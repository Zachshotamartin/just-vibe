import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { manageHooks, handleHook } from '../plugins/just-vibe/scripts/lib/automation.mjs';
function fixture(t) { const root = mkdtempSync(join(tmpdir(), 'jv-hooks-')); t.after(() => rmSync(root, { recursive: true, force: true })); return root; }
const config = { schemaVersion: 1, revision: 0, enabled: true, saveSummary: true, checks: [{ name: 'unit', command: ['node', '-e', 'process.exit(0)'], extensions: [], timeoutMs: 1000 }], formatters: [] };
const ok = { status: 0, stdout: '', stderr: '', timedOut: false, truncated: false };

test('hooks are inactive by default and configuration never silently grants local trust', async t => {
  const root = fixture(t), home = fixture(t); let calls = 0;
  const event = { cwd: root, hook_event_name: 'Stop' }, run = async () => { calls++; return ok; };
  assert.equal((await handleHook(event, { home, run })).skipped, 'disabled');
  manageHooks(root, 'configure', config, { home });
  assert.equal((await handleHook(event, { home, run })).skipped, 'untrusted');
  manageHooks(root, 'trust', {}, { home });
  assert.equal(manageHooks(root, 'status', {}, { home }).trusted, true);
  await handleHook(event, { home, run }); assert.equal(calls, 1);
  manageHooks(root, 'configure', { ...config, revision: 1, checks: [] }, { home });
  assert.equal((await handleHook(event, { home, run })).skipped, 'untrusted');
  assert.equal(calls, 1);
});

test('deduplication retains failed evidence and redacted summaries without reading transcripts', async t => {
  const root = fixture(t), home = fixture(t); let calls = 0;
  manageHooks(root, 'configure', config, { home }); manageHooks(root, 'trust', {}, { home });
  const event = { cwd: root, hook_event_name: 'Stop', last_assistant_message: 'Finished. token=private-value', transcript_path: '/never/read/transcript' };
  const run = async () => { calls++; return { ...ok, status: 1, stderr: 'assertion failed' }; };
  const first = await handleHook(event, { home, run }); assert.match(first.message, /failed/);
  await handleHook(event, { home, run }); assert.equal(calls, 1);
  const saved = readFileSync(join(root, '.just-vibe/automation/continuation.json'), 'utf8');
  assert.ok(!saved.includes('private-value')); assert.ok(saved.includes('REDACTED'));
  writeFileSync(join(root, 'source.js'), 'changed'); await handleHook(event, { home, run }); assert.equal(calls, 2);
  assert.equal((await handleHook({ ...event, stop_hook_active: true }, { home, run })).skipped, 'stop-loop');
});

test('formatter skips staged files and passes one literal authorized path without touching the index', async t => {
  const root = fixture(t), home = fixture(t); execFileSync('git', ['init', root], { stdio: 'ignore' });
  const file = join(root, 'source.js'); writeFileSync(file, 'staged'); execFileSync('git', ['-C', root, 'add', 'source.js']); writeFileSync(file, 'unstaged');
  const index = readFileSync(join(root, '.git/index')); const calls = [];
  manageHooks(root, 'configure', { ...config, checks: [], formatters: [{ name: 'format', command: ['format', '{file}'], timeoutMs: 1000, extensions: ['.js'] }] }, { home });
  manageHooks(root, 'trust', {}, { home });
  const run = async argv => { calls.push(argv); return ok; };
  const result = await handleHook({ cwd: root, hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: file } }, { home, run });
  assert.equal(result.results[0].result, 'skipped'); assert.equal(calls.length, 0); assert.deepEqual(readFileSync(join(root, '.git/index')), index);
  const other = join(root, 'new file.js'); writeFileSync(other, 'new');
  await handleHook({ cwd: root, hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: other } }, { home, run });
  assert.deepEqual(calls[0], ['format', realpathSync(other)]); assert.deepEqual(readFileSync(join(root, '.git/index')), index);
});

test('overlapping hooks run only once and untrust prevents later work', async t => {
  const root = fixture(t), home = fixture(t); manageHooks(root, 'configure', config, { home }); manageHooks(root, 'trust', {}, { home });
  let finish, started; const startedPromise = new Promise(r => { started = r; });
  const event = { cwd: root, hook_event_name: 'Stop' };
  const first = handleHook(event, { home, run: () => { started(); return new Promise(r => { finish = r; }); } });
  await startedPromise;
  assert.equal((await handleHook(event, { home })).skipped, 'busy'); finish(ok); await first;
  manageHooks(root, 'untrust', {}, { home }); assert.equal((await handleHook(event, { home })).skipped, 'untrusted');
});

test('a changed tree during checks invalidates success and is checked again', async t => {
  const root = fixture(t), home = fixture(t); manageHooks(root, 'configure', config, { home }); manageHooks(root, 'trust', {}, { home });
  const event = { cwd: root, hook_event_name: 'Stop' }; let calls = 0;
  const run = async () => { calls++; if (calls === 1) writeFileSync(join(root, 'source.js'), 'changed while checking'); return ok; };
  const first = await handleHook(event, { home, run }); assert.equal(first.results[0].result, 'stale');
  const second = await handleHook(event, { home, run }); assert.equal(second.results[0].result, 'passed'); assert.equal(calls, 2);
});

test('real hook entry point executes configured checks and emits an advisory failure', t => {
  const root = fixture(t), home = fixture(t);
  const real = { ...config, checks: [{ name: 'expected-failure', command: [process.execPath, '-e', 'process.stderr.write("fixture assertion failed");process.exit(1)'], timeoutMs: 3000, extensions: [] }] };
  manageHooks(root, 'configure', real, { home }); manageHooks(root, 'trust', {}, { home });
  const output = execFileSync(process.execPath, [fileURLToPath(new URL('../plugins/just-vibe/scripts/hooks.mjs', import.meta.url))], { cwd: root, env: { ...process.env, JUST_VIBE_HOME: home }, input: JSON.stringify({ cwd: root, hook_event_name: 'Stop', last_assistant_message: 'Fixture complete' }), encoding: 'utf8' });
  assert.match(JSON.parse(output).systemMessage, /expected-failure/);
  const record = JSON.parse(readFileSync(join(root, '.just-vibe/automation/stop.json')));
  assert.equal(record.results[0].exitCode, 1); assert.equal(record.results[0].result, 'failed');
});
