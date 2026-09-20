#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, existsSync, realpathSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { loadCatalog, getCommand, pluginRoot } from '../../plugins/just-vibe/scripts/lib/catalog.mjs';

const here = fileURLToPath(new URL('./', import.meta.url));
const read = path => JSON.parse(readFileSync(path, 'utf8'));
export const suite = read(join(here, 'cases.json'));
export function snapshot(root) {
  const result = {};
  function walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name), key = relative(root, path).replaceAll('\\', '/');
    if (entry.isSymbolicLink()) { result[key] = 'symlink'; continue; }
    if (entry.isDirectory()) walk(path);
    else result[key] = createHash('sha256').update(readFileSync(path)).digest('hex');
  } }
  walk(root); return result;
}
export function prepare({ id, out, arm = 'just-vibe', eccRoot }) {
  const fixture = suite.cases.find(c => c.id === id);
  if (!fixture) throw Error(`Unknown case: ${id}`);
  if (!['just-vibe', 'baseline', 'ecc'].includes(arm)) throw Error('Unknown evaluation arm.');
  if (existsSync(out)) throw Error('Use a fresh output directory; existing runs are never overwritten.');
  const root = resolve(out), workspace = join(root, 'workspace');
  if (arm === 'ecc' && (!fixture.ecc || !eccRoot || !existsSync(join(eccRoot, fixture.ecc)))) throw Error('This case needs its matched ECC source and explicit --ecc-root.');
  mkdirSync(root, { recursive: true });
  cpSync(join(here, 'cases', id), workspace, { recursive: true, errorOnExist: true, force: false });
  const instructions = [];
  const catalog = loadCatalog();
  if (arm === 'just-vibe') {
    const target = join(workspace, '_instructions/just-vibe');
    for (const name of ['scripts', 'catalog']) cpSync(join(pluginRoot, name), join(target, name), { recursive: true });
    for (const name of ['execution.md', 'runtime.md', 'teaching.md', 'teach-test.md', 'profiles.md', 'profile-reference.md']) {
      mkdirSync(join(target, 'references'), { recursive: true });
      cpSync(join(pluginRoot, 'references', name), join(target, 'references', name));
    }
    cpSync(join(pluginRoot, 'references/profiles'), join(target, 'references/profiles'), { recursive: true });
    for (const id of fixture.commands) {
      const c = getCommand(catalog, id, { canonical: true });
      cpSync(join(pluginRoot, 'skills', c.id), join(target, 'skills', c.id), { recursive: true });
      mkdirSync(join(target, 'references/packs'), { recursive: true });
      cpSync(join(pluginRoot, 'references/packs', `${c.pack}.md`), join(target, 'references/packs', `${c.pack}.md`));
      instructions.push(`_instructions/just-vibe/skills/${c.id}/SKILL.md`);
    }
  } else if (arm === 'ecc') {
    mkdirSync(join(workspace, '_instructions'), { recursive: true });
    cpSync(join(eccRoot, fixture.ecc), join(workspace, '_instructions/ecc.md'));
    instructions.push('_instructions/ecc.md');
  }
  const task = readFileSync(join(workspace, 'task.md'), 'utf8');
  const prompt = `Work only in ${workspace}. Read ${instructions.length ? instructions.join(', ') : 'the raw project files; no toolkit instructions are supplied'}. Then complete task.md. Do not inspect the source repository, other runs, graders, or evaluator oracles. Do not spawn agents. Report actual checks and limitations. Write your final JSON to ${join(root, 'answer.json')}.\n\n${task}`;
  writeFileSync(join(root, 'prompt.txt'), prompt);
  const manifest = { schemaVersion: 1, case: id, arm, commands: fixture.commands, allowedWrites: fixture.allowedWrites, preparedAt: new Date().toISOString(), workspace,
    inputs: snapshot(workspace), instructions, instructionBytes: instructions.reduce((n, p) => n + readFileSync(join(workspace, p)).length, 0),
    note: 'Preparation is not a model run. Timings and token/cost usage must come from actual host records; they are not inferred from file timestamps.' };
  writeFileSync(join(root, 'run.json'), JSON.stringify(manifest, null, 2) + '\n');
  return { root, workspace, prompt: join(root, 'prompt.txt') };
}
function same(actual, expected, ordered) {
  if (Array.isArray(expected) && Array.isArray(actual) && !ordered) return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
  return JSON.stringify(actual) === JSON.stringify(expected);
}
export function grade({ run, answer }) {
  const root = resolve(run), manifest = read(join(root, 'run.json'));
  const workspace = realpathSync(join(root, 'workspace'));
  if (workspace !== realpathSync(manifest.workspace)) throw Error('Run workspace identity mismatch.');
  const oracle = read(join(here, 'oracles.json')).cases[manifest.case];
  if (!oracle) throw Error('Missing independent oracle.');
  const answerPath = resolve(answer || join(root, 'answer.json'));
  const report = read(answerPath);
  const current = snapshot(workspace);
  const modified = [...new Set([...Object.keys(manifest.inputs), ...Object.keys(current)])].filter(p => manifest.inputs[p] !== current[p]);
  const checks = [{ name: 'Preserve input and instruction files outside allowed writes', pass: modified.every(p => manifest.allowedWrites.includes(p)) },
    { name: 'No symlink artifacts', pass: !Object.values(current).includes('symlink') }];
  for (const [key, value] of Object.entries(oracle.expected)) checks.push({ name: key, pass: same(report[key], value, key === 'eventOrder') });
  if (oracle.code && checks.every(c => c.pass)) {
    const env = { ...process.env };
    for (const key of ['NODE_OPTIONS', 'NODE_TEST_CONTEXT', 'NODE_V8_COVERAGE']) delete env[key];
    const result = spawnSync(process.execPath, [join(here, 'code-oracles.mjs'), oracle.code, workspace], { encoding: 'utf8', timeout: 20000, maxBuffer: 2 * 1024 * 1024, env });
    checks.push({ name: 'Independent behavioral assertions', pass: result.status === 0, detail: result.error?.message || result.stdout.trim() || result.stderr.trim() });
  } else if (oracle.code) checks.push({ name: 'Independent behavioral assertions', pass: false, detail: 'Execution withheld because integrity or report checks failed.' });
  return { schemaVersion: 1, case: manifest.case, arm: manifest.arm, gradedAt: new Date().toISOString(), checks, modified,
    status: checks.every(c => c.pass) ? 'passed-fixture' : 'failed-fixture',
    limits: 'Bounded fixture assertions, not a universal quality or host-parity claim. A reported JSON field is checked against raw-artifact facts; prose rationale still needs review.',
    answerSha256: createHash('sha256').update(readFileSync(answerPath)).digest('hex') };
}
function args(argv) {
  const [operation, ...rest] = argv, options = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (!['--case', '--out', '--arm', '--ecc-root', '--run', '--answer'].includes(rest[i]) || !rest[i+1] || rest[i+1].startsWith('--')) throw Error('Invalid harness arguments.');
    const key = rest[i].slice(2); if (key in options) throw Error('Duplicate option.'); options[key] = rest[i+1];
  }
  return { operation, options };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { operation, options: o } = args(process.argv.slice(2));
    if (operation === 'list') console.log(JSON.stringify(suite, null, 2));
    else if (operation === 'prepare' && o.case && o.out) console.log(JSON.stringify(prepare({ id: o.case, out: o.out, arm: o.arm, eccRoot: o['ecc-root'] }), null, 2));
    else if (operation === 'grade' && o.run) {
      const result = grade({ run: o.run, answer: o.answer });
      writeFileSync(join(resolve(o.run), 'grade.json'), JSON.stringify(result, null, 2) + '\n');
      console.log(JSON.stringify(result, null, 2)); process.exitCode = result.status === 'passed-fixture' ? 0 : 1;
    } else throw Error('Use list, prepare --case ID --out NEW_DIRECTORY [--arm baseline|just-vibe|ecc --ecc-root PATH], or grade --run DIRECTORY [--answer FILE].');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
