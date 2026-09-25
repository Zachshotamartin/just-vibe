import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { adaptiveStore } from '../plugins/just-vibe/scripts/lib/adaptive-store.mjs';
import { assistantRuntime, stopTask, activationContext } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { assistantHook } from '../plugins/just-vibe/scripts/lib/assistant-hooks.mjs';
import { manageHooks } from '../plugins/just-vibe/scripts/lib/automation.mjs';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';

const catalog = loadCatalog();
const cli = fileURLToPath(new URL('../bin/just-vibe.mjs', import.meta.url));
const hooks = fileURLToPath(new URL('../plugins/just-vibe/scripts/hooks.mjs', import.meta.url));
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'jv-adaptive-')), root = join(dir, 'project'), home = join(dir, 'personal');
  mkdirSync(root); writeFileSync(join(root, 'app.js'), 'export const value = 1;\n');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const run = (op, payload = {}) => assistantRuntime(root, op, payload, { home, catalog });
  const hook = (event, host = 'claude') => assistantHook({ cwd: root, session_id: 'session-one', ...event }, { home, host, catalog });
  const start = (brief, sessionId = 'session-one') => run('start', { brief, sessionId, host: 'claude' });
  return { dir, root, home, run, hook, start, store: adaptiveStore(root, { home }) };
}
const select = (f, task, id = 'ui-states', mode = 'apply') => f.run('select', { taskId: task.id, workflows: [id], mode, reason: 'The requested task matches this workflow.' });
function lesson(task, extra = {}) {
  return { taskId: task.id, revision: 0, scope: 'project', kind: 'correction', workflow: 'ui-states',
    excerpt: task.userMessage, instruction: 'Check the changed menu interactions in the browser.',
    triggers: ['drawer behavior'], tools: ['browser automation'], checks: ['Check Escape and outside-click close.'], ...extra };
}

test('ordinary requests route across frontend, ML, GitHub and backend without command names', t => {
  const f = fixture(t);
  for (const [brief, expected] of [
    ['Fix the mobile menu', 'ui-states'], ['Why is training unstable?', 'ml-debug-training'],
    ['Address this PR’s feedback', 'github-address-review'], ['Fix the login bug without deploying', 'backend-auth'],
    ['Review the database migration', 'db-migrate'],
    ['Add pagination to this endpoint', 'api-pagination'],
    ['Reduce the JavaScript bundle size', 'vite-bundle'],
    // Injection classes route to the input-boundary specialist first (review finding V-A10-01).
    ['Review the API for SQL injection', 'security-inputs'],
    ['Investigate a broken Docker build', 'ops-container'],
  ]) assert.equal(f.run('route', { brief }).recommendations[0].id, expected, brief);
  for (const brief of ['Hello', 'What is the weather?', 'Help choose a restaurant menu', 'Review my marathon training', 'Do not deploy anything']) {
    assert.equal(f.run('route', { brief }).kind, 'none', brief);
  }
  assert.equal(existsSync(f.home), false, 'Read-only retrieval must not create state.');
});

test('everyday engineering phrasing activates while ordinary conversation does not (R1-02, PB-02)', t => {
  const f = fixture(t);
  for (const brief of ['my tests are failing', 'CI is red', 'the dropdown overlaps the footer', 'the migrations are out of order',
    'Is our auth vulnerable to CSRF?', 'the endpoints return 500 after the upgrade', 'npm install fails with ERESOLVE',
    'the server crashes on startup', 'webhook signatures fail verification', 'our dependencies are out of date', 'the specs are flaky']) {
    const route = f.run('route', { brief });
    assert.equal(route.kind, 'task', brief); assert.ok(route.recommendations.length > 0, brief);
  }
  // Generic action rules and single method-id words ("next", "sales") are not engineering evidence.
  for (const brief of ['book a table for the team next friday', 'draft a thank-you note to the sales team', 'plan a weekend trip to Lisbon',
    'how do I fold a fitted sheet', 'write a birthday poem for my sister', 'recommend a good sci-fi novel', 'thanks, that was helpful']) {
    assert.equal(f.run('route', { brief }).kind, 'none', brief);
  }
  const context = brief => { const task = f.start(brief, brief); return task.kind === 'task' ? activationContext(f.store, catalog, task) : ''; };
  assert.doesNotMatch(context('design multi-region disaster recovery for the API'), /motion-design/);
  assert.match(context('BGP session flaps on the edge router'), /network-operations/);
});

