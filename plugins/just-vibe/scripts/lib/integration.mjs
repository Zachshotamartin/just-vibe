import { runtimeStore, object } from './runtime-store.mjs';
import { RULE_PACKS } from './rule-packs.mjs';
import { configureAdaptive } from './adaptive-store.mjs';
import { patternLearning } from './pattern-learning.mjs';
import { workers } from './workers.mjs';
import { policy, POLICY_RULES } from './action-policy.mjs';

const accessDefaults = { allowWrite: false, allowUser: false, allowWorkers: false };
export function integrationAccess(root, options = {}) {
  const state = runtimeStore(root, options).get('integration');
  return { ...accessDefaults, ...(state?.mcp || {}) };
}
export async function integration(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    current = store.get('integration') || { revision: 0, rules: [], mcp: accessDefaults };
  if (operation === 'status')
    return {
      ...current,
      automatic: store.config(),
      observation: store.get('patterns')?.enabled || false,
      workers: store.get('workers')?.enabled || false,
      policy: store.get('policy')?.settings || { enabled: false },
      note: 'Saved settings do not grant host hook trust or service permissions. Restart MCP connections after changing access.',
    };
  if (operation === 'recover') {
    object(payload, []);
    if (!current.pending) return { ...current, recovered: false };
    return finish(store, current, options);
  }
  if (!['preview', 'configure'].includes(operation)) throw Error('Unknown integration operation.');
  object(payload, ['revision', 'rules', 'mcp', 'automatic', 'observation', 'workers', 'policy']);
  const rules = payload.rules ?? current.rules,
    mcp = { ...current.mcp, ...payload.mcp };
  if (!Array.isArray(rules) || rules.some((id) => !RULE_PACKS.some((r) => r.id === id)))
    throw Error('Unknown selected rule pack.');
  if (payload.mcp) object(payload.mcp, Object.keys(accessDefaults));
  if (
    Object.values(mcp).some((v) => typeof v !== 'boolean') ||
    (mcp.allowWorkers && !mcp.allowWrite)
  )
    throw Error('MCP flags must be boolean; workers also require write access.');
  for (const key of ['automatic', 'observation', 'workers', 'policy'])
    if (payload[key] !== undefined && typeof payload[key] !== 'boolean')
      throw Error(`${key} must be boolean.`);
  const plan = {
    rules: [...new Set(rules)],
    mcp,
    choices: Object.fromEntries(
      ['automatic', 'observation', 'workers', 'policy']
        .filter((k) => payload[k] !== undefined)
        .map((k) => [k, payload[k]]),
    ),
    expected: {
      automatic: store.read(`${store.project}/config.json`)?.revision || 0,
      observation: store.get('patterns')?.revision || 0,
      workers: store.get('workers')?.revision || 0,
      policy: store.get('policy')?.revision || 0,
    },
  };
  if (operation === 'preview')
    return {
      ...plan,
      revision: current.revision,
      effects: [
        'Personal project settings only',
        'Host trust remains unchanged',
        'Restart existing MCP connections to use new access',
      ],
    };
  if (current.pending)
    throw Error('Recover the interrupted configuration before changing choices.');
  const saved = store.put('integration', { ...current, pending: plan }, payload.revision);
  return finish(store, saved, options);
}
async function finish(store, current, options) {
  const { choices, rules, mcp, expected } = current.pending;
  if (!expected)
    throw Error(
      'Configuration journal lacks concurrency checkpoints; preserve it for manual reconciliation.',
    );
  const checkpoints = {
    automatic: [
      store.read(`${store.project}/config.json`)?.revision || 0,
      store.read(`${store.project}/config.json`)?.settings?.enabled,
    ],
    observation: [store.get('patterns')?.revision || 0, store.get('patterns')?.enabled || false],
    workers: [store.get('workers')?.revision || 0, store.get('workers')?.enabled || false],
    policy: [store.get('policy')?.revision || 0, store.get('policy')?.settings?.enabled || false],
  };
  for (const [key, desired] of Object.entries(choices)) {
    const [revision, actual] = checkpoints[key];
    if (revision !== expected[key] && !(revision === expected[key] + 1 && actual === desired))
      throw Error(
        `${key} changed during configuration; preserve the pending journal and reconcile before recovery.`,
      );
  }
  if (
    choices.automatic !== undefined &&
    store.read(`${store.project}/config.json`)?.settings?.enabled !== choices.automatic
  ) {
    const previous = store.read(`${store.project}/config.json`);
    configureAdaptive(store, {
      scope: 'project',
      revision: previous?.revision || 0,
      settings: { ...previous?.settings, enabled: choices.automatic },
    });
  }
  if (
    choices.observation !== undefined &&
    (store.get('patterns')?.enabled || false) !== choices.observation
  )
    patternLearning(
      store.root,
      'configure',
      { revision: store.get('patterns')?.revision || 0, enabled: choices.observation },
      options,
    );
  if (choices.workers !== undefined && (store.get('workers')?.enabled || false) !== choices.workers)
    await workers(
      store.root,
      'configure',
      { revision: store.get('workers')?.revision || 0, enabled: choices.workers },
      options,
    );
  if (
    choices.policy !== undefined &&
    (store.get('policy')?.settings?.enabled || false) !== choices.policy
  )
    policy(
      store.root,
      'configure',
      {
        revision: store.get('policy')?.revision || 0,
        settings: {
          enabled: choices.policy,
          rules: store.get('policy')?.settings?.rules || [...POLICY_RULES],
        },
      },
      options,
    );
  return store.put(
    'integration',
    { rules, mcp, configuredAt: new Date().toISOString() },
    current.revision,
  );
}
