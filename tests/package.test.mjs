import test from 'node:test';
import { npm, packResult } from '../scripts/lib/npm.mjs';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync, existsSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { loadProfiles } from '../plugins/just-vibe/scripts/lib/profiles.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('npm archive contains the runnable installer and both complete plugin manifests, but no planning files', () => {
  const output = npm(['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' });
  const { files } = packResult(output);
  const paths = files.map(file => file.path);
  for (const required of [
    'bin/just-vibe.mjs', 'plugins/just-vibe/scripts/installer.mjs',
    '.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json',
    'plugins/just-vibe/.codex-plugin/plugin.json', 'plugins/just-vibe/.claude-plugin/plugin.json',
    'plugins/just-vibe/skills/setup/SKILL.md', 'plugins/just-vibe/skills/help/SKILL.md',
    'plugins/just-vibe/scripts/toolkit.mjs', 'plugins/just-vibe/scripts/lib/run.mjs',
    'plugins/just-vibe/catalog/commands.json', 'plugins/just-vibe/catalog/packs.json',
    'plugins/just-vibe/catalog/profiles.json', 'plugins/just-vibe/scripts/lib/profiles.mjs',
    'plugins/just-vibe/references/profiles.md', 'plugins/just-vibe/references/profile-reference.md',
    'plugins/just-vibe/references/execution.md', 'plugins/just-vibe/references/runtime.md',
    'plugins/just-vibe/hooks/hooks.json', 'plugins/just-vibe/scripts/hooks.mjs',
    'plugins/just-vibe/scripts/lib/continuity.mjs', 'plugins/just-vibe/scripts/lib/evidence.mjs',
    'plugins/just-vibe/references/daily-workflows.md',
    ...['workbench','memory','workspaces','proof','practice','experiments','tasks','decisions','intent-runtime'].map(n=>`plugins/just-vibe/scripts/lib/${n}.mjs`),
    'plugins/just-vibe/scripts/preview-worker.mjs',
    ...['intent-workflows','memory-checks','working-alternatives','proofs','practice','experiments','decision-history','task-undo'].map(n=>`plugins/just-vibe/references/${n}.md`),
  ]) assert.ok(paths.includes(required), `Missing from archive: ${required}`);
  const catalog = loadCatalog();
  for (const c of catalog.commands) assert.ok(paths.includes(`plugins/just-vibe/${c.skillPath}`), `Missing packaged workflow: ${c.id}`);
  for (const p of catalog.packs) assert.ok(paths.includes(`plugins/just-vibe/references/packs/${p.id}.md`), `Missing runbook: ${p.id}`);
  for (const p of loadProfiles().profiles) assert.ok(paths.includes(`plugins/just-vibe/references/profiles/${p.id}.md`), `Missing profile: ${p.id}`);
  assert.ok(paths.every(path => !/PLAN\.md|NAMING\.md|node_modules|\.tmp\/|\.env/.test(path)));
});

test('planning files are ignored by Git', () => {
  const output = execFileSync('git', ['check-ignore', '--no-index', 'PLAN.md', 'NAMING.md'], { cwd: root, encoding: 'utf8' });
  assert.deepEqual(output.trim().split(/\r?\n/).sort(), ['NAMING.md', 'PLAN.md']);
});

test('every catalog skill can be included in a Git-based installation', () => {
  const paths = loadCatalog().commands.map(command => `plugins/just-vibe/${command.skillPath}`);
  const result = spawnSync('git', ['check-ignore', '--no-index', '--stdin'], {
    cwd: root, encoding: 'utf8', input: `${paths.join('\n')}\n`,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 1, `Catalog skills are ignored or Git failed: ${result.stdout}${result.stderr}`);
  assert.equal(result.stdout, '');
});

test('package has no lifecycle install scripts or runtime dependencies', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  for (const key of ['preinstall', 'install', 'postinstall', 'prepare']) assert.equal(pkg.scripts[key], undefined);
  assert.equal(Object.keys(pkg.dependencies || {}).length, 0);
});

