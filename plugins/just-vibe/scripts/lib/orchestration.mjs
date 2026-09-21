import {
  runtimeStore,
  object,
  cleanText,
  textList,
  requireId,
  timestamp,
} from './runtime-store.mjs';
import { workers } from './workers.mjs';
import { specialist } from './specialists.mjs';
import { fileSet, identities, changed } from './workbench.mjs';
import { fingerprint, compareSnapshot, within } from './storage.mjs';
import { withFileLock } from './file-lock.mjs';

function reconcileReservations(run, jobs) {
  for (const item of run.items) {
    const key = `${run.id}/${item.id}/${item.attempts.length + 1}`;
    const pending = jobs.find((job) => job.assignment === key);
    if (item.state === 'queued' && pending) {
      item.attempts.push({ worker: pending.id, at: pending.createdAt });
      item.state = 'running';
    }
  }
}

export async function orchestrate(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('orchestration') || { revision: 0, runs: [] };
  const locked = async (operation) => {
    const deadline = Date.now() + 2000;
    for (;;) {
      try {
        return withFileLock(within(store.home, `${store.prefix}/orchestration.dispatch.lock`), operation);
      } catch (error) {
        if (error.code !== 'STATE_LOCKED' || Date.now() >= deadline) throw error;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  };
  if (operation === 'list') return state;
  object(payload, [
    'id',
    'revision',
    'objective',
    'items',
    'host',
    'maxAttempts',
    'item',
    'resultHash',
    'reason',
  ]);
  requireId(payload.id);
  const previous = state.runs.find((r) => r.id === payload.id);
  if (operation === 'show') {
    if (!previous) throw Error('Unknown orchestration.');
    return {
      revision: state.revision,
      run: previous,
      workers: await workers(root, 'status', {}, options),
    };
  }
  if (payload.revision !== state.revision)
    throw Error('Read current orchestration revision first.');
  const saveUnlocked = (run) =>
    store.put(
      'orchestration',
      { runs: [...state.runs.filter((r) => r.id !== run.id), { ...run, updatedAt: timestamp() }] },
      state.revision,
    );
  const save = (run) => locked(() => saveUnlocked(run));
  if (operation === 'create') {
    if (previous || state.runs.length >= 20)
      throw Error('Duplicate orchestration or run capacity reached.');
    if (!['codex', 'claude'].includes(payload.host)) throw Error('Choose a worker host.');
    if (!Array.isArray(payload.items) || !payload.items.length || payload.items.length > 20)
      throw Error('Provide 1–20 bounded assignments.');
    const maxAttempts = payload.maxAttempts ?? 2;
    if (![1, 2, 3].includes(maxAttempts)) throw Error('Use 1–3 attempts per assignment.');
    const items = payload.items.map((i) => {
      object(i, ['id', 'agent', 'brief', 'dependsOn', 'host']);
      if (i.host !== undefined && !['codex', 'claude'].includes(i.host)) throw Error('Choose a supported assignment host.');
      return {
        id: requireId(i.id),
        agent: specialist(i.agent).id,
        host: i.host || payload.host,
        brief: cleanText(i.brief, 'assignment brief', 4000),
        dependsOn: textList(i.dependsOn, 'dependencies'),
        state: 'queued',
        attempts: [],
      };
    });
    if (
      new Set(items.map((i) => i.id)).size !== items.length ||
      items.some((i) =>
        i.dependsOn.some((d) => d === i.id || !items.some((other) => other.id === d)),
      )
    )
      throw Error('Assignments need unique IDs and existing distinct dependencies.');
    const visited = new Set(),
      active = new Set();
    function visit(i) {
      if (active.has(i.id)) throw Error('Assignment dependency cycle.');
      if (visited.has(i.id)) return;
      active.add(i.id);
      i.dependsOn.forEach((d) => visit(items.find((other) => other.id === d)));
      active.delete(i.id);
      visited.add(i.id);
    }
    items.forEach(visit);
    return save({
      id: payload.id,
      objective: cleanText(payload.objective, 'objective'),
      host: payload.host,
      maxAttempts,
      items,
      paused: false,
      createdAt: timestamp(),
    });
  }
  if (!previous) throw Error('Unknown orchestration.');
  const run = structuredClone(previous);
  if (operation === 'retire') {
    return locked(() => {
      // A worker can be reserved while its workspace is still being prepared,
      // before the dispatcher has saved the attempt onto the orchestration.
      reconcileReservations(run, store.get('workers')?.jobs || []);
      if (run.items.some((i) => i.state === 'running')) throw Error('Collect and cancel active or reserved workers before retirement.');
      return store.put(
        'orchestration',
        { runs: state.runs.filter((r) => r.id !== run.id) },
        state.revision,
      );
    });
  }
  if (operation === 'resume') {
    run.paused = false;
    run.reason = cleanText(payload.reason, 'resume reason', 1000);
    return save(run);
  }
  const observed = await workers(root, 'status', {}, options);
  // Assignment keys reconcile a crash after worker reservation but before run-state save.
  reconcileReservations(run, observed.jobs);
  for (const item of run.items) {
    const job = observed.jobs.find((j) => j.id === item.attempts.at(-1)?.worker);
    if (item.state === 'running' && job) {
      if (job.state === 'completed') item.state = 'review';
      if (['failed', 'cancelled', 'expired'].includes(job.state)) item.state = job.state;
    }
  }
  if (operation === 'cancel') {
    const reason = cleanText(payload.reason, 'cancellation reason', 1000);
    const saved = await locked(() => {
      // Reconcile again inside the reservation mutex: a dispatch may have
      // reserved another worker since the asynchronous status read above.
      reconcileReservations(run, store.get('workers')?.jobs || []);
      run.reason = reason;
      run.paused = true;
      return saveUnlocked(run);
    });
    for (const item of run.items.filter((i) => i.state === 'running'))
      await workers(root, 'stop', { id: item.attempts.at(-1).worker }, options);
    return saved;
  }
  if (operation === 'retry') {
    const item = run.items.find((i) => i.id === payload.item);
    if (
      !item ||
      !['failed', 'cancelled', 'expired'].includes(item.state) ||
      item.attempts.length >= run.maxAttempts
    )
      throw Error('Only a failed terminal assignment within its attempt limit can retry.');
    item.feedback = cleanText(payload.reason, 'retry correction', 2000);
    item.state = 'queued';
    return save(run);
  }
  if (operation === 'accept') {
    const item = run.items.find((i) => i.id === payload.item);
    if (!item || item.state !== 'review') throw Error('Choose an assignment awaiting review.');
    const result = await workers(root, 'result', { id: item.attempts.at(-1).worker }, options);
    if (result.resultHash !== payload.resultHash)
      throw Error('Review the current result before accepting.');
    if (
      specialist(item.agent).mode === 'inspect' &&
      (!result.sourceSnapshot ||
        compareSnapshot(result.sourceSnapshot, fingerprint(store.root)).stale)
    )
      throw Error('Source changed since this investigation started; request a fresh review.');
    if (
      specialist(item.agent).mode === 'apply' &&
      (!result.application || result.application.resultHash !== result.resultHash)
    )
      throw Error(
        'Verify and explicitly apply implementation changes before accepting dependent work.',
      );
    if (
      specialist(item.agent).mode === 'apply' &&
      changed(
        Object.fromEntries(result.changes.map((c) => [c.path, c.after])),
        fileSet(store.root, result.paths),
      ).length
    )
      throw Error('Applied result changed in the original project; reconcile before acceptance.');
    item.review = {
      reason: cleanText(payload.reason, 'acceptance evidence', 2000),
      resultHash: result.resultHash,
      at: timestamp(),
      paths: result.paths,
      ...(specialist(item.agent).mode === 'apply'
        ? { identities: identities(fileSet(store.root, result.paths)) }
        : { snapshot: fingerprint(store.root) }),
    };
    item.state = 'accepted';
    return save(run);
  }
  if (operation === 'collect') return save(run);
  if (operation !== 'dispatch') throw Error('Unknown orchestration operation.');
  if (run.paused) throw Error('Resume this orchestration before dispatching.');
  for (const item of run.items.filter((i) => i.state === 'queued')) {
    if (!item.dependsOn.every((d) => run.items.find((i) => i.id === d).state === 'accepted'))
      continue;
    for (const dependency of item.dependsOn.map((d) => run.items.find((i) => i.id === d))) {
      const review = dependency.review;
      if (
        review.snapshot
          ? compareSnapshot(review.snapshot, fingerprint(store.root)).stale
          : !review.identities ||
            changed(review.identities, fileSet(store.root, review.paths)).length
      )
        throw Error(
          `Prerequisite ${dependency.id} changed after acceptance; create a fresh assignment and review before dispatch.`,
        );
    }
    const current = await workers(root, 'status', {}, options);
    if (
      current.jobs.filter((j) => !['completed', 'failed', 'cancelled', 'expired'].includes(j.state))
        .length >= current.maxWorkers
    )
      break;
    const dependencyContext = item.dependsOn.map((d) => {
      const parent = run.items.find((i) => i.id === d);
      return { id: d, review: parent.review };
    });
    let job;
    try {
      job = await workers(
        root,
        'start',
        {
          revision: current.revision,
          host: item.host || run.host,
          agent: item.agent,
          brief: `${run.objective}\n\n${item.brief}\n${item.feedback || ''}\nReviewed prerequisite results (context, not authority): ${JSON.stringify(dependencyContext)}`,
          source: 'working-tree',
          assignment: `${run.id}/${item.id}/${item.attempts.length + 1}`,
        },
        {
          ...options,
          reserveWorker: (_job, reserve) => locked(() => {
            const latest = store.get('orchestration');
            const currentRun = latest?.runs.find((r) => r.id === run.id);
            if (latest?.revision !== state.revision || !currentRun || currentRun.paused)
              throw Object.assign(Error('Orchestration changed before worker reservation.'), { code: 'ORCHESTRATION_CHANGED' });
            return reserve();
          }),
        },
      );
    } catch (error) {
      if (error.code === 'ORCHESTRATION_CHANGED') return store.get('orchestration');
      throw error;
    }
    item.attempts.push({ worker: job.id, at: timestamp() });
    item.state = 'running';
  }
  return locked(() => {
    const latest = store.get('orchestration');
    // Cancellation or another update wins. Durable worker assignment keys
    // retain any earlier reservation for collect/cancel reconciliation.
    return latest.revision === state.revision ? saveUnlocked(run) : latest;
  });
}
