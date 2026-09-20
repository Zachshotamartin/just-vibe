import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, symlinkSync, rmSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { createRun, startStage, recordStage, finishRun, resumeRun, insideProject } from '../plugins/just-vibe/scripts/lib/run.mjs';

const catalog = loadCatalog();
const capabilities = { 'project.read': { status: 'available', reason: 'Read fixture.' } };
function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'just-vibe-run-')));
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
  mkdirSync(join(root, 'src')); symlinkSync(outside, join(root, 'src/link'), 'dir');
  symlinkSync(join(outside, 'missing-directory'), join(root, 'src/dangling'), 'dir');
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
