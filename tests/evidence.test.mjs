import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { githubChecks, vercelDiagnosis, migrationEvidence, browserEvidence } from '../plugins/just-vibe/scripts/lib/evidence.mjs';
import { runCommand } from '../plugins/just-vibe/scripts/lib/process.mjs';
function fixture(t) { const root = mkdtempSync(join(tmpdir(), 'jv-evidence-')); t.after(() => rmSync(root, { recursive: true, force: true })); return root; }
const result = (value, status = 0) => ({ stdout: JSON.stringify(value), stderr: '', status, timedOut: false, truncated: false });

test('GitHub checks retain pending/failure states and reject changed PR identity', async () => {
  for (const [bucket, code, expected] of [['pending', 8, 'pending'], ['fail', 1, 'failed'], ['pass', 0, 'completed']]) {
    const calls = [];
    const run = async args => { calls.push(args); return args[2] === 'view' ? result({ number: 42, headRefOid: 'a'.repeat(40), baseRefName: 'main', state: 'OPEN', isDraft: false }) : result([{ name: 'test', bucket }], code); };
    const report = await githubChecks({ root: '.', repo: 'owner/repo', pr: 42 }, run);
    assert.equal(report.result, expected); assert.equal(calls.length, 3);
    assert.ok(calls.every(c => !c.includes('merge') && !c.includes('comment')));
  }
  let views = 0;
  const stale = await githubChecks({ root: '.', repo: 'owner/repo', pr: 42 }, async args => args[2] === 'view' ? result({ number: 42, headRefOid: (++views === 1 ? 'a' : 'b').repeat(40), baseRefName: 'main' }) : result([{ name: 'test', bucket: 'pass' }]));
  assert.equal(stale.result, 'stale');
  await assert.rejects(githubChecks({ root: '.', repo: '--repo bad', pr: 42 }), /Specify/);
  await assert.rejects(githubChecks({ root: '.', repo: 'owner/repo', pr: 42 }, async () => ({ ...result({}), status: 1, stderr: 'authentication required' })), /authentication/);
});

test('Vercel diagnosis includes stderr metadata and incomplete log status without inventing health', async () => {
  const report = await vercelDiagnosis({ root: '.', deployment: 'dpl_test' }, async args => args.includes('--logs') ? { stdout: 'Error: missing module\n', stderr: 'token=private-value', status: null, timedOut: true, truncated: false } : { stdout: '', stderr: 'deployment dpl_test queued', status: 0 });
  assert.match(report.details, /queued/); assert.equal(report.result, 'incomplete');
  assert.ok(report.errorCandidates.some(x => x.includes('missing module')));
  assert.ok(!JSON.stringify(report).includes('private-value'));
});

test('migration inventory compares applied hashes and reports drift without executing SQL', t => {
  const root = fixture(t); mkdirSync(join(root, 'migrations'));
  writeFileSync(join(root, 'migrations/001.sql'), "-- DROP TABLE ignored;\nCREATE TABLE accounts(id INTEGER); SELECT 'DROP TABLE ignored';");
  writeFileSync(join(root, 'migrations/002.sql'), 'ALTER TABLE accounts ADD COLUMN name TEXT;');
  const local = migrationEvidence({ root, directory: 'migrations' });
  assert.equal(local.result, 'local-only'); assert.equal(local.pending, null); assert.deepEqual(local.files[0].findings, []);
  writeFileSync(join(root, 'applied.json'), JSON.stringify({ schemaVersion: 1, target: 'fixture', observedAt: new Date().toISOString(), migrations: [local.files[0]] }));
  assert.deepEqual(migrationEvidence({ root, directory: 'migrations', applied: 'applied.json' }).pending, ['002.sql']);
  writeFileSync(join(root, 'migrations/001.sql'), 'DROP TABLE accounts;');
  assert.equal(migrationEvidence({ root, directory: 'migrations', applied: 'applied.json' }).result, 'drift');
  assert.throws(() => migrationEvidence({ root, directory: '../' }), /escapes/);
});

test('browser steps close the browser after failure and omit entered values', async t => {
  const root = fixture(t); writeFileSync(join(root, 'steps.json'), JSON.stringify({ steps: [{ action: 'fill', selector: '#input', value: 'private-value' }, { action: 'text', selector: '#result', value: 'expected' }] }));
  let closed = false;
  const page = { setDefaultTimeout() {}, on() {}, goto: async () => ({ status: () => 200 }), locator: () => ({ fill: async () => {}, waitFor: async () => {}, isVisible: async () => true, innerText: async () => 'different' }) };
  const report = await browserEvidence({ root, url: 'http://localhost:5173', steps: 'steps.json' }, async () => ({ newContext: async () => ({ newPage: async () => page }), close: async () => { closed = true; } }));
  assert.equal(report.result, 'failed'); assert.equal(report.steps.length, 2); assert.equal(closed, true);
  assert.ok(!JSON.stringify(report).includes('private-value'));
});

test('process helper preserves literal arguments and terminates hung/output-heavy commands', async t => {
  const root = fixture(t), text = '$(touch nope) `echo nope` ;';
  const literal = await runCommand([process.execPath, '-e', 'process.stdout.write(process.argv[1])', text], { cwd: root });
  assert.equal(literal.stdout, text); assert.equal(literal.status, 0);
  const timeout = await runCommand([process.execPath, '-e', 'setInterval(()=>{},1000)'], { cwd: root, timeoutMs: 300 });
  assert.equal(timeout.timedOut, true);
  const large = await runCommand([process.execPath, '-e', 'process.stdout.write("a".repeat(100000))'], { cwd: root, maxBytes: 100 });
  assert.equal(large.truncated, true); assert.ok(large.stdout.length <= 100);
});
