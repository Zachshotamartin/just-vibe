import { lifecycle } from './lifecycle.mjs';
import { assistantHook } from './assistant-hooks.mjs';
import { handleHook } from './automation.mjs';
import { policyHook } from './action-policy.mjs';
import { commitQualityHook } from './quality.mjs';
import { healthHook } from './context-health.mjs';
import { adaptiveStore } from './adaptive-store.mjs';
import { activationContext } from './assistant-runtime.mjs';
import { loadCatalog } from './catalog.mjs';
import { projectRoot, within } from './storage.mjs';

export async function editorEvent(root, host, event, options = {}) {
  root = projectRoot(root);
  if (!['cursor', 'opencode', 'kiro'].includes(host)) throw Error('Unsupported event adapter.');
  if (event.cwd) within(root, event.cwd);
  event = { ...event, cwd: event.cwd || root };
  options = { ...options, projectRoot: root };
  return lifecycle(event, { ...options, host });
}
export function editorContext(root, host, session, options = {}) {
  const store = adaptiveStore(root, options);
  if (!store.config().enabled) return '';
  const saved = store.read(store.sessionPath(host, session));
  if (!saved?.taskId) return '';
  if (options.once && saved.contextDeliveredTaskId === saved.taskId) return '';
  const context = activationContext(
    store,
    options.catalog || loadCatalog(),
    store.task(saved.taskId),
  );
  if (options.once)
    store.write(
      store.sessionPath(host, session),
      { ...saved, contextDeliveredTaskId: saved.taskId },
      saved.revision,
    );
  return context;
}
export async function cursorEvent(root, input, options = {}) {
  const map = {
    beforeSubmitPrompt: 'UserPromptSubmit',
    preToolUse: 'PreToolUse',
    postToolUse: 'PostToolUse',
    postToolUseFailure: 'PostToolUseFailure',
    stop: 'Stop',
    sessionStart: 'SessionStart',
  };
  const type = input.hook_event_name;
  if (!map[type]) return {};
  const session = input.conversation_id || input.session_id;
  if (typeof session !== 'string' || !session) throw Error('Cursor session identity is required.');
  const tools = { Shell: 'Bash', Write: 'Write', StrReplace: 'Edit' };
  const event = {
    hook_event_name: map[type],
    cwd: input.cwd || root,
    session_id: session,
    turn_id: input.generation_id,
    prompt: input.prompt,
    source: 'resume',
    tool_name: tools[input.tool_name] || input.tool_name,
    tool_input: input.tool_input,
    tool_use_id: input.tool_use_id,
    error: input.error_message,
    is_error: type === 'postToolUseFailure',
    stop_hook_active: input.loop_count > 0,
  };
  const result = await editorEvent(root, 'cursor', event, options);
  const message = [result.hookSpecificOutput?.additionalContext, result.systemMessage]
    .filter(Boolean)
    .join('\n');
  if (type === 'beforeSubmitPrompt')
    return {
      continue: result.decision !== 'block',
      ...(result.reason ? { user_message: result.reason } : {}),
    };
  if (type === 'preToolUse')
    return {
      permission: result.hookSpecificOutput?.permissionDecision === 'deny' ? 'deny' : 'allow',
      ...(result.hookSpecificOutput?.permissionDecisionReason
        ? { user_message: result.hookSpecificOutput.permissionDecisionReason }
        : {}),
    };
  if (type === 'stop')
    return input.status === 'completed' && !input.loop_count && result.decision === 'block'
      ? { followup_message: result.reason }
      : {};
  return {
    additional_context: [
      message,
      type === 'postToolUse'
        ? editorContext(root, 'cursor', session, { ...options, once: true })
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
  };
}
