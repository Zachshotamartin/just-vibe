import { telemetry } from './telemetry.mjs';
import { updater } from './updater.mjs';
import { connectors } from './connectors.mjs';
import { methodLibrary } from './method-library.mjs';
import { gitHooks } from './git-hooks.mjs';
import { dependencyIoc } from './dependency-ioc.mjs';
import { codeAtlas } from './code-atlas.mjs';
import { contextGraph } from './context-graph.mjs';
import { usageLedger } from './usage-ledger.mjs';
import { council } from './council.mjs';
import { boundedJobs } from './bounded-jobs.mjs';
import { canary } from './canary.mjs';
import { evaluation } from './evaluation-capsule.mjs';
import { operator } from './operator.mjs';
import { services } from './dev-services.mjs';
import { inventory } from './config-inventory.mjs';
import { portfolio } from './skill-portfolio.mjs';
import { sessions } from './native-sessions.mjs';
import { behaviorRules } from './behavior-rules.mjs';
import { mcpHealth } from './mcp-health.mjs';
import { runners } from './trusted-runners.mjs';
import { vault } from './vault.mjs';
import { policy } from './action-policy.mjs';
import { scanConfiguration } from './config-scan.mjs';
import { patternLearning } from './pattern-learning.mjs';
import { agents } from './specialists.mjs';
import { workers } from './workers.mjs';
import { adapters } from './editor-adapters.mjs';
import { rules } from './rule-packs.mjs';
import { activity } from './activity.mjs';
import { goals } from './goals.mjs';
import { portableContext } from './portable-context.mjs';
import { integration } from './integration.mjs';
import { orchestrate } from './orchestration.mjs';
import { planCanvas } from './plan-canvas.mjs';
import { contextHealth } from './context-health.mjs';
import { quality } from './quality.mjs';
import { securityAudit } from './security-audit.mjs';
import { epic } from './github-coordination.mjs';
export const PLATFORM_OPERATIONS = {
  telemetry: ['status', 'otlp', 'events'],
  updater: ['check', 'list', 'preview', 'show', 'apply', 'resolve', 'rollback-preview'],
  connectors: ['list', 'show', 'preview', 'install', 'update', 'uninstall', 'doctor'],
  methods: ['list', 'search', 'show'],
  'git-hooks': ['status', 'preview', 'install', 'uninstall', 'check'],
  ioc: ['status', 'import', 'scan'],
  atlas: ['list', 'map', 'create', 'show', 'validate', 'export'],
  graph: ['status', 'recall', 'save', 'link', 'pin', 'forget', 'compact', 'import'],
  usage: ['rates', 'pricing', 'observe', 'report', 'export', 'advise'],
  council: ['list', 'create', 'show', 'dispatch', 'collect', 'cancel', 'conclude', 'recover'],
  jobs: [
    'list',
    'due',
    'run-due',
    'create',
    'show',
    'enable',
    'cancel',
    'resolve',
    'tick',
    'watch',
  ],
  canary: ['list', 'configure', 'show', 'stop', 'sample', 'watch'],
  evaluation: [
    'list',
    'verify-receipt',
    'create',
    'show',
    'export',
    'compare',
    'run',
    'judge',
    'recover',
    'promote',
  ],
  operator: [
    'status',
    'claim',
    'heartbeat',
    'release',
    'message',
    'acknowledge',
    'queue-merge',
    'drop-merge',
    'request-dispatch',
    'dispatch',
  ],
  services: ['available', 'list', 'configure', 'show', 'logs', 'stop', 'start', 'recover'],
  inventory: ['scan', 'changes', 'show', 'preview', 'apply', 'recover', 'restore'],
  portfolio: ['status', 'scan', 'record', 'review', 'propose', 'resolve'],
  sessions: [
    'list',
    'search',
    'aliases',
    'alias',
    'import',
    'capture',
    'branch',
    'show',
    'resume',
    'export',
    'forget',
  ],
  behavior: ['list', 'controls', 'preset', 'preview', 'save', 'remove', 'toggle'],
  'mcp-health': ['status', 'observe', 'probe', 'reconnect'],
  runners: ['list', 'show', 'configure', 'trust', 'untrust', 'remove', 'run'],
  health: ['status', 'configure', 'observe', 'reset'],
  quality: ['preview', 'configure', 'status', 'check-commit'],
  audit: ['report', 'status', 'configure', 'trust', 'untrust', 'run'],
  epic: ['list', 'show', 'sync', 'plan', 'publish', 'recover', 'reconcile', 'discard'],
  canvas: ['list', 'create', 'show', 'wait', 'refresh', 'message', 'close', 'forget', 'open'],
  orchestrate: [
    'list',
    'create',
    'show',
    'dispatch',
    'collect',
    'accept',
    'retry',
    'cancel',
    'resume',
    'retire',
  ],
  integration: ['status', 'preview', 'configure', 'recover'],
  context: ['export', 'preview', 'import', 'transfer', 'recover', 'status'],
  vault: ['search', 'list', 'read', 'save', 'handoff', 'retire', 'forget', 'doctor'],
  policy: ['status', 'configure', 'check', 'exception'],
  scan: ['config'],
  learn: [
    'status',
    'configure',
    'record',
    'analyze',
    'git',
    'export',
    'import',
    'approve',
    'reject',
    'evolve',
    'recover',
    'prune',
    'reconsider',
    'propose',
  ],
  agents: ['list', 'show'],
  workers: [
    'list',
    'status',
    'configure',
    'start',
    'logs',
    'stop',
    'cleanup',
    'result',
    'verify',
    'apply',
  ],
  adapters: ['list', 'install', 'update', 'uninstall', 'doctor'],
  rules: ['list', 'show'],
  activity: ['show', 'health', 'report'],
  goal: [
    'list',
    'create',
    'show',
    'resume',
    'update',
    'evidence',
    'complete',
    'reopen',
    'retire',
    'forget',
  ],
};
export async function platformRuntime(family, root, operation, payload = {}, options = {}) {
  if (!PLATFORM_OPERATIONS[family]?.includes(operation))
    throw Error(`Unknown ${family} operation.`);
  if (family === 'inventory') return inventory(root, operation, payload, options);
  if (family === 'portfolio') return portfolio(root, operation, payload, options);
  if (family === 'sessions') return sessions(root, operation, payload, options);
  if (family === 'behavior') return behaviorRules(root, operation, payload, options);
  if (family === 'mcp-health') return mcpHealth(root, operation, payload, options);
  if (family === 'runners') return runners(root, operation, payload, options);
  if (family === 'git-hooks') return gitHooks(root, operation, payload, options);
  if (family === 'ioc') return dependencyIoc(root, operation, payload, options);
  if (family === 'atlas') return codeAtlas(root, operation, payload, options);
  if (family === 'graph') return contextGraph(root, operation, payload, options);
  if (family === 'usage') return usageLedger(root, operation, payload, options);
  if (family === 'council') return council(root, operation, payload, options);
  if (family === 'jobs') return boundedJobs(root, operation, payload, options);
  if (family === 'canary') return canary(root, operation, payload, options);
  if (family === 'evaluation') return evaluation(root, operation, payload, options);
  if (family === 'operator') return operator(root, operation, payload, options);
  if (family === 'services') return services(root, operation, payload, options);
  if (family === 'methods') return methodLibrary(root, operation, payload);
  if (family === 'telemetry') return telemetry(root, operation, payload, options);
  if (family === 'updater') return updater(root, operation, payload, options);
  if (family === 'connectors') return connectors(root, operation, payload, options);
  if (family === 'vault') return vault(root, operation, payload, options);
  if (family === 'health') return contextHealth(root, operation, payload, options);
  if (family === 'quality') return quality(root, operation, payload, options);
  if (family === 'audit') return securityAudit(root, operation, payload, options);
  if (family === 'epic') return epic(root, operation, payload, options);
  if (family === 'context') return portableContext(root, operation, payload, options);
  if (family === 'integration') return integration(root, operation, payload, options);
  if (family === 'orchestrate') return orchestrate(root, operation, payload, options);
  if (family === 'canvas') return planCanvas(root, operation, payload, options);
  if (family === 'policy') return policy(root, operation, payload, options);
  if (family === 'scan') return scanConfiguration(root, payload);
  if (family === 'learn') return patternLearning(root, operation, payload, options);
  if (family === 'agents') return agents(operation, payload);
  if (family === 'workers') return workers(root, operation, payload, options);
  if (family === 'adapters') return adapters(root, operation, payload);
  if (family === 'rules') return rules(operation, payload);
  if (family === 'activity') return activity(root, operation, payload, options);
  return goals(root, operation, payload, options);
}
