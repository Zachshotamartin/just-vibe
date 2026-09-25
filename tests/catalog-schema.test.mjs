import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { materializeAliases, validateCatalog, loadCatalog, pluginRoot } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { validateProfiles, loadProfiles } from '../plugins/just-vibe/scripts/lib/profiles.mjs';
import { validateMethods, loadMethods } from '../plugins/just-vibe/scripts/lib/method-library.mjs';
import { workflowReferenceChecker, unresolvedWorkflowReferences } from '../scripts/lib/workflow-references.mjs';

const read = name => JSON.parse(readFileSync(new URL(`../plugins/just-vibe/catalog/${name}`, import.meta.url), 'utf8'));
const effective = (commands, packs) => materializeAliases({ ...commands, commands: commands.commands.map(c => c.aliasOf ? c : {
  ...c, inputPolicy: c.inputPolicy ?? packs.packs.find(p => p.id === c.pack)?.inputPolicy }) });
const commandCase = mutate => () => {
  const commands = read('commands.json'), packs = read('packs.json');
  mutate(commands.commands.find(c => c.id === 'fix'));
  validateCatalog(effective(commands, packs), packs);
};
const packCase = mutate => () => {
  const commands = read('commands.json'), packs = read('packs.json');
  mutate(packs.packs.find(p => p.id === 'general'), packs);
  validateCatalog(effective(commands, packs), packs);
};
const profileCase = mutate => () => {
  const data = read('profiles.json');
  mutate(data.profiles.find(p => p.id === 'frontend-engineer'), data);
  validateProfiles(data, { commands: read('commands.json').commands });
};
const methodCase = mutate => () => { const data = read('methods.json'); mutate(data.methods[0], data); validateMethods(data); };

test('malformed catalog content is rejected with the record and field named', () => {
  for (const [name, run, message] of [
    ['string searchTerms would crash search', commandCase(c => { c.searchTerms = 'code review'; }), /Command fix: searchTerms/],
    ['empty searchTerm', commandCase(c => { c.searchTerms = ['bug', '']; }), /searchTerms\[1\]/],
    ['duplicate searchTerm', commandCase(c => { c.searchTerms = ['bug', 'Bug']; }), /must not repeat/],
    ['typo key drops guides', commandCase(c => { c.guide = c.guides; delete c.guides; }), /guide is not a known field/],
    ['missing aliases', commandCase(c => { delete c.aliases; }), /aliases is required/],
    ['optionalInputs string', commandCase(c => { c.optionalInputs = 'scope'; }), /optionalInputs/],
    ['duplicate capability', commandCase(c => { c.capabilities = ['project.read', 'project.read']; }), /capabilities must not repeat/],
    ['unknown example kind', commandCase(c => { c.examples[1].kind = 'weird'; }), /examples\[1\]\.kind/],
    ['non-string branch', commandCase(c => { c.branches[0].when = 4; }), /branches\[0\]\.when/],
    ['duplicate guide path', commandCase(c => { c.guides = [...c.guides, { ...c.guides[0], title: 'Other' }]; }), /same path twice/],
    ['pipe in table summary', commandCase(c => { c.summary = 'Fix a | defect'; }), /summary must not contain "\|"/],
    ['newline in text', commandCase(c => { c.summary = 'Fix a\ndefect'; }), /single trimmed line/],
    ['unknown validation key', commandCase(c => { c.validation.extra = 'x'; }), /validation: extra is not a known field/],
    ['pack missing name', packCase(p => { delete p.name; }), /Pack general: name is required/],
    ['pack missing prerequisites', packCase(p => { delete p.prerequisites; }), /Pack general: prerequisites is required/],
    ['pack unknown key', packCase(p => { p.extra = 'x'; }), /Pack general: extra/],
    ['duplicate profile name', profileCase((p, d) => { p.name = d.profiles[1].name; }), /name duplicates/],
    ['profile unknown key', profileCase(p => { p.searchterm = ['x']; }), /searchterm is not a known field/],
    ['too many profile workflows', profileCase(p => { p.workflows = ['fix', 'debug', 'build', 'test', 'review', 'plan']; }), /workflows must be an array of 1-5/],
    ['profile links a router command', profileCase(p => { p.workflows = ['fix', 'auto', 'build']; }), /not router or catalog commands/],
    ['profile names an unknown method', profileCase(p => { p.methods = ['no-such-method']; }), /unknown method: no-such-method/],
    ['duplicate method id', methodCase((m, d) => { d.methods.push(structuredClone(m)); }), /duplicates another method/],
    ['method triggers string', methodCase(m => { m.triggers = 'gsap'; }), /triggers/],
    ['insecure method reference', methodCase(m => { m.references[0].url = 'http://example.com'; }), /https URL/],
    ['method unknown key', methodCase(m => { m.extra = 'x'; }), /extra is not a known field/],
  ]) assert.throws(run, message, name);
});

