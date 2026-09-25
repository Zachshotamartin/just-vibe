import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { main } from '../plugins/just-vibe/scripts/toolkit.mjs';

async function cli(args) {
  const output = [], errors = [];
  const code = await main(args, { log: x => output.push(x), error: x => errors.push(x) });
  return { code, output: output.join('\n'), error: errors.join('\n') };
}

test('every operation accepts --help and -h and names its operations and governing reference (R1-10)', async () => {
  for (const [args, expected] of [
    [['session', '--help'], /create[\s\S]*start[\s\S]*record[\s\S]*finish/],
    [['route', '-h'], /route/],
    [['assist', '--help'], /select[\s\S]*load[\s\S]*evidence/],
    [['task', '--help'], /begin, capture, preview, undo, recover, show/],
    [['project', '--help'], /checkpoint[\s\S]*resume/],
  ]) {
    const result = await cli(args);
    assert.equal(result.code, 0, `${args.join(' ')}: ${result.error}`);
    assert.match(result.output, expected, args.join(' '));
    assert.match(result.output, /references\/[a-z-]+\.md/, `${args.join(' ')} names its reference`);
  }
});

test('help with an operation name shows that operation, and other words still search the catalog (R1-10)', async () => {
  const session = await cli(['help', 'session']);
  assert.equal(session.code, 0); assert.match(session.output, /session create/);
  assert.doesNotMatch(session.output, /backend-auth/);
  const search = await cli(['help', 'flaky', 'tests']);
  assert.equal(search.code, 0); assert.match(search.output, /test-flaky/);
});

test('an unknown intent operation lists the valid operations (R1-10)', async () => {
  const result = await cli(['task', 'bogus', 'name']);
  assert.equal(result.code, 1); assert.match(result.error, /begin, capture, preview, undo, recover, show/);
});

test('Codex tool listings separate the invocation from the example (R1-10)', async t => {
  const root = mkdtempSync(join(tmpdir(), 'jv-help-')); t.after(() => rmSync(root, { recursive: true, force: true }));
  const result = await cli(['tools', 'flaky', '--target', 'codex', '--root', root]);
  assert.equal(result.code, 0, result.error); assert.match(result.output, /skill picker: \S/);
});

test('adapter hosts get their own skill names; run operations still need a native host (A3-14)', async t => {
  const root = mkdtempSync(join(tmpdir(), 'jv-help-')); t.after(() => rmSync(root, { recursive: true, force: true }));
  const tools = await cli(['tools', 'react', '--target', 'cursor', '--root', root]);
  assert.equal(tools.code, 0, tools.error); assert.match(tools.output, /just-vibe-react-/); assert.doesNotMatch(tools.output, /\/just-vibe:/);
  const route = await cli(['route', '--target', 'cursor', '--root', root, '--json', '--', 'flaky test in CI']);
  assert.equal(route.code, 0, route.error); assert.match(JSON.parse(route.output).recommendations[0].invocation, /^just-vibe-/);
  const workflow = await cli(['workflow', 'fix', '--target', 'cursor', '--root', root, '--', 'Fix it']);
  assert.equal(workflow.code, 1); assert.match(workflow.error, /codex or claude/);
});

test('missing saved records name the command that lists or creates them instead of a raw file error (A3-16)', async t => {
  const root = mkdtempSync(join(tmpdir(), 'jv-missing-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [args, expected] of [
    [['project', 'resume', 'checkout', '--root', root], /No checkpoint named checkout\. Run project list/],
    [['task', 'show', 'checkout-retry', '--root', root], /No task record named checkout-retry\. Run workbench list/],
    [['guard', 'check', 'g1', '--root', root], /No guard named g1\. Create it with guard create g1/],
  ]) {
    const result = await cli(args);
    assert.notEqual(result.code, 0, args.join(' '));
    assert.match(result.error, expected, args.join(' '));
    assert.doesNotMatch(result.error, /ENOENT|lstat/, args.join(' '));
  }
});

test('role lookup accepts the --root every toolkit call passes (A3-19)', async t => {
  const root = mkdtempSync(join(tmpdir(), 'jv-roles-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const args of [['profiles', 'ml', '--root', root, '--json'], ['profile', 'frontend-engineer', '--root', root, '--json']]) {
    const result = await cli(args);
    assert.equal(result.code, 0, `${args[0]}: ${result.error}`);
  }
});
