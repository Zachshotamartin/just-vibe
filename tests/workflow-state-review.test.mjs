import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir, hostname } from 'node:os';
import { spawnSync } from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { pathToFileURL } from 'node:url';
import { adaptiveStore, pruneAdaptive, recoverAdaptive } from '../plugins/just-vibe/scripts/lib/adaptive-store.mjs';
import { assistantRuntime } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { withFileLock } from '../plugins/just-vibe/scripts/lib/file-lock.mjs';
import { patternLearning } from '../plugins/just-vibe/scripts/lib/pattern-learning.mjs';
import { sessions, parseSession } from '../plugins/just-vibe/scripts/lib/native-sessions.mjs';
import { createMcpServer } from '../plugins/just-vibe/scripts/lib/mcp-server.mjs';
import { configurationInventory } from '../plugins/just-vibe/scripts/lib/config-inventory.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';

const moduleUrl = file => pathToFileURL(resolve('plugins/just-vibe/scripts/lib', file)).href;
function fixture(t) {
  const base = fs.realpathSync.native(fs.mkdtempSync(join(tmpdir(), 'jv-workflow-review-')));
  const root = join(base, 'project'), home = join(base, 'home');
  fs.mkdirSync(root); fs.mkdirSync(home);
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  return { base, root, home, options: { home }, store: adaptiveStore(root, { home }) };
}
function runChild(code) {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return result;
}
const deadPid = () => spawnSync(process.execPath, ['-e', '']).pid;

test('adaptive recovery shares the automatic recovery gate and preserves live or foreign owners', t => {
  const f = fixture(t), lock = join(f.home, f.store.project, 'config.json.lock');
  fs.mkdirSync(join(f.home, f.store.project), { recursive: true });
  fs.writeFileSync(lock, JSON.stringify({ pid: deadPid(), host: hostname(), token: 'stale' }));
  withFileLock(`${lock}.recovery`, () => {
    const result = recoverAdaptive(f.store, 'project');
    assert.equal(result.recovered.length, 0);
    assert.equal(result.active.length, 1);
    assert.equal(fs.existsSync(lock), true);
  });
  assert.equal(recoverAdaptive(f.store, 'project').recovered.length, 1);
  withFileLock(lock, () => {
    assert.equal(recoverAdaptive(f.store, 'project').active.length, 1);
    assert.throws(() => withFileLock(lock, () => assert.fail('overlapping writer')), { code: 'STATE_LOCKED' });
  });
  fs.writeFileSync(lock, JSON.stringify({ pid: deadPid(), host: `${hostname()}-foreign`, token: 'foreign' }));
  assert.throws(() => recoverAdaptive(f.store, 'project'), /another host/);
  assert.equal(fs.existsSync(lock), true);
});

for (const kind of ['task', 'session']) test(`adaptive prune preserves a ${kind} updated after its initial read`, t => {
  const f = fixture(t), old = new Date(Date.now() - 31 * 86400000).toISOString();
  let task = assistantRuntime(f.root, 'start', { host: 'claude', sessionId: 'fixture', brief: 'Review this code.' }, f.options);
  const relative = kind === 'task' ? f.store.taskPath(task.id) : f.store.sessionPath('claude', 'fixture');
  const record = f.store.read(relative);
  f.store.write(relative, { ...record, updatedAt: old }, record.revision);
  const file = join(f.home, relative), original = fs.lstatSync;
  let stats = 0, updated = false;
  fs.lstatSync = function(path, ...args) {
    const stat = original.call(fs, path, ...args);
    // Both implementations reach this after reading the old record, immediately
    // before deciding whether to delete it. A real process publishes a new revision.
    if (String(path) === file && ++stats === 3) {
      if (kind === 'task') runChild(`import { assistantRuntime } from ${JSON.stringify(moduleUrl('assistant-runtime.mjs'))}; assistantRuntime(${JSON.stringify(f.root)}, 'select', ${JSON.stringify({ taskId: task.id, workflows: ['review'], mode: 'inspect', reason: 'Resume current task' })}, ${JSON.stringify(f.options)});`);
      else runChild(`import { adaptiveStore } from ${JSON.stringify(moduleUrl('adaptive-store.mjs'))}; const s=adaptiveStore(${JSON.stringify(f.root)}, ${JSON.stringify(f.options)}), p=${JSON.stringify(relative)}, old=s.read(p); s.write(p,{...old,updatedAt:new Date().toISOString()},old.revision);`);
      updated = true;
    }
    return stat;
  };
  syncBuiltinESMExports();
  try { assert.equal(pruneAdaptive(f.store).removed, 0); }
  finally { fs.lstatSync = original; syncBuiltinESMExports(); }
  assert.equal(updated, true);
  assert.ok(f.store.read(relative));
  assert.ok(Date.parse(f.store.read(relative).updatedAt) > Date.parse(old));
});

