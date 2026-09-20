import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { loadProfiles, validateProfiles, getProfile, searchProfiles, selectProfiles, profileContext } from '../plugins/just-vibe/scripts/lib/profiles.mjs';
import { createRun, setRunProfiles, startStage, recordStage, finishRun } from '../plugins/just-vibe/scripts/lib/run.mjs';
import { main } from '../plugins/just-vibe/scripts/toolkit.mjs';

const roles = loadProfiles(), commands = loadCatalog();
const user = { primary: 'machine-learning-engineer', secondary: ['mlops-engineer'], selectedBy: 'user', reason: 'User requested ML implementation with operational verification.' };
const agent = { primary: 'backend-engineer', selectedBy: 'agent', reason: 'The task is a service request with duplicate side effects.' };
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

test('profile materialization supplies only selected roles without sharing mutable state', () => {
  const selection = selectProfiles(roles, user), context = profileContext(roles, selection);
  assert.deepEqual(context.roles.map(p => p.id), [user.primary, ...user.secondary]);
  context.roles[0].priorities.length = 0;
  context.selection.secondary.length = 0;
  assert.ok(getProfile(roles, user.primary).priorities.length > 0);
  assert.equal(selection.secondary.length, 1);
  assert.equal(profileContext(roles, null), null);
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