test('a repair follow-up after an inspection offers workflows that can apply it (B6-02)', t => {
  const f = fixture(t), audit = 'audit the billing service for security issues, source only';
  for (const followUp of ['fix it', 'fix the first two', 'please fix the issues you found', 'now fix them']) {
    f.start(audit, followUp); const repair = f.start(followUp, followUp);
    assert.equal(repair.routeKind, 'task', followUp); assert.equal(repair.repair, true, followUp);
    assert.equal(repair.brief, audit, 'The original brief and its constraints are kept');
    assert.equal(repair.feedbackCandidate, false, 'A repair request is not feedback');
    assert.deepEqual(repair.candidates.map(c => c.id), ['security-fix', 'fix'], followUp);
    assert.match(activationContext(f.store, catalog, repair), /repair what the previous inspection found/);
  }
  // A selected apply-mode task continues unchanged; a selected inspect-mode task is repaired.
  const applied = f.start('Fix the mobile menu', 'applied'); select(f, applied);
  const continued = f.start('fix the first two', 'applied');
  assert.equal(continued.repair, false); assert.equal(continued.brief, 'Fix the mobile menu'); assert.equal(continued.candidates[0].id, 'ui-states');
  const inspected = f.start('Fix the mobile menu', 'inspected'); select(f, inspected, 'ui-states', 'inspect');
  assert.equal(f.start('fix it', 'inspected').repair, true);
  assert.equal(f.start('continue', 'inspected').repair, false, 'A plain continuation keeps the previous shortlist');
});

test('questions about which workflow to use are answered, not executed (B11-01)', t => {
  const f = fixture(t);
  for (const [brief, first] of [
    ['Which just-vibe command should I use to find out why a test only fails in CI?', 'help'],
    ['What commands do you have for React performance problems?', 'tools'],
    ['which skill handles Vercel build failures?', 'help'],
    ['is there a workflow for database migrations?', 'help'],
    ['how do I use just-vibe to review a pull request?', 'help'],
    ["Don't run anything yet. Just tell me which workflow fits a slow SQL query.", 'help'],
    ["Show which GitHub workflows are available here, but don't log in to anything.", 'tools'],
    ['Which integrations and prerequisites are missing for the Vercel workflows?', 'tools'],
    ['Which persona fits an SRE doing an on-call review?', 'profile'],
  ]) {
    const route = f.run('route', { brief });
    assert.equal(route.kind, 'discovery', brief); assert.equal(route.recommendations[0].id, first, brief);
  }
  for (const brief of ['Fix the mobile menu', 'Which GitHub workflow runs the tests?', 'what tool should I use for load testing']) {
    assert.notEqual(f.run('route', { brief }).kind, 'discovery', brief);
  }
  f.start('Fix the mobile menu');
  const question = f.start('Which just-vibe command should I use for flaky tests?');
  assert.equal(question.routeKind, 'discovery'); assert.equal(question.status, 'idle'); assert.equal(question.feedbackCandidate, false);
  const context = activationContext(f.store, catalog, question);
  assert.match(context, /do not start the embedded task/); assert.doesNotMatch(context, /Before implementation/);
  assert.deepEqual(stopTask(f.store, catalog, question.id), {}, 'Answering needs no workflow selection at Stop');
});

