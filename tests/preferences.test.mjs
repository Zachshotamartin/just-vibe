import { workbenchCall } from '../plugins/just-vibe/scripts/lib/workbench-access.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { assistantRuntime } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { preferences } from '../plugins/just-vibe/scripts/lib/preferences.mjs';
import { startOperatorServer } from '../plugins/just-vibe/scripts/lib/operator-http.mjs';
async function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'jv-preferences-')), root = join(dir, 'app'), options = { home: join(dir, 'home') };
  mkdirSync(root); writeFileSync(join(root, 'app.js'), 'export const value = 1;');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const task = await assistantRuntime(root, 'start', { brief: 'For this project always check drawer behavior in the browser.', host: 'codex', sessionId: 'preference-fixture' }, options);
  const lesson = await assistantRuntime(root, 'feedback', { taskId: task.id, revision: 0, scope: 'project', kind: 'correction', workflow: 'ui-states', excerpt: task.userMessage, instruction: 'Check the drawer in a browser.', triggers: ['drawer behavior'] }, options);
  return { root, options, lesson, run: (op, data) => preferences(root, op, data, options) };
}
test('preference preview is inert; edits retain provenance, disable and restore require current revision', async t => {
  const f = await fixture(t), { lesson } = f;
  await assert.rejects(workbenchCall('manage', f.root, {family:'preferences',operation:'edit',payload:{}}, f.options), /unavailable/);
  const preview = f.run('preview', { id: lesson.id, revision: lesson.revision, draft: { instruction: 'Check keyboard focus.', triggers: ['flibbertigibbet'] }, cases: [{ brief: 'flibbertigibbet', expectedAffected: true }, { brief: 'hello', expectedAffected: false }] });
  assert.ok(preview.cases.every(c => c.matchesExpectation));
  assert.equal(f.run('list', {}).lessons[0].current, 1);
  let next = f.run('edit', { id: lesson.id, revision: lesson.revision, draft: preview.draft });
  assert.equal(next.history.length, 2); assert.equal(next.history[1].source.kind, 'explicit-edit');
  assert.throws(() => f.run('edit', { id: lesson.id, revision: lesson.revision, draft: preview.draft }), /changed/);
  next = f.run('toggle', { id: next.id, revision: next.revision, enabled: false }); assert.equal(next.active, false);
  next = f.run('rollback', { id: next.id, revision: next.revision, version: 1 });
  assert.equal(next.active, true); assert.equal(next.current, 1); assert.equal(next.history.length, 2);
});
test('preference HTTP changes require token, same origin and supported operations', async t => {
  const f = await fixture(t), board = await startOperatorServer(f.root, f.options); t.after(() => board.close());
  const token = new URL(board.url).hash.slice(1), payload = { id: f.lesson.id, revision: f.lesson.revision, enabled: false };
  assert.equal((await fetch(board.origin + '/api/preferences')).status, 403);
  const send = (origin, operation) => fetch(board.origin + '/api/preferences-action', { method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-operator-token': token }, body: JSON.stringify({ operation, payload }) });
  assert.equal((await send('https://foreign.test', 'toggle')).status, 403);
  assert.equal((await send(board.origin, 'run')).status, 400);
  assert.equal((await send(board.origin, 'toggle')).status, 200);
  assert.equal(f.run('list', {}).lessons[0].active, false);
});
