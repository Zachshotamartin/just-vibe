import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { loadProfiles, validateProfiles, getProfile, searchProfiles, selectProfiles } from '../plugins/just-vibe/scripts/lib/profiles.mjs';
import { createRun, setRunProfiles, startStage, recordStage, finishRun } from '../plugins/just-vibe/scripts/lib/run.mjs';
import { main } from '../plugins/just-vibe/scripts/toolkit.mjs';

const roles = loadProfiles(), commands = loadCatalog();
const user = { primary: 'machine-learning-engineer', secondary: ['mlops-engineer'], selectedBy: 'user', reason: 'User requested ML implementation with operational verification.' };
const agent = { primary: 'backend-engineer', selectedBy: 'agent', reason: 'The task is a service request with duplicate side effects.' };

test('every generated profile exposes its authored concrete contribution', () => {
  for (const profile of roles.profiles) {
    const content = readFileSync(join(commands.root, 'references/profiles', `${profile.id}.md`), 'utf8');
    assert.ok(content.includes(profile.contribution), profile.id);
  }
});
function root(t) { const path = mkdtempSync(join(tmpdir(), 'just-vibe-profiles-')); t.after(() => rmSync(path, { recursive: true, force: true })); return path; }
async function cli(args, payload) {
  const lines = [], errors = [];
  const code = await main(args, { input: async () => JSON.stringify(payload), log: value => lines.push(value), error: value => errors.push(value) });
  return { code, output: lines.join('\n'), error: errors.join('\n') };
}

test('profile discovery resolves specialty and architecture terminology without activating roles', () => {
  assert.equal(searchProfiles(roles, 'principal-engineer')[0].id, 'principal-engineer');
  assert.ok(searchProfiles(roles, 'architecture').some(p => p.id === 'software-architect'));
  assert.ok(searchProfiles(roles, 'SRE').some(p => p.id === 'site-reliability-engineer'));
  assert.ok(searchProfiles(roles, 'ML').some(p => p.id === 'machine-learning-engineer'));
  assert.equal(searchProfiles(roles, 'unknown-specialty-xyz').length, 0);
  assert.throws(() => getProfile(roles, '../outside'), /Unknown profile/);
});

test('catalog rejects duplicate roles and unusable workflow links', () => {
  for (const mutate of [
    data => data.profiles.push(structuredClone(data.profiles[0])),
    data => { data.profiles[0].workflows = ['does-not-exist']; },
    data => { data.profiles[0].workflows = ['do']; },
    data => { data.profiles[0].family = 'unknown'; },
    data => { data.profiles[0].decision = ''; },
    data => { delete data.profiles[0].contribution; },
  ]) {
    const data = structuredClone(roles); mutate(data);
    assert.throws(() => validateProfiles(data, commands));
  }
});

test('user pins resist agent replacement and clearing; explicit user changes remain possible', () => {
  const pinned = selectProfiles(roles, user);
  assert.equal(pinned.pinned, true);
  assert.equal(pinned.scope, 'task');
  assert.throws(() => selectProfiles(roles, agent, pinned), /pinned user/);
  assert.throws(() => selectProfiles(roles, { ...agent, primary: null }, pinned), /pinned user/);
  const cleared = selectProfiles(roles, { selectedBy: 'user', primary: null, reason: 'User requested automatic selection.' }, pinned);
  assert.equal(cleared, null);
  const chosen = selectProfiles(roles, agent, cleared);
  assert.equal(chosen.pinned, false);
  assert.equal(selectProfiles(roles, { ...user, primary: 'principal-engineer' }, chosen).primary, 'principal-engineer');
});

test('selection rejects invented roles, privilege fields and ambiguous composition', () => {
  for (const request of [
    { ...agent, primary: 'imaginary-engineer' }, { ...agent, pinned: true },
    { ...user, secondary: [user.primary] }, { ...user, secondary: ['mlops-engineer', 'mlops-engineer'] },
    { ...user, secondary: ['mlops-engineer', 'llm-engineer', 'data-engineer'] },
    { ...user, scope: 'global' }, { ...user, mode: 'apply' }, { ...user, authorization: ['anything'] },
    { ...user, reason: '' }, { ...user, primary: null },
    { primary: null, selectedBy: 'user', reason: 'Clear', pinned: 'false' },
  ]) assert.throws(() => selectProfiles(roles, request));
  assert.equal(selectProfiles(roles, { ...user, pinned: false }).pinned, false);
});

