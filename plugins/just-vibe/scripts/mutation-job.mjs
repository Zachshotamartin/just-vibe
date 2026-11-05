// Runs one mutation job started by `mutation start`, detached from the caller. It rechecks the
// trusted runner identity, records its own pid, runs the tool within the job deadline and writes
// the outcome. SIGTERM (from `mutation cancel`) aborts the tool's process group.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { runtimeStore, timestamp } from './lib/runtime-store.mjs';
import { trustedCommand } from './lib/trusted-runners.mjs';
import { runCommand, redact } from './lib/process.mjs';
import { digest, within } from './lib/storage.mjs';

const [root, id] = process.argv.slice(2);
const store = runtimeStore(root), name = `mutation-job-${id}`;
function update(change) {
  for (let attempt = 0; ; attempt++) {
    const current = store.get(name);
    try { return store.put(name, { ...current, ...change(current) }, current.revision); }
    catch (error) { if (attempt >= 4) throw error; }
  }
}

const job = store.get(name);
if (!job || job.status !== 'starting') process.exit(0);
if (job.cancelRequested) { update(() => ({ status: 'cancelled', finishedAt: timestamp() })); process.exit(0); }
const trusted = trustedCommand(root, job.runner);
if (!trusted || trusted.hash !== job.runnerHash) {
  update(() => ({ status: 'failed', finishedAt: timestamp(), reason: 'The trusted runner changed or lost trust after the job was requested.' }));
  process.exit(0);
}
const controller = new AbortController();
process.on('SIGTERM', () => controller.abort());
update(() => ({ status: 'running', pid: process.pid, runningAt: timestamp() }));
if (store.get(name).cancelRequested) controller.abort();
const remaining = Math.max(1000, Date.parse(job.deadline) - Date.now());
const result = await runCommand(trusted.command, { cwd: root, timeoutMs: remaining, timeoutLimitMs: 60 * 60 * 1000, maxBytes: 8 * 1024 * 1024, signal: controller.signal });
let reportHash = null;
try { const report = within(root, job.report); if (existsSync(report) && statSync(report).isFile()) reportHash = digest(readFileSync(report)); } catch { /* outside the project or unreadable */ }
// Mutation tools exit non-zero when mutants survive, so an exit code alone is not a failed job.
const status = result.cancelled ? 'cancelled' : result.timedOut ? 'timed-out' : result.error || result.truncated ? 'failed' : 'finished';
update(() => ({ status, finishedAt: timestamp(), exitCode: result.status, reportHash, ...(result.error ? { reason: redact(result.error) } : result.truncated ? { reason: 'Tool output exceeded 8 MiB; the run was stopped.' } : {}),
  output: redact(`${result.stdout}\n${result.stderr}`).trim().slice(-4000) }));
