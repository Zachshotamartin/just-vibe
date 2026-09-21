import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
import { digest } from '../plugins/just-vibe/scripts/lib/storage.mjs';
import { findExecutable } from '../plugins/just-vibe/scripts/lib/command.mjs';
import { runCommand } from '../plugins/just-vibe/scripts/lib/process.mjs';

function fixture(t, alias = false) {
  const path = mkdtempSync(join(alias && process.platform === 'darwin' ? '/tmp' : tmpdir(), 'jv-runner-identity-'));
  const directory = alias ? path : realpathSync(path);
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = join(directory, 'project'), options = { home: join(directory, 'home') };
  mkdirSync(root);
  writeFileSync(join(root, 'source.mjs'), 'console.log("reviewed fixture")');
  return { root, options };
}
function link(t, target, path, type = 'file') {
  try { symlinkSync(target, path, type); return true; }
  catch (error) {
    if (process.platform !== 'win32' || !['EPERM', 'EACCES'].includes(error.code)) throw error;
    t.skip('This Windows account cannot create symlinks.');
    return false;
  }
}

for (const kind of ['file', 'dangling', 'directory']) {
  test(`runner configuration rejects a ${kind} symlink in executable argv`, async (t) => {
    const f = fixture(t);
    let argument = 'entry.mjs';
    if (kind === 'directory') {
      mkdirSync(join(f.root, 'actual'));
      writeFileSync(join(f.root, 'actual', 'source.mjs'), 'console.log("fixture")');
      if (!link(t, 'actual', join(f.root, 'linked'), 'dir')) return;
      argument = 'linked/source.mjs';
    } else if (!link(t, kind === 'dangling' ? 'missing.mjs' : 'source.mjs', join(f.root, argument))) return;
    await assert.rejects(runners(f.root, 'configure', { id: 'fixture', revision: 0,
      config: { command: [process.execPath, argument], purpose: 'Inert fixture' } }, f.options), /Symlink/);
    assert.equal((await runners(f.root, 'list', {}, f.options)).revision, 0);
  });
}

test('old trusted runner records cannot execute an omitted symlink input after upgrade', async (t) => {
  const f = fixture(t);
  if (!link(t, 'source.mjs', join(f.root, 'entry.mjs'))) return;
  const state = await runners(f.root, 'configure', { id: 'fixture', revision: 0,
    config: { command: [process.execPath, 'source.mjs'], purpose: 'Inert fixture' } }, f.options);
  const { current, trusted, id, configuredAt, hash, ...config } = state.runners[0];
  config.command = [config.command[0], 'entry.mjs'];
  config.inputs = config.inputs.filter((input) => input.path === config.command[0]);
  const legacy = { id, configuredAt, ...config, hash: digest(JSON.stringify(config)), trusted: true };
  const store = runtimeStore(f.root, f.options);
  const saved = store.put('trusted-runners', { runners: [legacy] }, state.revision);
  writeFileSync(join(f.root, 'source.mjs'), 'console.log("changed unreviewed fixture")');
  assert.equal((await runners(f.root, 'show', { id }, f.options)).runner.current, false);
  await assert.rejects(runners(f.root, 'trust', { id, hash: legacy.hash, revision: saved.revision }, f.options), /identity/);
  let dispatched = false;
  await assert.rejects(runners(f.root, 'run', { id, hash: legacy.hash }, {
    ...f.options, runCommand: async () => { dispatched = true; return { status: 0 }; },
  }), /identity/);
  assert.equal(dispatched, false);
});

test('regular script argv preserves exact execution and rejects changed inputs', async (t) => {
  const f = fixture(t);
  let state = await runners(f.root, 'configure', { id: 'fixture', revision: 0,
    config: { command: [process.execPath, 'source.mjs'], purpose: 'Inert fixture' } }, f.options);
  const hash = state.runners[0].hash;
  assert.equal(state.runners[0].current, true);
  state = await runners(f.root, 'trust', { id: 'fixture', hash, revision: state.revision }, f.options);
  const result = await runners(f.root, 'run', { id: 'fixture', hash }, f.options);
  assert.equal(result.passed, true);
  assert.equal(result.stdout.trim(), 'reviewed fixture');
  writeFileSync(join(f.root, 'source.mjs'), 'console.log("changed fixture")');
  assert.equal((await runners(f.root, 'show', { id: 'fixture' }, f.options)).runner.current, false);
});

test('aliased project roots and long inline Node arguments are valid runner configurations', async (t) => {
  const f = fixture(t, true);
  if (process.platform === 'darwin') assert.notEqual(f.root, realpathSync(f.root));
  const commands = [
    [process.execPath, 'source.mjs'],
    [process.execPath, '--check', 'source.mjs'],
    [process.execPath, '-e', '/*' + 'x'.repeat(400) + '*/ console.log("long inert fixture")'],
  ];
  let revision = 0;
  for (const [index, command] of commands.entries()) {
    const id = `fixture-${index}`;
    let state = await runners(f.root, 'configure', { id, revision, config: { command, purpose: 'Inert fixture' } }, f.options);
    const record = state.runners.find(r => r.id === id);
    assert.equal(record.current, true);
    state = await runners(f.root, 'trust', { id, hash: record.hash, revision: state.revision }, f.options);
    revision = state.revision;
    const result = await runners(f.root, 'run', { id, hash: record.hash }, f.options);
    assert.equal(result.passed, true, result.stderr);
  }
});

test('offline npm script argv executes from an aliased project root with declared inputs', async (t) => {
  if (!findExecutable('npm')) { t.skip('npm is not installed.'); return; }
  const f = fixture(t, true);
  writeFileSync(join(f.root, 'package.json'), JSON.stringify({ name: 'inert-fixture', private: true, scripts: { check: 'node source.mjs' } }));
  const options = { ...f.options, runCommand: (command, execution) => runCommand(command, { ...execution, env: { ...process.env,
    npm_config_offline: 'true', npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' } }) };
  let state = await runners(f.root, 'configure', { id: 'fixture', revision: 0, config: {
    command: ['npm', 'run', 'check', '--', '--fixture-option'], inputs: ['package.json', 'source.mjs'], purpose: 'Inert local package script',
  } }, options);
  const hash = state.runners[0].hash;
  assert.equal(state.runners[0].current, true);
  state = await runners(f.root, 'trust', { id: 'fixture', hash, revision: state.revision }, options);
  const result = await runners(f.root, 'run', { id: 'fixture', hash }, options);
  assert.equal(result.passed, true, result.stderr);
  assert.match(result.stdout, /reviewed fixture/);
});