test('role changes preserve a running task, stage identity, authority, limits and original criteria', t => {
  const directory = root(t), now = Date.now();
  let run = createRun(commands, 'auto', { root: directory, brief: 'Inspect only. Preserve literal $values and --flags.', mode: 'inspect', scope: '.',
    context: { successCriteria: ['Inspection complete'], constraints: ['No writes'], authorization: [] }, budget: { maxStages: 2, maxAttempts: 1, maxMinutes: 5 } }, now);
  run = startStage(commands, run, { id: 'inspection', command: 'orient', action: 'Read project files', effect: 'read' }, { 'project.read': { status: 'available', reason: 'Local fixture' } }, 'claude', now);
  const original = structuredClone(run);
  run = setRunProfiles(run, agent, now + 1);
  for (const key of ['id', 'brief', 'root', 'scope', 'mode', 'status', 'budget', 'createdAt', 'stages']) assert.deepEqual(run[key], original[key], key);
  for (const key of ['constraints', 'authorization', 'successCriteria', 'objective']) assert.deepEqual(run.context[key], original.context[key]);
  assert.equal(original.context.profile, undefined);
  assert.equal(run.profileHistory.length, 1);
  run = setRunProfiles(run, user, now + 2);
  assert.equal(run.profileHistory.length, 2);
  assert.deepEqual(run.profileHistory[1].previous.primary, agent.primary);
  assert.throws(() => setRunProfiles(run, agent, now + 3), /pinned user/);
  const outcome = { status: 'completed', summary: 'Read fixture', evidence: [{ reference: 'local fixture', detail: 'Inspected project', result: 'pass' }], criteria: [{ criterion: 'Inspection complete', result: 'pass', evidence: [0] }] };
  run = recordStage(run, { ...outcome, id: 'inspection' }, now + 4);
  run = finishRun(run, outcome, now + 5);
  assert.throws(() => setRunProfiles(run, user, now + 6), /resume explicitly/);
  assert.throws(() => setRunProfiles(original, user, now + 5 * 60000), /budget exhausted/);
});

// Ratchet: raise when profile search improves. Task requests are held out from profile text; aliases
// check the searchTerms field; own examples are indexed, so they only guard against regressions.
const PROFILE_SEARCH = { task: 0.65, alias: 0.98, own: 0.89 };
test('profile search ranks the intended role in the top three for realistic requests (PA2-01, PA1-04, PA2-02)', () => {
  const { queries } = JSON.parse(readFileSync(new URL('./fixtures/profiles/queries.json', import.meta.url), 'utf8'));
  const own = roles.profiles.map(p => ({ kind: 'own', request: p.example, accept: [p.id] }));
  const rates = {};
  for (const kind of Object.keys(PROFILE_SEARCH)) {
    const rows = [...queries, ...own].filter(q => q.kind === kind);
    const hits = rows.filter(q => searchProfiles(roles, q.request).slice(0, 3).some(p => q.accept.includes(p.id)));
    rates[kind] = hits.length / rows.length;
    assert.ok(rates[kind] >= PROFILE_SEARCH[kind], `${kind} top-3 ${rates[kind].toFixed(3)} fell below ${PROFILE_SEARCH[kind]}`);
  }
  // Stopwords and ordinary verbs no longer decide the ranking.
  assert.ok(searchProfiles(roles, 'and').every(p => p.score === 0), 'A stopword-only query browses without ranking');
  assert.notEqual(searchProfiles(roles, 'Add coverage for checkout failures and recovery.')[0]?.id, 'xr-engineer');
});

test('profile lookup accepts any case and display names, and suggests near matches (PB-10)', () => {
  assert.equal(getProfile(roles, 'FRONTEND-ENGINEER').id, 'frontend-engineer');
  assert.equal(getProfile(roles, 'Frontend engineer').id, 'frontend-engineer');
  assert.throws(() => getProfile(roles, 'frontend engneer'), /Closest: [^.]*frontend-engineer/);
  const selection = selectProfiles(roles, { ...agent, primary: 'Backend Engineer' });
  assert.equal(selection.primary, 'backend-engineer', 'Selections store canonical ids');
  assert.throws(() => selectProfiles(roles, { ...agent, role: 'x' }), /Invalid profile selection: unknown field role/);
  assert.throws(() => selectProfiles(roles, { ...agent, scope: 'global' }), /Invalid profile selection: scope must be "task"/);
});

