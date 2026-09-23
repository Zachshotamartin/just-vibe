import { workbenchCall } from '../plugins/just-vibe/scripts/lib/workbench-access.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { assistantRuntime } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { preferences } from '../plugins/just-vibe/scripts/lib/preferences.mjs';
import { patternLearning } from '../plugins/just-vibe/scripts/lib/pattern-learning.mjs';
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

test('creation, setting precedence, conflicts and task exclusions affect actual workflow delivery', async t => {
  const f = await fixture(t);
  const create = (scope, value) => f.run('create', { workflow: 'fix', scope, draft: { instruction: `Use ${value}.`, setting: { key: 'package-manager', value } } });
  const user = create('user', 'npm'), project = create('project', 'pnpm');
  const task = assistantRuntime(f.root, 'start', { brief: 'Fix the bug', host: 'codex', sessionId: 'delivery' }, f.options);
  assistantRuntime(f.root, 'select', { taskId: task.id, workflows: ['fix'], mode: 'apply', reason: 'Fix requested' }, f.options);
  const load = () => assistantRuntime(f.root, 'load', { taskId: task.id, workflow: 'fix' }, f.options);
  assert.deepEqual(load().lessons.map(l=>l.id),[project.id]);
  assert.equal(f.run('activity',{}).tasks[0].loads[0].behavior,'not independently verified');
  const conflicting = create('project', 'yarn');
  assert.equal(load().lessons.length,0); assert.equal(load().conflicts[0].kind,'conflicting-setting');
  const activity = f.run('activity',{}).tasks.find(t=>t.id===task.id);
  f.run('exclude',{taskId:task.id,revision:activity.revision,lessonIds:[conflicting.id]});
  assert.deepEqual(load().lessons.map(l=>l.id),[project.id]);
  const updated=f.run('activity',{}).tasks.find(t=>t.id===task.id);
  f.run('exclude',{taskId:task.id,revision:updated.revision,lessonIds:[project.id,conflicting.id]});
  assert.deepEqual(load().lessons.map(l=>l.id),[user.id]);
  assert.equal(f.run('list',{}).lessons.filter(l=>l.active).length,4);
  await assert.rejects(workbenchCall('manage',f.root,{family:'preferences',operation:'create',payload:{}},f.options),/unavailable/);
});

test('HTTP accepts the full bounded preference schema and rejects oversized transport', async t => {
  const f=await fixture(t),board=await startOperatorServer(f.root,f.options);t.after(()=>board.close());
  const fields=['triggers','avoid','tools','checks','conditions','exceptions'];
  const draft={instruction:'Test bounded metadata',...Object.fromEntries(fields.map(key=>[key,Array.from({length:12},(_,i)=>String(i)+'漢'.repeat(189))]))};
  const send=body=>fetch(board.origin+'/api/preferences-action',{method:'POST',headers:{origin:board.origin,'content-type':'application/json','x-operator-token':new URL(board.url).hash.slice(1)},body:JSON.stringify(body)});
  const result=await send({operation:'edit',payload:{id:f.lesson.id,revision:f.lesson.revision,draft}});
  assert.equal(result.status,200,await result.text());
  assert.equal((await send({padding:'x'.repeat(262145)})).status,400);
});

