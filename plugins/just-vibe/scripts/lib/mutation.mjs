import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { changedLines, touches } from './changed-lines.mjs';
import { trustedCommand } from './trusted-runners.mjs';
import { terminateOwnedGroup } from './process.mjs';
import { integer } from './capability-io.mjs';
import { within, digest, projectRoot } from './storage.mjs';
import { runtimeStore, object, requireId, timestamp } from './runtime-store.mjs';

// Mutation testing asks whether the tests notice deliberate faults in the changed code. Each tool
// runs as a trusted runner (it executes the project's tests) in a detached job, and its report is
// read back and narrowed to the lines this change touched.
export const MUTATION_TOOLS = {
  stryker: { runner: 'mutation-stryker', report: 'reports/mutation/mutation.json', scope: 'line',
    plan: c => ['npx', 'stryker', 'run', ...Object.entries(c.files).filter(([f]) => /\.(?:[cm]?[jt]sx?|vue|svelte)$/.test(f)).flatMap(([f, ranges]) => ranges.flatMap(([s, e]) => ['--mutate', `${f}:${s}-${e}`]))] },
  'cargo-mutants': { runner: 'mutation-cargo', report: 'mutants.out/outcomes.json', scope: 'line',
    plan: () => ['cargo', 'mutants', '--in-diff', '<diff file>', '--no-shuffle'] },
  mutmut: { runner: 'mutation-mutmut', report: 'mutants', scope: 'file',
    plan: c => ['mutmut', 'run', ...Object.keys(c.files).filter(f => f.endsWith('.py'))] },
};
const JOB_SCRIPT = fileURLToPath(new URL('../mutation-job.mjs', import.meta.url));
const STRYKER = { Killed: 'killed', Timeout: 'killed', Survived: 'survived', NoCoverage: 'no-coverage', CompileError: 'invalid', RuntimeError: 'invalid', Ignored: 'ignored', Pending: 'pending' };
const CARGO = { CaughtMutant: 'killed', Timeout: 'killed', MissedMutant: 'survived', Unviable: 'invalid' };
// mutmut 3 records each mutant's test exit code: 0 means the tests passed with the mutant applied.
const MUTMUT = code => code === 0 ? 'survived' : [1, 3].includes(code) ? 'killed' : [5, 33].includes(code) ? 'no-coverage' : [24, 36, 152, 255, -24].includes(code) ? 'killed' : code === 34 ? 'ignored' : 'invalid';

const readJson = (path, limit = 64 * 1024 * 1024) => {
  if (statSync(path).size > limit) throw Error('Mutation report exceeds 64 MiB.');
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { throw Error('Mutation report is not valid JSON.'); }
};
const normal = path => path.replaceAll('\\', '/').replace(/^\.\//, '');

export function parseReport(tool, root, reportPath) {
  const path = within(root, reportPath);
  if (tool === 'stryker') {
    const report = readJson(path);
    if (!report?.files || typeof report.files !== 'object') throw Error('Not a Stryker mutation-testing report (no files).');
    return Object.entries(report.files).flatMap(([file, entry]) => (entry.mutants || []).map(m => ({ file: normal(file), line: m.location?.start?.line ?? null,
      status: STRYKER[m.status] || 'invalid', id: String(m.id), mutator: m.mutatorName || null, replacement: m.replacement ?? null })));
  }
  if (tool === 'cargo-mutants') {
    const report = readJson(path);
    if (!Array.isArray(report?.outcomes)) throw Error('Not a cargo-mutants outcomes.json report.');
    return report.outcomes.filter(o => o.scenario?.Mutant).map((o, index) => {
      const m = o.scenario.Mutant;
      return { file: normal(m.file), line: m.span?.start?.line ?? m.line ?? null, status: CARGO[o.summary] || 'invalid', id: String(index), mutator: m.genre || null, replacement: m.replacement ?? null };
    });
  }
  if (tool === 'mutmut') {
    const found = [];
    const walk = (directory, depth = 0) => {
      if (depth > 12) return;
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const full = join(directory, entry.name);
        if (entry.isDirectory()) walk(full, depth + 1);
        else if (entry.name.endsWith('.meta') && found.length < 100000) {
          const meta = readJson(full, 8 * 1024 * 1024), file = normal(relative(path, full)).replace(/\.meta$/, '');
          for (const [id, code] of Object.entries(meta.exit_code_by_key || {})) found.push({ file, line: null, status: code === null ? 'pending' : MUTMUT(code), id, mutator: null, replacement: null });
        }
      }
    };
    walk(path);
    return found;
  }
  throw Error(`Unknown mutation tool. Choose ${Object.keys(MUTATION_TOOLS).join(', ')}.`);
}