test('both adapters inject a bounded shortlist and preserve the complete request', t => {
  const f = fixture(t);
  for (const host of ['claude', 'codex']) {
    const context = f.hook({ hook_event_name: 'UserPromptSubmit', prompt: 'Fix the mobile menu. No new packages; do not deploy.', turn_id: 't1' }, host).hookSpecificOutput.additionalContext;
    assert.match(context, /ui-states/); assert.match(context, /assist select/); assert.ok(context.length < 8000);
    const session = f.store.read(f.store.sessionPath(host, 'session-one'));
    assert.equal(f.store.task(session.taskId).brief, 'Fix the mobile menu. No new packages; do not deploy.');
    assert.equal(f.hook({ hook_event_name: 'UserPromptSubmit', prompt: 'Fix the mobile menu. No new packages; do not deploy.', turn_id: 't1' }, host).hookSpecificOutput.additionalContext, context);
  }
});

test('skipped prompts detach the previous task from later host events', t => {
  const f = fixture(t);
  for (const host of ['claude', 'codex']) for (const prompt of ['x'.repeat(16001), undefined, '', '   ', 'invalid\0prompt']) {
    f.hook({ hook_event_name: 'UserPromptSubmit', prompt: 'Fix the mobile menu' }, host);
    const session = f.store.read(f.store.sessionPath(host, 'session-one'));
    const previous = f.store.task(session.taskId);
    select(f, previous);
    assert.match(f.hook({ hook_event_name: 'UserPromptSubmit', prompt }, host).systemMessage, /skipped/);
    f.hook({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_use_id: 'new-untracked-turn' }, host);
    assert.equal(f.store.task(previous.id).observations.length, 0, 'Untracked new work must not become old task evidence');
    assert.deepEqual(f.hook({ hook_event_name: 'Stop' }, host), {});
    assert.equal(f.store.read(f.store.sessionPath(host, 'session-one')).taskId, null);
    f.hook({ hook_event_name: 'UserPromptSubmit', prompt: 'Explain this function' }, host);
    assert.notEqual(f.store.read(f.store.sessionPath(host, 'session-one')).taskId, previous.id);
  }
});

test('selection exposes actual capability uncertainty and loads full effective instructions', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu'), selected = select(f, task);
  assert.equal(selected.toolGuidance.find(g => g.capability === 'browser.inspect').status, 'unknown');
  assert.match(selected.toolGuidance.find(g => g.capability === 'browser.inspect').action, /Discover/);
  const loaded = f.run('load', { taskId: task.id, workflow: 'ui-states' });
  assert.match(loaded.instructions, /## Technical method/);
  assert.equal(f.run('report', { taskId: task.id }).checks.find(r => r.id.endsWith(':instructions')).result, 'delivered');
  assert.throws(() => f.run('load', { taskId: task.id, workflow: 'ml-train' }), /Select/);
});

test('inspect work has no implementation gates and an irrelevant route can be dismissed', t => {
  const f = fixture(t), task = f.start('Explain menu focus behavior');
  assert.deepEqual(select(f, task, 'ui-states', 'inspect').requirements.map(r => r.id), ['ui-states:instructions', 'ui-states:result']);
  f.run('select', { taskId: task.id, workflows: [], mode: 'inspect', reason: 'No specialized workflow is useful here.' });
  assert.deepEqual(stopTask(f.store, catalog, task.id), {});
});

test('tool activity is recorded without secrets and does not satisfy verification', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu'); select(f, task);
  f.hook({ hook_event_name: 'PostToolUse', tool_name: 'browser_click', tool_use_id: 'call1', tool_input: { password: 'private' }, tool_response: { text: 'secret output' } });
  f.hook({ hook_event_name: 'PostToolUse', tool_name: 'browser_click', tool_use_id: 'call1' });
  const result = f.run('report', { taskId: task.id });
  assert.equal(result.task.observations.length, 1);
  assert.equal(result.task.observations[0].outcome, 'returned');
  assert.ok(result.missing.includes('ui-states:browser'));
  assert.doesNotMatch(JSON.stringify(result.task), /"password"|secret output/);
});

