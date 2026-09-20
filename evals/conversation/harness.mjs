#!/usr/bin/env node
import { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, lstatSync, readlinkSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pluginRoot } from '../../plugins/just-vibe/scripts/lib/catalog.mjs';

const here = fileURLToPath(new URL('./', import.meta.url));
const hash = data => createHash('sha256').update(data).digest('hex');
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const save = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
export const targets = ['cleanup', 'privacy', 'transcript', 'atomic', 'fingerprint', 'browser', 'rules'];
export const initialMessage = 'Please do a general code review of this utility library. Use README.md as the contract, give stable numbered findings with file/line evidence and concrete failure cases, and distinguish defects from optional improvements. Do not change product files.';

export function snapshot(root) {
  const result = {};
  function visit(dir) {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name), key = relative(root, path).replaceAll('\\', '/'), stat = lstatSync(path);
      if (stat.isSymbolicLink()) result[key] = { type: 'link', target: readlinkSync(path) };
      else if (stat.isDirectory()) visit(path);
      else result[key] = { type: 'file', hash: hash(readFileSync(path)), mode: stat.mode & 0o777 };
    }
  }
  visit(root); return result;
}
const changed = (before, after) => [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(path => JSON.stringify(before[path]) !== JSON.stringify(after[path]));
function manifest(run) { return read(join(resolve(run), 'run.json')); }
function turns(run) { return readdirSync(join(run, 'turns')).filter(name => /^\d+$/.test(name)).map(Number).sort((a, b) => a - b); }
export function prepare({ out, arm = 'just-vibe' }) {
  const root = resolve(out);
  if (!['just-vibe', 'baseline'].includes(arm)) throw Error('Unknown arm.');
  if (existsSync(root)) throw Error('Use a fresh trial directory.');
  mkdirSync(root, { recursive: true });
  const workspace = join(root, 'workspace');
  cpSync(join(here, 'fixture'), workspace, { recursive: true });
  if (arm === 'just-vibe') cpSync(pluginRoot, join(workspace, '_instructions/just-vibe'), { recursive: true });
  mkdirSync(join(root, 'turns'));
  const inputs = snapshot(workspace);
  save(join(root, 'run.json'), { schemaVersion: 1, arm, workspace, preparedAt: new Date().toISOString(), inputs,
    instructionHash: hash(JSON.stringify(Object.entries(inputs).filter(([path]) => path.startsWith('_instructions/')))),
    limits: 'Public development fixture. The harness records turns and bounded behaviors, not a quality score or a sandbox.' });
  beginTurn({ run: root, message: initialMessage });
  return { root, workspace, prompt: join(root, 'turns/1/prompt.txt') };
}
export function beginTurn({ run, message, allowedWrites = [], expectFixed = [] }) {
  const root = resolve(run), info = manifest(root), history = turns(root);
  if (typeof message !== 'string' || !message.trim()) throw Error('A real user message is required.');
  if (!Array.isArray(allowedWrites) || new Set(allowedWrites).size !== allowedWrites.length || allowedWrites.some(path => !targets.some(id => path === `src/${id}.mjs`))) throw Error('Only named fixture source files may be writable.');
  if (!Array.isArray(expectFixed) || new Set(expectFixed).size !== expectFixed.length || expectFixed.some(id => !targets.includes(id))) throw Error('Unknown or duplicate expected behavior.');
  if (history.length) {
    const previous = join(root, 'turns', String(history.at(-1)), 'result.json');
    if (!existsSync(previous)) throw Error('Capture the active turn before advancing.');
    const result = read(previous);
    if (!result.integrity) throw Error('Trial failed scope checks; retain it and prepare a fresh trial.');
    if (changed(result.after, snapshot(info.workspace)).length) throw Error('Workspace changed between turns.');
  }
  const number = history.length + 1, directory = join(root, 'turns', String(number)); mkdirSync(directory);
  save(join(directory, 'request.json'), { number, message, allowedWrites, expectFixed, before: snapshot(info.workspace) });
  const instructions = info.arm === 'just-vibe' ? 'Use the relevant skills in _instructions/just-vibe: review for inspection, fix for requested repairs. Read linked guides only when relevant.' : 'No toolkit instructions are supplied.';
  const prompt = `Work only in ${info.workspace}. ${instructions}\nDo not inspect evaluator files, other trials, source repositories, controls or future turns. Do not spawn agents or use the network. You may use synthetic local temporary checks outside the workspace; keep supplied instructions and README unchanged. No commits. Reply normally with actual checks and limitations; do not save a report in the workspace.\n\n${message}\n`;
  writeFileSync(join(directory, 'prompt.txt'), prompt, { flag: 'wx' });
  return { number, prompt: join(directory, 'prompt.txt') };
}
export function capture({ run, response, actor = 'unrecorded' }) {
  const root = resolve(run), info = manifest(root), number = turns(root).at(-1), directory = join(root, 'turns', String(number));
  if (existsSync(join(directory, 'result.json'))) throw Error('This turn is already captured.');
  if (typeof response !== 'string' || !response.trim()) throw Error('Capture the actual nonempty response.');
  const request = read(join(directory, 'request.json')), after = snapshot(info.workspace), modified = changed(request.before, after);
  const integrity = modified.every(path => request.allowedWrites.includes(path) && after[path]?.type === 'file')
    && !Object.values(after).some(entry => entry.type === 'link');
  cpSync(join(info.workspace, 'src'), join(directory, 'artifacts/src'), { recursive: true });
  writeFileSync(join(directory, 'response.md'), response, { flag: 'wx' });
  let behaviors = [], executionError = null;
  if (integrity) {
    const env = { ...process.env }; for (const key of ['NODE_OPTIONS', 'NODE_TEST_CONTEXT', 'NODE_V8_COVERAGE']) delete env[key];
    const execution = spawnSync(process.execPath, [join(here, 'oracle.mjs'), join(directory, 'artifacts')], { encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024, env });
    if (execution.status !== 0 || execution.error) executionError = execution.error?.message || execution.stderr || `Exit ${execution.status}`;
    else { try { behaviors = JSON.parse(execution.stdout); } catch { executionError = 'Oracle did not emit a result.'; } }
  } else executionError = 'Oracle execution withheld after scope/instruction integrity failure.';
  const result = { number, capturedAt: new Date().toISOString(), actor, responseHash: hash(response), oracleHash: hash(readFileSync(join(here, 'oracle.mjs'))), after, modified, integrity, behaviors, executionError,
    expectedRepairsPass: integrity && !executionError && request.expectFixed.every(id => behaviors.some(item => item.id === id && item.status === 'passed')),
    judgment: 'Review finding accuracy, clarity, questions and correction burden separately using the actual response. No automatic prose-quality score.' };
  save(join(directory, 'result.json'), result); return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [operation, configPath] = process.argv.slice(2);
    if (!configPath || !['prepare', 'begin', 'capture'].includes(operation)) throw Error('Use prepare|begin|capture CONFIG.json. Capture requires actual response text; begin supplies the next user message and evaluator scope.');
    const options = read(resolve(configPath));
    const result = operation === 'prepare' ? prepare(options) : operation === 'begin' ? beginTurn(options) : capture(options);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
