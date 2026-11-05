import { adaptiveStore } from './adaptive-store.mjs';
import { startRequest, activationContext, sessionProtocol, stopTask } from './assistant-runtime.mjs';
import { observeHook } from './task-observations.mjs';
import { hostEnvelope } from './assist-signals.mjs';
import { loadCatalog } from './catalog.mjs';
import { projectTopLevel } from './project.mjs';
import { observePatternsFromTask } from './pattern-learning.mjs';
import { runtimeStore } from './runtime-store.mjs';
import { SPECIALISTS, specialistInstructions } from './specialists.mjs';
import { assistantRuntime } from './assistant-runtime.mjs';
import { digest } from './storage.mjs';

// The session protocol is sent with the first routed prompt of a session and on every resume or
// compaction restore. A prompt resends it only when this session lacks the current text, or when
// it is the prompt that delivered it (a duplicate event must reproduce the same context).
function deliverProtocol(store, host, sessionId, task, { restore = false } = {}) {
  const path = store.sessionPath(host, sessionId), session = store.read(path), hash = digest(sessionProtocol(store));
  if (!restore && session?.protocol?.hash === hash) return session.protocol.taskId === task.id;
  store.write(path, { ...session, root: store.root, protocol: { hash, taskId: task.id, at: new Date().toISOString() } }, session?.revision || 0);
  return true;
}
function forgetProtocol(store, host, sessionId) {
  const path = store.sessionPath(host, sessionId), session = store.read(path);
  if (!session?.protocol) return;
  const { protocol, ...rest } = session;
  store.write(path, { ...rest, updatedAt: new Date().toISOString() }, session.revision);
}

export function assistantHook(event, options = {}) {
  if (event?.hook_event_name === 'SubagentStart' && typeof event.cwd === 'string' && process.env.JUST_VIBE_WORKER !== '1') {
    const id = String(event.agent_type || '').replace(/^just-vibe(?::|-)/, '');
    const agent = String(event.agent_type || '').startsWith('just-vibe') && SPECIALISTS.find(a => a.id === id);
    if (!agent) return {};
    const root = options.projectRoot || projectTopLevel(event.cwd) || event.cwd;
    if (!adaptiveStore(root, options).config().enabled) return {};
    const method = assistantRuntime(root, 'load', { workflow: agent.workflow }, options);
    return { hookSpecificOutput: { hookEventName: 'SubagentStart', additionalContext: `${specialistInstructions(agent)}\n\n${method.instructions}\nSupporting references resolve from ${method.skillPath}.` } };
  }
  if (['PostToolUse', 'PostToolUseFailure'].includes(event?.hook_event_name)) return observeHook(event, options);
  if (process.env.JUST_VIBE_WORKER === '1' || !event || typeof event.cwd !== 'string' || typeof event.session_id !== 'string' || event.agent_id
    || !['UserPromptSubmit', 'SessionStart', 'PreCompact', 'Stop'].includes(event.hook_event_name)) return {};
  // A notification or local-command echo continues the current task rather than starting one.
  if (event.hook_event_name === 'UserPromptSubmit' && hostEnvelope(event.prompt)) return {};
  const root = options.projectRoot || projectTopLevel(event.cwd) || event.cwd;
  const store = adaptiveStore(root, options);
  if (!store.config().enabled) return {};
  const host = options.host || (process.env.PLUGIN_ROOT ? 'codex' : 'claude');
  // Compaction may summarize the protocol away; the next routed prompt or resume restores it.
  if (event.hook_event_name === 'PreCompact') { forgetProtocol(store, host, event.session_id); return {}; }
  // Parsing and validating the 1 MB catalog costs ~20 ms; tool observations never need it.
  let loaded;
  const catalog = () => (loaded ??= options.catalog || loadCatalog());
  let task;
  if (event.hook_event_name === 'UserPromptSubmit') {
    if (typeof event.prompt !== 'string' || !event.prompt.trim() || event.prompt.includes('\0') || event.prompt.length > 16000) {
      // This is a new, untracked turn. Its later tools and Stop event must not
      // be attributed to the previous task, including hosts without turn IDs.
      const path = store.sessionPath(host, event.session_id), session = store.read(path);
      if (session?.taskId) store.write(path, { ...session, root: store.root, taskId: null, updatedAt: new Date().toISOString() }, session.revision);
      return { systemMessage: 'just-vibe automatic routing skipped an oversized or unavailable prompt. Use the auto skill if needed.' };
    }
    task = startRequest(store, catalog(), { host, sessionId: event.session_id, turnId: event.turn_id, brief: event.prompt });
    const runtime = runtimeStore(root, options), key = `hook-delivery-${host}`;
    const receipt = { host, at: new Date().toISOString(), event: event.hook_event_name, taskId: task.id || null, sessionHash: task.sessionHash };
    runtime.put(key, receipt, runtime.get(key)?.revision || 0);
    if (task.kind === 'task') task = store.saveTask({ ...task, hookReceipt: receipt });
  } else {
    const session = store.read(store.sessionPath(host, event.session_id));
    if (session?.taskId) { try { task = store.task(session.taskId); } catch { return {}; } }
  }
  if (event.hook_event_name === 'SessionStart' && !['resume', 'compact'].includes(event.source)) return {};
  let goalContext = '';
  if (event.hook_event_name === 'SessionStart') {
    const saved = runtimeStore(root, { home: store.home }).get('goals');
    const goals = (saved?.goals || []).filter(g => ['active', 'blocked'].includes(g.status)).slice(-3);
    if (goals.length) goalContext = `Saved just-vibe goals (context only; the current user request controls what to resume): ${JSON.stringify(goals.map(g => ({ id: g.id, objective: g.objective.slice(0, 400), status: g.status, next: g.next.slice(0, 3) })))}. Use goals_read resume or goal resume to check evidence freshness before continuing.`;
  }
  if (!task || task.kind !== 'task') return goalContext ? { hookSpecificOutput: { hookEventName: event.hook_event_name, additionalContext: goalContext } } : {};
  if (event.hook_event_name === 'Stop' && event.turn_id && task.turnId && event.turn_id !== task.turnId) return {};
  if (event.hook_event_name === 'Stop') {
    const result = stopTask(store, catalog(), task.id, { stopHookActive: event.stop_hook_active === true });
    try {
      const suggestions = observePatternsFromTask(runtimeStore(root, { home: store.home }), store.task(task.id), options);
      if (suggestions.length) result.systemMessage = [result.systemMessage, `just-vibe recorded ${suggestions.length} new pattern suggestion(s). They are pending review and have not changed any workflow; inspect learning_status or learn status when useful.`].filter(Boolean).join('\n');
    }
    catch { result.systemMessage = [result.systemMessage, 'just-vibe pattern observation could not be recorded; no lesson was created.'].filter(Boolean).join('\n'); }
    return result;
  }
  if (event.hook_event_name === 'SessionStart' && !['active', 'suggested'].includes(task.status)) {
    forgetProtocol(store, host, event.session_id);
    return goalContext ? { hookSpecificOutput: { hookEventName: event.hook_event_name, additionalContext: goalContext } } : {};
  }
  const body = activationContext(store, catalog(), task);
  const protocol = Boolean(body) && deliverProtocol(store, host, event.session_id, task, { restore: event.hook_event_name === 'SessionStart' });
  const context = [protocol ? sessionProtocol(store) : '', body, goalContext].filter(Boolean).join('\n');
  return context ? { hookSpecificOutput: { hookEventName: event.hook_event_name, additionalContext: context } } : {};
}
