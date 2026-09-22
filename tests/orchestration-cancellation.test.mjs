import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { workers } from '../plugins/just-vibe/scripts/lib/workers.mjs';
import { orchestrate } from '../plugins/just-vibe/scripts/lib/orchestration.mjs';

async function waitFor(check, milliseconds = 10000) {
  const deadline = Date.now() + milliseconds;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw Error('Fixture process did not reach the expected state.');
}

async function fixture(t) {
  const directory = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-orchestration-cancel-')));
  const root = join(directory, 'project'), options = { home: join(directory, 'home') };
  const blocked = join(directory, 'setup-blocked'), release = join(directory, 'release-setup'), marker = join(directory, 'executed');
  mkdirSync(root);
  const hooks = join(directory, 'empty-hooks');
  mkdirSync(hooks);
  const git = args => execFileSync('git', ['-c', `core.hooksPath=${hooks}`, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', ...args], {
    cwd: root, stdio: 'ignore', env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))),
  });
  writeFileSync(join(root, '.gitignore'), '.just-vibe/\n');
  writeFileSync(join(root, 'source.txt'), 'Inert fixture');
  git(['init', '-q']); git(['add', '.']); git(['commit', '-qm', 'fixture']);
  await workers(root, 'configure', { revision: 0, enabled: true, maxWorkers: 2, timeoutSeconds: 10 }, options);
  const state = await orchestrate(root, 'create', { id: 'flow', revision: 0, host: 'codex', objective: 'Inert local commands', items: [
    { id: 'first', agent: 'reviewer', brief: 'First local fixture' },
    { id: 'second', agent: 'reviewer', brief: 'Second local fixture' },
  ] }, options);
  // Pause the real filesystem operation after reservation, without replacing
  // workspace creation or subprocess execution with a successful fake.
  const preload = join(directory, 'setup-barrier.mjs');
  writeFileSync(preload, `import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
const original = fs.writeFileSync;
let used = false;
fs.writeFileSync = function(path, ...args) {
  if (!used && basename(String(path)) === 'baseline.json') {
    used = true;
    original(${JSON.stringify(blocked)}, 'reserved');
    const deadline = Date.now() + 10000;
    while (!fs.existsSync(${JSON.stringify(release)})) {
      if (Date.now() > deadline) throw Error('Fixture setup barrier expired');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
  }
  return original.call(this, path, ...args);
};
syncBuiltinESMExports();
`);
  const dispatch = join(directory, 'dispatch.mjs');
  const command = [process.execPath, '-e', `require('node:fs').appendFileSync(${JSON.stringify(marker)}, ${JSON.stringify('inert effect\n')})`];
  writeFileSync(dispatch, `import { orchestrate } from ${JSON.stringify(new URL('../plugins/just-vibe/scripts/lib/orchestration.mjs', import.meta.url).href)};
console.log(JSON.stringify(await orchestrate(${JSON.stringify(root)}, 'dispatch', { id: 'flow', revision: ${state.revision} }, ${JSON.stringify({ ...options, command })})));
`);
  const child = spawn(process.execPath, ['--import', pathToFileURL(preload).href, dispatch], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', data => { stdout += data; });
  child.stderr.on('data', data => { stderr += data; });
  const completed = new Promise(resolve => child.once('close', code => resolve({ code, stdout, stderr })));
  t.after(async () => {
    writeFileSync(release, 'release');
    const current = await workers(root, 'status', {}, options);
    for (const job of current.jobs) await workers(root, 'stop', { id: job.id }, options);
    if (child.exitCode === null) child.kill();
    await completed;
    await waitFor(async () => (await workers(root, 'status', {}, options)).jobs.every(job => ['cancelled', 'completed', 'failed', 'expired'].includes(job.state)));
    rmSync(directory, { recursive: true, force: true });
  });
  await waitFor(() => existsSync(blocked));
  return { root, options, state, release, marker, completed };
}

test('orchestration cancellation captures in-flight setup and prevents later dispatch; retirement cannot drop its reservation', async (t) => {
  const f = await fixture(t);
  await assert.rejects(orchestrate(f.root, 'retire', { id: 'flow', revision: f.state.revision }, f.options), /reserved/);
  const cancelled = await orchestrate(f.root, 'cancel', { id: 'flow', revision: f.state.revision, reason: 'Cancel the inert fixture' }, f.options);
  assert.equal(existsSync(f.release), false, 'Cancellation completes while setup is still paused.');
  assert.equal(cancelled.runs[0].paused, true);
  assert.equal(cancelled.runs[0].items[0].attempts.length, 1);
  assert.equal(cancelled.runs[0].items[1].attempts.length, 0);
  writeFileSync(f.release, 'release');
  const dispatch = await f.completed;
  assert.equal(dispatch.code, 0, dispatch.stderr);
  assert.equal(JSON.parse(dispatch.stdout).runs[0].paused, true);
  const jobs = await waitFor(async () => {
    const current = (await workers(f.root, 'status', {}, f.options)).jobs;
    return current.every(job => job.state === 'cancelled') ? current : null;
  });
  assert.equal(jobs.length, 1);
  assert.equal(existsSync(f.marker), false);
});

test('an authoritative orchestration update during setup prevents another launch and keeps the reserved attempt', async (t) => {
  const f = await fixture(t);
  const collected = await orchestrate(f.root, 'collect', { id: 'flow', revision: f.state.revision }, f.options);
  assert.equal(collected.runs[0].items[0].attempts.length, 1);
  writeFileSync(f.release, 'release');
  const dispatch = await f.completed;
  assert.equal(dispatch.code, 0, dispatch.stderr);
  const jobs = await waitFor(async () => {
    const current = (await workers(f.root, 'status', {}, f.options)).jobs;
    return current.every(job => job.state === 'completed') ? current : null;
  });
  assert.equal(jobs.length, 1);
  assert.equal(readFileSync(f.marker, 'utf8'), 'inert effect\n');
  const state = await orchestrate(f.root, 'list', {}, f.options);
  assert.equal(state.runs[0].items[0].attempts[0].worker, jobs[0].id);
  assert.equal(state.runs[0].items[1].attempts.length, 0);
});
