#!/usr/bin/env node
import { gitHooks } from './lib/git-hooks.mjs';
if (process.argv.length !== 4 || process.argv[2] !== '--root') throw Error('Expected --root.');
try {
  let updates = '';
  for await (const chunk of process.stdin) {
    updates += chunk;
    if (updates.length > 64000) throw Error('Push input too large.');
  }
  await gitHooks(process.argv[3], 'check', { hook: 'pre-push', updates });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
