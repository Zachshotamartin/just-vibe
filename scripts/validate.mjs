import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, skillFile } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { loadProfiles } from '../plugins/just-vibe/scripts/lib/profiles.mjs';
import { generate } from './build-skills.mjs';
import { validateReferences } from './lib/references.mjs';

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
const catalog = loadCatalog();
assert.equal(catalog.commands.length, 216);
assert.deepEqual(skills.sort(), catalog.commands.map(c => c.id).sort());
assert.equal(catalog.commands.filter(c => c.pack === 'general').length, 55);
assert.equal(catalog.commands.filter(c => !['general', 'installation'].includes(c.pack)).length, 160);
for (const name of skills) {
  const content = readFileSync(resolve(skillRoot, name, 'SKILL.md'), 'utf8');
  assert.ok(content.startsWith(`---\nname: ${name}\n`), `Invalid name in ${name}`);
  assert.match(content, /\ndescription: .+\n/);
  assert.doesNotMatch(content, /\[TODO:/);
  for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^https?:/.test(match[1])) continue;
    const target = resolve(skillRoot, name, match[1].split('#')[0]);
    assert.ok(existsSync(target), `Broken skill reference: ${name} -> ${match[1]}`);
  }
}
assert.ok(existsSync(resolve(skillRoot, 'setup', '../../scripts/installer.mjs')));
for (const c of catalog.commands) assert.ok(existsSync(skillFile(catalog, c)));
for (const c of catalog.commands) for (const guide of c.guides || []) {
  assert.ok(existsSync(resolve(catalog.root, guide.path)), `Missing conditional guide: ${c.id} -> ${guide.path}`);
}
const referenceGraph = validateReferences(catalog.root);
const profiles = loadProfiles();
assert.deepEqual(readdirSync(resolve(catalog.root, 'references/profiles')).sort(), profiles.profiles.map(p => `${p.id}.md`).sort());
const behavioral = read('evals/releases/0.4.0-results.json');
for (const command of catalog.commands) {
  const records = [];
  if (command.validation.behavioral !== 'not-evaluated') records.push({ ...command.validation, status: command.validation.behavioral });
  if (command.validation.priorBehavioral) records.push(command.validation.priorBehavioral);
  for (const record of records) {
    assert.ok(existsSync(resolve(catalog.root, record.record)), `Missing behavioral record: ${command.id}`);
    assert.ok(record.cases?.length, `Missing evaluated cases: ${command.id}`);
    for (const id of record.cases) {
      const trial = behavioral.results.find(r => r.case === id && r.arm === 'just-vibe' && r.commands.includes(command.aliasOf || command.id));
      assert.ok(trial, `No recorded agent trial for ${command.id}/${id}`);
      if (record.status === 'passed-fixtures') {
        assert.equal(trial.status, 'passed-fixture');
        assert.ok(trial.checks.length && trial.checks.every(c => c.pass), `Failed evidence cannot support ${command.id}`);
      }
    }
  }
}
generate({ check: true });
console.log(`Validated both marketplaces, matching v${pkg.version} manifests, ${skills.length} skills, ${referenceGraph.links} local links across ${referenceGraph.files} Markdown files, technical methods, and reproducible catalog generation.`);