// Mode, write scope, examples and default text must describe the same authority (A4-03, A5-01,
// A6-05, A10-03, A2-12, A7-09, B5-03, B5-04).
const contractCase = (id, mutate) => () => {
  const commands = read('commands.json'), packs = read('packs.json');
  mutate(commands.commands.find(c => c.id === id), packs);
  validateCatalog(effective(commands, packs), packs);
};
test('contracts that promise writes without an apply mode are rejected', () => {
  for (const [name, run, message] of [
    ['inspect-only readScope promises a fix', contractCase('debug', c => { c.readScope += '; apply for an explicit fix.'; }), /Command debug: readScope promises a write/],
    ['inspect-only output promises a patch', contractCase('review', c => { c.outputs[0] += ' Optional authorized patch.'; }), /Command review: outputs\[0\] promises a write/],
    ['apply example on an inspect-only workflow', contractCase('debug', c => { c.examples[1].mode = 'apply'; }), /Command debug: examples\[1\]\.mode is apply/],
    ['apply-capable workflow keeps the no-changes scope', contractCase('vite-chunks', c => { c.writeScope = 'No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.'; }), /Command vite-chunks: writeScope forbids all source changes/],
    ['undefined execution authorization', contractCase('coverage', c => { c.stopConditions[0] = 'Running new coverage jobs requires execution authorization.'; }), /undefined "execution authorization"/],
    ['mode clause in required inputs', contractCase('ci', c => { c.requiredInputs[0] = 'apply for requested fixes. Requires workflow files.'; }), /Command ci: requiredInputs\[0\] must list inputs/],
    ['pack default edits for an inspect-only workflow', contractCase('vite-config', (c, packs) => {
      c.modePolicy = 'Inspect; configuration files.'; c.writeScope = 'No source changes in inspect/plan.';
      packs.packs.find(p => p.id === 'vite').inputPolicy.assume = 'Make a local focused change when the brief identifies the behavior.';
    }), /Command vite-config: inputPolicy\.assume tells a workflow without apply mode/],
  ]) assert.throws(run, message, name);
});

test('shipped catalogs satisfy the closed schemas', () => {
  assert.equal(loadCatalog().commands.length, 221);
  assert.equal(loadProfiles().profiles.length, 113);
  assert.ok(loadMethods().length > 0);
  assert.deepEqual(loadProfiles().profiles.find(p => p.id === 'agent-systems-engineer').workflows, ['llm-tools', 'llm-evals', 'backend-idempotency']);
});

test('references may only name workflows that exist', () => {
  const commands = loadCatalog().commands.map(c => c.id);
  const check = workflowReferenceChecker({ commands, known: new Set(commands) });
  assert.deepEqual(check('Use plan, arch-feature or api-contract when that decision is relevant.').map(h => h.id), ['api-contract']);
  assert.deepEqual(check('Use for effective security-relevant settings; vercel-audit compares deployments.'), []);
  assert.deepEqual(check('A default test-client does not establish CSRF protection.'), []);
  const catalog = loadCatalog();
  assert.deepEqual(unresolvedWorkflowReferences(pluginRoot, { commands: catalog.commands, methods: loadMethods(), profiles: loadProfiles().profiles, packs: catalog.packs }), []);
});
