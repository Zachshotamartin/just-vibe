import { runtimeStore, object, requireId, cleanText, timestamp } from './runtime-store.mjs';
import { hookEnabled } from './behavior-rules.mjs';
import { boundedList, integer, httpUrl } from './capability-io.mjs';
import { runners } from './trusted-runners.mjs';
import { digest, within } from './storage.mjs';
import { withFileLock } from './file-lock.mjs';
import { executionControl } from './execution-control.mjs';
async function probe(target, options) {
  const started = Date.now(),
    controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), target.timeoutMs);
  let reader;
  try {
    const response = await (options.fetch || fetch)(target.url, {
      method: 'GET',
      redirect: 'manual',
      signal: options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal,
      headers: { accept: target.sse ? 'text/event-stream' : '*/*' },
    });
    const type = response.headers.get('content-type') || '';
    reader = response.body?.getReader();
    let size = 0,
      text = '',
      heartbeat = false;
    if (reader) {
      const decoder = new TextDecoder();
      for (;;) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.length;
        if (size > 256 * 1024) throw Error('Response exceeds monitoring bound.');
        text += decoder.decode(part.value, { stream: true });
        if (target.sse && /(?:^|\n)(?:data:|:)/.test(text)) {
          heartbeat = true;
          break;
        }
      }
    }
    const passed =
      response.status === target.status &&
      (!target.contentType || type.toLowerCase().includes(target.contentType.toLowerCase())) &&
      (!target.contains || text.includes(target.contains)) &&
      (!target.sse || heartbeat);
    return {
      id: target.id,
      passed,
      status: response.status,
      contentType: type.slice(0, 120),
      bodyHash: digest(text),
      heartbeat: target.sse ? heartbeat : null,
      elapsedMs: Date.now() - started,
    };
  } catch (error) {
    return {
      id: target.id,
      passed: false,
      error:
        error.name === 'AbortError'
          ? 'timeout-or-missing-heartbeat'
          : 'transport-or-response-bound',
      elapsedMs: Date.now() - started,
    };
  } finally {
    clearTimeout(timer);
    await reader?.cancel().catch(() => {});
  }
}
export async function canary(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  if (operation === 'list')
    return {
      watches: store
        .list(store.prefix)
        .filter((p) => p.startsWith('canary-'))
        .map((p) => store.get(p.replace('.json', ''))),
    };
  object(payload, [
    'id',
    'revision',
    'targets',
    'intervalSeconds',
    'durationSeconds',
    'notifyRunner',
    'notifyHash',
    'reason',
  ]);
  const id = requireId(payload.id),
    name = `canary-${id}`,
    state = store.get(name);
  if (operation === 'configure') {
    const targets = boundedList(payload.targets, 'targets', 12).map((t) => {
      object(t, ['id', 'url', 'status', 'contentType', 'contains', 'sse', 'timeoutMs']);
      const url = httpUrl(t.url);
      if (url.search) throw Error('Canary URLs must not carry query credentials.');
      if (t.sse !== undefined && typeof t.sse !== 'boolean') throw Error('sse must be boolean.');
      return {
        id: requireId(t.id),
        url: url.href,
        status: integer(t.status ?? 200, 'status', 100, 599),
        contentType: t.contentType ? cleanText(t.contentType, 'content type', 120) : null,
        contains: t.contains ? cleanText(t.contains, 'expected content', 1000) : null,
        sse: t.sse === true,
        timeoutMs: integer(t.timeoutMs ?? 5000, 'timeoutMs', 100, 10000),
      };
    });
    if (!targets.length || new Set(targets.map((t) => t.id)).size !== targets.length)
      throw Error('Use distinct target IDs.');
    if (payload.notifyRunner) {
      const r = (await runners(root, 'show', { id: payload.notifyRunner }, options)).runner;
      if (!r.trusted || !r.current || r.hash !== payload.notifyHash)
        throw Error('Review and trust the exact notification command first.');
    }
    if (state?.status === 'watching') throw Error('Stop the active watch before reconfiguring.');
    return store.put(
      name,
      {
        id,
        targets,
        intervalSeconds: integer(payload.intervalSeconds ?? 30, 'intervalSeconds', 5, 3600),
        durationSeconds: integer(payload.durationSeconds ?? 300, 'durationSeconds', 5, 3600),
        notifyRunner: payload.notifyRunner || null,
        notifyHash: payload.notifyHash || null,
        status: 'ready',
        samples: [],
        createdAt: timestamp(),
      },
      payload.revision,
    );
  }
  if (!state) throw Error('Unknown canary.');
  const locked = fn => withFileLock(within(store.home, `${store.prefix}/${name}.dispatch.lock`), fn);
  if (operation === 'show') return state;
  if (payload.revision !== state.revision) throw Error('Read current canary revision first.');
  if (operation === 'stop')
    return locked(() => store.put(
      name,
      { ...state, status: 'stopped', reason: cleanText(payload.reason, 'reason', 1000) },
      state.revision,
    ));
  if (operation === 'sample') {
    if (state.status === 'stopped') return { ...state, attempted: false };
    const results = [];
    let expectedRevision = state.revision;
    const control = executionControl(() => {
      const latest = store.get(name);
      if (latest.status === 'stopped' || latest.revision !== expectedRevision) return 'watch-changed-or-stopped';
      if (latest.status === 'watching' && Date.parse(latest.deadline) <= Date.now()) return 'deadline';
      return null;
    }, options.signal);
    try {
    for (const t of state.targets) {
      const next = locked(() => control.poll() ? null : { promise: probe(t, { ...options, signal: control.signal }) });
      if (!next) break;
      results.push(await next.promise);
    }
    if (control.poll()) return { ...store.get(name), sampleInterrupted: true, results };
    const current = store.get(name);
    if (current.revision !== state.revision)
      throw Error('Watch changed while probing; result was not attached to changed settings.');
    const signature = digest(
        JSON.stringify(
          results.map(({ id, passed, status, error, contentType }) => ({
            id,
            passed,
            status,
            error,
            contentType,
          })),
        ),
      ),
      prior = state.samples.at(-1),
      changed = !prior || prior.signature !== signature;
    const sample = { at: timestamp(), signature, results, changed },
      saved = store.put(
        name,
        { ...state, samples: [...state.samples, sample].slice(-100) },
        state.revision,
      );
    expectedRevision = saved.revision;
    let notification = null;
    if (
      changed &&
      state.notifyRunner &&
      hookEnabled(root, 'notifications', options) &&
      (!results.every((r) => r.passed) || prior)
    ) {
      const dispatch = locked(() => control.poll() ? null : { promise: runners(
        root, 'run', { id: state.notifyRunner, hash: state.notifyHash }, { ...options, signal: control.signal },
      ) });
      if (dispatch) notification = await dispatch.promise;
    }
    return {
      ...store.get(name),
      notification,
      note: 'Status/content/heartbeat observations only. Identical body hashes can compare staging and production; dynamic content may legitimately differ. Notification commands receive no response bodies.',
    };
    } finally { control.close(); }
  }
  if (operation === 'watch') {
    if (state.status === 'watching')
      throw Error('Watch already reserved; inspect and stop an interrupted run before restarting.');
    let current = store.put(
        name,
        { ...state, status: 'watching', startedAt: timestamp(), deadline: new Date(Date.now() + state.durationSeconds * 1000).toISOString() },
        state.revision,
      ),
      deadline = Date.now() + state.durationSeconds * 1000;
    while (Date.now() < deadline) {
      current = store.get(name);
      if (current.status !== 'watching') return current;
      if (options.signal?.aborted) return canary(root, 'stop', { id, revision: current.revision, reason: 'Caller cancelled.' }, options);
      try {
        await canary(root, 'sample', { id, revision: current.revision }, options);
      } catch (error) {
        const latest = store.get(name);
        if (latest.status !== 'watching') return latest;
        return store.put(
          name,
          { ...latest, status: 'failed', reason: String(error.message).slice(0, 1000) },
          latest.revision,
        );
      }
      const remaining = Math.min(state.intervalSeconds * 1000, deadline - Date.now());
      for (let elapsed = 0; elapsed < remaining; elapsed += 250) {
        await new Promise((r) => setTimeout(r, Math.min(250, remaining - elapsed)));
        if (store.get(name).status !== 'watching') return store.get(name);
      }
    }
    current = store.get(name);
    return current.status === 'watching'
      ? store.put(name, { ...current, status: 'completed', endedAt: timestamp() }, current.revision)
      : current;
  }
  throw Error('Unknown canary operation.');
}
