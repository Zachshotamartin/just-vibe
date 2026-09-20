import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const pkg = read('package.json');
for (const host of ['codex', 'claude']) {
  const plugin = read(`plugins/just-vibe/.${host}-plugin/plugin.json`);
  assert.equal(plugin.name, pkg.name);
  assert.equal(plugin.version, pkg.version);
  assert.equal(plugin.repository, 'https://github.com/Zachshotamartin/just-vibe');
}
for (const path of ['.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json']) {
  const marketplace = read(path);
  assert.equal(marketplace.name, 'just-vibe');
  assert.equal(marketplace.plugins.length, 1);
  const entry = marketplace.plugins[0];
  assert.equal(entry.name, 'just-vibe');
  const source = typeof entry.source === 'string' ? entry.source : entry.source.path;
  assert.equal(source, './plugins/just-vibe');
  assert.ok(existsSync(resolve(root, source)));
}
const skillRoot = resolve(root, 'plugins/just-vibe/skills');
const skills = readdirSync(skillRoot);
assert.deepEqual(skills.sort(), ['help', 'setup']);
for (const name of skills) {
  const content = readFileSync(resolve(skillRoot, name, 'SKILL.md'), 'utf8');
  assert.ok(content.startsWith(`---\nname: ${name}\n`), `Invalid name in ${name}`);
  assert.match(content, /\ndescription: .+\n/);
  assert.doesNotMatch(content, /\[TODO:/);
}
assert.ok(existsSync(resolve(skillRoot, 'setup', '../../scripts/installer.mjs')));
console.log(`Validated both marketplaces, matching v${pkg.version} plugin manifests, and ${skills.length} skills.`);
