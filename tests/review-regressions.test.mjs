import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, symlinkSync, unlinkSync, chmodSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { labs } from '../plugins/just-vibe/scripts/lib/workspaces.mjs';
import { practices } from '../plugins/just-vibe/scripts/lib/practice.mjs';
import { proofs } from '../plugins/just-vibe/scripts/lib/proof.mjs';
import { memory } from '../plugins/just-vibe/scripts/lib/memory.mjs';
import { tasks } from '../plugins/just-vibe/scripts/lib/tasks.mjs';
import { fileState, writeState, fromText, checkCommand } from '../plugins/just-vibe/scripts/lib/workbench.mjs';
import { fingerprint, compareSnapshot } from '../plugins/just-vibe/scripts/lib/storage.mjs';
import { manageHooks, handleHook } from '../plugins/just-vibe/scripts/lib/automation.mjs';
import { githubChecks, browserEvidence } from '../plugins/just-vibe/scripts/lib/evidence.mjs';
import { redact, redactValue } from '../plugins/just-vibe/scripts/lib/process.mjs';

const git = (root, args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
function fixture(t, repository = false) {
  const root = mkdtempSync(join(tmpdir(), 'jv-regression-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  if (repository) {
    git(root, ['init']); git(root, ['config', 'user.name', 'Fixture']); git(root, ['config', 'user.email', 'fixture@example.invalid']);
    writeFileSync(join(root, '.gitignore'), '.just-vibe/\n');
    writeFileSync(join(root, 'value.mjs'), 'export const value=2;\n');
    writeFileSync(join(root, 'check.mjs'), 'import {value} from "./value.mjs"; import assert from "node:assert/strict"; assert.equal(value,2);\n');
    git(root, ['add', '.']); git(root, ['-c', 'core.hooksPath=/dev/null', 'commit', '-m', 'Fixture']);
  }
  return root;
}
const checks = [{ id: 'behavior', command: [process.execPath, 'check.mjs'] }];
const createLab = { revision: 0, title: 'Alternatives', variants: [{ id: 'a', brief: 'A' }, { id: 'b', brief: 'B' }], checks };
const expected = state => Object.fromEntries(state.variants.filter(v => v.exists).map(v => [v.id, v.snapshot]));
const instruction = { rule: 'Use clear names.', source: { kind: 'user-instruction', excerpt: 'Use clear names.' }, scope: '.', file: 'AGENTS.md', expectedFileHash: null };

for (const kind of ['lab', 'practice']) test(`${kind} cleanup preserves index-only edits and requires complete reviewed snapshots`, async t => {
  const root = fixture(t, true), invoke = kind === 'lab' ? labs : practices;
  const config = kind === 'lab' ? createLab : { revision: 0, lesson: { title: 'Values', objective: 'Return two', explanation: 'Fix the export.', sourceFiles: ['value.mjs'] }, edits: [{ path: 'value.mjs', content: 'export const value=0;\n' }], checks, checkFiles: ['check.mjs'], hints: ['Inspect the value.'] };
  const r = await invoke(root, 'create', 'cleanup', config);
  const reviewed = await invoke(root, 'show', 'cleanup');
  const workspace = join(root, r.variants[1].path), file = join(workspace, 'value.mjs'), original = readFileSync(file);
  await assert.rejects(invoke(root, 'cleanup', 'cleanup', { revision: r.revision, expected: Object.fromEntries(reviewed.variants.map(v => [v.id, v.snapshot.content])) }), /full snapshot/);
  writeFileSync(file, 'export const value=99;\n'); git(workspace, ['add', 'value.mjs']); writeFileSync(file, original);
  assert.equal(fingerprint(workspace).content, reviewed.variants[1].snapshot.content);
  await assert.rejects(invoke(root, 'cleanup', 'cleanup', { revision: r.revision, expected: expected(reviewed) }), /Workspace changed/);
  const fresh = await invoke(root, 'show', 'cleanup');
  await assert.rejects(invoke(root, 'cleanup', 'cleanup', { revision: r.revision, expected: expected(fresh) }), /staged changes/);
  assert.match(git(workspace, ['show', ':value.mjs']), /99/);
  assert.ok(r.variants.every(v => existsSync(join(root, v.path))), 'preflight must preserve all workspaces');
  git(workspace, ['restore', '--staged', 'value.mjs']);
  const clean = await invoke(root, 'show', 'cleanup');
  assert.equal((await invoke(root, 'cleanup', 'cleanup', { revision: r.revision, expected: expected(clean) })).status, 'cleaned');
});

test('proof output and command arguments are redacted without losing execution status or JSON structure', async t => {
  const root = fixture(t);
  const canaries = ['synthetic-password-value', 'synthetic-api-value', 'synthetic-token-value', 'synthetic-argument-value'];
  writeFileSync(join(root, 'check.mjs'), 'import fs from "node:fs"; process.stdout.write(fs.readFileSync("output.txt")); process.stderr.write("token=synthetic-token-value\\n"); process.exit(2);');
  writeFileSync(join(root, 'output.txt'), JSON.stringify({ password: canaries[0], nested: [{ api_key: canaries[1] }], count: 3, okay: true }));
  let p = await proofs(root, 'create', 'redaction', { revision: 0, title: 'Output handling', criteria: [{ id: 'check', text: 'Preserve failure evidence', kind: 'automated', files: ['check.mjs'] }] });
  p = await proofs(root, 'run', 'redaction', { revision: p.revision, criterion: 'check', command: [process.execPath, 'check.mjs', '--password', canaries[3]] });
  assert.equal(p.result, 'failed');
  const observation = p.criteria[0].evidence.observation;
  assert.equal(observation.status, 2);
  assert.deepEqual(JSON.parse(observation.stdout), { password: '[REDACTED]', nested: [{ api_key: '[REDACTED]' }], count: 3, okay: true });
  assert.equal(observation.stderr, 'token=[REDACTED]\n');
  const report = await proofs(root, 'report', 'redaction');
  for (const file of [join(root, '.just-vibe/proofs/redaction.json'), report.path]) {
    const content = readFileSync(file, 'utf8');
    for (const canary of canaries) assert.ok(!content.includes(canary), `leaked ${canary}`);
  }
  const passed = await checkCommand(root, [process.execPath, '-e', 'process.stdout.write("token=synthetic-value\\n")']);
  assert.equal(passed.result, 'passed'); assert.equal(passed.stdout, 'token=[REDACTED]\n');
  const malformed = redact('prefix {"password":"quoted value, with spaces; and \\"quotes\\"", "ok":true}');
  assert.ok(!malformed.includes('quoted value')); assert.match(malformed, /"ok":true/);
  assert.deepEqual(redactValue({ authorization: { nested: 'sensitive' }, value: 0, nil: null, flags: [true] }), { authorization: '[REDACTED]', value: 0, nil: null, flags: [true] });
});

test('GitHub evidence redacts check text without corrupting its result envelope', async () => {
  const report = await githubChecks({ root: '.', repo: 'owner/repo', pr: 1 }, async args => ({ status: 0, stdout: JSON.stringify(args[2] === 'view' ? { number: 1, headRefOid: 'a'.repeat(40), baseRefName: 'main' } : [{ name: 'token=synthetic-value', bucket: 'pass', workflow: 'unit' }]), stderr: '', timedOut: false, truncated: false }));
  assert.equal(report.result, 'completed'); assert.equal(report.counts.pass, 1);
  assert.equal(report.checks[0].name, 'token=[REDACTED]');
});

test('memory permissions survive save, retire and legacy state replacement', { skip: process.platform === 'win32' }, async t => {
  const root = fixture(t), path = join(root, 'CLAUDE.local.md');
  writeFileSync(path, 'Private instructions\n'); chmodSync(path, 0o600);
  let r = await memory(root, 'save', 'private', { ...instruction, revision: 0, file: 'CLAUDE.local.md', expectedFileHash: fileState(root, 'CLAUDE.local.md').sha256 });
  assert.equal(statSync(path).mode & 0o777, 0o600);
  r = await memory(root, 'retire', 'private', { revision: r.revision, expectedFileHash: fileState(root, 'CLAUDE.local.md').sha256, reason: 'Retire' });
  assert.equal(statSync(path).mode & 0o777, 0o600);
  writeState(root, 'CLAUDE.local.md', fromText('Legacy replacement'));
  assert.equal(statSync(path).mode & 0o777, 0o600);
  chmodSync(path, 0o700); const saved = fileState(root, 'CLAUDE.local.md'); unlinkSync(path);
  writeState(root, 'CLAUDE.local.md', saved); assert.equal(statSync(path).mode & 0o777, 0o700);
  unlinkSync(path); writeState(root, 'CLAUDE.local.md', fromText('Legacy restoration', true));
  assert.equal(statSync(path).mode & 0o777, 0o700);
});

test('task undo restores permissions and preserves a later independent mode change', { skip: process.platform === 'win32' }, async t => {
  const root = fixture(t, true), path = join(root, 'value.mjs');
  chmodSync(path, 0o600);
  let r = await tasks(root, 'begin', 'permissions', { revision: 0, purpose: 'Edit file', paths: ['value.mjs'] });
  writeFileSync(path, 'export const value=3;\n'); chmodSync(path, 0o644);
  r = await tasks(root, 'capture', 'permissions', { revision: r.revision });
  await tasks(root, 'undo', 'permissions', { revision: r.revision });
  assert.equal(statSync(path).mode & 0o777, 0o600); assert.match(readFileSync(path, 'utf8'), /value=2/);
  r = await tasks(root, 'begin', 'later-mode', { revision: 0, purpose: 'Edit only content', paths: ['value.mjs'] });
  writeFileSync(path, 'export const value=4;\n'); r = await tasks(root, 'capture', 'later-mode', { revision: r.revision }); chmodSync(path, 0o640);
  await tasks(root, 'undo', 'later-mode', { revision: r.revision });
  assert.equal(statSync(path).mode & 0o777, 0o640); assert.match(readFileSync(path, 'utf8'), /value=2/);
  r = await tasks(root, 'begin', 'delete', { revision: 0, purpose: 'Delete file', paths: ['value.mjs'] });
  unlinkSync(path); r = await tasks(root, 'capture', 'delete', { revision: r.revision });
  await tasks(root, 'undo', 'delete', { revision: r.revision });
  assert.equal(statSync(path).mode & 0o777, 0o640);
});

test('lab selection retains restrictive permissions in the original project', { skip: process.platform === 'win32' }, async t => {
  const root = fixture(t, true), path = join(root, 'value.mjs'); chmodSync(path, 0o600);
  let r = await labs(root, 'create', 'permissions', createLab);
  writeFileSync(join(root, r.variants[0].path, 'value.mjs'), 'export const value=1+1;\n');
  r = await labs(root, 'check', 'permissions', { revision: r.revision });
  r = await labs(root, 'select', 'permissions', { revision: r.revision, variant: 'a', task: 'selected' });
  assert.equal(statSync(path).mode & 0o777, 0o600);
  await tasks(root, 'undo', 'selected', { revision: r.undoTask.revision });
  assert.equal(statSync(path).mode & 0o777, 0o600);
});

test('symlink targets require revalidation and never deduplicate Stop checks', async t => {
  const root = fixture(t), target = fixture(t), other = fixture(t), home = fixture(t), link = join(root, 'linked');
  writeFileSync(join(target, 'value.mjs'), 'before');
  symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir');
  manageHooks(root, 'configure', { schemaVersion: 1, revision: 0, enabled: true, saveSummary: false, checks: [{ name: 'test', command: ['fixture'], timeoutMs: 1000, extensions: [] }], formatters: [] }, { home });
  manageHooks(root, 'trust', {}, { home });
  let calls = 0; const run = async () => { calls++; return { status: 0, stdout: '', stderr: '', timedOut: false, truncated: false }; };
  const before = fingerprint(root); await handleHook({ hook_event_name: 'Stop', cwd: root }, { home, run });
  writeFileSync(join(target, 'value.mjs'), 'after'); const after = fingerprint(root);
  assert.equal(before.partial, true); assert.equal(compareSnapshot(before, after).stale, true);
  await handleHook({ hook_event_name: 'Stop', cwd: root }, { home, run }); assert.equal(calls, 2);
  unlinkSync(link); symlinkSync(other, link, process.platform === 'win32' ? 'junction' : 'dir');
  assert.notEqual(fingerprint(root).content, before.content);
});

test('retired memory rules move with provenance and current-file checks', async t => {
  const root = fixture(t);
  let r = await memory(root, 'save', 'rule', { ...instruction, revision: 0 });
  const destination = { ...instruction, file: 'src/AGENTS.md', scope: 'src' };
  await assert.rejects(memory(root, 'save', 'rule', { ...destination, revision: r.revision }), /Retire/);
  r = await memory(root, 'retire', 'rule', { revision: r.revision, expectedFileHash: fileState(root, 'AGENTS.md').sha256, reason: 'Narrow scope' });
  mkdirSync(join(root, 'src')); writeFileSync(join(root, 'src/AGENTS.md'), 'Keep this existing guidance.\n');
  await assert.rejects(memory(root, 'save', 'rule', { ...destination, revision: r.revision }), /Instruction file changed/);
  r = await memory(root, 'save', 'rule', { ...destination, revision: r.revision, expectedFileHash: fileState(root, 'src/AGENTS.md').sha256 });
  assert.equal(r.status, 'active'); assert.equal(r.file, 'src/AGENTS.md');
  assert.equal(r.history.at(-1).file, 'AGENTS.md'); assert.equal(r.history.at(-1).status, 'retired');
  assert.ok(!readFileSync(join(root, 'AGENTS.md'), 'utf8').includes('just-vibe:rule:rule:'));
  assert.match(readFileSync(join(root, 'src/AGENTS.md'), 'utf8'), /Keep this existing guidance/);
  r = await memory(root, 'save', 'rule', { ...destination, revision: r.revision, expectedFileHash: fileState(root, 'src/AGENTS.md').sha256 });
  assert.equal(r.unchanged, true);
  assert.equal(readFileSync(join(root, 'src/AGENTS.md'), 'utf8').split('just-vibe:rule:rule:start').length, 2);
});

test('browser assertions retry delayed text, URL, title and focus with one deadline per step', async t => {
  const root = fixture(t); let changedAt = Infinity, closed = false;
  const ready = () => performance.now() >= changedAt;
  const page = {
    setDefaultTimeout() {}, on() {}, goto: async () => ({ status: () => 200 }),
    url: () => ready() ? 'http://localhost/done' : 'http://localhost/', title: async () => ready() ? 'Done' : 'Loading',
    locator: () => ({ click: async () => { changedAt = performance.now() + 150; }, isVisible: async () => true, innerText: async () => ready() ? 'Done' : 'Loading', evaluate: async () => ready() }),
  };
  const steps = ['text', 'url', 'title', 'focused'].flatMap(action => [{ action: 'click', selector: '#load' }, { action, ...(!['url', 'title'].includes(action) ? { selector: '#status' } : {}), ...(['text', 'title'].includes(action) ? { value: 'Done' } : action === 'url' ? { value: '/done' } : {}) }]);
  writeFileSync(join(root, 'steps.json'), JSON.stringify({ steps }));
  const report = await browserEvidence({ root, url: 'http://localhost/', steps: 'steps.json' }, async () => ({ newContext: async () => ({ newPage: async () => page }), close: async () => { closed = true; } }));
  assert.equal(report.result, 'passed'); assert.equal(report.steps.length, 8); assert.equal(closed, true);
});
