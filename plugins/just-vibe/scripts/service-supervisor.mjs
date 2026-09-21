#!/usr/bin/env node
import { spawn, execFile } from 'node:child_process';
import { runtimeStore, requireId, timestamp } from './lib/runtime-store.mjs';
import { runners, runnerCurrent } from './lib/trusted-runners.mjs';
import { commandInvocation } from './lib/command.mjs';
import { redact } from './lib/process.mjs';
import { isDirectRun } from './lib/entrypoint.mjs';
import { withFileLock } from './lib/file-lock.mjs';
import { within } from './lib/storage.mjs';
export async function supervise(args) {
  if (args.length !== 6 || args[0] !== '--root' || args[2] !== '--home' || args[4] !== '--run')
    throw Error('Invalid supervisor invocation.');
  const root = args[1],
    options = { home: args[3] },
    id = requireId(args[5]),
    store = runtimeStore(root, options),
    key = `service-run-${id}`,
    initial = store.get(key);
  if (!initial || initial.state !== 'starting')
    throw Error('Service reservation is not available.');
  const runner = (await runners(root, 'show', { id: initial.runner }, options)).runner;
  if (!runner.trusted || !runner.current || runner.hash !== initial.hash) {
    store.put(
      key,
      { ...initial, state: 'failed', error: 'Service trust changed.', updatedAt: timestamp() },
      initial.revision,
    );
    return;
  }
  // The command returned publicly is redacted. Read the private trusted argv only
  // after its identity was checked; redaction must never alter execution.
  const exact = store.get('trusted-runners').runners.find((r) => r.id === initial.runner);
  if (!runnerCurrent(exact)) throw Error('Service inputs changed.');
  const child = withFileLock(within(store.home, `${store.prefix}/${key}.startup.lock`), () => {
    const current = store.get(key), service = store.get(`service-${initial.service}`);
    if (current.state !== 'starting' || service?.run !== id) throw Error('Service reservation ownership changed.');
    if (current.stopRequested || Date.now() >= Date.parse(current.deadline)) {
      store.put(key, { ...current, state: 'stopped', updatedAt: timestamp(), reason: current.reason || 'Startup deadline expired.' }, current.revision);
      return null;
    }
    const trusted = store.get('trusted-runners')?.runners.find(r => r.id === initial.runner);
    if (!trusted?.trusted || trusted.hash !== initial.hash || !runnerCurrent(trusted)) {
      store.put(key, { ...current, state: 'failed', error: 'Service trust changed.', updatedAt: timestamp() }, current.revision);
      return null;
    }
    // Claim the one launch while holding the same mutex used by stop. A crash
    // here is uncertain and needs recovery; it must never replay automatically.
    store.put(key, { ...current, state: 'running', supervisorPid: process.pid, updatedAt: timestamp() }, current.revision);
    const [binary, argv] = commandInvocation(trusted.command[0], trusted.command.slice(1));
    return spawn(binary, argv, {
    cwd: store.root,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
    env: process.env,
    shell: false,
    });
  });
  if (!child) return;
  let output = '',
    bytes = 0,
    stopping = false,
    requestedStop = false,
    killCompletion = Promise.resolve(),
    lastIdentityCheck = Date.now();
  const save = (fields) => {
    for (let i = 0; i < 3; i++) {
      const current = store.get(key);
      try {
        return store.put(
          key,
          { ...current, ...fields, output: redact(output).slice(-32000), updatedAt: timestamp() },
          current.revision,
        );
      } catch (error) {
        if (i === 2) throw error;
      }
    }
  };
  const stop = (cleanup = false) => {
    if (!cleanup) requestedStop = true;
    if (stopping) return;
    stopping = true;
    if (!child.pid) return;
    if (process.platform === 'win32') {
      killCompletion = new Promise((resolve) =>
        execFile('taskkill', ['/PID', String(child.pid), '/T', '/F'], { timeout: 3000 }, resolve),
      );
    } else {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {}
      killCompletion = new Promise((resolve) =>
        setTimeout(() => {
          try {
            process.kill(-child.pid, 'SIGKILL');
          } catch {}
          resolve();
        }, 1000),
      );
    }
  };
  child.stdout.on('data', (chunk) => {
    bytes += chunk.length;
    output += chunk.toString('utf8');
    output = output.slice(-32000);
    if (bytes > 1024 * 1024) stop();
  });
  child.stderr.on('data', (chunk) => {
    bytes += chunk.length;
    output += chunk.toString('utf8');
    output = output.slice(-32000);
    if (bytes > 1024 * 1024) stop();
  });
  child.once('spawn', () =>
    save({ supervisorPid: process.pid, childPid: child.pid }),
  );
  const interval = setInterval(() => {
    try {
      const state = store.get(key);
      const trusted = store.get('trusted-runners')?.runners.find((r) => r.id === initial.runner);
      const checkIdentity = Date.now() - lastIdentityCheck >= 5000;
      if (checkIdentity) lastIdentityCheck = Date.now();
      if (
        state.stopRequested ||
        Date.now() >= Date.parse(initial.deadline) ||
        !trusted?.trusted ||
        trusted.hash !== initial.hash ||
        (checkIdentity && !runnerCurrent(exact))
      )
        stop();
      save({});
    } catch {
      stop();
    }
  }, 500);
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  child.once('exit', () => stop(true));
  await new Promise((resolve) => {
    child.once('error', () => {
      save({ state: 'failed', error: 'Child process could not start.' });
      resolve();
    });
    child.once('close', (code, signal) => {
      requestedStop ||= store.get(key)?.stopRequested === true;
      save({
        state: requestedStop ? 'stopped' : code === 0 ? 'completed' : 'failed',
        exitCode: code,
        signal,
        outputLimitReached: bytes > 1024 * 1024,
      });
      resolve();
    });
  });
  clearInterval(interval);
  await killCompletion;
}
if (isDirectRun(import.meta.url)) await supervise(process.argv.slice(2));
