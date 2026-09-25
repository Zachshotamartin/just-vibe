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
    ['duplicate method id', methodCase((m, d) => { d.methods.push(structuredClone(m)); }), /duplicates another method/],
    ['method triggers string', methodCase(m => { m.triggers = 'gsap'; }), /triggers/],
    ['insecure method reference', methodCase(m => { m.references[0].url = 'http://example.com'; }), /https URL/],
    ['method unknown key', methodCase(m => { m.extra = 'x'; }), /extra is not a known field/],
  ]) assert.throws(run, message, name);
});

test('shipped catalogs satisfy the closed schemas', () => {
  assert.equal(loadCatalog().commands.length, 221);
  assert.equal(loadProfiles().profiles.length, 112);
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
