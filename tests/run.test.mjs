import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, symlinkSync, rmSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { createRun, startStage, recordStage, finishRun, resumeRun, insideProject, supersedeStage, amendStage } from '../plugins/just-vibe/scripts/lib/run.mjs';

const catalog = loadCatalog();
const capabilities = { 'project.read': { status: 'available', reason: 'Read fixture.' } };
function fixture(t) {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'just-vibe-run-')));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  return root;
}
function outcome(id, status = 'completed') { return { id, status, summary: 'Verified fixture behavior.',
  evidence: [{ reference: 'fixture/check', detail: 'Observed the expected result.', result: 'pass' }],
  criteria: [{ criterion: 'Desired behavior works', result: 'pass', evidence: [0] }] }; }
function run(root, mode = 'apply', extra = {}) { return createRun(catalog, 'auto', { root, mode,
  brief: 'Fix the feature.\nNo dependencies. Keep user edits.', context: { constraints: ['No dependencies'], successCriteria: ['Desired behavior works'] }, ...extra }); }
function start(r, extra = {}) { return startStage(catalog, r, { id: 'fix-stage', command: 'fix', action: 'Fix feature', target: r.scope, effect: 'local-write', ...extra }, capabilities); }

test('alias and transitions preserve constraints, brief and original state', t => {
  const root = fixture(t);
  const initial = createRun(catalog, 'do', { root, brief: 'Keep all\ncontext', context: { constraints: ['No deps'] } });
  assert.equal(initial.command, 'auto'); assert.equal(initial.invokedAs, 'do');
  const next = start(initial);
  assert.equal(initial.stages.length, 0);
  assert.equal(next.brief, initial.brief);
  assert.deepEqual(next.context.constraints, ['No deps']);
});

test('inspect and plan reject writes, and plan artifacts need the exact grant', t => {
  const root = fixture(t);
  assert.throws(() => start(run(root, 'inspect')), /Inspect mode/);
  assert.throws(() => start(run(root, 'plan')), /Plan mode/);
  const r = run(root, 'plan');
  assert.throws(() => start(r, { effect: 'plan-artifact' }), /authorization/);
  r.context.authorization.push({ effect: 'plan-artifact', target: root, action: 'Fix feature', basis: 'User asked to save this plan.' });
  assert.equal(start(r, { effect: 'plan-artifact' }).stages[0].status, 'running');
});

test('external, destructive and paid effects require exact action and target authorization', t => {
  const root = fixture(t);
  for (const effect of ['external-write', 'destructive', 'paid']) {
    const r = run(root);
    assert.throws(() => start(r, { effect, target: 'staging' }), /authorization/);
    r.context.authorization.push({ effect, target: 'staging', action: 'Fix feature', basis: 'Explicit user instruction.' });
    assert.equal(start(r, { effect, target: 'staging' }).stages.length, 1);
    assert.throws(() => start(r, { effect, target: 'production' }), /authorization/);
  }
});

test('scope checks reject traversal, symlink escape and Git internals', t => {
  const root = fixture(t), outside = fixture(t);
  mkdirSync(join(root, 'src')); symlinkSync(outside, join(root, 'src/link'), process.platform === 'win32' ? 'junction' : 'dir');
  symlinkSync(join(outside, 'missing-directory'), join(root, 'src/dangling'), process.platform === 'win32' ? 'junction' : 'dir');
  const r = run(root, 'apply', { scope: 'src' });
  for (const target of ['../outside', 'src/link/new-file', 'src/dangling/new-file', 'other/new-file', '.git/config']) {
    assert.throws(() => start(r, { target }), target);
  }
  assert.equal(insideProject(root, 'src/new/file'), join(root, 'src/new/file'));
});

test('router rejects recursion, unavailable capabilities, concurrent and completed stage retries', t => {
  const root = fixture(t), r = run(root);
  for (const command of ['auto', 'do']) assert.throws(() => start(r, { command }), /Recursive/);
  assert.throws(() => start(r, { command: 'github-review' }), /prerequisites/);
  const active = start(r);
  assert.throws(() => start(active, { id: 'second' }), /running stage/);
  const done = recordStage(active, outcome('fix-stage'));
  assert.throws(() => start(done), /Only the same failed/);
});

test('retry requires new evidence, keeps failed history and stops at the configured limit', t => {
  const root = fixture(t);
  let r = run(root, 'apply', { budget: { maxAttempts: 2 } });
  r = recordStage(start(r), outcome('fix-stage', 'failed'));
  assert.throws(() => start(r), /New evidence/);
  r = recordStage(start(r, { newEvidence: 'Found a different causal branch.' }), outcome('fix-stage', 'failed'));
  assert.equal(r.stages[0].attempts.length, 2);
  assert.throws(() => start(r, { newEvidence: 'More data.' }), /retry budget/);
});

