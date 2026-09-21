import { existsSync } from 'node:fs';
import { runtimeStore } from './runtime-store.mjs';
import { digest, within } from './storage.mjs';
import { boundedText } from './capability-io.mjs';
import { editedFiles } from './edited-files.mjs';

export function investigationHook(event, options = {}) {
  const root = options.projectRoot || event.cwd;
  if (!root || !event.session_id) return {};
  const store = runtimeStore(root, options);
  if (store.get('hook-controls')?.profile !== 'strict') return {};
  const key = `investigation-${digest(event.session_id).slice(0, 24)}`;
  const state = store.get(key) || { revision: 0, files: [] };
  const hash = (path) => {
    try {
      return digest(boundedText(root, path, 1024 * 1024));
    } catch {
      return null;
    }
  };
  const result = event.tool_response;
  const failed = event.is_error || event.error || result?.isError === true ||
    result?.is_error === true || result?.error ||
    ['exit_code', 'exitCode', 'status'].some(
      (key) => typeof result?.[key] === 'number' && result[key] !== 0,
    );
  if (
    event.hook_event_name === 'PostToolUse' &&
    /^(Read|read_file|read)$/i.test(event.tool_name || '') &&
    !failed
  ) {
    const path = event.tool_input?.file_path || event.tool_input?.path;
    if (!path) return {};
    // A successful partial read does not establish inspection of the whole file.
    if (
      ['offset', 'limit', 'start_line', 'end_line'].some(
        (key) => event.tool_input?.[key] !== undefined,
      )
    )
      return {};
    const full = within(root, path),
      sha256 = hash(full);
    if (sha256)
      store.put(
        key,
        {
          files: [...state.files.filter((f) => f.path !== full), { path: full, sha256 }].slice(
            -200,
          ),
        },
        state.revision,
      );
  }
  if (
    event.hook_event_name !== 'PreToolUse' ||
    !/^(Edit|Write|MultiEdit|StrReplace|apply_patch)$/i.test(event.tool_name || '')
  )
    return {};
  const paths = editedFiles(event);
  const missing =
    !paths.length ||
    paths.some((path) => {
      try {
        const full = within(root, path);
        return (
          existsSync(full) && !state.files.some((f) => f.path === full && f.sha256 === hash(full))
        );
      } catch {
        return true;
      }
    });
  return missing
    ? {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason:
            'Strict investigation requires a successful Read/read_file of each existing file at its current content before editing. New files are allowed. Shell inspection is not inferred; use an explicit file-read tool or select the standard preset.',
        },
      }
    : {};
}
