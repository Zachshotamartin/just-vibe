import { runtimeStore, object, requireId, cleanText, timestamp } from './runtime-store.mjs';
import { integer } from './capability-io.mjs';
import { runners } from './trusted-runners.mjs';
import { digest, within } from './storage.mjs';
import { withFileLock } from './file-lock.mjs';
import { executionControl } from './execution-control.mjs';

// Persist a reservation BEFORE execution. An interrupted reservation never
// replays automatically: at-most-once dispatch is safer than duplicate effects.
export async function boundedJobs(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    now = options.now?.() ?? Date.now();
  if (operation === 'watch') {
    object(payload, ['seconds']);
    const deadline = Date.now() + integer(payload.seconds ?? 60, 'seconds', 1, 3600) * 1000;
    const results = [];
    while (Date.now() < deadline && !options.signal?.aborted) {
      const batch = await boundedJobs(root, 'run-due', { limit: 3 }, options);
      results.push(...batch.results.map((r) => ({ id: r.id, status: r.status })));
      if (results.length >= 100) break;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(500, Math.max(0, deadline - Date.now()))),
      );
    }
    return {
      results,
      stopped: options.signal?.aborted ? 'cancelled' : 'bounded interval completed',
    };
  }
  if (operation === 'list' || operation === 'due') {
    const jobs = store
      .list(store.prefix)
      .filter((p) => p.startsWith('bounded-job-'))
      .map((p) => store.get(p.replace('.json', '')));
    return {
      jobs:
        operation === 'due'
          ? jobs.filter(
              (j) =>
                j.enabled &&
                j.status === 'ready' &&
                Date.parse(j.nextAt) <= now &&
                Date.parse(j.deadline) > now,
            )
          : jobs,
      note: 'No daemon runs merely because a schedule exists. Use run-due from an explicitly configured host scheduler, or watch for a bounded foreground interval.',
    };
  }
  if (operation === 'run-due') {
    object(payload, ['limit']);
    const due = await boundedJobs(root, 'due', {}, options),
      results = [];
    for (const job of due.jobs.slice(0, integer(payload.limit ?? 3, 'limit', 1, 10))) {
      if (options.signal?.aborted) break;
      results.push(
        await boundedJobs(root, 'tick', { id: job.id, revision: job.revision }, options),
      );
    }
    return { results };
  }
  object(payload, [
    'id',
    'revision',
    'kind',
    'objective',
    'runner',
    'runnerHash',
    'verifier',
    'verifierHash',
    'maxRuns',
    'maxFailures',
    'intervalSeconds',
    'deadline',
    'enabled',
    'reason',
    'outcome',
    'nextAt',
  ]);
  const id = requireId(payload.id),
    name = `bounded-job-${id}`,
    state = store.get(name);
  if (operation === 'create') {
    if (state) throw Error('Job ID already exists.');
    if (!['loop', 'schedule'].includes(payload.kind)) throw Error('Choose loop or schedule.');
    const deadline = Date.parse(payload.deadline);
    if (!Number.isFinite(deadline) || deadline <= now || deadline > now + 30 * 86400000)
      throw Error('Choose a future deadline within 30 days.');
    for (const [field, hash] of [
      ['runner', 'runnerHash'],
      ...(payload.verifier ? [['verifier', 'verifierHash']] : []),
    ]) {
      const runner = (await runners(root, 'show', { id: payload[field] }, options)).runner;
      if (!runner.trusted || !runner.current || runner.hash !== payload[hash])
        throw Error('Job references must be current explicitly trusted runners.');
    }
    return store.put(
      name,
      {
        id,
        kind: payload.kind,
        objective: cleanText(payload.objective, 'objective', 3000),
        runner: payload.runner,
        runnerHash: payload.runnerHash,
        verifier: payload.verifier || null,
        verifierHash: payload.verifierHash || null,
        maxRuns: integer(payload.maxRuns ?? 3, 'maxRuns', 1, 100),
        maxFailures: integer(payload.maxFailures ?? 2, 'maxFailures', 1, 10),
        intervalSeconds: integer(payload.intervalSeconds ?? 60, 'intervalSeconds', 5, 86400),
        deadline: new Date(deadline).toISOString(),
        enabled: false,
        status: 'ready',
        nextAt: new Date(now).toISOString(),
        runs: [],
        failures: 0,
        createdAt: timestamp(),
      },
      payload.revision,
    );
  }
  if (!state) throw Error('Unknown job.');
  const locked = (fn) => withFileLock(within(store.home, `${store.prefix}/${name}.dispatch.lock`), fn);
  if (operation === 'show') return { ...state, expired: Date.parse(state.deadline) <= now };
  if (payload.revision !== state.revision) throw Error('Read current job revision first.');
  if (operation === 'enable') {
    if (typeof payload.enabled !== 'boolean') throw Error('enabled must be boolean.');
    if (state.status !== 'ready' && payload.enabled)
      throw Error('Resolve the terminal or interrupted job before enabling.');
    return locked(() => store.put(
      name,
      {
        ...state,
        enabled: payload.enabled,
        authorization: cleanText(payload.reason, 'execution authority', 1000),
      },
      state.revision,
    ));
  }
  if (operation === 'cancel')
    return locked(() => store.put(
      name,
      {
        ...state,
        enabled: false,
        status: 'cancelled',
        reason: cleanText(payload.reason, 'reason', 1000),
      },
      state.revision,
    ));
  if (operation === 'resolve') {
    if (
      state.status !== 'running' ||
      !['failed', 'succeeded', 'inconclusive'].includes(payload.outcome)
    )
      throw Error(
        'Resolve only an interrupted running reservation after inspecting actual effects.',
      );
    return locked(() => store.put(
      name,
      {
        ...state,
        enabled: false,
        status: 'needs-review',
        resolution: {
          outcome: payload.outcome,
          reason: cleanText(payload.reason, 'recovery evidence', 3000),
          at: timestamp(),
        },
      },
      state.revision,
    ));
  }
  if (operation !== 'tick') throw Error('Unknown job operation.');
  if (!state.enabled || state.status !== 'ready')
    throw Error('Job is disabled, already reserved or terminal.');
  if (
    state.runs.length >= state.maxRuns ||
    state.failures >= state.maxFailures ||
    Date.parse(state.deadline) <= now
  )
    return store.put(name, { ...state, status: 'exhausted', enabled: false }, state.revision);
  if (Date.parse(state.nextAt) > now) return { ...state, attempted: false, reason: 'not-due' };
  const reservation = { id: `${id}-${state.runs.length + 1}`, at: new Date(now).toISOString() };
  let reserved = store.put(name, { ...state, status: 'running', reservation }, state.revision);
  let execution, verification;
  const control = executionControl(() => {
    const latest = store.get(name);
    if (latest.status !== 'running' || latest.reservation?.id !== reservation.id) return 'job-no-longer-running';
    if (!latest.enabled) return 'authorization-revoked';
    const trusted = store.get('trusted-runners')?.runners || [];
    for (const [id, hash] of [[state.runner, state.runnerHash], ...(state.verifier ? [[state.verifier, state.verifierHash]] : [])])
      if (!trusted.some(r => r.id === id && r.hash === hash && r.trusted)) return 'runner-trust-revoked';
    if (Date.parse(latest.deadline) <= (options.now?.() ?? Date.now())) return 'deadline';
    return null;
  }, options.signal);
  const dispatch = (id, hash) => locked(() => {
    if (control.poll()) return { promise: Promise.resolve({ passed: false, cancelled: true }) };
    // runners invokes runCommand/spawn synchronously before yielding. The lock
    // orders that dispatch against a cancellation acknowledgement.
    return { promise: runners(root, 'run', { id, hash }, { ...options, signal: control.signal }) };
  }).promise;
  try {
    execution = await dispatch(state.runner, state.runnerHash);
    if (execution.passed && state.verifier && !control.poll()) {
      try { verification = await dispatch(state.verifier, state.verifierHash); }
      catch (error) { verification = { passed: false, error: String(error.message).slice(0, 2000) }; }
    }
  } catch (error) {
    execution = { passed: false, error: String(error.message).slice(0, 2000) };
  } finally { control.poll(); control.close(); }
  // Cancellation during execution wins; the receipt still records what happened.
  const outputHash = digest(
    JSON.stringify([
      execution.passed,
      execution.stdout,
      execution.stderr,
      execution.error,
      verification?.passed,
      verification?.stdout,
      verification?.stderr,
    ]),
  );
  const compact = (result) =>
    result
      ? {
          passed: !!result.passed,
          status: result.status ?? null,
          timedOut: !!result.timedOut,
          cancelled: !!result.cancelled,
          outputHash: digest(JSON.stringify(result)),
          excerpt: [result.stdout, result.stderr, result.error]
            .filter(Boolean)
            .join('\n')
            .slice(0, 2500),
        }
      : null;
  const current = store.get(name),
    passed = !control.signal.aborted && !!execution.passed && (!state.verifier || !!verification?.passed),
    receipt = {
      ...reservation,
      finishedAt: timestamp(),
      execution: compact(execution),
      verification: compact(verification),
      passed,
      outputHash,
      interrupted: control.signal.aborted ? String(control.signal.reason) : null,
    };
  const runs = [...state.runs, receipt],
    failures = passed ? 0 : state.failures + 1,
    repeated = runs.length >= 2 && runs.at(-2).outputHash === receipt.outputHash && !passed;
  const status =
    current.status !== 'running'
      ? current.status
      : Date.parse(current.deadline) <= (options.now?.() ?? Date.now())
        ? 'exhausted'
      : control.signal.aborted || !current.enabled
        ? 'cancelled'
      : state.kind === 'loop' && passed && state.verifier
        ? 'succeeded'
        : runs.length >= state.maxRuns || failures >= state.maxFailures || repeated
          ? 'exhausted'
          : 'ready';
  return store.put(
    name,
    {
      ...current,
      status,
      enabled: status === 'ready' && current.enabled,
      runs,
      failures,
      nextAt: new Date(
        (options.now?.() ?? Date.now()) + state.intervalSeconds * 1000,
      ).toISOString(),
      reservation: null,
      note: 'Exit-based verifier outcome only. Inspect semantic acceptance independently; external effects cannot be rolled back by cancelling.',
    },
    current.revision,
  );
}