// Passing needs at least one mutant on a changed line and no more survivors than allowed; a mutant
// no test reached (no-coverage) is a survivor. File-scope tools (mutmut) count every mutant in a
// changed file, which the result says.
export function mutationSummary(mutants, changes, { maxSurvived = 0, scope = 'line' } = {}) {
  const covered = mutants.filter(m => changes.files[m.file] && (scope === 'file' || m.line === null || touches(changes.files[m.file], m.line)));
  const count = status => covered.filter(m => m.status === status).length;
  const survivors = covered.filter(m => ['survived', 'no-coverage'].includes(m.status));
  const judged = covered.filter(m => ['killed', 'survived', 'no-coverage'].includes(m.status));
  const result = !judged.length ? 'review-needed' : survivors.length <= maxSurvived ? 'passed' : 'failed';
  return { result, scope, changedFiles: Object.keys(changes.files).length, mutants: covered.length, killed: count('killed'), survived: count('survived'), noCoverage: count('no-coverage'),
    invalid: count('invalid'), ignored: count('ignored'), pending: count('pending'), maxSurvived, score: judged.length ? Math.round((1000 * count('killed')) / judged.length) / 10 : null,
    survivors: survivors.slice(0, 20).map(({ file, line, status, mutator, replacement }) => ({ file, line, status, mutator, replacement: replacement === null ? null : String(replacement).slice(0, 200) })),
    ...(judged.length ? {} : { reason: 'No judged mutant touches a changed line; the report does not cover this change.' }) };
}

function toolFor(name) {
  const tool = MUTATION_TOOLS[name];
  if (!tool) throw Error(`Unknown mutation tool. Choose ${Object.keys(MUTATION_TOOLS).join(', ')}.`);
  return tool;
}
const jobName = id => `mutation-job-${requireId(id)}`;
const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; } };
function view(job) {
  if (!job) throw Error('Unknown mutation job.');
  return ['starting', 'running'].includes(job.status) && job.pid && !alive(job.pid) ? { ...job, status: 'interrupted', note: 'The job process exited without recording a result.' } : job;
}

export function mutationReport(root, payload) {
  object(payload, ['tool', 'report', 'base', 'mergeBase', 'maxSurvived']);
  root = projectRoot(root);
  const tool = toolFor(payload.tool), report = payload.report ?? tool.report;
  if (!existsSync(within(root, report))) throw Error(`No ${payload.tool} report at ${report}. Run the tool (mutation start) first.`);
  const changes = changedLines(root, { base: payload.base, mergeBase: payload.mergeBase === true });
  const summary = mutationSummary(parseReport(payload.tool, root, report), changes, { maxSurvived: integer(payload.maxSurvived ?? 0, 'maxSurvived', 0, 10000), scope: tool.scope });
  const file = within(root, report);
  return { tool: payload.tool, report, reportHash: statSync(file).isFile() ? digest(readFileSync(file)) : null, against: changes.against, ...summary,
    method: `${payload.tool} report narrowed to ${tool.scope === 'file' ? 'changed files' : 'changed lines'}; it measures whether tests detect injected faults, not whether the code is correct.` };
}

