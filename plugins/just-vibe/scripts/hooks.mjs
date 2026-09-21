#!/usr/bin/env node
import { isDirectRun } from './lib/entrypoint.mjs';
import { lifecycle } from './lib/lifecycle.mjs';
export async function hookMain(stream = process.stdin, output = console.log) {
  let event;
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of stream) {
      size += chunk.length;
      if (size > 1024 * 1024) throw Error('Hook event too large.');
      chunks.push(chunk);
    }
    event = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const result = await lifecycle(event);
    if (Object.keys(result).length) output(JSON.stringify(result));
  } catch {
    if (event?.hook_event_name === 'PreToolUse') {
      output(JSON.stringify({ hookSpecificOutput: {
        hookEventName: 'PreToolUse', permissionDecision: 'deny',
        permissionDecisionReason: 'just-vibe could not evaluate its enforcement state. Inspect and repair the hook state before retrying this operation.',
      } }));
      return;
    }
    output(
      JSON.stringify({
        systemMessage:
          'just-vibe optional automation could not run. Inspect hooks status and local automation state; no successful check is implied.',
      }),
    );
  }
}
if (isDirectRun(import.meta.url)) await hookMain();
