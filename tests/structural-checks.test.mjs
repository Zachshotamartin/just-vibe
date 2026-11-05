import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, realpathSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { structural, structuralRules } from '../plugins/just-vibe/scripts/lib/structural-checks.mjs';
import { RULE_PACKS } from '../plugins/just-vibe/scripts/lib/rule-packs.mjs';

const samples = fileURLToPath(new URL('./fixtures/structural/', import.meta.url));
function project(t) {
  const directory = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-structural-')));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = join(directory, 'project'), options = { home: join(directory, 'home') };
  mkdirSync(root);
  for (const name of readdirSync(samples)) writeFileSync(join(root, name), readFileSync(join(samples, name)));
  return { root, options, directory };
}
// A stand-in ast-grep: identifies itself and streams a recorded match for each scanned .go file.
function fakeScanner(directory, { identify = 'ast-grep 0.51.1' } = {}) {
  const script = join(directory, 'fake-ast-grep.mjs');
  writeFileSync(script, `const args = process.argv.slice(2);
if (args[0] === '--version') { console.log(${JSON.stringify(identify)}); process.exit(0); }
const files = args.slice(args.indexOf('--json=stream') + 1).filter(f => f.endsWith('.go'));
for (const file of files) console.log(JSON.stringify({ file, ruleId: 'go-error-string-compare', severity: 'warning', text: 'err.Error() == "EOF"', range: { start: { line: 5, column: 4 }, end: { line: 5, column: 24 } } }));
console.log(JSON.stringify({ file: files[0] || 'x', ruleId: 'not-ours', range: { start: { line: 0, column: 0 } } }));`);
  return script;
}
async function trust(root, options, command) {
  const state = await runners(root, 'list', {}, options);
  const configured = await runners(root, 'configure', { id: 'ast-grep', revision: state.revision, config: { command, purpose: 'structural rules' } }, options);
  const runner = configured.runners.find(r => r.id === 'ast-grep');
  await runners(root, 'trust', { id: 'ast-grep', revision: configured.revision, hash: runner.hash }, options);
}

test('every structural rule names a real prose rule and parses without a YAML library', () => {
  const rules = structuralRules();
  assert.ok(rules.length >= 7);
  for (const rule of rules) {
    assert.ok(RULE_PACKS.some(p => p.id === rule.pack), rule.id);
    assert.equal(typeof rule.prose, 'string', `${rule.id} links to its prose rule`);
    assert.match(rule.id, /^[a-z]+(?:-[a-z]+)+$/);
    assert.ok(['warning', 'error', 'info', 'hint'].includes(rule.severity), rule.id);
  }
  assert.equal(new Set(rules.map(r => r.id)).size, rules.length);
});

test('a scan needs a trusted scanner that identifies itself as ast-grep', async t => {
  const { root, options, directory } = project(t);
  const untrusted = await structural(root, 'scan', { packs: ['go'] }, options);
  assert.equal(untrusted.status, 'unavailable');
  assert.match(untrusted.reason, /runners configure \{"id":"ast-grep"/);
  await trust(root, options, [process.execPath, fakeScanner(directory, { identify: 'sg from shadow-utils' })]);
  const impostor = await structural(root, 'scan', { packs: ['go'] }, options);
  assert.equal(impostor.status, 'unavailable');
  assert.match(impostor.reason, /did not identify itself/);
});

test('scan findings map to their rule, prose and project-relative location', async t => {
  const { root, options, directory } = project(t);
  await trust(root, options, [process.execPath, fakeScanner(directory)]);
  const result = await structural(root, 'scan', { paths: ['bad.go', 'bad.py'], packs: ['go', 'python'] }, options);
  assert.equal(result.status, 'ok', result.reason);
  assert.deepEqual(result.findings.map(f => [f.path, f.line, f.column, f.ruleId]), [['bad.go', 6, 5, 'go-error-string-compare']]);
  assert.match(result.findings[0].prose, /errors\.Is/);
  assert.ok(result.rules.includes('py-mutable-default') && !result.rules.includes('ts-json-parse-assertion'));
  await assert.rejects(structural(root, 'scan', { paths: ['../outside.go'] }, options));
  writeFileSync(join(root, '.env'), 'X=1');
  await assert.rejects(structural(root, 'scan', { paths: ['.env'] }, options), /Private files/);
  await assert.rejects(structural(root, 'scan', { packs: ['sql'] }, options), /No structural rules/);
});

// Runs only when a real ast-grep is on PATH or named by JUST_VIBE_AST_GREP (npm run test:structural).
const real = process.env.JUST_VIBE_AST_GREP;
test('real ast-grep finds every positive sample and none of the safe variants', { skip: !real && 'set JUST_VIBE_AST_GREP to an ast-grep binary' }, async t => {
  const { root, options } = project(t);
  if (process.platform !== 'win32') chmodSync(real, 0o755);
  await trust(root, options, [real]);
  const result = await structural(root, 'scan', {}, options);
  assert.equal(result.status, 'ok', result.reason);
  assert.deepEqual(result.findings.map(f => `${f.path}:${f.line}:${f.ruleId}`).sort(), [
    'bad.cs:2:cs-sync-over-async', 'bad.go:6:go-error-string-compare', 'bad.kt:2:kt-global-scope',
    'bad.py:1:py-mutable-default', 'bad.py:12:py-bare-except', 'bad.py:4:py-mutable-default',
    'bad.ts:2:ts-json-parse-assertion', 'bad.ts:3:ts-json-parse-assertion', 'bad.tsx:1:tsx-json-parse-assertion',
  ].sort());
});