test('evidence detects changed artifacts and source; blockers stay visible', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu'); select(f, task);
  f.run('load', { taskId: task.id, workflow: 'ui-states' });
  writeFileSync(join(f.root, 'result.txt'), 'Menu checks passed');
  f.run('evidence', { taskId: task.id, requirement: 'ui-states:browser', kind: 'artifact', path: 'result.txt', summary: 'Recorded menu interaction check output.' });
  f.run('evidence', { taskId: task.id, requirement: 'ui-states:verification', kind: 'blocked', summary: 'The test runner is unavailable.' });
  let report = f.run('report', { taskId: task.id });
  assert.deepEqual(report.missing, []); assert.equal(report.limitations.length, 1);
  assert.match(stopTask(f.store, catalog, task.id).systemMessage, /blocked/);
  writeFileSync(join(f.root, 'app.js'), 'changed');
  report = f.run('report', { taskId: task.id }); assert.ok(report.missing.includes('ui-states:browser'));
  assert.throws(() => f.run('evidence', { taskId: task.id, requirement: 'ui-states:browser', kind: 'artifact', path: '../outside', summary: 'bad' }), /escapes/);
});

test('completion reminders stop after one retry and never manufacture a pass', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu'); select(f, task);
  assert.equal(stopTask(f.store, catalog, task.id).decision, 'block');
  assert.match(stopTask(f.store, catalog, task.id).systemMessage, /incomplete/);
  assert.equal(f.store.task(task.id).reminders, 1); assert.equal(f.store.task(task.id).status, 'incomplete');
  assert.deepEqual(stopTask(f.store, catalog, task.id), {});
  const next = f.start('Fix the mobile menu'); select(f, next);
  assert.equal(stopTask(f.store, catalog, next.id, { stopHookActive: true }).decision, undefined);
});

test('resume restores selected workflows; startup, other sessions and late events do not', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu'); select(f, task);
  assert.match(f.hook({ hook_event_name: 'SessionStart', source: 'compact' }).hookSpecificOutput.additionalContext, /Selected workflows: ui-states/);
  assert.deepEqual(f.hook({ hook_event_name: 'SessionStart', source: 'startup' }), {});
  assert.deepEqual(f.hook({ hook_event_name: 'SessionStart', source: 'resume', session_id: 'another' }), {});
  assert.deepEqual(f.hook({ hook_event_name: 'PostToolUse', tool_name: 'Bash', agent_id: 'child' }), {});
  const continuation = f.start('continue'); assert.match(continuation.brief, /Fix the mobile menu/);
  f.start('Thanks.'); assert.match(f.start('continue').brief, /Fix the mobile menu/);
});

test('explicit feedback updates routing and real loaded instructions across sessions', t => {
  const f = fixture(t), task = f.start('You forgot the browser. Always check menu interactions in the browser.');
  const saved = f.run('feedback', lesson(task));
  assert.equal(saved.current, 1);
  const routed = f.run('route', { brief: 'Fix drawer behavior' }); assert.equal(routed.recommendations[0].id, 'ui-states');
  const next = f.start('Fix drawer behavior', 'fresh-session'); select(f, next);
  const loaded = f.run('load', { taskId: next.id, workflow: 'ui-states' });
  assert.match(loaded.instructions, /Check the changed menu interactions in the browser/);
  assert.equal(loaded.lessons[0].id, saved.id);
  assert.ok(f.run('report', { taskId: next.id }).checks.some(r => r.id.includes('learned-')));
  const output = execFileSync(process.execPath, [cli, 'show', 'ui-states', '--root', f.root], { encoding: 'utf8', env: { ...process.env, JUST_VIBE_HOME: f.home } });
  assert.match(output, /Check the changed menu interactions in the browser/);
});

