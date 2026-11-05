import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, realpathSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseZeroContextDiff, changedLines } from '../plugins/just-vibe/scripts/lib/changed-lines.mjs';
import { parseReport, mutationSummary, mutation } from '../plugins/just-vibe/scripts/lib/mutation.mjs';
import { collectEvidence } from '../plugins/just-vibe/scripts/lib/evidence.mjs';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';

function repository(t) {
  const directory = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-mutation-')));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = join(directory, 'project'), options = { home: join(directory, 'home') };
  mkdirSync(join(root, 'src'), { recursive: true });
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { stdio: 'ignore' });
  git('init', '-q');
  writeFileSync(join(root, 'src/math.js'), 'export function add(a, b) {\n  return a + b;\n}\n\nexport function sub(a, b) {\n  return a - b;\n}\n');
  writeFileSync(join(root, 'src/old.js'), 'export const old = 1;\n');
  git('add', '.'); git('-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-qm', 'base');
  return { root, options, directory, git };
}

test('zero-context diffs yield new-side ranges for edits, additions, renames and quoted paths', () => {
  const diff = [
    'diff --git a/src/a.js b/src/a.js', '--- a/src/a.js', '+++ b/src/a.js', '@@ -2 +2 @@', '-x', '+y', '@@ -10,0 +11,3 @@', '+a', '+b', '+c', '@@ -20,2 +22,0 @@', '-gone', '-gone',
    'diff --git a/old.js b/new.js', 'similarity index 90%', 'rename from old.js', 'rename to new.js', '--- a/old.js', '+++ b/new.js', '@@ -1 +1 @@', '-a', '+b',
    'diff --git a/del.js b/del.js', 'deleted file mode 100644', '--- a/del.js', '+++ /dev/null', '@@ -1 +0,0 @@', '-a',
    'diff --git a/img.png b/img.png', 'Binary files a/img.png and b/img.png differ',
    'diff --git "a/sp ace\\303\\251.js" "b/sp ace\\303\\251.js"', '--- "a/sp ace\\303\\251.js"', '+++ "b/sp ace\\303\\251.js"', '@@ -0,0 +1,2 @@', '+a', '+b',
    'diff --git a/only-deletions.js b/only-deletions.js', '--- a/only-deletions.js', '+++ b/only-deletions.js', '@@ -3,2 +2,0 @@', '-a', '-b',
  ].join('\n');
  assert.deepEqual(parseZeroContextDiff(diff), {
    files: { 'src/a.js': [[2, 2], [11, 13]], 'new.js': [[1, 1]], 'sp aceé.js': [[1, 2]] },
    deleted: ['del.js'], binary: ['img.png'],
  });
});

test('changed lines cover the working tree against HEAD, a base, and untracked files', t => {
  const { root, git } = repository(t);
  writeFileSync(join(root, 'src/math.js'), 'export function add(a, b) {\n  return a + b + 0;\n}\n\nexport function sub(a, b) {\n  return a - b;\n}\n');
  writeFileSync(join(root, 'src/new.js'), 'export const x = 1;\nexport const y = 2;\n');
  git('mv', 'src/old.js', 'src/renamed.js');
  const changes = changedLines(root);
  assert.deepEqual(changes.files, { 'src/math.js': [[2, 2]], 'src/new.js': [[1, 2]] });
  assert.equal(changes.against, 'HEAD');
  assert.throws(() => changedLines(root, { base: '--output=/tmp/x' }), /base must be/);
  assert.throws(() => changedLines(root, { base: 'no-such-branch' }), /could not diff/);
});

const strykerReport = { schemaVersion: '1', thresholds: { high: 80, low: 60 }, files: { 'src/math.js': { language: 'javascript', source: '', mutants: [
  { id: '1', mutatorName: 'ArithmeticOperator', replacement: 'a - b + 0', status: 'Killed', location: { start: { line: 2, column: 10 }, end: { line: 2, column: 19 } } },
  { id: '2', mutatorName: 'ArithmeticOperator', replacement: 'a + b - 0', status: 'Survived', location: { start: { line: 2, column: 10 }, end: { line: 2, column: 19 } } },
  { id: '3', mutatorName: 'ArithmeticOperator', replacement: 'a + b', status: 'Survived', location: { start: { line: 6, column: 10 }, end: { line: 6, column: 15 } } },
  { id: '4', mutatorName: 'BlockStatement', status: 'NoCoverage', location: { start: { line: 1, column: 27 }, end: { line: 3, column: 2 } } },
] } } };

