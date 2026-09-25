import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, skillFile } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { loadProfiles } from '../plugins/just-vibe/scripts/lib/profiles.mjs';
import { generate } from './build-skills.mjs';
import { validateReferences } from './lib/references.mjs';
import { unresolvedWorkflowReferences } from './lib/workflow-references.mjs';
import { loadMethods } from '../plugins/just-vibe/scripts/lib/method-library.mjs';
import { MCP_TOOLS } from '../plugins/just-vibe/scripts/lib/mcp-server.mjs';
import { staleDocCounts } from './lib/doc-counts.mjs';
import { compareVersions, publishedVersions } from './lib/releases.mjs';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const pkg = read('package.json');
for (const host of ['codex', 'claude']) {
  const plugin = read(`plugins/just-vibe/.${host}-plugin/plugin.json`);
  assert.equal(plugin.name, pkg.name);
  assert.equal(plugin.version, pkg.version);
  assert.equal(plugin.repository, 'https://github.com/Zachshotamartin/just-vibe');
}
// One product description everywhere it is published (R2-10).
const description = pkg.description;
for (const host of ['codex', 'claude']) assert.equal(read(`plugins/just-vibe/.${host}-plugin/plugin.json`).description, description, `${host} plugin description`);
assert.equal(read('plugins/just-vibe/.codex-plugin/plugin.json').interface.shortDescription, description, 'Codex short description');
assert.equal(read('.claude-plugin/marketplace.json').metadata.description, description, 'Claude marketplace description');
assert.equal(read('.claude-plugin/marketplace.json').plugins[0].description, description, 'Claude marketplace plugin description');
assert.ok(readFileSync(resolve(root, 'README.md'), 'utf8').split('\n')[2].startsWith(description.replace(/\.$/, '')), 'README opens with the product description');
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
assert.equal(catalog.commands.length, 221);
assert.deepEqual(skills.sort(), catalog.commands.map(c => c.id).sort());
assert.equal(catalog.commands.filter(c => c.pack === 'general').length, 58);
assert.equal(catalog.commands.filter(c => !['general', 'installation'].includes(c.pack)).length, 161);
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
const unresolved = unresolvedWorkflowReferences(catalog.root, { commands: catalog.commands, methods: loadMethods(), profiles: profiles.profiles, packs: catalog.packs });
assert.deepEqual(unresolved, [], `Unknown workflow names: ${unresolved.map(u => `${u.where}: ${u.id}`).join('; ')}`);
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
// Current-count claims in shipped and public docs match the catalog (R1-18, R2-05).
const stale = staleDocCounts(root, { mcpTools: MCP_TOOLS.length, skillNames: catalog.commands.length,
  workflows: catalog.commands.filter(c => !c.aliasOf).length, profiles: loadProfiles().profiles.length });
assert.deepEqual(stale, [], `Stale counts: ${stale.map(s => `${s.file}: "${s.text}" (now ${s.actual})`).join('; ')}`);
// Once the source version is published, docs may not call its features unreleased or upcoming (R2-01, R2-02).
const published = publishedVersions(root);
if (published.length && compareVersions(pkg.version, published.at(-1)) <= 0) {
  const docs = [resolve(root, 'README.md'), ...['plugins/just-vibe/references', 'website/src/pages/docs'].flatMap(dir =>
    readdirSync(resolve(root, dir), { recursive: true }).filter(name => name.endsWith('.md')).map(name => resolve(root, dir, name)))];
  const unreleased = docs.filter(file => /\bUnreleased\b|\bupcoming (?:release|version|\d)/i.test(readFileSync(file, 'utf8')));
  assert.deepEqual(unreleased, [], `v${pkg.version} is published; remove unreleased/upcoming wording from: ${unreleased.map(file => relative(root, file)).join(', ')}`);
}
// A release tag needs its publication record; records start at 0.8.0 (R2-02).
let tags = [];
try { tags = execFileSync('git', ['tag', '-l', 'v*'], { cwd: root, encoding: 'utf8' }).split('\n').filter(t => /^v\d+\.\d+\.\d+$/.test(t)); } catch { /* no Git checkout */ }
for (const tag of tags.map(t => t.slice(1)).filter(v => compareVersions(v, '0.8.0') >= 0)) {
  assert.ok(published.includes(tag), `Tag v${tag} has no evals/releases/${tag}-publication.json record.`);
}
generate({ check: true });
console.log(`Validated both marketplaces, matching v${pkg.version} manifests, ${skills.length} skills, ${referenceGraph.links} local links across ${referenceGraph.files} Markdown files, technical methods, and reproducible catalog generation.`);
