import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { adapters } from '../plugins/just-vibe/scripts/lib/editor-adapters.mjs';
import { behaviorRules } from '../plugins/just-vibe/scripts/lib/behavior-rules.mjs';

// Only instrument consumption boundaries: the installed entrypoint processes
// the real pipe bytes. The second chunk is sent after its loop requests another
// chunk, avoiding timing assumptions or operating-system write coalescing.
const wrapper = `
import { pathToFileURL } from 'node:url';
const original = process.stdin[Symbol.asyncIterator].bind(process.stdin);
process.stdin[Symbol.asyncIterator] = async function* () {
  process.stderr.write('JV_READY\\n');
  for await (const chunk of original()) {
    yield chunk;
    process.stderr.write('JV_CONSUMED\\n');
  }
};
await import(pathToFileURL(process.argv[1]));
`;
function invoke(entry, root, home, bytes, cut) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '--eval', wrapper, entry], {
      cwd: root, env: { ...process.env, JUST_VIBE_HOME: home }, stdio: ['pipe', 'pipe', 'pipe'],
    });
    const stdout = [], stderr = [];
    let started = false, sentRest = false;
    const timer = setTimeout(() => { child.kill(); reject(Error('Hook fixture timed out.')); }, 10000);
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => {
      stderr.push(chunk);
      const text = Buffer.concat(stderr).toString('utf8');
      if (!started && text.includes('JV_READY\n')) {
        started = true;
        if (cut === undefined) child.stdin.end(bytes);
        else child.stdin.write(bytes.subarray(0, cut));
      }
      if (cut !== undefined && !sentRest && text.includes('JV_CONSUMED\n')) {
        sentRest = true;
        child.stdin.end(bytes.subarray(cut));
      }
    });
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.stdin.on('error', (error) => { if (error.code !== 'EPIPE') reject(error); });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8').replaceAll('JV_READY\n', '').replaceAll('JV_CONSUMED\n', '') });
    });
  });
}

for (const target of ['cursor', 'kiro']) test(`${target} installed hooks preserve split UTF-8 and reject malformed or oversized byte input`, async (t) => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'jv-hook-input-')));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const root = join(base, 'project'), home = join(base, 'home');
  mkdirSync(root);
  behaviorRules(root, 'save', {
    revision: 0,
    rule: { id: 'unicode-block', event: 'command', action: 'block', enabled: true,
      conditions: [{ field: 'command', operator: 'contains', value: 'café' }], message: 'Blocked fixture command' },
  }, { home });
  adapters(root, 'install', { target, profile: 'core', hooks: true });
  const entry = join(root, `.just-vibe/adapters/${target}/plugin/scripts/${target}-hooks.mjs`);
  const event = { hook_event_name: 'preToolUse', cwd: root, session_id: 'fixture', conversation_id: 'fixture',
    tool_name: target === 'cursor' ? 'Shell' : 'shell', tool_input: { command: 'echo café' } };
  const bytes = Buffer.from(JSON.stringify(event)), at = bytes.indexOf(Buffer.from('é'));
  assert.ok(at > 0);
  const whole = await invoke(entry, root, home, bytes);
  const split = await invoke(entry, root, home, bytes, at + 1);
  assert.deepEqual(split, whole);
  if (target === 'cursor') {
    assert.equal(split.code, 0);
    assert.equal(JSON.parse(split.stdout).permission, 'deny');
  } else {
    assert.equal(split.code, 2);
    assert.match(split.stderr, /Blocked fixture command/);
  }
  const malformedUtf8 = Buffer.from(bytes);
  malformedUtf8[at + 1] = 0x28;
  const oversized = Buffer.from(JSON.stringify({ ...event, tool_input: { command: 'echo allowed' }, padding: 'é'.repeat(530000) }));
  assert.ok(oversized.length > 1024 * 1024);
  assert.ok(oversized.toString('utf8').length < 1024 * 1024);
  for (const body of [Buffer.from('{"broken":'), malformedUtf8, oversized]) {
    const result = await invoke(entry, root, home, body);
    assert.equal(result.code, target === 'cursor' ? 1 : 2);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /event failed|could not be checked/);
  }
});