test('reports from each tool are narrowed to changed lines, and survivors fail', t => {
  const { root } = repository(t);
  mkdirSync(join(root, 'reports/mutation'), { recursive: true });
  writeFileSync(join(root, 'reports/mutation/mutation.json'), JSON.stringify(strykerReport));
  const changes = { files: { 'src/math.js': [[2, 2]] } };
  const stryker = mutationSummary(parseReport('stryker', root, 'reports/mutation/mutation.json'), changes);
  assert.deepEqual([stryker.result, stryker.mutants, stryker.killed, stryker.survived, stryker.score], ['failed', 2, 1, 1, 50]);
  assert.equal(stryker.survivors[0].replacement, 'a + b - 0');
  assert.equal(mutationSummary(parseReport('stryker', root, 'reports/mutation/mutation.json'), changes, { maxSurvived: 1 }).result, 'passed');
  // A line only a no-coverage mutant touches is a survivor: no test reached it.
  assert.equal(mutationSummary(parseReport('stryker', root, 'reports/mutation/mutation.json'), { files: { 'src/math.js': [[1, 1]] } }).result, 'failed');
  assert.equal(mutationSummary(parseReport('stryker', root, 'reports/mutation/mutation.json'), { files: { 'src/other.js': [[1, 9]] } }).result, 'review-needed');

  mkdirSync(join(root, 'mutants.out'), { recursive: true });
  writeFileSync(join(root, 'mutants.out/outcomes.json'), JSON.stringify({ outcomes: [
    { scenario: 'Baseline', summary: 'Success' },
    { scenario: { Mutant: { file: 'src/lib.rs', span: { start: { line: 4, column: 5 }, end: { line: 4, column: 9 } }, replacement: '0', genre: 'FnValue' } }, summary: 'CaughtMutant' },
    { scenario: { Mutant: { file: 'src/lib.rs', line: 9, replacement: 'true', genre: 'FnValue' } }, summary: 'MissedMutant' },
    { scenario: { Mutant: { file: 'src/lib.rs', line: 9 } }, summary: 'Unviable' },
  ] }));
  const cargo = mutationSummary(parseReport('cargo-mutants', root, 'mutants.out/outcomes.json'), { files: { 'src/lib.rs': [[4, 4]] } });
  assert.deepEqual([cargo.result, cargo.killed], ['passed', 1]);
  assert.equal(mutationSummary(parseReport('cargo-mutants', root, 'mutants.out/outcomes.json'), { files: { 'src/lib.rs': [[9, 9]] } }).result, 'failed');

  mkdirSync(join(root, 'mutants/src'), { recursive: true });
  writeFileSync(join(root, 'mutants/src/calc.py.meta'), JSON.stringify({ exit_code_by_key: { 'src.calc.x_add__mutmut_1': 1, 'src.calc.x_add__mutmut_2': 0, 'src.calc.x_add__mutmut_3': null } }));
  const mutmut = mutationSummary(parseReport('mutmut', root, 'mutants'), { files: { 'src/calc.py': [[1, 1]] } }, { scope: 'file' });
  assert.deepEqual([mutmut.result, mutmut.killed, mutmut.survived, mutmut.pending, mutmut.scope], ['failed', 1, 1, 1, 'file']);

  writeFileSync(join(root, 'bad.json'), '{"files": 3}');
  assert.throws(() => parseReport('stryker', root, 'bad.json'), /Not a Stryker/);
  assert.throws(() => parseReport('stryker', root, '../outside.json'));
  assert.throws(() => parseReport('pitest', root, 'x'), /Unknown mutation tool/);
});

