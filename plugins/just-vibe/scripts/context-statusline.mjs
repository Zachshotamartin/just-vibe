#!/usr/bin/env node
import { contextHealth } from './lib/context-health.mjs';
import { gitRead } from './lib/project.mjs';
let data = '';
for await (const chunk of process.stdin) {
  data += chunk;
  if (data.length > 262144) throw Error('Status input too large.');
}
try {
  const event = JSON.parse(data),
    cwd = event.workspace?.project_dir || event.cwd;
  const remaining = event.context_window?.remaining_percentage;
  if (cwd && event.session_id && Number.isFinite(remaining)) {
    contextHealth(gitRead(cwd, ['rev-parse', '--show-toplevel']) || cwd, 'observe', {
      host: 'claude',
      sessionId: event.session_id,
      remainingPercent: remaining,
      observedAt: new Date().toISOString(),
    });
    process.stdout.write(`just-vibe | context remaining ${Math.round(remaining)}%`);
  } else process.stdout.write('just-vibe | context unavailable');
} catch {
  process.stdout.write('just-vibe | context unavailable');
}
