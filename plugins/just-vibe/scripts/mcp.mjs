#!/usr/bin/env node
import { createMcpServer, serveMcp } from './lib/mcp-server.mjs';
import { isDirectRun } from './lib/entrypoint.mjs';
export async function mcpMain(args, input = process.stdin, output = process.stdout) {
  const options = {};
  let root = process.cwd();
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    if (seen.has(args[i])) throw Error('Duplicate MCP option.');
    seen.add(args[i]);
    if (args[i] === '--root') {
      root = args[++i];
      if (!root || root.startsWith('--')) throw Error('--root needs a directory.');
    } else if (args[i] === '--allow-write') options.allowWrite = true;
    else if (args[i] === '--allow-user') options.allowUser = true;
    else if (args[i] === '--allow-workers') options.allowWorkers = true;
    else
      throw Error('MCP options: --root DIRECTORY, --allow-write, --allow-user, --allow-workers.');
  }
  await serveMcp(input, output, createMcpServer(root, options));
  return 0;
}
if (isDirectRun(import.meta.url)) {
  try {
    await mcpMain(process.argv.slice(2));
  } catch (error) {
    console.error(`just-vibe MCP: ${error.message}`);
    process.exitCode = 1;
  }
}
