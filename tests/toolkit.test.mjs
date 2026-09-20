import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, symlinkSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { loadCatalog, getCommand, searchCommands, availability, validateCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { inspectProject } from '../plugins/just-vibe/scripts/lib/project.mjs';
import { discoverCapabilities, validateCapabilityReport, listTools, recommend } from '../plugins/just-vibe/scripts/lib/discovery.mjs';
import { main, parseToolkitArgs } from '../plugins/just-vibe/scripts/toolkit.mjs';

const catalog = loadCatalog();
function fixture(t) {
  const path = mkdtempSync(join(tmpdir(), 'just-vibe-toolkit-'));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
}
function report(root, capabilities) { return { schemaVersion: 1, root, observedAt: new Date().toISOString(), capabilities }; }

test('search resolves exact IDs, pack names, aliases and scenario language', () => {
  assert.deepEqual(searchCommands(catalog, 'ml-leakage').map(x => x.command.id), ['ml-leakage']);
  assert.equal(getCommand(catalog, '/just-vibe:do', { canonical: true }).id, 'auto');
  assert.equal(searchCommands(catalog, 'React').length, 8);
  assert.ok(searchCommands(catalog, 'ML evaluation').every(x => x.command.pack === 'ml-evaluation'));
  for (const [query, expected] of [
    ['model scores well offline but fails in production', 'ml-parity'],
    ['move uncommitted changes to another branch', 'git-worktree'],
    ['preview deployments behave differently from local builds', 'vercel-build-fix'],
    ['product grid freezes when filters change', 'react-rerenders'],
  ]) assert.equal(searchCommands(catalog, query)[0].command.id, expected, query);
  assert.throws(() => searchCommands(catalog, '', { pack: 'nonexistent' }), /Unknown pack/);
});

test('teach supports both topic and workflow lessons without requiring external capabilities', t => {
  const root = fixture(t);
  const command = getCommand(catalog, 'teach');
  assert.equal(command.defaultMode, 'inspect');
  assert.equal(command.examples.length, 3);
  assert.equal(command.examples[0].mode, 'inspect');
  assert.equal(command.examples[1].mode, 'inspect');
  assert.equal(searchCommands(catalog, 'teach linked lists')[0].command.id, 'teach');
  const found = discoverCapabilities(root, { executable: () => null, git: () => null });
  assert.equal(listTools(catalog, found, { query: 'teach', available: true })[0].status, 'available');
  assert.equal(listTools(catalog, found, { all: true }).length, catalog.commands.length);
});

test('catalog rejects alias drift, undeclared capabilities and escaping skill paths', () => {
  for (const mutate of [
    c => { c.commands.find(x => x.id === 'do').aliasOf = 'do'; },
    c => { c.commands[0].capabilities = ['fake']; },
    c => { c.commands[0].skillPath = '../outside.md'; },
    c => { c.commands.push(structuredClone(c.commands[0])); },
  ]) {
    const c = structuredClone(catalog); mutate(c);
    assert.throws(() => validateCatalog(c, { schemaVersion: 1, packs: c.packs }));
  }
});

test('discovery never treats an installed CLI as authentication', t => {
  const root = fixture(t);
  const found = discoverCapabilities(root, { executable: () => '/fake/cli', git: () => null });
  assert.equal(found.capabilities['git.repo'].status, 'missing');
  assert.equal(found.capabilities['github.context'].status, 'unknown');
  assert.ok(found.integrations.every(c => c.authenticated === 'unknown'));
  assert.ok(!listTools(catalog, found, { available: true }).some(c => c.id === 'github-review'));
});

test('explicit recent host evidence enables only its declared capability', t => {
  const root = fixture(t);
  const found = discoverCapabilities(root, { executable: () => null, git: () => null,
    report: report(root, { 'github.context': { status: 'available', reason: 'Observed the requested PR.' },
      'git.repo': { status: 'available', reason: 'Attempted override of local state.' } }) });
  assert.equal(found.capabilities['git.repo'].status, 'missing');
  assert.equal(found.capabilities['github.context'].source, 'host-report');
  assert.equal(listTools(catalog, found, { query: 'github-review', available: true }).length, 1);
  assert.equal(listTools(catalog, found, { query: 'vercel-audit', available: true }).length, 0);
});

test('capability reports reject stale, future, other-project and malformed evidence', t => {
  const root = fixture(t), other = fixture(t);
  for (const r of [
    { ...report(root, {}), observedAt: '2000-01-01T00:00:00Z' },
    { ...report(root, {}), observedAt: '3000-01-01T00:00:00Z' },
    report(other, {}), report(root, { 'unknown.tool': { status: 'available', reason: 'x' } }),
    report(root, { 'github.context': { status: 'connected', reason: 'x' } }),
  ]) assert.throws(() => validateCapabilityReport(r, root));
});

test('inventory distinguishes planned, uninstalled, blocked and unknown states', t => {
  const root = fixture(t);
  const base = getCommand(catalog, 'github-review');
  assert.equal(availability(catalog, base, {}).status, 'unknown');
  assert.equal(availability(catalog, base, { 'github.context': { status: 'disabled', reason: 'Host disabled connector.' } }).status, 'blocked');
  assert.equal(availability(catalog, { ...base, implementationStatus: 'planned' }).status, 'planned');
  assert.equal(availability({ ...catalog, root }, base).status, 'uninstalled');
  mkdirSync(join(root, 'skills/do'), { recursive: true });
  writeFileSync(join(root, 'skills/do/SKILL.md'), 'Alias wrapper exists but the router is missing.');
  assert.equal(availability({ ...catalog, root }, getCommand(catalog, 'do')).status, 'uninstalled');
});

test('routing preserves the complete brief, never recurses, and separates unavailable candidates', t => {
  const root = fixture(t);
  const found = discoverCapabilities(root, { executable: () => null, git: () => null });
  const brief = 'Fix GitHub Actions CI.\nNo new dependencies. Do not push or post comments.';
  const route = recommend(catalog, found, brief);
  assert.equal(route.brief, brief);
  assert.equal(route.executableHere, false);
  assert.ok([...route.available, ...route.unavailable].every(c => !['auto', 'do', 'help', 'tools', 'setup'].includes(c.id)));
  assert.ok(route.unavailable.some(c => c.id === 'github-fix-ci'));
  assert.ok(route.available.every(c => c.status === 'available'));
});

test('project inspection is bounded, skips secrets/symlinks and never executes scripts or config', t => {
  const root = fixture(t), outside = fixture(t);
  mkdirSync(join(root, 'packages/app'), { recursive: true });
  mkdirSync(join(root, 'node_modules/evil'), { recursive: true });
  writeFileSync(join(root, '.env'), 'SECRET_SENTINEL=do-not-read');
  writeFileSync(join(root, 'vite.config.mjs'), 'throw new Error("Do not execute config");');
  writeFileSync(join(root, 'package.json'), JSON.stringify({ scripts: { test: 'touch ran-untrusted-script' } }));
  writeFileSync(join(root, 'packages/app/package.json'), JSON.stringify({ scripts: { build: 'ignored' }, dependencies: { react: 'x' } }));
  writeFileSync(join(outside, 'package.json'), '{"name":"outside-private"}');
  symlinkSync(outside, join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  const before = readdirSync(root).sort();
  const info = inspectProject(root, { git: () => null });
  assert.equal(info.packages.length, 2);
  assert.deepEqual(info.packages[0].scripts, ['test']);
  assert.ok(!JSON.stringify(info).includes('SECRET_SENTINEL'));
  assert.ok(!info.manifests.some(p => p.includes('linked') || p.includes('node_modules')));
  assert.deepEqual(readdirSync(root).sort(), before);
  assert.equal(inspectProject(root, { git: () => null, maxEntries: 1 }).truncated, true);
});

test('real Git discovery works without fetching or modifying the index', t => {
  const root = fixture(t);
  execFileSync('git', ['init', root], { stdio: 'ignore' });
  writeFileSync(join(root, 'file.txt'), 'keep me');
  execFileSync('git', ['-C', root, 'add', '--', 'file.txt']);
  const index = readFileSync(join(root, '.git/index'));
  const result = inspectProject(root);
  assert.ok(result.git.root);
  assert.equal(result.git.head, null);
  assert.deepEqual(readFileSync(join(root, '.git/index')), index);
});

test('CLI context preserves multiline text and shell metacharacters literally', async t => {
  const root = fixture(t);
  const brief = 'Fix the bug.\nNo new dependencies.\n`touch should-not-exist` $(echo private) --mode apply';
  const logs = [], errors = [];
  assert.equal(await main(['workflow', 'fix', '--root', root, '--mode', 'plan', '--stdin'], {
    input: async () => brief, log: value => logs.push(value), error: value => errors.push(value),
  }), 0);
  const record = JSON.parse(logs[0]);
  assert.equal(record.brief, brief);
  assert.equal(record.mode, 'plan');
  assert.deepEqual(readdirSync(root), []);
  assert.deepEqual(errors, []);
});

test('CLI rejects conflicting sources, unknown flags and inapplicable controls', () => {
  for (const args of [
    ['tools', '--mode', 'apply'], ['workflow', 'fix', '--stdin', '--brief-file', 'x'],
    ['tools', '--json', '--json'], ['tools', '--target', 'other'], ['tools', '--oops'],
    ['show', 'fix', 'extra'], ['inspect', 'extra'],
  ]) assert.throws(() => parseToolkitArgs(args), args.join(' '));
  assert.deepEqual(parseToolkitArgs(['workflow', 'fix', '--', '--unknown', 'literal']).positionals, ['fix', '--unknown', 'literal']);
});

test('CLI unknown commands return an error rather than attempting execution', async () => {
  const errors = [];
  assert.equal(await main(['nonexistent'], { error: e => errors.push(e) }), 1);
  assert.match(errors[0], /Unknown utility/);
});

test('all aliases inherit full behavioral contracts and preserve invocation identity', t => {
  const root = fixture(t);
  for (const alias of catalog.commands.filter(c => c.aliasOf)) {
    const target = getCommand(catalog, alias.id, { canonical: true });
    for (const field of ['defaultMode', 'modePolicy', 'writeScope', 'readScope', 'procedure', 'runtimeSteps', 'branches', 'outputs', 'verification', 'stopConditions', 'capabilities', 'validation']) {
      assert.deepEqual(alias[field], target[field], `${alias.id}.${field}`);
      const changed = structuredClone(catalog);
      changed.commands.find(c => c.id === alias.id)[field] = 'drift';
      assert.throws(() => validateCatalog(changed, { schemaVersion: 1, packs: changed.packs }));
    }
    assert.equal(availability(catalog, alias, discoverCapabilities(root).capabilities).status, availability(catalog, target, discoverCapabilities(root).capabilities).status);
  }
});

test('routing recommends each canonical UI workflow once even when aliases also match', t => {
  const root = fixture(t), found = discoverCapabilities(root);
  const route = recommend(catalog, found, 'responsive ui-responsive a11y ui-accessibility', { limit: 100 });
  const candidates = [...route.available, ...route.unavailable];
  assert.equal(new Set(candidates.map(c => c.id)).size, candidates.length);
  assert.ok(!candidates.some(c => ['responsive', 'a11y'].includes(c.id)));
  assert.ok(candidates.some(c => c.id === 'ui-responsive' && c.matchedNames.includes('responsive')));
});
