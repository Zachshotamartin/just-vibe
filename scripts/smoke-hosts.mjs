import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const sandbox = mkdtempSync(resolve(tmpdir(), 'just-vibe-smoke-'));
const cli = resolve(root, 'bin/just-vibe.mjs');

try {
  for (const target of ['codex', 'claude']) {
    const config = resolve(sandbox, target);
    mkdirSync(config);
    const env = { ...process.env, [target === 'codex' ? 'CODEX_HOME' : 'CLAUDE_CONFIG_DIR']: config };
    for (const command of ['setup', 'setup', 'doctor', 'update', 'doctor', 'uninstall', 'uninstall', 'setup']) {
      console.log(`\nNative smoke: ${target} ${command}`);
      execFileSync(process.execPath, [cli, command, '--target', target, '--local'], {
        cwd: sandbox, env, stdio: 'inherit', timeout: 180_000,
      });
    }
  }
  console.log('\nBoth native plugin lifecycles passed in isolated configuration directories.');
} finally {
  // Only the temporary directory created by this process is removed.
  rmSync(sandbox, { recursive: true, force: true });
}
