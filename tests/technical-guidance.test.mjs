import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog, validateCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { validateReferences } from '../scripts/lib/references.mjs';
import { renderSkill } from '../scripts/build-skills.mjs';

const catalog = loadCatalog();
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'jv-guides-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'references'));
  return root;
}

test('technical contract omissions and alias drift are rejected before generation or execution', () => {
  const missing = structuredClone(catalog);
  delete missing.commands.find(c => c.id === 'security').technical.check;
  assert.throws(() => validateCatalog(missing, { schemaVersion: 1, packs: catalog.packs }), /Invalid technical method: security/);
  const drift = structuredClone(catalog);
  drift.commands.find(c => c.id === 'do').technical.method = 'Independent behavior';
  assert.throws(() => validateCatalog(drift, { schemaVersion: 1, packs: catalog.packs }), /Alias contract drift \(technical\): do/);
});

test('input policies and one procedure remain canonical across generation and aliases', () => {
  for (const mutate of [
    data => { delete data.commands.find(c => c.id === 'review').inputPolicy.ask; },
    data => { data.commands.find(c => c.id === 'auto').runtimeSteps = ['A second conflicting procedure']; },
    data => { data.commands.find(c => c.id === 'do').inputPolicy.assume = 'Alias-only default'; },
  ]) {
    const data = structuredClone(catalog); mutate(data);
    assert.throws(() => validateCatalog(data, { schemaVersion: 1, packs: catalog.packs }));
  }
  for (const command of catalog.commands.filter(c => !c.aliasOf)) {
    const rendered = renderSkill(command, catalog.packs.find(p => p.id === command.pack));
    for (const value of Object.values(command.inputPolicy)) assert.ok(rendered.includes(value));
    for (const step of command.procedure) assert.equal(rendered.split(step).length - 1, 1, `${command.id}: repeated procedure`);
  }
});

test('every generated entry point exposes its canonical technical method without a source-checkout dependency', () => {
  for (const command of catalog.commands.filter(c => !c.aliasOf)) {
    const rendered = renderSkill(command, catalog.packs.find(p => p.id === command.pack));
    for (const value of Object.values(command.technical)) assert.ok(rendered.includes(value), `Lost technical method for ${command.id}`);
    assert.equal(readFileSync(join(catalog.root, command.skillPath), 'utf8'), rendered);
  }
});

test('reference validation follows supporting documents, rejects missing and escaping targets, and ignores fenced examples', t => {
  const root = fixture(t);
  writeFileSync(join(root, 'SKILL.md'), '[guide](references/deep.md)\n');
  writeFileSync(join(root, 'references/deep.md'), '[missing](missing.md)\n');
  assert.throws(() => validateReferences(root), /Broken shipped reference/);
  writeFileSync(join(root, 'references/deep.md'), '[outside](../../other.md)\n');
  assert.throws(() => validateReferences(root), /Reference escapes plugin/);
  writeFileSync(join(root, 'references/deep.md'), '```md\n[example](not-real.md)\n```\n[home](../SKILL.md)\n');
  assert.deepEqual(validateReferences(root), { files: 2, links: 2 });
});
