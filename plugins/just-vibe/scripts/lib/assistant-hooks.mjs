import { adaptiveStore } from './adaptive-store.mjs';
import { startRequest, activationContext, observeTool, stopTask } from './assistant-runtime.mjs';
import { loadCatalog } from './catalog.mjs';
import { gitRead } from './project.mjs';

export function assistantHook(event, options = {}) {
  if (!event || typeof event.cwd !== 'string' || typeof event.session_id !== 'string' || event.agent_id
    || !['UserPromptSubmit', 'SessionStart', 'PostToolUse', 'PostToolUseFailure', 'Stop'].includes(event.hook_event_name)) return {};
  const root = gitRead(event.cwd, ['rev-parse', '--show-toplevel']) || event.cwd;
  const store = adaptiveStore(root, options);
  if (!store.config().enabled) return {};
  const host = options.host || (process.env.PLUGIN_ROOT ? 'codex' : 'claude');
  const catalog = options.catalog || loadCatalog();
  let task;
  if (event.hook_event_name === 'UserPromptSubmit') {
    if (typeof event.prompt !== 'string' || event.prompt.length > 16000) return { systemMessage: 'just-vibe automatic routing skipped an oversized or unavailable prompt. Use the auto skill if needed.' };
    task = startRequest(store, catalog, { host, sessionId: event.session_id, turnId: event.turn_id, brief: event.prompt });
  } else {
    const session = store.read(store.sessionPath(host, event.session_id));
    if (session?.taskId) { try { task = store.task(session.taskId); } catch { return {}; } }
  }
  if (event.hook_event_name === 'SessionStart' && !['resume', 'compact'].includes(event.source)) return {};
  if (!task || task.kind !== 'task') return {};
  if (['PostToolUse', 'PostToolUseFailure', 'Stop'].includes(event.hook_event_name) && event.turn_id && task.turnId && event.turn_id !== task.turnId) return {};
  if (event.hook_event_name === 'PostToolUse' || event.hook_event_name === 'PostToolUseFailure') {
    observeTool(store, task.id, event); return {};
  }
  if (event.hook_event_name === 'Stop') return stopTask(store, catalog, task.id, { stopHookActive: event.stop_hook_active === true });
  if (event.hook_event_name === 'SessionStart' && !['active', 'suggested'].includes(task.status)) return {};
  const context = activationContext(store, catalog, task);
  return context ? { hookSpecificOutput: { hookEventName: event.hook_event_name, additionalContext: context } } : {};
}
