#!/usr/bin/env node
import { readJson } from './lib/storage.mjs';
import { writeFileSync, unlinkSync } from 'node:fs';
import { startCanvasServer } from './lib/canvas-http.mjs';
const path = process.argv[2],
  config = readJson(path);
const running = await startCanvasServer(config.root, config.id, config);
writeFileSync(
  `${path}.status`,
  JSON.stringify({
    url: running.url,
    expiresAt: new Date(Date.now() + config.seconds * 1000).toISOString(),
  }),
  { flag: 'wx', mode: 0o600 },
);
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  clearTimeout(timer);
  await running.close();
  for (const p of [path, `${path}.status`]) {
    try {
      unlinkSync(p);
    } catch {}
  }
}
const timer = setTimeout(close, config.seconds * 1000);
process.on('SIGTERM', close);
process.on('SIGINT', close);