test('correction revisions and rollback change subsequent command behavior', t => {
  const f = fixture(t), first = f.start('Always check menu interactions in the browser.');
  const a = f.run('feedback', lesson(first));
  const second = f.start('I prefer checking keyboard behavior first.');
  const b = f.run('feedback', lesson(second, { id: a.id, revision: a.revision, instruction: 'Check keyboard behavior first.', triggers: ['keyboard regression'] }));
  assert.equal(b.history.length, 2); assert.equal(b.current, 2);
  assert.match(f.run('load', { workflow: 'ui-states' }).instructions, /Check keyboard behavior first/);
  assert.throws(() => f.run('rollback', { id: a.id, revision: a.revision, version: 1 }), /revision/);
  const rolled = f.run('rollback', { id: a.id, revision: b.revision, version: 1 });
  assert.match(f.run('load', { workflow: 'ui-states' }).instructions, /Check the changed menu interactions/);
  const retired = f.run('retire', { id: a.id, revision: rolled.revision });
  assert.equal(f.run('load', { workflow: 'ui-states' }).lessons.length, 0);
  f.run('forget', { id: a.id, revision: retired.revision }); assert.equal(f.run('history').lessons.length, 0);
});

test('feedback requires real source text, explicit scope and a durable signal', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu');
  assert.throws(() => f.run('feedback', lesson(task, { excerpt: 'Invented approval' })), /quote/);
  assert.deepEqual(f.run('history').lessons, [], 'A request by itself must not create a lesson.');
  const once = f.start('Always check this for this task only');
  assert.throws(() => f.run('feedback', lesson(once)), /one-time/);
  const correction = f.start('Always check menus in the browser');
  assert.throws(() => f.run('feedback', lesson(correction, { scope: 'user' })), /cross-project/);
  const global = f.start('Across projects, always check changed menus in the browser.');
  const saved = f.run('feedback', lesson(global, { scope: 'user' })); assert.equal(saved.scope, 'user');
  const other = join(f.dir, 'other'); mkdirSync(other);
  assert.equal(assistantRuntime(other, 'load', { workflow: 'ui-states' }, { home: f.home }).lessons.length, 1);
  f.run('feedback', lesson(correction));
  assert.equal(assistantRuntime(other, 'load', { workflow: 'ui-states' }, { home: f.home }).lessons.length, 1, 'Project lesson must not leak.');
  assert.throws(() => assistantRuntime(other, 'report', { taskId: task.id }, { home: f.home }), /Unknown task/);
});

test('negative routing feedback suppresses a workflow but respects explicit invocation', t => {
  const f = fixture(t), task = f.start('Do not use the menu workflow for restaurant menus.');
  f.run('feedback', lesson(task, { avoid: ['restaurant menu'], triggers: [] }));
  assert.ok(!f.run('route', { brief: 'Build a restaurant menu website' }).recommendations.some(r => r.id === 'ui-states'));
  assert.ok(f.run('route', { brief: '/just-vibe:ui-states build a restaurant menu website' }).recommendations.some(r => r.id === 'ui-states'));
});

test('settings disable hooks or learning and advisory mode never continues a turn', t => {
  const f = fixture(t);
  f.run('configure', { scope: 'project', revision: 0, settings: { gate: 'advisory', learning: false } });
  const task = f.start('Always check menu interactions in the browser'); select(f, task);
  assert.equal(stopTask(f.store, catalog, task.id).decision, undefined);
  assert.throws(() => f.run('feedback', lesson(task)), /disabled/);
  f.run('configure', { scope: 'project', revision: 1, settings: { enabled: false } });
  assert.deepEqual(f.hook({ hook_event_name: 'UserPromptSubmit', prompt: 'Fix the mobile menu' }), {});
  assert.throws(() => f.run('configure', { scope: 'project', revision: 0, settings: { enabled: true } }), /revision/);
});

