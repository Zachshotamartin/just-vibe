#!/usr/bin/env node
import { isDirectRun } from './lib/entrypoint.mjs';
import { lifecycle } from './lib/lifecycle.mjs';
import { runtimeStore } from './lib/runtime-store.mjs';
import { redact } from './lib/process.mjs';

// A PreToolUse event carries the whole tool input (a regenerated lockfile can exceed 1 MiB), so
// it is still evaluated up to 64 MiB and denied beyond that; other events stay bounded at 1 MiB.
const EVENT_BYTES = 1024 * 1024, TOOL_EVENT_BYTES = 64 * 1024 * 1024, PREFIX_BYTES = 64 * 1024;
const sniff = (prefix, key) => {
  const match = prefix.match(new RegExp(`"${key}"\\s*:\\s*("(?:[^"\\\\]|\\\\.)*")`));
  try { return match ? JSON.parse(match[1]) : undefined; } catch { return undefined; }
};

// The last failure is kept, redacted, for diagnose status; recording it never changes the decision.
function recordFailure(cwd, name, error) {
  if (!cwd) return;
  try {
    const runtime = runtimeStore(cwd);
    runtime.put('hook-last-error', { at: new Date().toISOString(), event: name || 'unknown', message: redact(String(error?.message || error)).slice(0, 500) }, runtime.get('hook-last-error')?.revision || 0);
  } catch { /* diagnostics are best effort */ }
}

export async function hookMain(stream = process.stdin, output = console.log) {
  let event, name, cwd;
  try {
    const chunks = [];
    let size = 0, prefix = '';
    for await (const chunk of stream) {
      size += chunk.length;
      chunks.push(chunk);
      if (prefix.length < PREFIX_BYTES) {
        prefix = Buffer.concat(chunks).subarray(0, PREFIX_BYTES).toString('utf8');
        name ??= sniff(prefix, 'hook_event_name');
        cwd ??= sniff(prefix, 'cwd');
      }
      // An event whose name is not in the prefix is treated as a possible tool event.
      if (size > (name === undefined || name === 'PreToolUse' ? TOOL_EVENT_BYTES : EVENT_BYTES)) throw Error(`Hook event larger than ${Math.round(size / 1024 / 1024)} MiB.`);
    }
    event = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    name = event.hook_event_name; cwd = event.cwd;
    const result = await lifecycle(event);
    if (Object.keys(result).length) output(JSON.stringify(result));
  } catch (error) {
    recordFailure(cwd, name, error);
    if (name === 'PreToolUse') {
      output(JSON.stringify({ hookSpecificOutput: {
        hookEventName: 'PreToolUse', permissionDecision: 'deny',
        permissionDecisionReason: 'just-vibe could not evaluate its enforcement state for this operation. Run diagnose status for the recorded error, then repair the hook state before retrying.',
      } }));
      return;
    }
    output(
      JSON.stringify({
        systemMessage:
          'just-vibe optional automation could not run. Run diagnose status for the recorded error; no successful check is implied.',
      }),
    );
  }
}
if (isDirectRun(import.meta.url)) await hookMain();
