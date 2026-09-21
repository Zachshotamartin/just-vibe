#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { cursorEvent } from './lib/editor-events.mjs';
const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../../..');
try {
  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > 1024 * 1024) throw Error('Event exceeds limit.');
    chunks.push(bytes);
  }
  const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
  console.log(JSON.stringify(await cursorEvent(root, JSON.parse(text))));
} catch {
  console.error('just-vibe editor event failed; inspect adapter doctor and runtime state.');
  process.exitCode = 1;
}
