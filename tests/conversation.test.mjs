import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { prepare, beginTurn, capture } from '../evals/conversation/harness.mjs';
import { evaluate, files } from '../evals/conversation/oracle.mjs';

const source = fileURLToPath(new URL('../evals/conversation/', import.meta.url));
function scratch(t) { const path = mkdtempSync(join(tmpdir(), 'jv-conversation-test-')); t.after(() => rmSync(path, { recursive: true, force: true })); return path; }

test('review fixture distinguishes every seeded defect from working and disabled controls', async t => {
  const workspace = join(scratch(t), 'workspace'); cpSync(join(source, 'fixture'), workspace, { recursive: true });
  const seeded = await evaluate(workspace);
  for (const item of seeded) if (item.status !== 'skipped') assert.equal(item.status, 'failed', item.id);
  cpSync(join(source, 'controls'), join(workspace, 'src'), { recursive: true });
  const correct = await evaluate(workspace);
  for (const item of correct) if (item.status !== 'skipped') assert.equal(item.status, 'passed', JSON.stringify(item));
  for (const id of files) writeFileSync(join(workspace, 'src', `${id}.mjs`), 'export const disabled = true;\n');
  for (const item of await evaluate(workspace)) if (item.status !== 'skipped') assert.equal(item.status, 'failed', item.id);
});

test('conversation captures actual turn artifacts, selected repairs and unchanged excluded files', t => {
  const out = join(scratch(t), 'trial'), { workspace } = prepare({ out, arm: 'baseline' });
  assert.throws(() => prepare({ out }), /fresh/);
  assert.throws(() => beginTurn({ run: out, message: 'continue' }), /Capture/);
  const review = capture({ run: out, response: 'Synthetic harness control: no edits.' });
  assert.equal(review.integrity, true); assert.equal(review.behaviors.filter(r => r.status === 'passed').length, 0);
  beginTurn({ run: out, message: 'Fix only privacy.', allowedWrites: ['src/privacy.mjs'], expectFixed: ['privacy'] });
  cpSync(join(source, 'controls/privacy.mjs'), join(workspace, 'src/privacy.mjs'));
  const fix = capture({ run: out, response: 'Synthetic harness control: repaired privacy only.' });
  assert.equal(fix.expectedRepairsPass, true); assert.deepEqual(fix.modified, ['src/privacy.mjs']);
  assert.throws(() => capture({ run: out, response: 'overwrite' }), /already captured/);
  beginTurn({ run: out, message: 'Continue without further edits.', expectFixed: ['privacy'] });
  const continued = capture({ run: out, response: 'Synthetic harness control: unchanged.' });
  assert.equal(continued.expectedRepairsPass, true); assert.deepEqual(continued.modified, []);
  assert.ok(readFileSync(join(out, 'turns/2/artifacts/src/privacy.mjs'), 'utf8').includes('redactEvidence'));
  writeFileSync(join(workspace, 'README.md'), 'changed between turns');
  assert.throws(() => beginTurn({ run: out, message: 'continue' }), /between turns/);
});

test('unauthorized edits withhold oracle execution and cannot become a successful continuation', t => {
  const out = join(scratch(t), 'trial'), { workspace } = prepare({ out, arm: 'baseline' });
  writeFileSync(join(workspace, 'src/privacy.mjs'), 'throw Error("should not run");');
  const result = capture({ run: out, response: 'Synthetic unauthorized edit control.' });
  assert.equal(result.integrity, false); assert.equal(result.expectedRepairsPass, false);
  assert.deepEqual(result.behaviors, []); assert.match(result.executionError, /withheld/);
  assert.throws(() => beginTurn({ run: out, message: 'continue' }), /failed scope/);
});

test('isolated instruction payload contains linked guides and excludes evaluator answers', t => {
  const out = join(scratch(t), 'trial'); prepare({ out });
  const manifest = JSON.parse(readFileSync(join(out, 'run.json'))), paths = Object.keys(manifest.inputs);
  assert.ok(paths.includes('_instructions/just-vibe/references/examples/general.md'));
  assert.ok(paths.includes('_instructions/just-vibe/references/security/review.md'));
  assert.ok(paths.every(path => !path.includes('oracle') && !path.startsWith('controls/')));
  assert.equal(manifest.instructionHash.length, 64);
});
