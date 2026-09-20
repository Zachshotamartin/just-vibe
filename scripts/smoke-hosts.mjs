import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, readdirSync, readFileSync, cpSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.length && (args.length !== 1 || !['--github', '--local'].includes(args[0]))) throw new Error('Usage: node scripts/smoke-hosts.mjs [--github|--local]');
const source = args.includes('--github') ? 'github' : args.includes('--local') ? 'local' : 'bundled';
const expectedVersion = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
const expectedSkills = JSON.parse(readFileSync(resolve(root, 'plugins/just-vibe/catalog/commands.json'), 'utf8')).commands.length;
const sandbox = mkdtempSync(resolve(tmpdir(), 'just-vibe-smoke-'));
const cli = resolve(root, 'bin/just-vibe.mjs');

function verifyCachedPayload(config, target) {
  const stack = [resolve(config, 'plugins/cache')];
  const toolkits = [];
  while (stack.length) {
    const directory = stack.pop();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) stack.push(path);
      else if (entry.isFile() && entry.name === 'toolkit.mjs') toolkits.push(path);
    }
  }
  assert.ok(toolkits.length, `${target}: installed runtime missing from the native cache`);
  let verified = 0;
  for (const toolkit of toolkits) {
    const manifest = JSON.parse(readFileSync(resolve(toolkit, `../../.${target}-plugin/plugin.json`), 'utf8'));
    if (manifest.version !== expectedVersion) continue; // Hosts may retain caches from previous versions.
    verified++;
    const inventory = JSON.parse(execFileSync(process.execPath, [toolkit, 'tools', '--all', '--root', sandbox, '--json'], {
      cwd: sandbox, encoding: 'utf8', timeout: 10_000,
    }));
    assert.equal(inventory.tools.length, expectedSkills);
    assert.ok(inventory.tools.every(tool => tool.status !== 'uninstalled'));
  }
  assert.ok(verified, `${target}: current payload is missing from the native cache`);
  console.log(`Verified ${expectedSkills} skills and the runnable v${expectedVersion} payload in ${target}'s native cache.`);
}

try {
  for (const target of ['codex', 'claude']) {
    const config = resolve(sandbox, target);
    mkdirSync(config);
    const env = { ...process.env, JUST_VIBE_HOME: resolve(sandbox, 'managed'), [target === 'codex' ? 'CODEX_HOME' : 'CLAUDE_CONFIG_DIR']: config };
    if (source === 'bundled') {
      const prior = resolve(sandbox, `prior-${target}`);
      mkdirSync(prior);
      for (const asset of ['bin', 'plugins', '.agents', '.claude-plugin', 'LICENSE']) cpSync(resolve(root, asset), resolve(prior, asset), { recursive: true });
      for (const host of ['codex', 'claude']) {
        const path = resolve(prior, `plugins/just-vibe/.${host}-plugin/plugin.json`);
        const manifest = JSON.parse(readFileSync(path, 'utf8'));
        manifest.version = '0.2.99';
        writeFileSync(path, JSON.stringify(manifest));
      }
      console.log(`\nNative upgrade fixture: ${target} 0.2.99 → ${expectedVersion}`);
      execFileSync(process.execPath, [resolve(prior, 'bin/just-vibe.mjs'), 'setup', '--target', target], { cwd: sandbox, env, stdio: 'inherit', timeout: 180_000 });
      rmSync(prior, { recursive: true, force: true });
      execFileSync(process.execPath, [cli, 'update', '--target', target], { cwd: sandbox, env, stdio: 'inherit', timeout: 180_000 });
    }
    for (const command of ['setup', 'setup', 'doctor', 'update', 'doctor', 'uninstall', 'uninstall', 'setup']) {
      console.log(`\nNative smoke (${source}): ${target} ${command}`);
      execFileSync(process.execPath, [cli, command, '--target', target, ...(source === 'bundled' ? [] : [`--${source}`])], {
        cwd: sandbox, env, stdio: 'inherit', timeout: 180_000,
      });
    }
    verifyCachedPayload(config, target);
  }
  console.log('\nBoth native plugin lifecycles passed in isolated configuration directories.');
} finally {
  // Only the temporary directory created by this process is removed.
  rmSync(sandbox, { recursive: true, force: true });
}