export async function mutation(root, operation, payload = {}, options = {}) {
  root = projectRoot(root);
  const store = runtimeStore(root, options);
  if (operation === 'tools') {
    object(payload, []);
    return { tools: Object.entries(MUTATION_TOOLS).map(([id, t]) => ({ id, runner: t.runner, defaultReport: t.report, scope: t.scope, trusted: Boolean(trustedCommand(root, t.runner, options)) })) };
  }
  if (operation === 'plan') {
    object(payload, ['tool', 'base', 'mergeBase']);
    const tool = toolFor(payload.tool), changes = changedLines(root, { base: payload.base, mergeBase: payload.mergeBase === true });
    return { tool: payload.tool, runner: tool.runner, changes, suggestedCommand: tool.plan(changes),
      note: `Configure and trust the runner ${tool.runner} with the reviewed command, then mutation start. A runner identity pins its arguments, so a command scoped to these lines needs trusting again when they change; a whole-project command with this report filter does not.` };
  }
  if (operation === 'report') return mutationReport(root, payload);
  if (operation === 'list') {
    object(payload, []);
    return { jobs: store.list(store.prefix).filter(p => p.startsWith('mutation-job-')).map(p => view(store.get(p.replace('.json', '')))) };
  }
  if (operation === 'status' || operation === 'result') {
    object(payload, ['id']);
    const job = view(store.get(jobName(payload.id)));
    if (operation === 'result' && ['starting', 'running'].includes(job.status)) throw Error('The mutation job is still running; check status later.');
    return job;
  }
  if (operation === 'start') {
    object(payload, ['tool', 'timeoutMinutes', 'report']);
    const tool = toolFor(payload.tool), trusted = trustedCommand(root, tool.runner, options);
    if (!trusted) throw Error(`Configure and trust the runner ${tool.runner} first (mutation plan suggests a command). Mutation tools run the project's tests.`);
    const minutes = integer(payload.timeoutMinutes ?? 15, 'timeoutMinutes', 1, 60), id = randomUUID();
    const job = { id, tool: payload.tool, runner: tool.runner, runnerHash: trusted.hash, report: payload.report ?? tool.report, status: 'starting',
      startedAt: timestamp(), deadline: new Date(Date.now() + minutes * 60000).toISOString(), timeoutMinutes: minutes };
    store.put(jobName(id), job, 0);
    const child = (options.spawn || spawn)(process.execPath, [JOB_SCRIPT, root, id], { detached: true, stdio: 'ignore', windowsHide: true,
      env: { ...process.env, ...(options.home ? { JUST_VIBE_HOME: options.home } : {}) } });
    child.unref?.();
    return { ...job, pid: child.pid ?? null, note: 'The job runs in the background; check mutation status, then mutation report or a proof collector once it finishes.' };
  }
  if (operation === 'cancel') {
    object(payload, ['id']);
    const job = view(store.get(jobName(payload.id)));
    if (!['starting', 'running'].includes(job.status)) return job;
    const saved = store.put(jobName(job.id), { ...job, cancelRequested: true }, job.revision);
    // The job turns SIGTERM into an abort that ends the tool's own process group; Windows ends the tree.
    if (job.pid && process.platform !== 'win32') { try { process.kill(job.pid, 'SIGTERM'); } catch { /* already gone */ } return saved; }
    // taskkill ends the job before it can record anything, so the cancellation is recorded here.
    if (job.pid) await terminateOwnedGroup({ pid: job.pid, kill() {} });
    const latest = store.get(jobName(job.id));
    return ['starting', 'running'].includes(latest.status) && (job.pid || latest.status === 'starting')
      ? store.put(jobName(job.id), { ...latest, status: 'cancelled', finishedAt: timestamp() }, latest.revision) : latest;
  }
  throw Error('Unknown mutation operation.');
}
