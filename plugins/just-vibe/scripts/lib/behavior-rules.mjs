import { runtimeStore, object, cleanText, requireId, timestamp } from './runtime-store.mjs';
import { digest } from './storage.mjs';
import { boundedList } from './capability-io.mjs';

export const HOOK_FEATURES = [
  'policy',
  'commit',
  'automation',
  'assistant',
  'health',
  'rules',
  'sessions',
  'mcp-health',
  'notifications',
];
const EVENTS = ['prompt', 'command', 'file', 'stop', 'all'];
const FIELDS = ['command', 'path', 'content', 'oldContent', 'prompt', 'tool'];
const OPERATORS = ['contains', 'notContains', 'equals', 'startsWith', 'endsWith', 'glob'];

// Greedy glob matching with a bounded pattern/input; user patterns never become
// JavaScript regular expressions or executable code.
export function globMatch(pattern, input) {
  let p = 0,
    s = 0,
    star = -1,
    checkpoint = -1;
  while (s < input.length) {
    if (pattern[p] === '?' || pattern[p] === input[s]) {
      p++;
      s++;
    } else if (pattern[p] === '*') {
      star = p++;
      checkpoint = s;
    } else if (star !== -1) {
      p = star + 1;
      s = ++checkpoint;
    } else return false;
  }
  while (pattern[p] === '*') p++;
  return p === pattern.length;
}
function validateRule(rule) {
  object(rule, ['id', 'event', 'action', 'enabled', 'conditions', 'message']);
  if (
    !EVENTS.includes(rule.event) ||
    !['warn', 'block'].includes(rule.action) ||
    typeof rule.enabled !== 'boolean'
  )
    throw Error('Invalid behavior rule event/action/enabled.');
  const conditions = boundedList(rule.conditions, 'conditions', 8).map((c) => {
    object(c, ['field', 'operator', 'value', 'caseSensitive']);
    if (
      !FIELDS.includes(c.field) ||
      !OPERATORS.includes(c.operator) ||
      (c.caseSensitive !== undefined && typeof c.caseSensitive !== 'boolean')
    )
      throw Error('Invalid rule condition.');
    return {
      field: c.field,
      operator: c.operator,
      value: cleanText(c.value, 'condition value', 256),
      caseSensitive: c.caseSensitive !== false,
    };
  });
  if (!conditions.length) throw Error('A rule needs at least one condition.');
  return {
    id: requireId(rule.id),
    event: rule.event,
    action: rule.action,
    enabled: rule.enabled,
    conditions,
    message: cleanText(rule.message, 'rule message', 1000),
  };
}
export function ruleEvent(event) {
  const input = event.tool_input || {},
    name = event.hook_event_name;
  const tool = String(event.tool_name || '');
  const kind =
    name === 'UserPromptSubmit'
      ? 'prompt'
      : name === 'Stop'
        ? 'stop'
        : /Bash|Shell|PowerShell|exec_command/.test(tool)
          ? 'command'
          : /Write|Edit|MultiEdit|apply_patch|StrReplace/.test(tool)
            ? 'file'
            : 'all';
  return {
    kind,
    fields: {
      tool,
      command: input.command || input.cmd || '',
      path: input.file_path || input.path || input.target_file || '',
      content:
        typeof input === 'string'
          ? input
          : input.new_string || input.new_text || input.content || input.patch || '',
      oldContent: input.old_string || input.old_text || '',
      prompt: event.prompt || '',
    },
  };
}
export function evaluateRules(rules, event) {
  const { kind, fields } = ruleEvent(event),
    matches = [];
  for (const rule of rules.filter((r) => r.enabled && (r.event === 'all' || r.event === kind))) {
    let incomplete = false;
    const results = rule.conditions.map((c) => {
      if (typeof fields[c.field] !== 'string') {
        incomplete = true;
        return false;
      }
      if (fields[c.field].length > 32768) {
        incomplete = true;
        return false;
      }
      const input = c.caseSensitive ? fields[c.field] : fields[c.field].toLowerCase();
      const expected = c.caseSensitive ? c.value : c.value.toLowerCase();
      return c.operator === 'contains'
        ? input.includes(expected)
        : c.operator === 'notContains'
          ? !input.includes(expected)
          : c.operator === 'equals'
            ? input === expected
            : c.operator === 'startsWith'
              ? input.startsWith(expected)
              : c.operator === 'endsWith'
                ? input.endsWith(expected)
                : globMatch(expected, input);
    });
    if (results.every(Boolean) || (incomplete && rule.action === 'block'))
      matches.push({
        id: rule.id,
        action: rule.action,
        message: incomplete
          ? `Rule ${rule.id} could not inspect the full input. Reduce the operation scope before retrying.`
          : rule.message,
        incomplete,
      });
  }
  return {
    kind,
    matches,
    blocked: matches.some((m) => m.action === 'block'),
    inspected: rules.filter((r) => r.enabled).length,
  };
}
export function hookEnabled(root, feature, options = {}) {
  const state = runtimeStore(root, options).get('hook-controls');
  return !state?.disabled?.includes(feature);
}
export function behaviorRules(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('behavior-rules') || { revision: 0, rules: [], events: [] };
  if (operation === 'list') return state;
  if (operation === 'controls')
    return store.get('hook-controls') || { revision: 0, profile: 'standard', disabled: [] };
  if (operation === 'preset') {
    object(payload, ['revision', 'profile', 'disabled']);
    if (!['minimal', 'standard', 'strict'].includes(payload.profile))
      throw Error('Choose minimal, standard or strict.');
    const disabled = boundedList(
      payload.disabled ??
        (payload.profile === 'minimal' ? ['automation', 'health', 'notifications'] : []),
      'disabled',
      HOOK_FEATURES.length,
    );
    if (disabled.some((f) => !HOOK_FEATURES.includes(f))) throw Error('Unknown hook feature.');
    return store.put(
      'hook-controls',
      { profile: payload.profile, disabled: [...new Set(disabled)] },
      payload.revision,
    );
  }
  if (operation === 'preview') {
    object(payload, ['event', 'rule']);
    object(payload.event, ['hook_event_name', 'tool_name', 'tool_input', 'prompt']);
    return evaluateRules(payload.rule ? [validateRule(payload.rule)] : state.rules, payload.event);
  }
  object(payload, ['revision', 'rule', 'id', 'enabled']);
  if (payload.revision !== state.revision) throw Error('Read current rule revision first.');
  let rules = state.rules;
  if (operation === 'save') {
    const rule = validateRule(payload.rule);
    if (!rules.some((r) => r.id === rule.id) && rules.length >= 40)
      throw Error('Rule capacity reached.');
    rules = [...rules.filter((r) => r.id !== rule.id), rule];
  } else {
    requireId(payload.id);
    if (!rules.some((r) => r.id === payload.id)) throw Error('Unknown rule.');
    if (operation === 'remove') rules = rules.filter((r) => r.id !== payload.id);
    else if (operation === 'toggle' && typeof payload.enabled === 'boolean')
      rules = rules.map((r) => (r.id === payload.id ? { ...r, enabled: payload.enabled } : r));
    else throw Error('Unknown behavior rule operation.');
  }
  return store.put('behavior-rules', { rules, events: state.events }, state.revision);
}
export function behaviorHook(event, options = {}) {
  if (!event.cwd || !['PreToolUse', 'UserPromptSubmit', 'Stop'].includes(event.hook_event_name))
    return {};
  const root = options.projectRoot || event.cwd;
  if (!hookEnabled(root, 'rules', options)) return {};
  const store = runtimeStore(root, options),
    state = store.get('behavior-rules');
  if (!state?.rules?.length) return {};
  const result = evaluateRules(state.rules, event);
  if (!result.matches.length) return {};
  const eventHash = digest(
    JSON.stringify({
      session: event.session_id,
      id: event.tool_use_id,
      kind: result.kind,
      fields: ruleEvent(event).fields,
    }),
  );
  const prior = state.events.find((e) => e.hash === eventHash);
  let auditWarning;
  try {
    if (!prior) store.put(
      'behavior-rules',
      {
        ...state,
        events: [
          ...state.events,
          {
            hash: eventHash,
            at: timestamp(),
            rules: result.matches.map((r) => r.id),
            blocked: result.blocked,
          },
        ].slice(-200),
      },
      state.revision,
    );
  } catch {
    // Enforcement must not depend on the optional observation journal.
    auditWarning = 'just-vibe could not record this rule observation; its enforcement decision still applies.';
  }
  const message = result.matches.map((m) => m.message).join('\n');
  // Completion hooks get one interruption per exact event to avoid stop loops.
  const blocked =
    result.blocked && !(event.hook_event_name === 'Stop' && (event.stop_hook_active || prior));
  if (blocked && event.hook_event_name === 'PreToolUse')
    return {
      ...(auditWarning ? { systemMessage: auditWarning } : {}),
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: message,
      },
    };
  if (blocked) return { decision: 'block', reason: message, ...(auditWarning ? { systemMessage: auditWarning } : {}) };
  return { systemMessage: [message, auditWarning].filter(Boolean).join('\n') };
}