test('hook entry point and packaged CLI form a complete ordinary-request loop', t => {
  const f = fixture(t), env = { ...process.env, JUST_VIBE_HOME: f.home };
  const event = { cwd: f.root, session_id: 'native-fixture', hook_event_name: 'UserPromptSubmit', prompt: 'Explain linked lists' };
  const output = JSON.parse(execFileSync(process.execPath, [hooks], { cwd: f.root, env, input: JSON.stringify(event), encoding: 'utf8' }));
  const id = output.hookSpecificOutput.additionalContext.match(/Task ID: ([a-z0-9-]+)/)[1];
  const call = (op, value) => JSON.parse(execFileSync(process.execPath, [cli, 'assist', op, '--root', f.root, '--stdin'], { cwd: f.root, env, input: JSON.stringify(value), encoding: 'utf8' }));
  call('select', { taskId: id, workflows: ['explain'], mode: 'inspect', reason: 'Explain a data structure.' });
  call('load', { taskId: id, workflow: 'explain' });
  call('evidence', { taskId: id, requirement: 'explain:result', kind: 'host-report', summary: 'Walked through nodes, pointers and insertion using a concrete example.' });
  const stopped = execFileSync(process.execPath, [hooks], { cwd: f.root, env, input: JSON.stringify({ ...event, hook_event_name: 'Stop' }), encoding: 'utf8' });
  assert.equal(stopped, ''); assert.equal(call('report', { taskId: id }).status, 'reported');
});

test('symlink state and credential evidence are rejected', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu'); select(f, task);
  writeFileSync(join(f.root, '.env'), 'SECRET=example');
  assert.throws(() => f.run('evidence', { taskId: task.id, requirement: 'ui-states:browser', kind: 'artifact', path: '.env', summary: 'secret' }), /non-secret/);
  const elsewhere = join(f.dir, 'elsewhere'); mkdirSync(elsewhere);
  const link = join(f.dir, 'linked'); symlinkSync(elsewhere, link, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => assistantRuntime(f.root, 'status', {}, { home: link }), /symlink/);
});

test('a host-generated Stop continuation is never a new user source or a new retry budget', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu'); select(f, task);
  const reminder = stopTask(f.store, catalog, task.id);
  const resumed = f.start(reminder.reason);
  assert.equal(resumed.id, task.id); assert.equal(resumed.reminders, 1);
  assert.equal(resumed.userMessage, 'Fix the mobile menu');
  assert.throws(() => f.run('feedback', lesson(resumed, { excerpt: reminder.reason })), /quote/);
  assert.equal(stopTask(f.store, catalog, resumed.id).decision, undefined);
});

test('continuation events follow the new host turn while late events stay isolated', t => {
  const f = fixture(t);
  f.hook({ hook_event_name: 'UserPromptSubmit', prompt: 'Fix the mobile menu', turn_id: 'first' }, 'codex');
  const session = f.store.read(f.store.sessionPath('codex', 'session-one'));
  const task = f.store.task(session.taskId); select(f, task);
  const reminder = f.hook({ hook_event_name: 'Stop', turn_id: 'first' }, 'codex');
  f.hook({ hook_event_name: 'UserPromptSubmit', prompt: reminder.reason, turn_id: 'continuation' }, 'codex');
  assert.equal(f.store.task(task.id).turnId, 'continuation');
  assert.equal(f.store.task(task.id).userMessage, 'Fix the mobile menu');
  assert.equal(f.store.task(task.id).reminders, 1);
  f.hook({ hook_event_name: 'PostToolUse', turn_id: 'first', tool_name: 'Bash' }, 'codex');
  assert.equal(f.store.task(task.id).observations.length, 0);
  f.hook({ hook_event_name: 'PostToolUse', turn_id: 'continuation', tool_name: 'Bash' }, 'codex');
  assert.equal(f.store.task(task.id).observations.length, 1);
  assert.match(f.hook({ hook_event_name: 'Stop', turn_id: 'continuation' }, 'codex').systemMessage, /incomplete/);
  assert.equal(f.store.task(task.id).status, 'incomplete');
});

test('feedback cannot omit a task-only restriction by quoting a shorter excerpt', t => {
  const f = fixture(t), task = f.start('Always check menu interactions in the browser, for this task only.');
  assert.throws(() => f.run('feedback', lesson(task, { excerpt: 'Always check menu interactions in the browser' })), /one-time/);
  assert.deepEqual(f.run('history').lessons, []);
});

