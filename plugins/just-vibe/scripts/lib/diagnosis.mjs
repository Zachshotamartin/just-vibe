import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { within } from './storage.mjs';
import { readFileSync, mkdirSync } from 'node:fs';
import { adaptiveStore } from './adaptive-store.mjs';
import { runtimeStore, object } from './runtime-store.mjs';
export function diagnosis(root, operation, input = {}, options = {}) {
  if (operation === 'trial') {
    object(input, ['host', 'useAccount']);
    if (!['codex', 'claude'].includes(input.host) || input.useAccount !== true) throw Error('Choose codex or claude and explicitly set useAccount:true for a live model trial.');
    const output = within(root, '.just-vibe/reports/live-hosts-' + Date.now());
    mkdirSync(output, { recursive: true, mode: 0o700 });
    return promisify(execFile)(process.execPath, [fileURLToPath(new URL('../live-hosts.mjs', import.meta.url)), '--run', '--host=' + input.host], { cwd: root, env: { ...process.env, JUST_VIBE_DIAGNOSIS_OUTPUT: output }, timeout: 900000, maxBuffer: 8 * 1024 * 1024 }).catch(error => {
      // An incomplete or blocked journey returns nonzero; preserve its actual report.
      if (error.killed) throw Error('Live trial exceeded its total time budget; inspect ' + output);
    }).then(() => ({ path: output, ...JSON.parse(readFileSync(output + '/results.json', 'utf8')) }));
  }
  if (operation !== 'status') throw Error('Unknown diagnosis operation.');
  object(input, ['host', 'taskId']);
  if (input.host !== undefined && !['codex', 'claude', 'cursor', 'kiro', 'opencode'].includes(input.host)) throw Error('Unknown host.');
  const store = adaptiveStore(root, options), runtime = runtimeStore(root, options);
  const tasks = input.taskId ? [store.task(input.taskId)] : store.list(`${store.project}/tasks`).map(n => store.read(`${store.project}/tasks/${n}`)).filter(t => t?.kind === 'task' && (!input.host || t.host === input.host)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 10);
  const hosts = input.host ? [input.host] : ['codex', 'claude', 'cursor', 'kiro', 'opencode'];
  const receipts = hosts.map(host => ({ host, receipt: runtime.get(`hook-delivery-${host}`) })).filter(r => r.receipt);
  return {
    automaticEnabled: store.config().enabled,
    stages: [
      { stage: 'hook received', observed: receipts.length > 0, evidence: receipts.map(({ host, receipt }) => ({ host, at: receipt.at, event: receipt.event, taskId: receipt.taskId })) },
      { stage: 'workflow selected', observed: tasks.some(t => t.selected?.length), evidence: tasks.filter(t => t.selected?.length).map(t => ({ taskId: t.id, workflows: t.selected, at: t.updatedAt })) },
      { stage: 'workflow loaded', observed: tasks.some(t => t.loaded?.length), evidence: tasks.filter(t => t.loaded?.length).map(t => ({ taskId: t.id, loads: t.loaded })) },
      { stage: 'tools observed', observed: tasks.some(t => t.observations?.length), evidence: tasks.map(t => ({ taskId: t.id, tools: [...new Set((t.observations || []).map(o => o.tool))] })).filter(t => t.tools.length) },
    ],
    next: !receipts.length ? 'Send an ordinary task in the configured host after enabling and trusting its hooks. Configuration files alone do not demonstrate delivery.' : !tasks.some(t => t.loaded?.length) ? 'Check host tool discovery for task_select and workflow_load. A received hook does not prove that the agent followed it.' : 'Review the task evidence and exact observation times. Loaded instructions establish delivery, not adherence or quality.',
    limitation: 'Local runtime receipts can be replayed or edited; they are diagnostic observations, not host attestations. Historical records do not prove the current connection works. Run the opt-in live host journey for a fresh check.',
  };
}
