import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { runCommand } from '../plugins/just-vibe/scripts/lib/process.mjs';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { services } from '../plugins/just-vibe/scripts/lib/dev-services.mjs';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { const result = await check(); if (result) return result; await pause(10); }
  throw Error('Fixture condition timed out.');
}
function fixture(t) {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-owned-lifetime-')));
  t.after(() => {
    if (existsSync(join(root, 'leader'))) try { process.kill(-Number(readFileSync(join(root, 'leader'), 'utf8')), 'SIGKILL'); } catch {}
    rmSync(root, { recursive: true, force: true });
  });
  return root;
}
function command(root, { pipes = false, running = false, ignoreTerm = false } = {}) {
  const child = `const fs=require('node:fs');${ignoreTerm ? `process.on('SIGTERM',()=>fs.writeFileSync('term','1'));` : ''}fs.writeFileSync('ready','1');setInterval(()=>{if(fs.existsSync('trigger'))fs.writeFileSync('marker','effect after completion');},5);`;
  return [process.execPath, '-e', `const fs=require('node:fs');fs.writeFileSync('leader',String(process.pid));const child=require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(child)}],{cwd:${JSON.stringify(root)},stdio:${JSON.stringify(pipes ? ['ignore', 'inherit', 'inherit'] : 'ignore')}});child.unref();const timer=setInterval(()=>{if(fs.existsSync('ready')){${running ? '' : 'clearInterval(timer);process.exit(0);'}}},5);`];
}
for (const kind of ['runCommand', 'agent-worker', 'preview-worker']) {
  for (const pipes of [false, true]) {
    test(`${kind} ends owned ${pipes ? 'pipe-inheriting' : 'silent'} descendants before normal completion`, { skip: process.platform === 'win32' }, async t => {
      const root = fixture(t), argv = command(root, { pipes });
      let result;
      if (kind === 'runCommand') {
        result = await runCommand(argv, { cwd: root, timeoutMs: 2000 });
        assert.equal(result.status, 0);
        assert.equal(result.timedOut, false);
        assert.equal(result.cancelled, false);
      } else {
        const config = join(root, 'config.json');
        writeFileSync(config, JSON.stringify({ token: 'owned', cwd: root, command: argv, prompt: 'fixture', timeoutSeconds: 2, minutes: 1, port: 12345 }));
        const child = spawn(process.execPath, [resolve(`plugins/just-vibe/scripts/${kind}.mjs`), config], { stdio: 'ignore' });
        t.after(() => child.kill('SIGKILL'));
        const completion = new Promise((ok, fail) => { child.once('error', fail); child.once('close', ok); });
        const timer = setTimeout(() => child.kill('SIGKILL'), 4000);
        assert.equal(await completion, 0);
        clearTimeout(timer);
        result = JSON.parse(readFileSync(join(root, 'status.json'), 'utf8'));
        assert.equal(result.state, kind === 'agent-worker' ? 'completed' : 'exited');
      }
      writeFileSync(join(root, 'trigger'), 'only after terminal response');
      await pause(100);
      assert.equal(existsSync(join(root, 'marker')), false);
    });
  }
  test(`${kind} retains cancellation semantics while ending owned descendants`, { skip: process.platform === 'win32' }, async t => {
    const root = fixture(t), argv = command(root, { pipes: true, running: true });
    const controller = new AbortController();
    let pending, child;
    if (kind === 'runCommand') pending = runCommand(argv, { cwd: root, signal: controller.signal, timeoutMs: 3000 });
    else {
      const config = join(root, 'config.json');
      writeFileSync(config, JSON.stringify({ token: 'owned', cwd: root, command: argv, prompt: 'fixture', timeoutSeconds: 5, minutes: 1, port: 12345 }));
      child = spawn(process.execPath, [resolve(`plugins/just-vibe/scripts/${kind}.mjs`), config], { stdio: 'ignore' });
      t.after(() => child.kill('SIGKILL'));
      pending = new Promise((ok, fail) => { child.once('error', fail); child.once('close', ok); });
    }
    await until(() => existsSync(join(root, 'ready')));
    if (kind === 'runCommand') controller.abort();
    else writeFileSync(join(root, 'stop'), 'owned');
    const result = await pending;
    if (kind === 'runCommand') { assert.equal(result.cancelled, true); assert.equal(result.timedOut, false); }
    else assert.equal(JSON.parse(readFileSync(join(root, 'status.json'), 'utf8')).state, kind === 'agent-worker' ? 'cancelled' : 'stopped');
    writeFileSync(join(root, 'trigger'), 'after cancellation');
    await pause(100);
    assert.equal(existsSync(join(root, 'marker')), false);
  });
}

test('service reservation remains active through descendant cleanup and accepts a stop during grace', { skip: process.platform === 'win32' }, async t => {
  const root = fixture(t), options = { home: join(root, 'home') };
  let state = await runners(root, 'configure', { id: 'fixture', revision: 0, config: {
    command: command(root, { ignoreTerm: true }), purpose: 'Inert service lifetime',
  } }, options);
  const hash = state.runners[0].hash;
  state = await runners(root, 'trust', { id: 'fixture', revision: state.revision, hash }, options);
  let service = await services(root, 'configure', { id: 'fixture', revision: 0, runner: 'fixture', hash, durationSeconds: 5 }, options);
  service = await services(root, 'start', { id: 'fixture', revision: service.revision }, options);
  await until(() => existsSync(join(root, 'term')));
  assert.equal((await services(root, 'show', { id: 'fixture' }, options)).run.state, 'running');
  await assert.rejects(services(root, 'start', { id: 'fixture', revision: service.revision }, options), /active/);
  await assert.rejects(services(root, 'configure', { id: 'fixture', revision: service.revision, runner: 'fixture', hash }, options), /Stop/);
  assert.equal((await services(root, 'stop', { id: 'fixture', revision: service.revision }, options)).stopRequested, true);
  await until(async () => (await services(root, 'show', { id: 'fixture' }, options)).run.state === 'stopped');
  writeFileSync(join(root, 'trigger'), 'after terminal');
  await pause(100);
  assert.equal(existsSync(join(root, 'marker')), false);
});

test('preview redacts identical secret-assignment bytes identically across stream chunks', t => {
  const root = fixture(t), outputs = [];
  for (const split of [false, true]) {
    const dir = join(root, split ? 'split' : 'whole'); mkdirSync(dir);
    const status = join(dir, 'status.json');
    const code = split
      ? `const fs=require('node:fs');process.stdout.write('api_key=inert-fixture-prefix');const t=setInterval(()=>{try{if(JSON.parse(fs.readFileSync(${JSON.stringify(status)},'utf8')).output.includes('[REDACTED]')){clearInterval(t);process.stdout.write('-PRIVATE-SUFFIX\\n')}}catch{}},10);`
      : `process.stdout.write('api_key=inert-fixture-prefix-PRIVATE-SUFFIX\\n')`;
    const config = join(dir, 'config.json');
    writeFileSync(config, JSON.stringify({ token: 'fixture', cwd: dir, command: [process.execPath, '-e', code], minutes: 1, port: 12345 }));
    const result = spawnSync(process.execPath, [resolve('plugins/just-vibe/scripts/preview-worker.mjs'), config], { encoding: 'utf8', timeout: 5000 });
    assert.equal(result.status, 0, result.stderr);
    outputs.push(JSON.parse(readFileSync(status, 'utf8')).output);
  }
  assert.equal(outputs[0], 'api_key=[REDACTED]\n');
  assert.equal(outputs[1], outputs[0]);
});