test('broken project automation does not suppress the adaptive completion reminder', t => {
  const f = fixture(t), env = { ...process.env, JUST_VIBE_HOME: f.home };
  const event = { cwd: f.root, session_id: 'isolated-hooks', hook_event_name: 'UserPromptSubmit', prompt: 'Fix the mobile menu' };
  const call = value => JSON.parse(execFileSync(process.execPath, [hooks], { env, input: JSON.stringify(value), encoding: 'utf8' }));
  call(event);
  mkdirSync(join(f.root, '.just-vibe')); writeFileSync(join(f.root, '.just-vibe/automation.json'), '{broken');
  const stopped = call({ ...event, hook_event_name: 'Stop' });
  assert.equal(stopped.decision, 'block');
  assert.match(stopped.systemMessage, /optional automation could not run/);
});

test('completion freshness is checked after trusted project commands finish', t => {
  const f = fixture(t), env = { ...process.env, JUST_VIBE_HOME: f.home };
  const event = { cwd: f.root, session_id: 'ordered-hooks', hook_event_name: 'UserPromptSubmit', prompt: 'Explain this function' };
  const call = value => JSON.parse(execFileSync(process.execPath, [hooks], { env, input: JSON.stringify(value), encoding: 'utf8' }));
  const activated = call(event), id = activated.hookSpecificOutput.additionalContext.match(/Task ID: ([a-z0-9-]+)/)[1];
  select(f, f.store.task(id), 'explain', 'inspect');
  f.run('load', { taskId: id, workflow: 'explain' });
  manageHooks(f.root, 'configure', { schemaVersion: 1, revision: 0, enabled: true, saveSummary: false, formatters: [], checks: [
    { name: 'changes-source', command: [process.execPath, '-e', "require('node:fs').writeFileSync('app.js', 'changed by check')"], timeoutMs: 2000, extensions: [] },
  ] }, { home: f.home });
  manageHooks(f.root, 'trust', {}, { home: f.home });
  f.run('evidence', { taskId: id, requirement: 'explain:result', kind: 'host-report', summary: 'Inspected the current implementation.' });
  const stopped = call({ ...event, hook_event_name: 'Stop' });
  assert.equal(stopped.decision, 'block');
  assert.match(stopped.reason, /explain:result/);
  assert.match(stopped.systemMessage, /changes-source \(stale\)/);
});

test('positive feedback is explicit, versioned and never inferred from tool outcomes', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu'); select(f, task);
  f.hook({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_response: { exit_code: 0 } });
  assert.deepEqual(f.run('history').lessons, []);
  const positive = f.start('I liked starting with keyboard navigation. Keep that approach.');
  const saved = f.run('feedback', lesson(positive, { kind: 'reinforcement', instruction: 'Begin menu verification with keyboard navigation.' }));
  assert.equal(saved.history[0].feedback, 'reinforcement');
  assert.match(f.run('load', { workflow: 'ui-states' }).instructions, /Begin menu verification with keyboard navigation/);
});

test('unusual natural-language feedback is offered to the host for interpretation', t => {
  const f = fixture(t); f.start('Fix the mobile menu');
  const context = f.hook({ hook_event_name: 'UserPromptSubmit', prompt: 'The amount of ceremony here feels exhausting.' }).hookSpecificOutput.additionalContext;
  assert.match(context, /may contain explicit feedback/);
  assert.deepEqual(f.run('history').lessons, [], 'Interpretation is required before persisting feedback.');
});

