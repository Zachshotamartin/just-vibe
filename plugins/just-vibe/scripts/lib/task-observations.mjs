import { randomUUID } from 'node:crypto';
import { adaptiveStore, textField } from './adaptive-store.mjs';
import { projectTopLevel } from './project.mjs';
import { digest } from './storage.mjs';

const now = () => new Date().toISOString();

// Tool observations run after every tool call, so they live apart from routing: recording one
// loads only the store, never the catalog or the router.
export function observeTool(store, taskId, event) {
  const task = store.task(taskId);
  if (task.status !== 'active' && task.status !== 'suggested') return task;
  const tool = textField(event.tool_name, 'Tool name', 200);
  const id = digest(`${event.tool_use_id || randomUUID()}:${tool}`);
  if (task.observations.some(o => o.id === id)) return task;
  const result = event.tool_response;
  const failed = event.hook_event_name === 'PostToolUseFailure' || event.error || result?.isError === true || result?.is_error === true
    || (typeof result?.exit_code === 'number' && result.exit_code !== 0);
  return store.saveTask({ ...task, updatedAt: now(), observations: [...task.observations.slice(-99),
    { id, tool, at: now(), outcome: failed ? 'failed' : 'returned', note: 'Tool activity only; no semantic verification inferred.' }] });
}

export function observeHook(event, options = {}) {
  if (process.env.JUST_VIBE_WORKER === '1' || !event || typeof event.cwd !== 'string' || typeof event.session_id !== 'string' || event.agent_id
    || !['PostToolUse', 'PostToolUseFailure'].includes(event.hook_event_name)) return {};
  const root = options.projectRoot || projectTopLevel(event.cwd) || event.cwd;
  const store = adaptiveStore(root, options);
  if (!store.config().enabled) return {};
  const host = options.host || (process.env.PLUGIN_ROOT ? 'codex' : 'claude');
  const session = store.read(store.sessionPath(host, event.session_id));
  if (!session?.taskId) return {};
  let task;
  try { task = store.task(session.taskId); } catch { return {}; }
  // A late event from an earlier turn belongs to that turn's task, not the current one.
  if (event.turn_id && task.turnId && event.turn_id !== task.turnId) return {};
  observeTool(store, task.id, event);
  return {};
}
