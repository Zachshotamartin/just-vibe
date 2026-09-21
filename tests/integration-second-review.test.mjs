import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { gitHooks } from '../plugins/just-vibe/scripts/lib/git-hooks.mjs';
import { stagedQuality } from '../plugins/just-vibe/scripts/lib/quality.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
import { stageBundle } from '../plugins/just-vibe/scripts/lib/bundle.mjs';
import { install, parseArgs } from '../plugins/just-vibe/scripts/installer.mjs';
import { fixtureGit } from '../scripts/lib/host-fixture.mjs';
import { releaseEnvironment } from '../scripts/lib/git.mjs';

function fixture(t) {
  const base = fs.realpathSync(fs.mkdtempSync(join(tmpdir(), 'jv-integrations-second-')));
  const root = join(base, 'project');
  fs.mkdirSync(root);
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')));
  const git = (...args) => spawnSync('git', ['-c', 'commit.gpgSign=false', '-C', root, ...args], { env, encoding: 'utf8' });
  assert.equal(git('init', '-q').status, 0);
  assert.equal(git('config', 'user.name', 'Fixture').status, 0);
  assert.equal(git('config', 'user.email', 'fixture@example.invalid').status, 0);
  return { base, root, git, options: { home: join(base, 'home') } };
}

test('native pre-commit checks the temporary index for only/all commits and rejects foreign indexes', async (t) => {
  const { base, root, git, options } = fixture(t);
  const file = join(root, 'file.txt');
  fs.writeFileSync(file, 'baseline\n');
  assert.equal(git('add', '.').status, 0);
  assert.equal(git('commit', '-qm', 'baseline').status, 0);
  const preview = await gitHooks(root, 'preview', {}, options);
  await gitHooks(root, 'install', { revision: preview.revision, hash: preview.hash }, options);
  const head = git('rev-parse', 'HEAD').stdout;
  for (const args of [['--only', 'file.txt'], ['--all']]) {
    fs.writeFileSync(file, '<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> branch\n');
    const blocked = git('commit', ...args, '-m', 'must fail');
    assert.notEqual(blocked.status, 0, blocked.stdout + blocked.stderr);
    assert.match(blocked.stderr, /Staged secret or conflict/);
    assert.equal(git('rev-parse', 'HEAD').stdout, head);
  }
  fs.writeFileSync(file, 'valid selected change\n');
  const passed = git('commit', '--only', 'file.txt', '-m', 'valid partial commit');
  assert.equal(passed.status, 0, passed.stderr);
  assert.equal(git('show', 'HEAD:file.txt').stdout, 'valid selected change\n');

  const foreign = join(base, 'foreign-index');
  fs.copyFileSync(join(root, '.git/index'), foreign);
  const before = fs.readFileSync(foreign);
  const previous = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith('GIT_')));
  try {
    process.env.GIT_DIR = join(base, 'unrelated.git');
    process.env.GIT_WORK_TREE = base;
    process.env.GIT_INDEX_FILE = foreign;
    assert.deepEqual(stagedQuality(root).files, [], 'standalone quality ignores inherited index and repository overrides');
    await assert.rejects(gitHooks(root, 'check', {}, options), /outside|escape/i);
    assert.deepEqual(fs.readFileSync(foreign), before);
  } finally {
    for (const key of Object.keys(process.env)) if (key.startsWith('GIT_')) delete process.env[key];
    Object.assign(process.env, previous);
  }
});

test('Git hook ownership reservations precede mutation and recover interrupted final writes', async (t) => {
  const { root, options } = fixture(t);
  const store = runtimeStore(root, options);
  const lock = join(store.home, store.prefix, 'git-hook.json.lock');
  fs.mkdirSync(join(store.home, store.prefix), { recursive: true });
  const hold = () => fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, token: 'fixture' }));
  let preview = await gitHooks(root, 'preview', {}, options);
  hold();
  await assert.rejects(gitHooks(root, 'install', { revision: preview.revision, hash: preview.hash }, options), /being updated/);
  assert.equal(fs.existsSync(preview.path), false);
  fs.unlinkSync(lock);

  const originalWrite = fs.writeFileSync;
  try {
    fs.writeFileSync = function(path, ...args) {
      const result = originalWrite.call(this, path, ...args);
      if (path === preview.path) originalWrite(lock, JSON.stringify({ pid: process.pid, token: 'fixture' }));
      return result;
    };
    syncBuiltinESMExports();
    await assert.rejects(gitHooks(root, 'install', { revision: preview.revision, hash: preview.hash }, options), /being updated/);
  } finally { fs.writeFileSync = originalWrite; syncBuiltinESMExports(); }
  fs.unlinkSync(lock);
  let status = await gitHooks(root, 'status', {}, options);
  assert.equal(status.managed, true);
  assert.equal(status.pending, 'install');
  preview = await gitHooks(root, 'preview', {}, options);
  await gitHooks(root, 'install', { revision: preview.revision, hash: preview.hash }, options);
  status = await gitHooks(root, 'status', {}, options);
  assert.equal(status.pending, null);

  const originalUnlink = fs.unlinkSync;
  try {
    fs.unlinkSync = function(path, ...args) {
      const result = originalUnlink.call(this, path, ...args);
      if (path === status.path) hold();
      return result;
    };
    syncBuiltinESMExports();
    await assert.rejects(gitHooks(root, 'uninstall', { revision: status.revision, hash: status.hash }, options), /being updated/);
  } finally { fs.unlinkSync = originalUnlink; syncBuiltinESMExports(); }
  fs.unlinkSync(lock);
  status = await gitHooks(root, 'status', {}, options);
  assert.equal(status.pending, 'uninstall');
  assert.equal(fs.existsSync(status.path), false);
  fs.writeFileSync(status.path, '#!/bin/sh\n# foreign hook\n');
  await assert.rejects(gitHooks(root, 'uninstall', { revision: status.revision, hash: status.hash }, options), /changed or missing/);
  assert.match(fs.readFileSync(status.path, 'utf8'), /foreign hook/);
  fs.unlinkSync(status.path);
  await gitHooks(root, 'uninstall', { revision: status.revision, hash: status.hash }, options);
  assert.equal((await gitHooks(root, 'status', {}, options)).pending, null);
});