test('stage/time budgets stop execution and cannot be reset by resume', t => {
  const root = fixture(t);
  let r = run(root, 'apply', { budget: { maxStages: 1 } });
  r = recordStage(start(r), outcome('fix-stage'));
  assert.throws(() => start(r, { id: 'another' }), /stage budget/);
  const expired = createRun(catalog, 'auto', { root, brief: 'Task', budget: { maxMinutes: 1 } }, Date.now() - 120000);
  assert.throws(() => start(expired), /time budget/);
  assert.throws(() => resumeRun(expired, { root, summary: 'Observed state.', evidence: ['file'] }), /Budget expired/);
});

test('failed, missing and unverified evidence cannot pass a stage', t => {
  const r = start(run(fixture(t)));
  for (const edit of [
    o => { o.evidence = []; }, o => { o.evidence[0].result = 'unverified'; },
    o => { o.criteria = []; }, o => { o.criteria[0].evidence = []; },
    o => { o.criteria[0].result = 'fail'; }, o => { o.criteria[0].evidence = [99]; },
  ]) { const o = outcome('fix-stage'); edit(o); assert.throws(() => recordStage(r, o)); }
});

test('completed run verifies original criteria and rejects remaining work', t => {
  let r = start(run(fixture(t)));
  assert.throws(() => finishRun(r, outcome()), /running stage/);
  r = recordStage(r, outcome('fix-stage'));
  const wrong = outcome(); wrong.criteria[0].criterion = 'Different criterion';
  assert.throws(() => finishRun(r, wrong), /Original success criteria/);
  const final = finishRun(r, outcome());
  assert.equal(final.status, 'completed');
  assert.throws(() => start(final), /completed/);
  assert.throws(() => finishRun(final, outcome()), /already terminal/);
});

test('resume requires current evidence and reconciled effects without changing context', t => {
  const root = fixture(t), other = fixture(t);
  const r = finishRun(run(root), { status: 'blocked', summary: 'Need access.' });
  assert.throws(() => resumeRun(r, { root: other, summary: 'Wrong project', evidence: ['x'] }), /differs/);
  assert.throws(() => resumeRun(r, { root, summary: 'No evidence', evidence: [] }), /evidence/);
  const next = resumeRun(r, { root, summary: 'Access is now available.', evidence: ['Fresh host observation.'] });
  assert.deepEqual(next.context, r.context); assert.deepEqual(next.budget, r.budget);
  assert.throws(() => resumeRun(start(next), { root, summary: 'Interrupted', evidence: ['x'] }), /Reconcile/);
});

test('a resolved blocked stage can resume with evidence while preserving prior outcome history', t => {
  const root = fixture(t);
  let r = recordStage(start(run(root)), outcome('fix-stage', 'blocked'));
  r = finishRun(r, { status: 'blocked', summary: 'Fixture input temporarily unavailable.' });
  r = resumeRun(r, { root, summary: 'Input restored and inspected.', evidence: ['restored fixture'] });
  assert.equal(r.finishedAt, undefined);
  assert.equal(r.outcome, undefined);
  assert.equal(r.previousOutcomes[0].status, 'blocked');
  r = recordStage(start(r, { newEvidence: 'Read the restored input.' }), outcome('fix-stage'));
  assert.equal(finishRun(r, outcome()).status, 'completed');
  assert.equal(r.stages[0].attempts.length, 2);
});

test('a verified alternative supersedes a blocked route without deleting history or resetting budgets', t => {
  const original = recordStage(start(run(fixture(t))), outcome('fix-stage', 'blocked'));
  let r = recordStage(start(original, { id: 'alternative', command: 'build' }), outcome('alternative'));
  assert.throws(() => finishRun(r, outcome()), /Unfinished/);
  const proof = outcome();
  r = supersedeStage(r, { id: 'fix-stage', replacements: ['alternative'], reason: 'Alternative implements the same required behavior.', evidence: proof.evidence, criteria: proof.criteria });
  assert.equal(r.stages[0].status, 'superseded');
  assert.equal(r.stages[0].attempts[0].status, 'blocked');
  assert.equal(original.stages[0].status, 'blocked');
  assert.deepEqual(r.budget, original.budget);
  assert.equal(r.createdAt, original.createdAt);
  assert.equal(finishRun(r, proof).status, 'completed');
  assert.throws(() => start(r), /Only the same failed/);
});