test('the mutation proof collector reads a report against the live diff', async t => {
  const { root } = repository(t);
  writeFileSync(join(root, 'src/math.js'), readFileSync(join(root, 'src/math.js'), 'utf8').replace('a + b;', 'a + b + 0;'));
  mkdirSync(join(root, 'reports/mutation'), { recursive: true });
  writeFileSync(join(root, 'reports/mutation/mutation.json'), JSON.stringify(strykerReport));
  const failed = await collectEvidence('mutation', { root, tool: 'stryker' });
  assert.deepEqual([failed.kind, failed.result, failed.survived], ['mutation', 'failed', 1]);
  assert.equal((await collectEvidence('mutation', { root, tool: 'stryker', maxSurvived: 1 })).result, 'passed');
  await assert.rejects(collectEvidence('mutation', { root, tool: 'stryker', report: 'missing.json' }), /No stryker report/);
});

// A stand-in mutation tool: writes a Stryker report, or sleeps until cancelled.
function fakeTool(directory) {
  const script = join(directory, 'fake-stryker.mjs');
  writeFileSync(script, `import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
writeFileSync('tool.pid', String(process.pid));
const mode = readFileSync('.tool-mode', 'utf8').trim();
if (mode === 'slow') setTimeout(() => {}, 60000);
else { mkdirSync('reports/mutation', { recursive: true }); writeFileSync('reports/mutation/mutation.json', ${JSON.stringify(JSON.stringify(strykerReport))}); console.log('1 survived'); process.exit(1); }`);
  return script;
}
async function trust(root, options, command) {
  const state = await runners(root, 'list', {}, options);
  const c = await runners(root, 'configure', { id: 'mutation-stryker', revision: state.revision, config: { command, purpose: 'mutation testing' } }, options);
  await runners(root, 'trust', { id: 'mutation-stryker', revision: c.revision, hash: c.runners.find(r => r.id === 'mutation-stryker').hash }, options);
}
async function settle(root, options, id, done) {
  for (let i = 0; i < 300; i++) {
    const job = await mutation(root, 'status', { id }, options);
    if (done(job)) return job;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw Error('mutation job did not settle');
}

test('a detached mutation job runs the trusted tool, records its outcome and can be cancelled', async t => {
  const { root, options, directory } = repository(t);
  await assert.rejects(mutation(root, 'start', { tool: 'stryker' }, options), /Configure and trust the runner mutation-stryker/);
  await trust(root, options, [process.execPath, fakeTool(directory)]);
  writeFileSync(join(root, '.tool-mode'), 'fast');
  const started = await mutation(root, 'start', { tool: 'stryker', timeoutMinutes: 2 }, options);
  assert.equal(started.status, 'starting');
  // A result is refused while the job runs; a fast job may already be done.
  try { await mutation(root, 'result', { id: started.id }, options); } catch (error) { assert.match(error.message, /still running/); }
  const finished = await settle(root, options, started.id, job => !['starting', 'running'].includes(job.status));
  assert.equal(finished.status, 'finished', JSON.stringify(finished));
  assert.equal(finished.exitCode, 1, 'surviving mutants make the tool exit non-zero without failing the job');
  assert.match(finished.reportHash, /^[0-9a-f]{64}$/);
  assert.equal((await mutation(root, 'result', { id: started.id }, options)).status, 'finished');

  writeFileSync(join(root, '.tool-mode'), 'slow');
  rmSync(join(root, 'tool.pid'));
  const slow = await mutation(root, 'start', { tool: 'stryker' }, options);
  await settle(root, options, slow.id, job => job.status === 'running' && existsSync(join(root, 'tool.pid')));
  const toolPid = Number(readFileSync(join(root, 'tool.pid'), 'utf8'));
  await mutation(root, 'cancel', { id: slow.id }, options);
  const cancelled = await settle(root, options, slow.id, job => !['starting', 'running'].includes(job.status));
  assert.equal(cancelled.status, 'cancelled');
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.throws(() => process.kill(toolPid, 0), { code: 'ESRCH' }, 'the tool process ended with its job');
  assert.equal((await mutation(root, 'list', {}, options)).jobs.length, 2);
});
