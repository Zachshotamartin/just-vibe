import { basename, relative, resolve, isAbsolute } from 'node:path';
import { existsSync } from 'node:fs';
import { digest, within, projectRoot } from './storage.mjs';
import { runtimeStore, object, cleanText, revision, timestamp } from './runtime-store.mjs';
import { gitRead } from './project.mjs';

export const POLICY_RULES = ['quality-config', 'git-no-verify', 'git-force-push', 'git-discard'];
const defaults = { enabled: false, rules: POLICY_RULES };
const protectedName = (name) =>
  /^(?:eslint\.config\.[cm]?[jt]s|\.eslintrc(?:\..+)?|\.prettierrc(?:\..+)?|prettier\.config\.[cm]?[jt]s|biome\.jsonc?|ruff\.toml|\.ruff\.toml|\.golangci\.(?:ya?ml|json)|clippy\.toml|\.clippy\.toml)$/.test(
    basename(name),
  );
// Tokenize quotes and command boundaries without expanding or executing shell
// syntax. Indirect/evaluated scripts are deliberately outside this guard.
export function shellCommands(source) {
  const commands = [];
  let words = [],
    word = '',
    quote = '',
    escaped = false;
  const flush = () => {
    if (word) words.push(word);
    word = '';
  };
  for (const c of source) {
    if (escaped) {
      word += c;
      escaped = false;
      continue;
    }
    if (c === '\\' && quote !== "'") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (c === quote) quote = '';
      else word += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (';|&\n'.includes(c)) {
      flush();
      if (words.length) commands.push(words);
      words = [];
    } else if ('<>'.includes(c)) {
      flush();
      words.push(c);
    } else if (/\s/.test(c)) flush();
    else word += c;
  }
  flush();
  if (words.length) commands.push(words);
  return commands;
}
export function actionIdentity(event) {
  return digest(
    JSON.stringify({
      tool: event.tool_name,
      input: event.tool_input,
      cwd: event.cwd ? projectRoot(event.cwd) : null,
    }),
  );
}
export function inspectAction(root, event, settings = defaults) {
  root = projectRoot(root);
  const logicalCwd = resolve(event.cwd || root),
    cwd = projectRoot(logicalCwd);
  const hits = [],
    input = event.tool_input;
  const tool = typeof event.tool_name === 'string' ? event.tool_name : '';
  let command = typeof input === 'string' ? input : (input?.command ?? input?.cmd ?? '');
  if (typeof command !== 'string' || command.length > 100000) command = '';
  const shell = /^(Bash|bash|exec_command|shell|run_command)$/.test(tool);
  const edit = /^(Edit|Write|MultiEdit|apply_patch|write_file|edit_file)$/.test(tool);
  const paths = [];
  if (edit) {
    if (typeof input?.file_path === 'string') paths.push(input.file_path);
    if (typeof input?.path === 'string') paths.push(input.path);
    for (const match of command.matchAll(
      /^\*\*\* (?:Update|Delete|Add) File: (.+)$|^\*\*\* Move to: (.+)$/gm,
    ))
      paths.push(match[1] || match[2]);
  }
  if (shell) {
    for (const words of shellCommands(command)) {
      let index = 0;
      while (
        /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index] || '') ||
        ['env', 'command', 'sudo'].includes(words[index])
      )
        index++;
      const binary = basename(words[index] || ''),
        args = words.slice(index + 1);
      if (binary === 'git') {
        let at = 0;
        while (args[at]?.startsWith('-')) {
          if (['-c', '-C', '--git-dir', '--work-tree'].includes(args[at])) at += 2;
          else at++;
        }
        const op = args[at],
          flags = args.slice(at + 1);
        const hooksDisabled =
          words.slice(0, index).some((w) => /^HUSKY=0$/.test(w)) ||
          args.slice(0, at).some((w) => /^core\.hooksPath=/.test(w));
        if (
          ['commit', 'merge', 'rebase', 'push'].includes(op) &&
          (flags.includes('--no-verify') ||
            (op === 'commit' && flags.includes('-n')) ||
            hooksDisabled)
        )
          hits.push('git-no-verify');
        if (
          op === 'push' &&
          flags.some((f) => /^--force(?:-with-lease(?:=.*)?)?$|^-[^-]*f[^-]*$|^\+[^\s]+$/.test(f))
        )
          hits.push('git-force-push');
        if (
          (op === 'reset' && flags.includes('--hard')) ||
          (op === 'clean' &&
            flags.some((f) => /^-[^-]*f/.test(f)) &&
            !flags.some((f) => f === '--dry-run' || /^-[^-]*n/.test(f))) ||
          op === 'restore' ||
          (op === 'checkout' && flags.includes('--'))
        )
          hits.push('git-discard');
      }
      for (let n = 0; n < words.length - 1; n++)
        if (words[n] === '>' && words[n + 1] !== '>') paths.push(words[n + 1]);
      if (['rm', 'mv', 'tee'].includes(binary))
        paths.push(...args.filter((a) => !a.startsWith('-')));
      else if (binary === 'cp' && args.length) paths.push(args.at(-1));
      else if (['sed', 'perl'].includes(binary) && args.some((a) => /^-[^-]*i/.test(a)))
        paths.push(...args);
      else if (/^(?:python\d*|node)$/.test(binary))
        for (const token of args.join(' ').split(/[^a-zA-Z0-9_./-]+/))
          if (protectedName(token)) paths.push(token);
    }
  }
  for (const path of paths) {
    try {
      const target = within(
        root,
        resolve(cwd, isAbsolute(path) ? relative(logicalCwd, path) : path),
      );
      if (protectedName(target) && existsSync(target)) hits.push('quality-config');
    } catch {
      /* A path outside this policy's project is not controlled by it. */
    }
  }
  return {
    actionHash: actionIdentity(event),
    rules: [...new Set(hits)].filter((r) => settings.rules.includes(r)),
    coverage: shell ? 'lexical-shell' : edit ? 'structured-edit' : 'unrecognized-tool',
    paths: paths.map((p) => relative(root, resolve(event.cwd || root, p))),
  };
}
export function policy(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  const state = store.get('policy') || {
    revision: 0,
    settings: defaults,
    exceptions: [],
    events: [],
  };
  if (operation === 'status') return state;
  if (operation === 'configure') {
    object(payload, ['revision', 'settings']);
    object(payload.settings, ['enabled', 'rules']);
    const settings = { ...state.settings, ...payload.settings };
    if (
      typeof settings.enabled !== 'boolean' ||
      !Array.isArray(settings.rules) ||
      settings.rules.some((r) => !POLICY_RULES.includes(r))
    )
      throw Error('Invalid policy settings.');
    return store.put('policy', { ...state, settings }, payload.revision);
  }
  if (operation === 'exception') {
    object(payload, ['revision', 'actionHash', 'reason', 'expiresMinutes']);
    if (!/^[a-f0-9]{64}$/.test(payload.actionHash))
      throw Error('Use the exact action hash from a policy check.');
    const minutes = payload.expiresMinutes ?? 5;
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 30)
      throw Error('Exception expiry must be 1–30 minutes.');
    const reason = cleanText(payload.reason, 'exception reason', 500);
    return store.put(
      'policy',
      {
        ...state,
        exceptions: [
          ...state.exceptions
            .filter((e) => e.expiresAt > Date.now() && e.actionHash !== payload.actionHash)
            .slice(-19),
          { actionHash: payload.actionHash, reason, expiresAt: Date.now() + minutes * 60000 },
        ],
      },
      payload.revision,
    );
  }
  if (operation !== 'check') throw Error('Unknown policy operation.');
  object(payload, ['event']);
  object(payload.event, ['tool_name', 'tool_input', 'cwd']);
  const check = inspectAction(store.root, payload.event, state.settings);
  const exception = state.exceptions.find(
    (e) => e.actionHash === check.actionHash && e.expiresAt > Date.now(),
  );
  const blocked = state.settings.enabled && check.rules.length > 0 && !exception;
  if (options.consume && state.settings.enabled && (blocked || exception)) {
    revision(state.revision);
    store.put(
      'policy',
      {
        ...state,
        exceptions: state.exceptions.filter((e) => e.expiresAt > Date.now() && e !== exception),
        events: [
          ...state.events.slice(-99),
          {
            at: timestamp(),
            actionHash: check.actionHash,
            rules: check.rules,
            outcome: blocked ? 'blocked' : 'exception',
          },
        ],
      },
      state.revision,
    );
  }
  return {
    ...check,
    enabled: state.settings.enabled,
    blocked,
    exception: !!exception,
    note: 'Recognized action checks only; shell indirection and unsupported tool transports are outside coverage. An exception does not grant host permissions.',
  };
}
export function policyHook(event, options = {}) {
  if (event?.hook_event_name !== 'PreToolUse' || typeof event.cwd !== 'string') return {};
  const root = options.projectRoot || gitRead(event.cwd, ['rev-parse', '--show-toplevel']) || event.cwd;
  try {
    const result = policy(
      root,
      'check',
      { event: { tool_name: event.tool_name, tool_input: event.tool_input, cwd: event.cwd } },
      { ...options, consume: true },
    );
    if (!result.blocked) return {};
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `just-vibe policy blocked ${result.rules.join(', ')}. Exact action: ${result.actionHash}. For an already authorized exception, use policy exception with this hash and a reason; do not rewrite the action to evade this check.`,
      },
    };
  } catch {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'just-vibe could not read the action policy. Inspect policy status and repair its local state before retrying.',
      },
    };
  }
}
