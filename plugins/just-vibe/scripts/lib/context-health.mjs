import { runtimeStore, object } from './runtime-store.mjs';
import { digest } from './storage.mjs';
import { gitRead } from './project.mjs';
import { resolve } from 'node:path';
import { editedFiles } from './edited-files.mjs';

const defaults = {
  enabled: true,
  remainingPercent: 25,
  repeatCalls: 5,
  changedFiles: 20,
  cooldownCalls: 10,
};
function settings(value) {
  object(value, Object.keys(defaults));
  const result = { ...defaults, ...value };
  if (typeof result.enabled !== 'boolean') throw Error('enabled must be boolean.');
  for (const [key, min, max] of [
    ['remainingPercent', 1, 90],
    ['repeatCalls', 3, 20],
    ['changedFiles', 2, 200],
    ['cooldownCalls', 1, 100],
  ])
    if (!Number.isInteger(result[key]) || result[key] < min || result[key] > max)
      throw Error(`Invalid ${key}.`);
  return result;
}
export function contextHealth(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('context-health') || { revision: 0, settings: defaults, sessions: {} };
  if (operation === 'status')
    return {
      ...state,
      note: 'Context percentages are host-reported capacity signals, not a quality or cost score. Arguments and prompts are never retained.',
    };
  if (operation === 'configure') {
    object(payload, ['revision', 'settings']);
    return store.put(
      'context-health',
      { ...state, settings: settings(payload.settings) },
      payload.revision,
    );
  }
  if (!['observe', 'reset'].includes(operation)) throw Error('Unknown context-health operation.');
  object(payload, [
    'host',
    'sessionId',
    'tool',
    'arguments',
    'file',
    'files',
    'remainingPercent',
    'observedAt',
    'reset',
  ]);
  if (payload.reset !== undefined && typeof payload.reset !== 'boolean')
    throw Error('reset must be boolean.');
  if (
    !['claude', 'codex', 'cursor', 'opencode', 'external'].includes(payload.host) ||
    typeof payload.sessionId !== 'string' ||
    !payload.sessionId ||
    payload.sessionId.length > 300
  )
    throw Error('Provide a supported host and bounded session ID.');
  if (!state.settings.enabled) return { disabled: true, warnings: [] };
  const now = options.now?.() ?? Date.now(),
    key = digest(`${payload.host}\0${payload.sessionId}`);
  const old = state.sessions[key];
  const session =
    operation === 'reset' || payload.reset || !old
      ? { calls: 0, recent: [], files: [], warnings: {}, metric: null }
      : structuredClone(old);
  if (payload.remainingPercent !== undefined) {
    const at = Date.parse(payload.observedAt);
    if (
      !Number.isFinite(payload.remainingPercent) ||
      payload.remainingPercent < 0 ||
      payload.remainingPercent > 100 ||
      !Number.isFinite(at) ||
      at > now + 5000 ||
      at < now - 120000
    )
      throw Error('Metrics must be a real 0–100 percentage observed within two minutes.');
    if (!session.metric || at >= Date.parse(session.metric.at))
      session.metric = {
        remainingPercent: payload.remainingPercent,
        at: new Date(at).toISOString(),
        source: 'host-reported',
      };
  }
  if (payload.tool !== undefined) {
    if (
      typeof payload.tool !== 'string' ||
      payload.tool.length > 200 ||
      JSON.stringify(payload.arguments ?? {}).length > 100000
    )
      throw Error('Tool observation too large.');
    session.calls++;
    session.recent.push(digest(JSON.stringify([payload.tool, payload.arguments ?? {}])));
    session.recent = session.recent.slice(-state.settings.repeatCalls);
  }
  const files = payload.files ?? (payload.file === undefined ? [] : [payload.file]);
  if (
    !Array.isArray(files) ||
    files.length > 201 ||
    files.some((file) => typeof file !== 'string' || !file || file.length > 4000)
  )
    throw Error('Invalid observed files.');
  session.files = [
    ...new Set([...session.files, ...files.map((file) => digest(resolve(root, file)))]),
  ].slice(-201);
  const candidates = [];
  if (
    session.metric &&
    now - Date.parse(session.metric.at) <= 120000 &&
    session.metric.remainingPercent <= state.settings.remainingPercent
  )
    candidates.push([
      'context',
      `Host reports ${session.metric.remainingPercent}% context remaining. Save the current objective, constraints, decisions and next step using the existing goal/handoff tools before context is compacted. Do not claim a summary was saved until it is.`,
    ]);
  if (session.recent.length >= state.settings.repeatCalls && new Set(session.recent).size === 1)
    candidates.push([
      'repeat',
      `The same tool and arguments were observed ${session.recent.length} times consecutively. Check whether this is intentional polling; otherwise change the investigation or report the blocker.`,
    ]);
  if (session.files.length >= state.settings.changedFiles)
    candidates.push([
      'scope',
      `Edits touched at least ${session.files.length} files this turn. Check them against the requested scope; broad authorized work may be appropriate.`,
    ]);
  const warnings = [];
  for (const [type, message] of payload.tool ? candidates : []) {
    const previous = session.warnings[type];
    if (
      !previous ||
      session.calls - previous.calls >= state.settings.cooldownCalls ||
      now - previous.at >= 120000
    ) {
      warnings.push({ type, message });
      session.warnings[type] = { calls: session.calls, at: now };
    }
  }
  session.updatedAt = new Date(now).toISOString();
  const sessions = Object.fromEntries(
    Object.entries({ ...state.sessions, [key]: session })
      .sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt))
      .slice(0, 32),
  );
  store.put('context-health', { ...state, sessions }, state.revision);
  return {
    warnings,
    remainingPercent:
      session.metric && now - Date.parse(session.metric.at) <= 120000
        ? session.metric.remainingPercent
        : null,
    observedFiles: session.files.length,
  };
}
export function healthHook(event, options = {}) {
  if (!event?.cwd || !event.session_id || event.agent_id || process.env.JUST_VIBE_WORKER === '1')
    return {};
  const root =
    options.projectRoot || gitRead(event.cwd, ['rev-parse', '--show-toplevel']) || event.cwd;
  const host = options.host || (process.env.PLUGIN_ROOT ? 'codex' : 'claude');
  const payload = { host, sessionId: event.session_id };
  if (
    event.hook_event_name === 'UserPromptSubmit' ||
    (event.hook_event_name === 'SessionStart' && event.source === 'compact')
  )
    return contextHealth(root, 'reset', payload, options);
  if (!['PostToolUse', 'PostToolUseFailure'].includes(event.hook_event_name)) return {};
  payload.tool = event.tool_name || 'unknown';
  payload.arguments = event.tool_input;
  if (
    event.hook_event_name === 'PostToolUse' &&
    /^(Write|Edit|MultiEdit|apply_patch)$/.test(payload.tool)
  )
    payload.files = editedFiles(event)
      .slice(0, 201)
      .map((file) => resolve(event.cwd, file));
  return contextHealth(root, 'observe', payload, options);
}
