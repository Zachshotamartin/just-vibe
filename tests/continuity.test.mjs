import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, truncateSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { continuity } from '../plugins/just-vibe/scripts/lib/continuity.mjs';

function fixture(t) { const root = mkdtempSync(join(tmpdir(), 'jv-state-')); t.after(() => rmSync(root, { recursive: true, force: true })); return root; }
const checkpoint = { revision: 0, objective: 'Repair the checkout', constraints: ['No new dependencies'], decisions: [], completed: ['Reproduced'], remaining: ['Fix'], nextStep: 'Implement the repair' };

test('project preferences and notes update explicitly with revision conflict protection', t => {
  const root = fixture(t);
  const first = continuity(root, 'init', { preferences: { profile: 'frontend-engineer', testCommand: 'do-not-execute' } });
  assert.equal(first.revision, 1);
  assert.throws(() => continuity(root, 'init'), /revision changed/);
  const second = continuity(root, 'configure', { revision: 1, preferences: { detail: 'concise' } });
  assert.equal(second.revision, 2);
  assert.throws(() => continuity(root, 'configure', { revision: 1, preferences: {} }), /revision changed/);
  assert.throws(() => continuity(root, 'configure', { revision: 2, preferences: { permissions: 'all' } }), /Unknown/);
  continuity(root, 'remember', { revision: 0, id: 'ui', text: 'Use existing primitives.' });
  assert.throws(() => continuity(root, 'remember', { revision: 0, id: 'other', text: 'Conflicting writer.' }), /revision changed/);
  const removed = continuity(root, 'forget', { revision: 1, id: 'ui' });
  assert.equal(removed.notes.length, 0);
  assert.equal(continuity(root, 'show').preferences.revision, 2);
});

test('checkpoint resume detects content and index changes while leaving files untouched', t => {
  const root = fixture(t), file = join(root, 'source.txt');
  execFileSync('git', ['init', root], { stdio: 'ignore' }); writeFileSync(file, 'original');
  execFileSync('git', ['-C', root, 'add', 'source.txt']);
  continuity(root, 'checkpoint', checkpoint, 'checkout');
  assert.equal(continuity(root, 'resume', {}, 'checkout').stale, false);
  writeFileSync(file, 'edited');
  assert.ok(continuity(root, 'resume', {}, 'checkout').differences.includes('content'));
  continuity(root, 'checkpoint', { ...checkpoint, revision: 1 }, 'checkout');
  execFileSync('git', ['-C', root, 'add', 'source.txt']);
  const result = continuity(root, 'resume', {}, 'checkout');
  assert.ok(result.differences.includes('index')); assert.ok(!result.differences.includes('content'));
  assert.equal(readFileSync(file, 'utf8'), 'edited');
  assert.deepEqual(continuity(root, 'list').checkpoints, ['checkout']);
  assert.throws(() => continuity(root, 'checkpoint', checkpoint, '../escape'), /lowercase name/);
});

test('managed state rejects symlink escapes and copied project identities', t => {
  const root = fixture(t), other = fixture(t);
  symlinkSync(other, join(root, '.just-vibe'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => continuity(root, 'init'), /Symlink/);
  const clean = fixture(t); continuity(clean, 'init');
  mkdirSync(join(other, '.just-vibe'));
  writeFileSync(join(other, '.just-vibe/project.json'), readFileSync(join(clean, '.just-vibe/project.json')));
  assert.throws(() => continuity(other, 'show'), /another project/);
});

test('large data does not prevent a checkpoint but cannot certify a complete snapshot', t => {
  const root = fixture(t), file = join(root, 'large.bin'); writeFileSync(file, ''); truncateSync(file, 9 * 1024 * 1024);
  const saved = continuity(root, 'checkpoint', checkpoint, 'training');
  assert.equal(saved.snapshot.partial, true);
  assert.ok(continuity(root, 'resume', {}, 'training').differences.includes('incomplete-snapshot-coverage'));
});
