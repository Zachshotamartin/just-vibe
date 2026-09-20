#!/usr/bin/env node
import { handleHook } from './lib/automation.mjs';
import { isDirectRun } from './lib/entrypoint.mjs';

export async function hookMain(stream = process.stdin, output = console.log) {
  try {
    const chunks = []; let size = 0;
    for await (const chunk of stream) { size += chunk.length; if (size > 1024 * 1024) throw Error('Hook event too large.'); chunks.push(chunk); }
    const result = await handleHook(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    // Advisory only: never manufacture a block/continue decision or restart a stopped turn.
    if (result.message) output(JSON.stringify({ systemMessage: result.message }));
  } catch { output(JSON.stringify({ systemMessage: 'just-vibe optional automation could not run. Inspect hooks status and local automation state; no successful check is implied.' })); }
}
if (isDirectRun(import.meta.url)) await hookMain();
