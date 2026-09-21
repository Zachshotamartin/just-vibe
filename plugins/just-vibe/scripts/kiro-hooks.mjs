#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { editorEvent } from './lib/editor-events.mjs';
import { isDirectRun } from './lib/entrypoint.mjs';
export async function kiroEvent(root, input, options = {}) {
  const events = { preToolUse: 'PreToolUse', postToolUse: 'PostToolUse', stop: 'Stop' };
  const type = events[input.hook_event_name];
  if (!type) return { exitCode: 0, context: '' };
  if (typeof input.session_id !== 'string' || !input.session_id)
    throw Error('Kiro session identity is required.');
  const result = await editorEvent(
    root,
    'kiro',
    { ...input, cwd: input.cwd || root, hook_event_name: type },
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
  let text = '';
  try {
    for await (const chunk of process.stdin) {
      text += chunk;
      if (text.length > 1024 * 1024) throw Error('Event too large.');
    }
    const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../../..');
    const result = await kiroEvent(root, JSON.parse(text));
    if (result.context) (result.exitCode ? console.error : console.log)(result.context);
    process.exitCode = result.exitCode;
  } catch {
    console.error('just-vibe Kiro event could not be checked.');
    process.exitCode = 2;
  }
}
