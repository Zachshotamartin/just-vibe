import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runtimeStore, object, requireId, cleanText, timestamp } from './runtime-store.mjs';
import { integer } from './capability-io.mjs';
import { runners } from './trusted-runners.mjs';
import { findExecutable } from './command.mjs';
import { randomUUID } from 'node:crypto';
import { withFileLock } from './file-lock.mjs';
import { within } from './storage.mjs';
export async function services(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  if (operation === 'available')
    return {
      adapters: ['tmux', 'pm2', 'code', 'wt'].map((name) => ({
        name,
        installed: !!findExecutable(name),
      })),
      native: 'Node supervisor; available without a global process manager',
      note: 'Presence is not authorization. just-vibe never installs or controls unrelated process-manager services.',
    };
  if (operation === 'list')
    return {
      services: store
        .list(store.prefix)
        .filter((p) => p.startsWith('service-') && !p.startsWith('service-run-'))
        .map((p) => {
          const s = store.get(p.replace('.json', ''));
          const run = s.run ? store.get(`service-run-${s.run}`) : null;
          return {
            ...s,
            run: run
              ? {
                  ...run,
                  stale: run.state === 'running' && Date.now() - Date.parse(run.updatedAt) > 3000,
                }
              : null,
          };
        }),
    };
  object(payload, ['id', 'revision', 'runner', 'hash', 'durationSeconds', 'reason']);
  const id = requireId(payload.id),
    name = `service-${id}`,
    state = store.get(name);
  if (operation === 'configure') {
    const r = (await runners(root, 'show', { id: payload.runner }, options)).runner;
    if (!r.trusted || !r.current || r.hash !== payload.hash)
      throw Error('Review and trust the service command first.');
    const current = state?.run && store.get(`service-run-${state.run}`);
    if (current && ['starting', 'running'].includes(current.state))
      throw Error('Stop the current service before reconfiguring.');
    return store.put(
      name,
      {
        id,
        runner: payload.runner,
        hash: payload.hash,
        durationSeconds: integer(payload.durationSeconds ?? 300, 'durationSeconds', 5, 3600),
        run: null,
      },
      payload.revision,
    );
  }
  if (!state) throw Error('Unknown service.');
  const active = state.run ? store.get(`service-run-${state.run}`) : null;
  if (operation === 'show' || operation === 'logs')
    return {
      ...state,
      run: active,
      stale:
        active &&
        ['starting', 'running'].includes(active.state) &&
        Date.now() - Date.parse(active.updatedAt) > 3000,
    };
  if (payload.revision !== state.revision) throw Error('Read current service revision first.');
  if (operation === 'recover') {
    if (
      !active ||
      !['starting', 'running'].includes(active.state) ||
      Date.now() - Date.parse(active.updatedAt) < 10000
    )
      throw Error('Only a stale, uncertain run can be reconciled.');
    const reason = cleanText(payload.reason, 'owned process inspection evidence', 2000);
    store.put(
      `service-run-${state.run}`,
      { ...active, state: 'reconciled', stopRequested: true, reason, updatedAt: timestamp() },
      active.revision,
    );
    return {
      ...state,
      reconciled: true,
      note: 'No process was signaled. Inspect and clean up any orphaned process before starting again.',
    };
  }
  if (operation === 'stop') {
    if (!active) return state;
    const waitUntil = Date.now() + 2000;
    for (;;) {
      try {
        return withFileLock(
          within(store.home, `${store.prefix}/service-run-${state.run}.startup.lock`),
          () => {
            if (store.get(name).revision !== state.revision)
              throw Error('Read current service revision first.');
            const latest = store.get(`service-run-${state.run}`);
            if (!['starting', 'running'].includes(latest.state))
              return { ...state, stopRequested: false, runState: latest.state };
            store.put(
              `service-run-${state.run}`,
              {
                ...latest,
                stopRequested: true,
                reason: cleanText(payload.reason || 'User requested stop', 'reason', 1000),
              },
              latest.revision,
            );
            return {
              ...state,
              stopRequested: true,
              note: 'Only the owning live supervisor signals its child process. Stale PIDs are never killed.',
            };
          },
        );
      } catch (error) {
        // Startup and heartbeats hold these locks briefly. Wait without blocking
        // the event loop, then reread the exact reservation before acknowledging.
        if (
          Date.now() >= waitUntil ||
          !(
            error.code === 'STATE_LOCKED' ||
            error.message === 'State revision changed. Read it again before updating.'
          )
        )
          throw error;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  }
  if (operation !== 'start') throw Error('Unknown service operation.');
  if (active && ['starting', 'running'].includes(active.state))
    throw Error('Existing run is active or uncertain; inspect its owned process before recovery.');
  const r = (await runners(root, 'show', { id: state.runner }, options)).runner;
  if (!r.trusted || !r.current || r.hash !== state.hash)
    throw Error('Service runner changed or trust was revoked.');
  const run = randomUUID(),
    runState = store.put(
      `service-run-${run}`,
      {
        id: run,
        service: id,
        state: 'starting',
        runner: state.runner,
        hash: state.hash,
        deadline: new Date(Date.now() + state.durationSeconds * 1000).toISOString(),
        createdAt: timestamp(),
        updatedAt: timestamp(),
        stopRequested: false,
        output: '',
      },
      0,
    );
  const reserved = store.put(name, { ...state, run }, state.revision);
  try {
    const child = spawn(
      process.execPath,
      [
        fileURLToPath(new URL('../service-supervisor.mjs', import.meta.url)),
        '--root',
        store.root,
        '--home',
        store.home,
        '--run',
        run,
      ],
      { cwd: store.root, detached: true, stdio: 'ignore', env: process.env },
    );
    await new Promise((resolve, reject) => {
      child.once('spawn', resolve);
      child.once('error', reject);
    });
    child.unref();
    return { ...reserved, state: 'starting' };
  } catch (error) {
    store.put(
      `service-run-${run}`,
      {
        ...runState,
        state: 'failed',
        updatedAt: timestamp(),
        error: 'Supervisor could not start.',
      },
      runState.revision,
    );
    throw error;
  }
}
