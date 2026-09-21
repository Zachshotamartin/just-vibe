import { execFileSync } from 'node:child_process';
import { releaseEnvironment } from './git.mjs';

// The caller supplies an owned empty directory, separate from the checkout.
// Fixture commits must never invoke user hooks, signing programs or fsmonitor.
export function fixtureGit(root, hooksDirectory, args, env = process.env) {
  return execFileSync('git', [
    '--no-pager', '--no-replace-objects',
    '-c', `core.hooksPath=${hooksDirectory}`,
    '-c', 'commit.gpgSign=false',
    '-c', 'core.fsmonitor=false',
    ...args,
  ], {
    cwd: root, env: releaseEnvironment(env), encoding: 'utf8',
    timeout: 10000, maxBuffer: 1024 * 1024,
  });
}
