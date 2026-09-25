import { realpathSync, statSync, readFileSync, accessSync, constants } from 'node:fs';
import { resolve } from 'node:path';
import { CAPABILITIES, availability, searchCommands, invocation, getCommand } from './catalog.mjs';
import { findExecutable, gitRead } from './project.mjs';
import { routeContext, rankCandidates, intentSignals, executionStrategy } from './routing.mjs';

export function validateCapabilityReport(report, root, now = Date.now()) {
  if (report.schemaVersion !== 1 || !report.capabilities || typeof report.capabilities !== 'object' || Array.isArray(report.capabilities)) throw new Error('Invalid capability report.');
  if (typeof report.root !== 'string' || realpathSync(resolve(report.root)) !== realpathSync(resolve(root))) throw new Error('Capability report belongs to another project.');
  const age = now - Date.parse(report.observedAt);
  if (!Number.isFinite(age) || age < -60_000 || age > 15 * 60_000) throw new Error('Capability report is stale or has an invalid timestamp. Re-observe the current session.');
  for (const [key, value] of Object.entries(report.capabilities)) {
    if (!CAPABILITIES.includes(key) || !value || !['available', 'missing', 'disabled', 'unknown'].includes(value.status)
        || typeof value.reason !== 'string' || !value.reason.trim() || value.reason.length > 500) throw new Error(`Invalid capability evidence: ${key}`);
  }
  return report;
}

export function readCapabilityReport(path, root) {
  const stat = statSync(path);
  if (!stat.isFile() || stat.size > 64 * 1024) throw new Error('Capability report must be a regular file up to 64 KiB.');
  return validateCapabilityReport(JSON.parse(readFileSync(path, 'utf8')), root);
}

export function discoverCapabilities(root = process.cwd(), { report, git = gitRead, executable = findExecutable } = {}) {
  const project = realpathSync(resolve(root));
  if (!statSync(project).isDirectory()) throw new Error('Project root must be a directory.');
  accessSync(project, constants.R_OK | constants.X_OK);
  const capabilities = Object.fromEntries(CAPABILITIES.map(id => [id, { status: 'unknown', reason: 'Host must verify task-specific access or supplied evidence.', source: 'unobserved' }]));
  capabilities['project.read'] = { status: 'available', reason: 'Project directory is readable.', source: 'local-probe' };
  const gitPath = executable('git');
  capabilities['git.repo'] = gitPath && git(project, ['rev-parse', '--git-dir']) !== null
    ? { status: 'available', reason: 'Git recognizes the selected repository.', source: 'local-probe' }
    : { status: 'missing', reason: gitPath ? 'Selected directory is not a Git repository.' : 'Git is not on PATH.', source: 'local-probe' };
  if (report) {
    validateCapabilityReport(report, project);
    for (const [id, value] of Object.entries(report.capabilities)) {
      // A supplied host report may attest connector/evidence access, not override local facts.
      if (['project.read', 'git.repo'].includes(id)) continue;
      capabilities[id] = { ...value, source: 'host-report' };
    }
  }
  const integrations = ['git', 'gh', 'vercel', 'node', 'python3', 'docker', 'codex', 'claude'].map(name => ({
    name, executable: Boolean(executable(name)), authenticated: 'unknown',
  }));
  return { schemaVersion: 1, root: project, observedAt: new Date().toISOString(), capabilities, integrations,
    note: 'Executable presence is not authentication. Host reports are session evidence, not permission grants. No external services were contacted.' };
}

// The router never suggests these entry points; they are selected explicitly.
export const UNROUTED = ['auto', 'do', 'help', 'tools', 'setup'];

export function toolEntry(catalog, discovery, command, host) {
  return { id: command.id, pack: command.pack, summary: command.summary, aliasOf: command.aliasOf,
    defaultMode: command.defaultMode, invocation: invocation(command, host), example: command.examples[0],
    implementationStatus: command.implementationStatus, executionModel: command.executionModel,
    validation: command.validation, ...availability(catalog, command, discovery.capabilities, host) };
}

export function listTools(catalog, discovery, { query = '', pack, available = false, all = false, host = 'claude', limit = 1000 } = {}) {
  return searchCommands(catalog, query, { pack, limit: 1000 }).map(({ command, score }) => ({
    ...toolEntry(catalog, discovery, command, host), score,
  })).filter(c => (all || !['planned', 'uninstalled', 'unsupported'].includes(c.status)) && (!available || c.status === 'available')).slice(0, limit);
}

export function recommend(catalog, discovery, brief, { host = 'claude', limit = 3, context = routeContext(discovery.root) } = {}) {
  if (typeof brief !== 'string' || !brief.trim()) throw new Error('A routing goal is required.');
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw Error('limit must be between 1 and 1000.');
  const signals = intentSignals(brief);
  // An explicit prefix selects exactly one workflow, including auto/tools/help.
  // Unknown names fail instead of falling through to incidental task keywords.
  if (signals.explicit) {
    const command = getCommand(catalog, signals.explicit.id, { canonical: true });
    const candidate = { ...listTools(catalog, discovery, { query: command.id, host, all: true })[0],
      matchedNames: [signals.explicit.id], selectionReasons: ['Workflow selected explicitly'] };
    return { brief, commandBrief: signals.explicit.brief, invokedAs: signals.explicit.invocation,
      executableHere: false, context, strategy: executionStrategy(brief, [candidate]), recommendations: [candidate],
      confidence: 'explicit', instruction: 'Load the selected installed workflow; preserve its mode, constraints and host permissions. An invocation is not an authorization bypass.',
      available: candidate.status === 'available' ? [candidate] : [], unavailable: candidate.status === 'available' ? [] : [candidate] };
  }
  const query = signals.positive.trim();
  const matches = (/[a-z0-9]/i.test(query) ? listTools(catalog, discovery, { query, host, all: true, limit: catalog.commands.length }) : [])
    .filter(c => !UNROUTED.includes(c.id));
  // A rule names workflows the words may not; it adds them with no lexical credit, so the
  // rule boost and the request text decide the order rather than a synthetic exact-id score.
  for (const rule of signals.matches) for (const id of rule.ids) {
    const command = catalog.commands.find(c => c.id === id);
    if (command && !matches.some(c => c.id === id)) matches.push({ ...toolEntry(catalog, discovery, command, host), score: 0 });
  }
  // Collapse aliases into their canonical workflow: canonical contract fields, best score.
  const unique = new Map();
  for (const match of matches) {
    const id = match.aliasOf || match.id;
    const canonical = getCommand(catalog, id);
    const existing = unique.get(id);
    if (existing) { existing.matchedNames.push(match.id); existing.score = Math.max(existing.score, match.score); continue; }
    unique.set(id, { ...toolEntry(catalog, discovery, canonical, host), score: match.score, matchedNames: [match.id] });
  }
  const candidates = rankCandidates([...unique.values()], brief, context);
  return { brief, executableHere: false,
    context, strategy: executionStrategy(brief, candidates), recommendations: candidates.slice(0, limit),
    confidence: candidates.length === 0 ? 'no-match' : candidates.length > 1 && candidates[0].score - candidates[1].score < 12 ? 'ambiguous' : 'candidate',
    instruction: 'Candidates only. The active host agent must resolve intent, context, scope, and authority before selecting and executing a route. Do not execute keyword matches blindly.',
    available: candidates.filter(c => c.status === 'available').slice(0, limit),
    unavailable: candidates.filter(c => c.status !== 'available').slice(0, limit) };
}
