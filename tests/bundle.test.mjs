import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { stageBundle, packageRoot, validateBundle } from '../plugins/just-vibe/scripts/lib/bundle.mjs';
import { install, parseArgs, PLUGIN } from '../plugins/just-vibe/scripts/installer.mjs';
import { claudeShortcuts } from '../plugins/just-vibe/scripts/lib/claude-shortcuts.mjs';

function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), 'just-vibe bundle '));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function host(target, source) {
  const state = { installed: false, registered: false };
  const mutations = [];
  return { source, log: () => {}, state, mutations,
    shortcuts: (options, args) => claudeShortcuts(options, { ...args, root: `${source}-claude-config` }), run(binary, args) {
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
      const entries = state.installed ? [{ id: PLUGIN, pluginId: PLUGIN, scope: 'user', enabled: state.enabled ?? true, version: state.version }] : [];
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

test('doctor reports a disabled plugin and a stale version together (A3-23)', t => {
  const fixture = host('codex', join(temporary(t), 'managed'));
  install(parseArgs(['setup']), fixture);
  Object.assign(fixture.state, { enabled: false, version: '0.0.1' });
  assert.throws(() => install(parseArgs(['doctor']), fixture), error => /needs 2 repairs/.test(error.message) && /installed but disabled/.test(error.message) && /version differs/.test(error.message));
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

test('a first install lists the entry workflows; an existing full install keeps every skill on update', t => {
  const root = temporary(t), fresh = join(root, 'fresh'), full = join(root, 'full');
  stageBundle(fresh, { target: 'claude' });
  const selection = JSON.parse(readFileSync(join(fresh, 'plugins/just-vibe/selection.json'), 'utf8'));
  assert.equal(selection.profile, 'entry');
  assert.ok(existsSync(join(fresh, 'plugins/just-vibe/skills/fix/SKILL.md')));
  // Excluded workflows stay installed as references that routing and workflow_load still read.
  assert.equal(existsSync(join(fresh, 'plugins/just-vibe/skills/db-migrate/SKILL.md')), false);
  assert.ok(existsSync(join(fresh, 'plugins/just-vibe/skills/db-migrate/REFERENCE.md')));
  stageBundle(full, { target: 'claude', selection: { profile: 'full', packs: [] } });
  stageBundle(full, { target: 'claude', replace: true });
  assert.ok(existsSync(join(full, 'plugins/just-vibe/skills/db-migrate/SKILL.md')), 'Update keeps the full selection');
  stageBundle(fresh, { target: 'claude', replace: true });
  assert.equal(JSON.parse(readFileSync(join(fresh, 'plugins/just-vibe/selection.json'), 'utf8')).profile, 'entry', 'Update keeps the entry selection');
  // Choosing only rule packs on a first install still lists the entry workflows, as editor adapters do.
  const ruled = join(root, 'ruled');
  stageBundle(ruled, { target: 'claude', selection: { rules: ['typescript'] } });
  const recorded = JSON.parse(readFileSync(join(ruled, 'plugins/just-vibe/selection.json'), 'utf8'));
  assert.deepEqual([recorded.profile, recorded.rules], ['entry', ['typescript']]);
});

test('Claude code intelligence registers PATH language servers, survives updates and turns off', async t => {
  const { chmodSync } = await import('node:fs');
  const root = temporary(t), bin = join(root, 'bin'), destination = join(root, 'claude');
  mkdirSync(bin);
  for (const name of ['typescript-language-server', 'gopls']) {
    const file = join(bin, process.platform === 'win32' ? `${name}.cmd` : name);
    writeFileSync(file, process.platform === 'win32' ? '@echo off\r\n' : '#!/bin/sh\n');
    chmodSync(file, 0o755);
  }
  const env = { PATH: bin, PATHEXT: '.CMD' }, marker = () => JSON.parse(readFileSync(join(destination, '.just-vibe-managed.json'), 'utf8'));
  const lsp = join(destination, 'plugins/just-vibe/.lsp.json');
  stageBundle(destination, { target: 'claude', codeIntelligence: true, env });
  const servers = JSON.parse(readFileSync(lsp, 'utf8'));
  assert.deepEqual(Object.keys(servers).sort(), ['go', 'typescript']);
  assert.deepEqual(servers.typescript.args, ['--stdio']);
  assert.equal(servers.go.extensionToLanguage['.go'], 'go');
  assert.ok(Object.values(servers).every(s => Object.keys(s).every(k => ['command', 'args', 'extensionToLanguage'].includes(k))), 'only keys the strict .lsp.json schema accepts');
  assert.deepEqual(marker().codeIntelligence.binaries.map(b => b.id).sort(), ['go', 'typescript']);
  assert.match(marker().codeIntelligence.binaries[0].sha256, /^[0-9a-f]{64}$/);
  stageBundle(destination, { target: 'claude', replace: true, env });
  assert.ok(existsSync(lsp), 'an update keeps code intelligence on');
  stageBundle(destination, { target: 'claude', replace: true, codeIntelligence: false, env });
  assert.equal(existsSync(lsp), false);
  assert.equal(marker().codeIntelligence, undefined);
  const codex = join(root, 'codex');
  stageBundle(codex, { target: 'codex', codeIntelligence: true, env });
  assert.equal(existsSync(join(codex, 'plugins/just-vibe/.lsp.json')), false, 'Codex has no plugin language servers');
  assert.equal(parseArgs(['setup', '--target', 'claude', '--code-intelligence', 'on']).codeIntelligence, true);
  assert.throws(() => parseArgs(['setup', '--target', 'codex', '--code-intelligence', 'on']), /bundled Claude Code plugin/);
});