test('repeat requests retain the original task instead of becoming feedback-only turns', t => {
  const f = fixture(t);
  const first = f.start('Review the authentication code. Do not deploy.');
  for (const brief of ['again', 'Please do that again.', 'One more time', 'another pass']) {
    const repeated = f.start(brief);
    assert.equal(repeated.routeKind, 'task', brief);
    assert.match(repeated.brief, /Review the authentication code\. Do not deploy\./);
    assert.equal(repeated.userMessage, brief);
    assert.notEqual(repeated.id, first.id);
    assert.ok(repeated.candidates.length > 0);
  }
  const unrelated = f.start('What is the weather?');
  assert.equal(unrelated.routeKind, 'none');
  assert.equal(f.start('again').routeKind, 'none', 'Repeating an unrelated request must not resurrect older coding work');
  assert.equal(f.start('again', 'new-session').kind, 'none', 'A repeat without a prior task must not invent one');
  const bounded = 'Do not deploy. Review the authentication code. ' + 'Context. '.repeat(1770) + ' Preserve user changes.';
  assert.ok(bounded.length <= 16000);
  const original = f.start(bounded, 'long-request');
  for (let i = 0; i < 3; i++) {
    const repeated = f.start('again', 'long-request');
    assert.equal(repeated.brief, original.brief, 'Repeats must preserve the full task instead of progressively truncating its leading constraints');
    assert.equal(repeated.userMessage, 'again');
  }
});

test('natural-language learning controls bypass unrelated workflow selection', t => {
  const f = fixture(t);
  for (const prompt of ['What have you learned about me?', 'Forget that preference', 'Roll back that lesson', 'Stop learning']) {
    const context = f.hook({ hook_event_name: 'UserPromptSubmit', prompt }).hookSpecificOutput.additionalContext;
    assert.match(context, /assist history\/status/); assert.doesNotMatch(context, /Resolve these candidates/);
  }
});

test('retention removes expired task text while preserving explicit learning', t => {
  const f = fixture(t), task = f.start('Always check menu interactions in the browser.');
  f.run('feedback', lesson(task));
  const old = new Date(Date.now() - 35 * 86400000).toISOString();
  f.store.saveTask({ ...f.store.task(task.id), updatedAt: old, createdAt: old });
  assert.equal(f.run('prune').removed, 1);
  assert.throws(() => f.run('report', { taskId: task.id }), /Unknown task/);
  assert.equal(f.run('history').lessons.length, 1);
});

test('interrupted-state recovery preserves live locks and removes dead owners only', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu');
  const path = join(f.home, f.store.taskPath(task.id) + '.lock');
  writeFileSync(path, JSON.stringify({ pid: process.pid }));
  assert.equal(f.run('recover', { scope: 'project' }).active.length, 1);
  assert.equal(existsSync(path), true);
  const dead = Number(execFileSync(process.execPath, ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }).trim());
  writeFileSync(path, JSON.stringify({ pid: dead }));
  assert.equal(f.run('recover', { scope: 'project' }).recovered.length, 1);
  assert.equal(existsSync(path), false);
  select(f, task);
});

test('rejected capability reports leave the selected task unchanged', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu');
  assert.throws(() => f.run('select', { taskId: task.id, workflows: ['ui-states'], mode: 'apply', reason: 'UI repair', capabilityReport: { schemaVersion: 1, root: f.root, observedAt: '2000-01-01', capabilities: {} } }), /stale/);
  assert.equal(f.store.task(task.id).revision, task.revision);
});

test('current browser exclusions do not add a default browser gate', t => {
  const f = fixture(t), task = f.start('Fix the mobile menu without a browser.');
  assert.equal(select(f, task).requirements.some(r => r.id.endsWith(':browser')), false);
  assert.doesNotThrow(() => f.run('route', { brief: 'Fix $variable handling in this Python function' }));
});
test('status chooses recent active tasks by timestamp rather than filename order', t => {
  const f = fixture(t);
  for (let i = 0; i < 101; i++) f.store.saveTask({ kind: 'task', id: i === 0 ? 'a-newest' : 'z-old-' + i, root: f.root, host: 'codex', brief: 'Fix a bug', status: 'active', updatedAt: i === 0 ? '2026-09-22T12:00:00Z' : '2026-09-01T12:00:00Z' }, 0);
  const tasks = f.run('status').activeTasks;
  assert.equal(tasks.length, 10); assert.equal(tasks[0].id, 'a-newest');
});
