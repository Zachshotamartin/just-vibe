#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { editorEvent } from './lib/editor-events.mjs';
import { isDirectRun } from './lib/entrypoint.mjs';
// Kiro's native names and documented aliases differ from the shared lifecycle
// names. Normalize exact built-ins only; namespaced MCP tools retain their identity.
const tools = {
  shell: 'Bash', execute_bash: 'Bash', execute_cmd: 'Bash',
  write: 'Write', fs_write: 'Write', fsWrite: 'Write',
  read: 'Read', fs_read: 'Read', fsRead: 'Read',
};
export async function kiroEvent(root, input, options = {}) {
  const events = { preToolUse: 'PreToolUse', postToolUse: 'PostToolUse', stop: 'Stop' };
  const type = events[input.hook_event_name];
  if (!type) return { exitCode: 0, context: '' };
  if (typeof input.session_id !== 'string' || !input.session_id)
    throw Error('Kiro session identity is required.');
  const tool = Object.hasOwn(tools, input.tool_name) ? tools[input.tool_name] : input.tool_name;
  let toolInput = input.tool_input;
  if (tool === 'Write' && toolInput && typeof toolInput === 'object' && !Array.isArray(toolInput))
    toolInput = {
      ...toolInput,
      file_path: toolInput.path ?? toolInput.file_path,
      content: toolInput.file_text ?? toolInput.new_str ?? toolInput.text ?? toolInput.content,
      old_string: toolInput.old_str ?? toolInput.old_string,
    };
  const result = await editorEvent(
    root,
    'kiro',
    { ...input, cwd: input.cwd || root, hook_event_name: type, tool_name: tool, tool_input: toolInput },
    { ...options, suppressFollowup: true },
  );
  const blocked = type === 'PreToolUse' && result.hookSpecificOutput?.permissionDecision === 'deny';
  return {
    exitCode: blocked ? 2 : 0,
    context: [
      result.hookSpecificOutput?.permissionDecisionReason,
      result.hookSpecificOutput?.additionalContext,
      result.systemMessage,
    ]
      .filter(Boolean)
      .join('\n'),
  };
}
if (isDirectRun(import.meta.url)) {
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of process.stdin) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += bytes.length;
      if (size > 1024 * 1024) throw Error('Event too large.');
      chunks.push(bytes);
    }
    const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
    const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../../..');
    const result = await kiroEvent(root, JSON.parse(text));
    if (result.context) (result.exitCode ? console.error : console.log)(result.context);
    process.exitCode = result.exitCode;
  } catch {
    console.error('just-vibe Kiro event could not be checked.');
    process.exitCode = 2;
  }
}
