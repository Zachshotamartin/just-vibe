import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync, existsSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('npm archive contains the runnable installer and both complete plugin manifests, but no planning files', () => {
  const output = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' });
  const [{ files }] = JSON.parse(output);
  const paths = files.map(file => file.path);
  for (const required of [
    'bin/just-vibe.mjs', 'plugins/just-vibe/scripts/installer.mjs',
    '.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json',
    'plugins/just-vibe/.codex-plugin/plugin.json', 'plugins/just-vibe/.claude-plugin/plugin.json',
    'plugins/just-vibe/skills/setup/SKILL.md', 'plugins/just-vibe/skills/help/SKILL.md',
    'plugins/just-vibe/scripts/toolkit.mjs', 'plugins/just-vibe/scripts/lib/run.mjs',
    'plugins/just-vibe/catalog/commands.json', 'plugins/just-vibe/catalog/packs.json',
    'plugins/just-vibe/references/execution.md', 'plugins/just-vibe/references/runtime.md',
  ]) assert.ok(paths.includes(required), `Missing from archive: ${required}`);
  const catalog = loadCatalog();
  for (const c of catalog.commands) assert.ok(paths.includes(`plugins/just-vibe/${c.skillPath}`), `Missing packaged workflow: ${c.id}`);
  for (const p of catalog.packs) assert.ok(paths.includes(`plugins/just-vibe/references/packs/${p.id}.md`), `Missing runbook: ${p.id}`);
  assert.ok(paths.every(path => !/PLAN\.md|NAMING\.md|node_modules|\.tmp\/|\.env/.test(path)));
});

test('planning files are ignored by Git', () => {
  const output = execFileSync('git', ['check-ignore', '--no-index', 'PLAN.md', 'NAMING.md'], { cwd: root, encoding: 'utf8' });
  assert.deepEqual(output.trim().split('\n').sort(), ['NAMING.md', 'PLAN.md']);
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
  symlinkSync(join(root, 'plugins/just-vibe'), plugin, 'dir');
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
  const output = execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', dir], { cwd: root, encoding: 'utf8' });
  const [{ filename }] = JSON.parse(output);
  execFileSync('tar', ['-xzf', join(dir, filename), '-C', dir]);
  const cli = join(dir, 'package/bin/just-vibe.mjs');
  const json = execFileSync(process.execPath, [cli, 'tools', '--all', '--root', dir, '--json'], { cwd: dir, encoding: 'utf8' });
  const inventory = JSON.parse(json);
  assert.equal(inventory.tools.length, 213);
  assert.ok(!inventory.tools.some(c => c.status === 'uninstalled'));
  const skill = execFileSync(process.execPath, [cli, 'show', 'auto'], { cwd: dir, encoding: 'utf8' });
  assert.ok(skill.includes('session start'));
  assert.equal(existsSync(join(dir, 'package/PLAN.md')), false);
  assert.equal(existsSync(join(dir, 'package/node_modules')), false);
});
