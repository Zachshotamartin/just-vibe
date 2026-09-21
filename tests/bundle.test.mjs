import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { stageBundle, packageRoot, validateBundle } from '../plugins/just-vibe/scripts/lib/bundle.mjs';
import { install, parseArgs, PLUGIN } from '../plugins/just-vibe/scripts/installer.mjs';

function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), 'just-vibe bundle '));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function host(target, source) {
  const state = { installed: false, registered: false };
  const mutations = [];
  return { source, log: () => {}, state, mutations, run(binary, args) {
    assert.notEqual(binary, 'git', 'Bundled installs must not require Git or GitHub');
    if (args.includes('--version')) return 'fixture';
    if (args.includes('--help')) { if (state.failPreflight) throw new Error('preflight failed'); return 'help'; }
    if (args.includes('--json')) {
      if (args[1] === 'marketplace') {
        const entries = state.registered ? [target === 'codex'
          ? { name: 'just-vibe', marketplaceSource: { sourceType: 'local', source: state.source || source } }
          : { name: 'just-vibe', source: 'directory', path: state.source || source }] : [];
        return JSON.stringify(target === 'codex' ? { marketplaces: entries } : entries);
      }
      const entries = state.installed ? [{ id: PLUGIN, pluginId: PLUGIN, scope: 'user', enabled: true, version: state.version }] : [];
      return JSON.stringify(target === 'codex' ? { installed: entries } : entries);
    }
    mutations.push(args);
    assert.ok(existsSync(source), 'Host registration must see a complete persistent copy');
    if (args[1] === 'marketplace') state.registered = true;
    else if (['uninstall', 'remove'].includes(args[1])) state.installed = false;
    else { if (state.failInstall) throw new Error('installation failed'); state.installed = true; state.version = validateBundle(source); }
    return 'ok';
  } };
}

for (const target of ['codex', 'claude']) test(`${target}: bundled lifecycle needs no Git, preserves other data and survives loss of package cache`, t => {
  const root = temporary(t), source = join(root, 'managed'), cache = join(root, 'cache');
  const fixture = host(target, source);
  cpSync(packageRoot, cache, { recursive: true, filter: path => !/[\\/](\.git|\.tmp|node_modules|dist)([\\/]|$)/.test(path) });
  const options = parseArgs(['setup', '--target', target]);
  install(options, { ...fixture, prepare: path => stageBundle(path, { root: cache }) });
  writeFileSync(join(root, 'unrelated-settings.json'), 'preserve');
  rmSync(cache, { recursive: true, force: true });
  install(options, fixture);
  install({ ...options, command: 'doctor' }, fixture);
  assert.equal(fixture.mutations.length, 2);
  install({ ...options, command: 'update' }, fixture);
  install({ ...options, command: 'uninstall' }, fixture);
  install({ ...options, command: 'uninstall' }, fixture);
  assert.equal(readFileSync(join(root, 'unrelated-settings.json'), 'utf8'), 'preserve');
  assert.ok(existsSync(join(source, 'plugins/just-vibe/LICENSE')));
  assert.equal(fixture.state.registered, true);
  assert.equal(fixture.state.installed, false);
});

test('setup preserves the stored version; update replaces it from the selected package', t => {
  const root = temporary(t), source = join(root, 'managed');
  const version = stageBundle(source);
  const payload = join(source, 'plugins/just-vibe/skills/help/SKILL.md');
  const original = readFileSync(payload, 'utf8');
  writeFileSync(payload, 'old version sentinel');
  assert.equal(stageBundle(source), version);
  assert.equal(readFileSync(payload, 'utf8'), 'old version sentinel');
  assert.throws(() => stageBundle(source, { replace: true }), /user edits/);
  assert.equal(readFileSync(payload, 'utf8'), 'old version sentinel');
  writeFileSync(payload, original);
  stageBundle(source, { replace: true });
  assert.notEqual(readFileSync(payload, 'utf8'), 'old version sentinel');
});

test('source conflict and failed command preflight leave the filesystem untouched', t => {
  for (const state of [{ registered: true, source: '/another/source' }, { failPreflight: true }]) {
    const source = join(temporary(t), 'managed');
    const fixture = host('codex', source);
    Object.assign(fixture.state, state);
    assert.throws(() => install(parseArgs(['setup']), fixture), /different or unrecognized|preflight failed/);
    assert.equal(existsSync(source), false);
    assert.equal(fixture.mutations.length, 0);
  }
});

test('failed host install retains a usable managed payload for retry', t => {
  const fixture = host('codex', join(temporary(t), 'managed'));
  fixture.state.failInstall = true;
  assert.throws(() => install(parseArgs(['setup']), fixture), /Earlier native steps/);
  assert.ok(validateBundle(fixture.source));
  fixture.state.failInstall = false;
  install(parseArgs(['setup']), fixture);
  assert.equal(fixture.state.installed, true);
});

test('invalid new payload, unmanaged directories, and symlinks are never replaced', t => {
  const root = temporary(t), source = join(root, 'managed');
  const version = stageBundle(source);
  assert.throws(() => stageBundle(source, { root, replace: true }), /complete npm package/);
  assert.equal(validateBundle(source), version);
  const other = join(root, 'user-files');
  mkdirSync(other); writeFileSync(join(other, 'keep'), 'keep');
  assert.throws(() => stageBundle(other), /not managed/);
  assert.equal(readFileSync(join(other, 'keep'), 'utf8'), 'keep');
  const link = join(root, 'link');
  symlinkSync(other, link, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => stageBundle(link), /symlink/);
});

test('copy lock prevents competing update and preserves the old source', t => {
  const source = join(temporary(t), 'managed');
  const version = stageBundle(source);
  mkdirSync(`${source}.lock`);
  assert.throws(() => stageBundle(source, { replace: true }), /Another installation/);
  assert.equal(validateBundle(source), version);
});

test('dry run performs no copying, and conflicting source flags are rejected', t => {
  const source = join(temporary(t), 'managed');
  install(parseArgs(['setup', '--dry-run']), { source, run: () => assert.fail(), prepare: () => assert.fail(), log: () => {} });
  assert.equal(existsSync(source), false);
  assert.throws(() => parseArgs(['setup', '--local', '--github']), /cannot be combined/);
});

test('a stale host cache is not reported as a successful update or healthy installation', t => {
  const fixture = host('codex', join(temporary(t), 'managed'));
  install(parseArgs(['setup']), fixture);
  fixture.state.version = '0.0.1';
  assert.throws(() => install(parseArgs(['doctor']), fixture), /version differs/);
  const run = (binary, args) => {
    const output = fixture.run(binary, args);
    if (args[1] === 'add' && !args.includes('--help')) fixture.state.version = '0.0.1';
    return output;
  };
  assert.throws(() => install(parseArgs(['update']), { ...fixture, run }), /Host still reports/);
});
