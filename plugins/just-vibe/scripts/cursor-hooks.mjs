#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { cursorEvent } from './lib/editor-events.mjs';
const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../../..');
let text = '';
for await (const chunk of process.stdin) {
  text += chunk;
  if (text.length > 1024 * 1024) throw Error('Event exceeds limit.');
}
try {
  console.log(JSON.stringify(await cursorEvent(root, JSON.parse(text))));
} catch {
  console.error('just-vibe editor event failed; inspect adapter doctor and runtime state.');
  process.exitCode = 1;
}