test('bundled script entry points run through symlinked cache paths and remain import-safe', t => {
  const dir = mkdtempSync(join(tmpdir(), 'just-vibe-entrypoint-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const plugin = join(dir, 'linked-plugin');
  symlinkSync(join(root, 'plugins/just-vibe'), plugin, process.platform === 'win32' ? 'junction' : 'dir');
  const toolkit = join(plugin, 'scripts/toolkit.mjs');
  const command = JSON.parse(execFileSync(process.execPath, [toolkit, 'show', 'teach-test', '--json'], { encoding: 'utf8' }));
  assert.equal(command.id, 'teach-test');
  const version = execFileSync(process.execPath, [join(plugin, 'scripts/installer.mjs'), '--version'], { encoding: 'utf8' }).trim();
  assert.equal(version, JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version);
  const imported = execFileSync(process.execPath, ['--input-type=module', '-'], {
    input: `await import(${JSON.stringify(pathToFileURL(toolkit).href)}); console.log('import-safe');`, encoding: 'utf8',
  });
  assert.equal(imported.trim(), 'import-safe');
});

test('packed CLI and every skill work without the source checkout, plan or dependencies', t => {
  const dir = mkdtempSync(join(tmpdir(), 'just-vibe-package-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const output = npm(['pack', '--json', '--ignore-scripts', '--pack-destination', dir], { cwd: root, encoding: 'utf8' });
  const { filename } = packResult(output);
  execFileSync('tar', ['-xzf', join(dir, filename), '-C', dir]);
  const cli = join(dir, 'package/bin/just-vibe.mjs');
  const json = execFileSync(process.execPath, [cli, 'tools', '--all', '--root', dir, '--json'], { cwd: dir, encoding: 'utf8' });
  const inventory = JSON.parse(json);
  assert.equal(inventory.tools.length, loadCatalog().commands.length);
  const profiles = JSON.parse(execFileSync(process.execPath, [cli, 'profiles', '--json'], { cwd: dir, encoding: 'utf8' }));
  assert.equal(profiles.profiles.length, loadProfiles().profiles.length);
  const run = JSON.parse(execFileSync(process.execPath, [cli, 'workflow', 'auto', '--root', dir, '--profile', 'principal-engineer', '--', 'Review this design only'], { cwd: dir, encoding: 'utf8' }));
  assert.equal(run.context.profile.primary, 'principal-engineer');
  assert.equal(run.context.profile.pinned, true);
  assert.ok(!inventory.tools.some(c => c.status === 'uninstalled'));
  const skill = execFileSync(process.execPath, [cli, 'show', 'auto'], { cwd: dir, encoding: 'utf8' });
  assert.ok(skill.includes('session start'));
  const created = JSON.parse(execFileSync(process.execPath, [cli, 'project', 'init', '--root', dir, '--stdin'], { input: '{"preferences":{"detail":"concise"}}', encoding: 'utf8' }));
  assert.equal(created.revision, 1);
  const resumed = JSON.parse(execFileSync(process.execPath, [cli, 'project', 'show', '--root', dir], { encoding: 'utf8' }));
  assert.equal(resumed.preferences.preferences.detail, 'concise');
  const hookStatus = JSON.parse(execFileSync(process.execPath, [cli, 'hooks', 'status', '--root', dir], { encoding: 'utf8' }));
  assert.equal(hookStatus.trusted, false);
  const memory = JSON.parse(execFileSync(process.execPath, [cli, 'memory', 'save', 'package-rule', '--root', dir, '--stdin'], { input: JSON.stringify({revision:0,rule:'Preserve user changes.',scope:'.',file:'AGENTS.md',expectedFileHash:null,source:{kind:'user-instruction',excerpt:'Preserve user changes.'}}), encoding:'utf8' }));
  assert.equal(memory.status,'active');
  const inspection=JSON.parse(execFileSync(process.execPath,[cli,'memory','inspect','--root',dir],{encoding:'utf8'}));
  assert.equal(inspection.rules[0].persisted,true);
  assert.equal(JSON.parse(execFileSync(process.execPath,[cli,'workbench','list','--root',dir],{encoding:'utf8'})).memory[0],'package-rule');
  assert.equal(existsSync(join(dir, 'package/PLAN.md')), false);
  assert.equal(existsSync(join(dir, 'package/node_modules')), false);
});
