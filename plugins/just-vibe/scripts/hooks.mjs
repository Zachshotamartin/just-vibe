#!/usr/bin/env node
import { handleHook } from './lib/automation.mjs';
import { isDirectRun } from './lib/entrypoint.mjs';
import { assistantHook } from './lib/assistant-hooks.mjs';

export async function hookMain(stream = process.stdin, output = console.log) {
  try {
    const chunks = []; let size = 0;
    for await (const chunk of stream) { size += chunk.length; if (size > 1024 * 1024) throw Error('Hook event too large.'); chunks.push(chunk); }
    const event = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    // Trusted project commands may change files. Inspect adaptive evidence only
    // after they finish, and isolate failures so either integration can respond.
    let result;
    try { result = await handleHook(event); }
    catch { result = { message: 'just-vibe optional automation could not run. Inspect hooks status and local automation state; no successful check is implied.' }; }
    let automatic;
    try { automatic = assistantHook(event); }
    catch { automatic = { systemMessage: 'just-vibe automatic assistance could not update its local state. No workflow or successful check is implied; inspect assist status.' }; }
    if (result.message) automatic.systemMessage = [automatic.systemMessage, result.message].filter(Boolean).join('\n');
    if (Object.keys(automatic).length) output(JSON.stringify(automatic));
  } catch { output(JSON.stringify({ systemMessage: 'just-vibe optional automation could not run. Inspect hooks status and local automation state; no successful check is implied.' })); }
}
if (isDirectRun(import.meta.url)) await hookMain();