test('context import requires a reviewed current preview and preserves preferences as pending', async t => {
  const f=await fixture(t),board=await startOperatorServer(f.root,f.options);t.after(()=>board.close());
  const headers={'x-operator-token':new URL(board.url).hash.slice(1)};
  const api=async(path,body)=>{const r=await fetch(board.origin+'/api/'+path,{method:body?'POST':'GET',headers:{...headers,...(body?{origin:board.origin,'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});return{status:r.status,value:await r.json()};};
  const bundle=(await api('context-export')).value; assert.equal(bundle.lessons.length,1);
  bundle.memories=[{id:'imported-note',title:'Imported note',body:'A note to review',tags:[],source:'user'}];
  let preview=(await api('context-preview',{bundle})).value;
  assert.equal((await api('context-apply',{id:preview.id,hash:'wrong'})).status,400);
  const {runtimeStore}=await import('../plugins/just-vibe/scripts/lib/runtime-store.mjs');
  runtimeStore(f.root,f.options).put('memory',{entries:[]},0);
  assert.equal((await api('context-apply',{id:preview.id,hash:preview.hash})).status,400);
  preview=(await api('context-preview',{bundle})).value;
  assert.equal((await api('context-apply',{id:preview.id,hash:preview.hash})).status,200);
  assert.equal(f.run('list',{}).lessons.length,1);
  assert.equal((await api('context-apply',{id:preview.id,hash:preview.hash})).status,400);
});


test('conditional settings retain the fallback for agent applicability review',async t=>{
  const f=await fixture(t);
  f.run('create',{workflow:'fix',scope:'user',draft:{instruction:'Use the preferred manager.',setting:{key:'package-manager',value:'pnpm'}}});
  f.run('create',{workflow:'fix',scope:'project',draft:{instruction:'Use npm for legacy workspaces.',setting:{key:'package-manager',value:'npm'},conditions:['Only inside the legacy workspace']}});
  const effective=assistantRuntime(f.root,'load',{workflow:'fix'},f.options);
  assert.equal(effective.lessons.length,2);assert.equal(effective.conflicts[0].kind,'conditional-setting-review');
  assert.match(effective.instructions,/Setting: package-manager=pnpm/);assert.match(effective.instructions,/Setting: package-manager=npm/);
});

test('evolving a structured preference retains its value in both reusable formats', async t => {
  const f = await fixture(t);
  const lesson = f.run('create', { workflow: 'fix', scope: 'project', draft: { instruction: 'Use the preferred package manager.', setting: { key: 'package-manager', value: 'pnpm' } } });
  for (const format of ['skill', 'agent']) {
    const result = patternLearning(f.root, 'evolve', { id: lesson.id, format }, f.options);
    assert.match(readFileSync(join(f.root, result.file), 'utf8'), /Setting: package-manager=pnpm\./);
  }
});

test('workflow reload synchronizes learned checks with exclusions, restored defaults and edits', async t => {
  const f = await fixture(t);
  const create = (scope, value, checks) => f.run('create', { workflow: 'fix', scope, draft: { instruction: 'Use the preferred manager.', setting: { key: 'package-manager', value }, checks } });
  const fallback = create('user', 'npm', ['Check default install']), project = create('project', 'pnpm', ['Check project install']);
  const task = assistantRuntime(f.root, 'start', { brief: 'Fix the bug', host: 'codex', sessionId: 'checks' }, f.options);
  const select = () => assistantRuntime(f.root, 'select', { taskId: task.id, workflows: ['fix'], mode: 'apply', reason: 'Verify preferences' }, f.options);
  const load = () => assistantRuntime(f.root, 'load', { taskId: task.id, workflow: 'fix' }, f.options);
  const checks = () => assistantRuntime(f.root, 'report', { taskId: task.id }, f.options).checks.filter(r => r.id.includes(':learned-'));
  const exclude = ids => f.run('exclude', { taskId: task.id, revision: f.run('activity', {}).tasks.find(t => t.id === task.id).revision, lessonIds: ids });
  select(); load(); assert.deepEqual(checks().map(c => c.description), ['Check project install']);
  exclude([project.id]); load();
  assert.deepEqual(checks().map(c => c.description), ['Check default install']);
  select(); assert.deepEqual(checks().map(c => c.description), ['Check default install'], 'Reselection must honor task exclusions too');
  load();
  assistantRuntime(f.root, 'evidence', { taskId: task.id, requirement: checks()[0].id, kind: 'host-report', summary: 'Observed default install' }, f.options);
  load(); assert.equal(checks()[0].result, 'reported', 'Unchanged checks retain evidence');
  f.run('edit', { id: fallback.id, revision: fallback.revision, draft: { ...fallback.history[0].change, checks: ['Check the updated default'] } });
  load(); assert.equal(checks()[0].description, 'Check the updated default'); assert.equal(checks()[0].result, 'missing');
  exclude([project.id, fallback.id]); load(); assert.equal(checks().length, 0);
});
