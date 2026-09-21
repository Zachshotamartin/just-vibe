import { runtimeStore, object, requireId, cleanText, timestamp } from './runtime-store.mjs';
import { boundedList, integer } from './capability-io.mjs';
import { within, digest } from './storage.mjs';
import { relative } from 'node:path';
import { workers } from './workers.mjs';
import { boundedJobs } from './bounded-jobs.mjs';
import { orchestrate } from './orchestration.mjs';
import { contextHealth } from './context-health.mjs';
export async function operator(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('operator') || {
      revision: 0,
      claims: [],
      inbox: [],
      merges: [],
      dispatch: [],
    },
    now = options.now?.() ?? Date.now();
  if (operation === 'status') {
    const claims = state.claims.map((c) => ({ ...c, stale: Date.parse(c.expiresAt) <= now })),
      conflicts = [];
    for (let i = 0; i < claims.length; i++)
      for (let j = i + 1; j < claims.length; j++)
        if (
          !claims[i].stale &&
          !claims[j].stale &&
          claims[i].paths.some((p) =>
            claims[j].paths.some(
              (q) =>
                p === '.' || q === '.' || p === q || p.startsWith(q + '/') || q.startsWith(p + '/'),
            ),
          )
        )
          conflicts.push({
            claims: [claims[i].id, claims[j].id],
            reason: 'overlapping declared paths',
          });
    return {
      ...state,
      claims,
      conflicts,
      workers: await workers(root, 'status', {}, options),
      jobs: await boundedJobs(root, 'list', {}, options),
      orchestrations: await orchestrate(root, 'list', {}, options),
      observedAt: timestamp(),
      note: 'Declared ownership and local observations only. Stale leases are visible; no automatic reassignment, merge or killing another process.',
    };
  }
  object(payload, [
    'revision',
    'id',
    'owner',
    'paths',
    'ttlSeconds',
    'message',
    'recipient',
    'worker',
    'resultHash',
    'reason',
    'job',
    'requestId',
  ]);
  if (payload.revision !== state.revision) throw Error('Read current operator revision first.');
  const id = requireId(payload.id);
  let next = structuredClone(state);
  if (operation === 'claim') {
    const paths = boundedList(payload.paths, 'paths', 30).map(
      (p) => relative(store.root, within(root, p)).replaceAll('\\', '/') || '.',
    );
    if (!paths.length) throw Error('Declare at least one owned path.');
    const owner = cleanText(payload.owner, 'owner', 160),
      old = state.claims.find((c) => c.id === id);
    if (old && old.owner !== owner && Date.parse(old.expiresAt) > now)
      throw Error('Claim belongs to another active owner.');
    next.claims = [
      ...state.claims.filter((c) => c.id !== id),
      {
        id,
        owner,
        paths,
        updatedAt: timestamp(),
        expiresAt: new Date(
          now + integer(payload.ttlSeconds ?? 300, 'ttlSeconds', 10, 3600) * 1000,
        ).toISOString(),
      },
    ];
  } else if (operation === 'heartbeat') {
    const claim = state.claims.find((c) => c.id === id);
    if (!claim || claim.owner !== payload.owner) throw Error('Claim owner mismatch.');
    next.claims = state.claims.map((c) =>
      c === claim
        ? {
            ...c,
            updatedAt: timestamp(),
            expiresAt: new Date(
              now + integer(payload.ttlSeconds ?? 300, 'ttlSeconds', 10, 3600) * 1000,
            ).toISOString(),
          }
        : c,
    );
  } else if (operation === 'release') {
    const claim = state.claims.find((c) => c.id === id);
    if (claim && claim.owner !== payload.owner) throw Error('Claim owner mismatch.');
    next.claims = state.claims.filter((c) => c.id !== id);
  } else if (operation === 'message') {
    if (state.inbox.some((m) => m.id === id)) throw Error('Message ID already exists.');
    next.inbox = [
      ...state.inbox,
      {
        id,
        recipient: cleanText(payload.recipient, 'recipient', 160),
        message: cleanText(payload.message, 'local message', 3000),
        at: timestamp(),
        acknowledged: false,
      },
    ].slice(-100);
  } else if (operation === 'acknowledge') {
    if (!state.inbox.some((m) => m.id === id)) throw Error('Unknown message.');
    next.inbox = state.inbox.map((m) => (m.id === id ? { ...m, acknowledged: true } : m));
  } else if (operation === 'queue-merge') {
    if (state.merges.some((m) => m.id === id)) throw Error('Queue ID already exists.');
    const result = await workers(root, 'result', { id: payload.worker }, options);
    if (result.resultHash !== payload.resultHash)
      throw Error('Inspect current worker result first.');
    next.merges = [
      ...state.merges,
      {
        id,
        worker: payload.worker,
        resultHash: payload.resultHash,
        state: 'awaiting-review',
        reason: cleanText(payload.reason, 'merge context', 2000),
        at: timestamp(),
      },
    ];
  } else if (operation === 'drop-merge') {
    next.merges = state.merges.filter((m) => m.id !== id);
  } else if (operation === 'request-dispatch') {
    const requestId = requireId(payload.requestId || id);
    const retired = store.get(`dispatch-${digest(requestId)}`), retiredId = store.get(`dispatch-id-${digest(id)}`);
    const duplicate = state.dispatch.find(d => d.requestId === requestId) || retired;
    if (duplicate) {
      if (duplicate.job !== payload.job) throw Error('Request identity belongs to a different job.');
      return { ...state, duplicate: true, retired: !!retired };
    }
    if (retiredId || state.dispatch.some(d => d.id === id)) throw Error('Dispatch ID already belongs to a different request.');
    const job = await boundedJobs(root, 'show', { id: payload.job }, options);
    if (!job.enabled || job.status !== 'ready')
      throw Error('Remote requests can only reference locally enabled ready jobs.');
    next.dispatch = [
      ...state.dispatch,
      { id, requestId, job: job.id, jobRevision: job.revision, status: 'queued', at: timestamp() },
    ];
  } else if (operation === 'retire-dispatch') {
    const request = state.dispatch.find(d => d.id === id);
    if (!request || request.status !== 'finished') throw Error('Only a finished dispatch can be retired.');
    const tombstone = { id, requestId: request.requestId, job: request.job, outcome: request.outcome,
      finishedAt: request.updatedAt || request.at, retiredAt: timestamp() };
    // Tombstones are published before removing history. An interrupted retirement
    // may retain the row, but can never permit replay of an acknowledged request.
    for (const name of [`dispatch-${digest(request.requestId)}`, `dispatch-id-${digest(id)}`]) {
      const old = store.get(name);
      if (old && (old.requestId !== request.requestId || old.id !== id || old.job !== request.job))
        throw Error('Dispatch retirement identity conflict.');
      if (!old) store.put(name, tombstone, 0);
    }
    next.dispatch = state.dispatch.filter(d => d.id !== id);
  } else if (operation === 'dispatch') {
    const request = state.dispatch.find((d) => d.id === id);
    if (!request || request.status !== 'queued') throw Error('Choose a queued dispatch request.');
    const pending = store.put(
      'operator',
      {
        ...state,
        dispatch: state.dispatch.map((d) => (d === request ? { ...d, status: 'reserved', updatedAt: timestamp() } : d)),
      },
      state.revision,
    );
    let result;
    try {
      result = await boundedJobs(
        root,
        'tick',
        { id: request.job, revision: request.jobRevision },
        options,
      );
    } catch (error) {
      result = { status: 'failed', reason: String(error.message).slice(0, 1000) };
    }
    const current = store.get('operator');
    return store.put(
      'operator',
      {
        ...current,
        dispatch: current.dispatch.map((d) =>
          d.id === id
            ? { ...d, status: 'finished', updatedAt: timestamp(), outcome: result.status, reason: result.reason || null }
            : d,
        ),
      },
      current.revision,
    );
  } else throw Error('Unknown operator operation.');
  if (next.claims.length > 100 || next.merges.length > 100 || next.dispatch.length > 100)
    throw Error('Operator capacity reached; use retire-dispatch for finished requests, drop-merge for reviewed merges, or release for claims.');
  return store.put('operator', next, state.revision);
}
