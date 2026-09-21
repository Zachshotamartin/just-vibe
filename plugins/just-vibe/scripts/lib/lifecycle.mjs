import { handleHook } from './automation.mjs';
import { assistantHook } from './assistant-hooks.mjs';
import { policyHook } from './action-policy.mjs';
import { healthHook } from './context-health.mjs';
import { commitQualityHook } from './quality.mjs';
import { behaviorHook, hookEnabled } from './behavior-rules.mjs';
import { sessionLifecycleHook } from './native-sessions.mjs';
import { mcpHealth } from './mcp-health.mjs';
import { configurationInventory } from './config-inventory.mjs';
import { investigationHook } from './investigation.mjs';

export async function lifecycle(event, options = {}) {
  if (!event.cwd) return {};
  const root = options.projectRoot || event.cwd,
    messages = [];
  const enabled = (feature) => hookEnabled(root, feature, options);
  // Custom blockers, existing policy and commit checks compose; a warning must
  // never short-circuit a later denial.
  const rule = behaviorHook(event, options);
  if (rule.decision === 'block' || rule.hookSpecificOutput?.permissionDecision === 'deny')
    return rule;
  if (rule.systemMessage) messages.push(rule.systemMessage);
  const investigation = investigationHook(event, options);
  if (investigation.hookSpecificOutput?.permissionDecision === 'deny') return investigation;
  if (event.hook_event_name === 'PreToolUse') {
    for (const [feature, run] of [
      ['policy', policyHook],
      ['commit', commitQualityHook],
    ]) {
      if (!enabled(feature)) continue;
      const result = await run(event, options);
      if (result.hookSpecificOutput?.permissionDecision === 'deny') return result;
      if (result.systemMessage) messages.push(result.systemMessage);
    }
    return messages.length ? { systemMessage: messages.join('\n') } : {};
  }
  if (enabled('sessions')) {
    try {
      const saved = sessionLifecycleHook(event, options);
      if (saved.systemMessage) messages.push(saved.systemMessage);
    } catch {
      messages.push('just-vibe checkpoint could not be saved; no checkpoint success is implied.');
    }
  }
  if (
    enabled('mcp-health') &&
    ['PostToolUse', 'PostToolUseFailure'].includes(event.hook_event_name) &&
    /^mcp__[^_].*__/.test(event.tool_name || '')
  ) {
    try {
      const name = event.tool_name.slice(5, event.tool_name.lastIndexOf('__'));
      const matches = configurationInventory(root, {}, options).servers.filter(
        (s) => s.name === name,
      );
      if (matches.length === 1) {
        const state = await mcpHealth(root, 'status', {}, options),
          server = matches[0];
        const failed =
          event.hook_event_name === 'PostToolUseFailure' ||
          event.is_error ||
          event.error ||
          event.tool_response?.isError;
        await mcpHealth(
          root,
          'observe',
          {
            key: server.key,
            configHash: server.configHash,
            revision: state.revision,
            outcome: failed ? 'failure' : 'success',
            ...(failed ? { failure: String(event.error || 'tool error') } : {}),
          },
          options,
        );
      }
    } catch {
      /* Monitoring cannot change a completed tool's result. */
    }
  }
  if (enabled('automation')) {
    try {
      const result = await handleHook(event, options);
      if (result.message) messages.push(result.message);
    } catch {
      messages.push('just-vibe optional automation could not run; no successful check is implied.');
    }
  }
  let assistant = {};
  if (enabled('assistant')) {
    try {
      assistant = assistantHook(
        options.suppressFollowup && event.hook_event_name === 'Stop'
          ? { ...event, stop_hook_active: true }
          : event,
        options,
      );
    } catch {
      messages.push('just-vibe assistance could not update its state; inspect assist status.');
    }
  }
  if (enabled('health')) {
    try {
      const result = healthHook(event, options);
      messages.push(...(result.warnings || []).map((w) => w.message));
    } catch {
      /* Monitoring is best effort, never passing evidence. */
    }
  }
  if (assistant.systemMessage) messages.unshift(assistant.systemMessage);
  return { ...assistant, ...(messages.length ? { systemMessage: messages.join('\n') } : {}) };
}