test('native doctor detects missing, changed and added managed files without modifying the bundle', (t) => {
  const { base } = fixture(t);
  for (const target of ['codex', 'claude']) {
    const source = join(base, target);
    const version = stageBundle(source, { target });
    const run = (_host, args) => {
      if (args[0] === '--version') return 'fixture';
      if (args.join(' ') === 'plugin marketplace list --json') {
        return JSON.stringify(target === 'codex' ? { marketplaces: [{ name: 'just-vibe', marketplaceSource: { sourceType: 'local', source } }] } : [{ name: 'just-vibe', source: 'directory', path: source }]);
      }
      if (args.join(' ') === 'plugin list --json') {
        const entries = [{ pluginId: 'just-vibe@just-vibe', version, enabled: true, scope: 'user' }];
        return JSON.stringify(target === 'codex' ? { installed: entries } : entries);
      }
      throw Error('Doctor must not mutate the host');
    };
    const doctor = () => install(parseArgs(['doctor', '--target', target]), { source, run, log() {} });
    doctor();
    const file = join(source, 'plugins/just-vibe/scripts/lib/storage.mjs');
    const original = fs.readFileSync(file);
    fs.unlinkSync(file);
    assert.throws(doctor, /1 missing, 0 changed, 0 added/);
    assert.equal(fs.existsSync(file), false);
    fs.writeFileSync(file, 'user edit\n');
    assert.throws(doctor, /0 missing, 1 changed, 0 added/);
    assert.equal(fs.readFileSync(file, 'utf8'), 'user edit\n');
    fs.writeFileSync(file, original);
    const added = join(source, 'local-note.txt');
    fs.writeFileSync(added, 'preserve me');
    assert.throws(doctor, /0 missing, 0 changed, 1 added/);
    assert.equal(fs.readFileSync(added, 'utf8'), 'preserve me');
    fs.unlinkSync(added);
    doctor();
  }
});

test('live-host fixture helper isolates Git overrides and disables hooks and signing offline', (t) => {
  const { base, root: foreign, git } = fixture(t);
  fs.writeFileSync(join(foreign, 'foreign.txt'), 'foreign baseline\n');
  assert.equal(git('add', '.').status, 0);
  assert.equal(git('commit', '-qm', 'foreign baseline').status, 0);
  fs.writeFileSync(join(foreign, 'foreign.txt'), 'foreign staged content\n');
  assert.equal(git('add', '.').status, 0);
  const before = ['config', 'index', 'HEAD'].map(name => fs.readFileSync(join(foreign, '.git', name)));
  const selected = join(base, 'selected'), emptyHooks = join(base, 'empty-hooks');
  fs.mkdirSync(selected); fs.mkdirSync(emptyHooks);
  const env = {
    ...process.env, GIT_DIR: join(foreign, '.git'), GIT_WORK_TREE: foreign,
    GIT_INDEX_FILE: join(foreign, '.git/index'), GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'user.name', GIT_CONFIG_VALUE_0: 'redirected',
  };
  const run = args => fixtureGit(selected, emptyHooks, args, env);
  run(['init', '-q']);
  run(['config', 'user.name', 'Fixture']);
  run(['config', 'user.email', 'fixture@example.invalid']);
  run(['config', 'commit.gpgSign', 'true']);
  run(['config', 'gpg.program', join(base, 'must-not-execute-signing')]);
  const hooks = join(base, 'untrusted-hooks'); fs.mkdirSync(hooks);
  fs.writeFileSync(join(hooks, 'pre-commit'), '#!/bin/sh\nexit 92\n', { mode: 0o755 });
  run(['config', 'core.hooksPath', hooks]);
  fs.writeFileSync(join(selected, 'fixture.txt'), 'selected content\n');
  run(['add', '.']);
  run(['commit', '-qm', 'fixture']);
  assert.equal(run(['show', 'HEAD:fixture.txt']), 'selected content\n');
  assert.equal(run(['log', '-1', '--format=%an']).trim(), 'Fixture');
  assert.equal(run(['diff', '--name-only']).trim(), '');
  assert.deepEqual(['config', 'index', 'HEAD'].map(name => fs.readFileSync(join(foreign, '.git', name))), before);
  assert.equal(fs.readFileSync(join(foreign, 'foreign.txt'), 'utf8'), 'foreign staged content\n');
  const hostProbe = spawnSync(process.execPath, ['-e', 'process.stdout.write(JSON.stringify(Object.keys(process.env).filter(k=>/^GIT_/i.test(k))))'], { env: releaseEnvironment(env), encoding: 'utf8' });
  assert.equal(hostProbe.status, 0, hostProbe.stderr);
  assert.deepEqual(JSON.parse(hostProbe.stdout), []);
});
