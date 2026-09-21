import { platformRuntime } from './platform-runtime.mjs';
export const WORKBENCH_ACCESS = {
  read: {
    telemetry: ['status', 'otlp', 'events'],
    connectors: ['list', 'show', 'preview'],
    updater: ['list', 'show'],
    methods: ['list', 'search', 'show'],
    inventory: ['scan', 'changes', 'show'],
    portfolio: ['status', 'scan'],
    sessions: ['list', 'search', 'aliases', 'show', 'resume', 'export', 'window'],
    behavior: ['list', 'controls', 'preview'],
    'mcp-health': ['status'],
    runners: ['list', 'show'],
    ioc: ['status', 'scan'],
    atlas: ['list', 'map', 'show', 'validate'],
    graph: ['status', 'recall'],
    usage: ['rates', 'report', 'export', 'advise'],
    council: ['list', 'show'],
    jobs: ['list', 'due', 'show'],
    canary: ['list', 'show'],
    evaluation: ['list', 'show', 'export', 'compare', 'verify-receipt'],
    operator: ['status'],
    services: ['available', 'list', 'show', 'logs'],
  },
  manage: {
    inventory: ['preview', 'apply', 'recover', 'restore'],
    portfolio: ['record', 'review', 'propose', 'resolve'],
    sessions: ['alias', 'import', 'capture', 'branch', 'forget'],
    behavior: ['save', 'remove', 'toggle'],
    atlas: ['create', 'export'],
    graph: ['save', 'link', 'pin', 'forget', 'compact', 'import'],
    usage: ['observe'],
    council: ['create', 'conclude', 'recover'],
    jobs: ['cancel', 'resolve'],
    canary: ['stop'],
    'mcp-health': ['recover'],
    evaluation: ['create', 'judge', 'recover'],
    operator: [
      'claim',
      'heartbeat',
      'release',
      'message',
      'acknowledge',
      'queue-merge',
      'drop-merge',
      'request-dispatch',
      'retire-dispatch',
    ],
  },
  execute: {
    'mcp-health': ['probe', 'observe', 'reconnect'],
    runners: ['run'],
    council: ['dispatch', 'collect', 'cancel'],
    jobs: ['tick', 'run-due'],
    canary: ['sample'],
    evaluation: ['run'],
    operator: ['dispatch'],
    services: ['start', 'stop'],
  },
};
export async function workbenchCall(level, root, args, options) {
  if (!WORKBENCH_ACCESS[level]?.[args.family]?.includes(args.operation))
    throw Error(
      'Operation is unavailable at this access level. Configuration, trust, scheduling authority and installation remain local CLI actions.',
    );
  return platformRuntime(args.family, root, args.operation, args.payload || {}, options);
}