test('supersession rejects missing, unverified, unrelated and circular replacements', t => {
  const blocked = recordStage(start(run(fixture(t))), outcome('fix-stage', 'failed'));
  const unrelated = outcome('different'); unrelated.criteria[0].criterion = 'Unrelated result';
  const r = recordStage(start(blocked, { id: 'different' }), unrelated);
  const proof = outcome();
  const resolution = { id: 'fix-stage', replacements: ['different'], reason: 'Trying alternative', evidence: proof.evidence, criteria: proof.criteria };
  assert.throws(() => supersedeStage(r, resolution), /does not cover/);
  for (const replacements of [[], ['missing'], ['fix-stage'], ['different', 'different']]) assert.throws(() => supersedeStage(r, { ...resolution, replacements }));
  assert.throws(() => supersedeStage(start(blocked, { id: 'running' }), { ...resolution, replacements: ['running'] }), /already be completed/);
  assert.throws(() => supersedeStage(r, { ...resolution, criteria: [] }), /verified criteria/);
  assert.throws(() => supersedeStage(r, { ...resolution, evidence: [{ ...proof.evidence[0], result: 'unverified' }] }), /passing evidence/);
  const partial = finishRun(r, { status: 'partial', summary: 'Work remains.' });
  assert.throws(() => supersedeStage(partial, resolution), /resume explicitly/);
});

test('amending an action checks every effect and preserves attempt and action history', t => {
  const root = fixture(t);
  let r = start(run(root), { effect: 'read' });
  const initial = structuredClone(r);
  r = amendStage(r, { id: 'fix-stage', effects: ['local-write'], target: root, action: 'Apply observed correction' });
  assert.equal(initial.stages[0].attempts[0].actions, undefined);
  assert.equal(r.stages[0].attempts.length, 1);
  assert.equal(r.stages[0].attempts[0].effect, 'read');
  const action = { id: 'fix-stage', effects: ['external-write', 'paid'], target: 'preview/project', action: 'Deploy preview' };
  r.context.authorization.push({ effect: 'external-write', target: action.target, action: action.action, basis: 'User requested this deployment.' });
  assert.throws(() => amendStage(r, action), /authorization/);
  r.context.authorization.push({ effect: 'paid', target: action.target, action: action.action, basis: 'User provided an explicit deployment budget.' });
  r = amendStage(r, action);
  assert.equal(r.stages[0].attempts[0].actions.length, 2);
  assert.deepEqual(r.budget, initial.budget);
  assert.throws(() => amendStage(r, { ...action, target: 'production/project' }), /authorization/);
  const inspected = start(run(root, 'inspect'), { effect: 'read' });
  assert.throws(() => amendStage(inspected, { ...action, effects: ['local-write'], target: root }), /Inspect mode/);
  const finished = recordStage(r, outcome('fix-stage'));
  assert.throws(() => amendStage(finished, action), /No matching running/);
});

test('outcome fields cannot overwrite checked action identity or history', t => {
  let r = start(run(fixture(t)), { effect: 'read' });
  r = amendStage(r, { id: 'fix-stage', effects: ['read'], target: r.root, action: 'Inspect more evidence' });
  r = recordStage(r, { ...outcome('fix-stage'), effect: 'external-write', target: 'attacker', actions: [] });
  assert.equal(r.stages[0].attempts[0].effect, 'read');
  assert.equal(r.stages[0].attempts[0].target, r.root);
  assert.equal(r.stages[0].attempts[0].actions.length, 1);
});

test('superseding uncertain external effects requires explicit reconciliation evidence', t => {
  let r=run(fixture(t));
  r.context.authorization.push({effect:'external-write',target:'preview',action:'Fix feature',basis:'User requested the preview.'});
  r=recordStage(start(r,{effect:'external-write',target:'preview'}),outcome('fix-stage','failed'));
  r=recordStage(start(r,{id:'alternative'}),outcome('alternative'));
  const proof=outcome(), resolution={id:'fix-stage',replacements:['alternative'],reason:'Reused existing deployment.',evidence:proof.evidence,criteria:proof.criteria};
  assert.throws(()=>supersedeStage(r,resolution),/reconciliation/);
  const result=supersedeStage(r,{...resolution,effectReconciliation:{reference:'provider operation 123',detail:'Original deployment exists and matches the requested revision; no duplicate was created.',result:'pass'}});
  assert.equal(result.stages[0].resolution.effectReconciliation.result,'pass');
});
