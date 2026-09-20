import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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
  ]) assert.ok(paths.includes(required), `Missing from archive: ${required}`);
  assert.ok(paths.every(path => !/PLAN\.md|NAMING\.md|node_modules|\.tmp\/|\.env/.test(path)));
});

test('planning files are ignored by Git', () => {
  const output = execFileSync('git', ['check-ignore', '--no-index', 'PLAN.md', 'NAMING.md'], { cwd: root, encoding: 'utf8' });
  assert.deepEqual(output.trim().split('\n').sort(), ['NAMING.md', 'PLAN.md']);
});

test('package has no lifecycle install scripts or runtime dependencies', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  for (const key of ['preinstall', 'install', 'postinstall', 'prepare']) assert.equal(pkg.scripts[key], undefined);
  assert.equal(Object.keys(pkg.dependencies || {}).length, 0);
});