test('adaptive prune skips records held by a writer', t => {
  const f = fixture(t);
  let task = assistantRuntime(f.root, 'start', { host: 'claude', sessionId: 'fixture', brief: 'Review this code.' }, f.options);
  task = f.store.saveTask({ ...task, updatedAt: new Date(Date.now() - 31 * 86400000).toISOString() });
  withFileLock(join(f.home, f.store.taskPath(task.id)) + '.lock', () => {
    assert.equal(pruneAdaptive(f.store).removed, 0);
    assert.equal(f.store.task(task.id).id, task.id);
  });
  assert.equal(pruneAdaptive(f.store).removed, 1);
});

test('pruning preserves an interrupted approval until activation is recovered', t => {
  const f = fixture(t);
  const state = patternLearning(f.root, 'import', { revision: 0, bundle: { schema: 'just-vibe.preferences.v1', items: [{ workflow: 'review', instruction: 'Inspect boundary conditions.', tools: [], triggers: [], avoid: [], checks: [], conditions: [], exceptions: [] }] } }, f.options);
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import fs from 'node:fs'; import {syncBuiltinESMExports} from 'node:module';
    const original=fs.writeFileSync; fs.writeFileSync=(path,...args)=>{
      if(String(path).replaceAll('\\\\','/').includes('/learning/pattern-'))process.exit(77);
      return original(path,...args);
    }; syncBuiltinESMExports();
    const {patternLearning}=await import(${JSON.stringify(moduleUrl('pattern-learning.mjs'))});
    patternLearning(${JSON.stringify(f.root)},'approve',${JSON.stringify({ revision: state.revision, id: state.candidates[0].id, reason: 'Reviewed fixture preference' })},${JSON.stringify(f.options)});
  `], { encoding: 'utf8', timeout: 10000 });
  assert.equal(child.status, 77, child.stderr);
  const pending = patternLearning(f.root, 'status', {}, f.options);
  assert.equal(pending.candidates[0].status, 'approved');
  let pruned = patternLearning(f.root, 'prune', { revision: pending.revision }, f.options);
  assert.equal(pruned.candidates.length, 1);
  patternLearning(f.root, 'recover', {}, f.options);
  assert.equal(assistantRuntime(f.root, 'load', { workflow: 'review' }, f.options).lessons.length, 1);
  pruned = patternLearning(f.root, 'prune', { revision: pruned.revision }, f.options);
  assert.equal(pruned.candidates.length, 0);
  assert.equal(pruned.decisions[0].status, 'approved');
});

const response = (id, turn) => ({ type: 'response_item', payload: { type: 'message', id, turn_id: turn, role: 'user', content: [{ type: 'input_text', text: 'Continue.' }] } });
const event = (id, turn) => ({ type: 'event_msg', payload: { type: 'user_message', message_id: id, turn_id: turn, message: 'Continue.' } });
test('Codex import pairs each adjacent mirror once and preserves repeated or interrupted requests', t => {
  const f = fixture(t);
  for (const [rows, expected] of [
    [[response('one'), response('two')], 2],
    [[response('one'), event('one'), response('two'), event('two')], 2],
    [[event('one'), response('one'), event('two'), response('two')], 2],
    [[response('one'), event('two')], 2],
    [[response(undefined, 'a'), event(undefined, 'b')], 2],
    [[response(), { type: 'event_msg', payload: { type: 'turn_aborted' } }, event()], 2],
    [[response(), null, event()], 2],
  ]) assert.equal(parseSession(JSON.stringify(rows), 'codex').totalMessages, expected);
  fs.writeFileSync(join(f.root, 'session.jsonl'), [
    { type: 'session_meta', payload: { cwd: f.root } }, response('one'),
    { type: 'event_msg', payload: { type: 'turn_aborted' } }, response('two'),
  ].map(JSON.stringify).join('\n'));
  sessions(f.root, 'import', { id: 'chat', revision: 0, host: 'codex', path: 'session.jsonl' }, f.options);
  assert.equal(sessions(f.root, 'window', { id: 'chat' }, f.options).totalMessages, 2);
});

async function connection(f, allowWrite) {
  const handler = createMcpServer(f.root, { ...f.options, allowWrite, allowUser: false });
  await handler({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25' } });
  await handler({ jsonrpc: '2.0', method: 'notifications/initialized' });
  return (name, family, operation, payload) => handler({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name, arguments: { family, operation, payload } } });
}
test('CLI and MCP dispatch documented windows and recovery operations with their existing access rules', async t => {
  const f = fixture(t), store = runtimeStore(f.root, f.options);
  fs.writeFileSync(join(f.root, 'chat.json'), JSON.stringify({ cwd: f.root, messages: [{ role: 'user', text: 'x'.repeat(4100) + 'suffix' }] }));
  sessions(f.root, 'import', { id: 'chat', revision: 0, host: 'generic', path: 'chat.json' }, f.options);
  const payload = { id: 'chat', characterOffset: 4100 };
  const cli = spawnSync(process.execPath, [resolve('plugins/just-vibe/scripts/toolkit.mjs'), 'sessions', 'window', '--root', f.root, '--stdin'], { encoding: 'utf8', input: JSON.stringify(payload), env: { ...process.env, JUST_VIBE_HOME: f.home } });
  assert.equal(cli.status, 0, cli.stderr);
  assert.equal(JSON.parse(cli.stdout).messages[0].text, 'suffix');
  const read = await connection(f, false);
  assert.equal((await read('workbench_read', 'sessions', 'window', payload)).result.isError, false);
  assert.ok((await read('workbench_manage', 'mcp-health', 'recover', {})).error);
  assert.equal((await read('workbench_read', 'operator', 'retire-dispatch', {})).result.isError, true);
  const manage = await connection(f, true);
  fs.writeFileSync(join(f.root, '.mcp.json'), JSON.stringify({ mcpServers: { fixture: { type: 'http', url: 'https://example.invalid/mcp' } } }));
  const server = configurationInventory(f.root, {}, f.options).servers.find(s => s.name === 'fixture');
  let state = store.put('mcp-health', { servers: [{ ...server, status: 'reconnecting', attempt: { pid: deadPid() } }] }, 0);
  const recovered = await manage('workbench_manage', 'mcp-health', 'recover', { key: server.key, configHash: server.configHash, revision: state.revision, reason: 'Fixture process exited' });
  assert.equal(recovered.result.isError, false, JSON.stringify(recovered));
  assert.equal(store.get('mcp-health').servers[0].status, 'reconnect-inconclusive');
  state = store.put('operator', { claims: [], inbox: [], merges: [], dispatch: [{ id: 'old', requestId: 'request', job: 'fixture', status: 'finished', at: new Date().toISOString() }] }, 0);
  const retired = await manage('workbench_manage', 'operator', 'retire-dispatch', { id: 'old', revision: state.revision });
  assert.equal(retired.result.isError, false, JSON.stringify(retired));
  assert.equal(store.get('operator').dispatch.length, 0);
});