test('session create treats profile as a selection request, not a user pin (PB-10)', async t => {
  const directory = root(t);
  const pinned = await cli(['session', 'create'], { command: 'fix', brief: 'Fix it', root: directory, profile: 'frontend-engineer' });
  assert.equal(pinned.code, 1); assert.match(pinned.error, /selection request/);
  const created = await cli(['session', 'create'], { command: 'fix', brief: 'Fix it', root: directory, profile: { primary: 'frontend-engineer', selectedBy: 'agent', reason: 'UI task.' } });
  assert.equal(created.code, 0, created.error);
  const run = JSON.parse(created.output).context.profile;
  assert.deepEqual([run.primary, run.selectedBy, run.pinned, run.scope], ['frontend-engineer', 'agent', false, 'task']);
  const partial = createRun(commands, 'fix', { root: directory, brief: 'Fix it', context: { profile: { primary: 'frontend-engineer', selectedBy: 'agent', reason: 'UI task.' } } });
  assert.equal(partial.context.profile.pinned, false, 'A partial context.profile is completed like session profile');
});

test('profile text shows its contribution; profiles supports limits and explains empty results (PA2-15, PB-10, R1-10)', async () => {
  const shown = await cli(['profile', 'agent-systems-engineer']);
  assert.equal(shown.code, 0, shown.error); assert.match(shown.output, /\nContribution: \S/);
  const limited = await cli(['profiles', 'engineer', '--limit', '3', '--json']);
  assert.equal(limited.code, 0, limited.error); assert.equal(JSON.parse(limited.output).profiles.length, 3);
  const none = await cli(['profiles', 'zzzzqqq']);
  assert.equal(none.code, 0); assert.match(none.output, /No matching profiles/);
});

test('CLI supports discovery, explicit selection and agent updates without persisting settings', async t => {
  const directory = root(t);
  const list = await cli(['profiles', 'architecture', '--json']);
  assert.equal(list.code, 0, list.error);
  assert.ok(JSON.parse(list.output).profiles.some(p => p.id === 'software-architect'));
  const shown = await cli(['profile', 'principal-engineer', '--json']);
  assert.equal(JSON.parse(shown.output).id, 'principal-engineer');
  const created = await cli(['workflow', 'auto', '--root', directory, '--profile', 'frontend-engineer', '--mode', 'inspect', '--', 'Review only; do not write.']);
  assert.equal(created.code, 0, created.error);
  const run = JSON.parse(created.output);
  assert.equal(run.context.profile.pinned, true);
  assert.equal(run.mode, 'inspect');
  assert.equal((await cli(['session', 'profile'], { run, selection: agent })).code, 1);
  const clear = await cli(['session', 'profile'], { run, selection: { primary: null, selectedBy: 'user', reason: 'User requested auto.' } });
  assert.equal(clear.code, 0, clear.error);
  const changed = await cli(['session', 'profile'], { run: JSON.parse(clear.output), selection: agent });
  assert.equal(changed.code, 0, changed.error);
  assert.equal(JSON.parse(changed.output).context.profile.primary, agent.primary);
  assert.deepEqual(readdirSync(directory), []);
  assert.equal((await cli(['profile', 'unknown'])).code, 1);
  assert.equal((await cli(['profiles', '--profile', 'frontend-engineer'])).code, 1);
});

test('creating a run rejects conflicting or invalid profile sources', t => {
  const directory = root(t), context = { profile: selectProfiles(roles, user) };
  assert.throws(() => createRun(commands, 'auto', { root: directory, brief: 'Task', context, profile: 'frontend-engineer' }), /not both/);
  assert.throws(() => createRun(commands, 'auto', { root: directory, brief: 'Task', profile: 'unknown' }), /Unknown profile/);
  assert.throws(() => createRun(commands, 'auto', { root: directory, brief: 'Task', context: { profile: { ...context.profile, scope: 'global' } } }), /Invalid profile/);
  assert.throws(() => createRun(commands, 'auto', { root: directory, brief: 'Task', context: { profile: false } }), /Invalid profile/);
});
