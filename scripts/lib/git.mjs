import { execFileSync } from 'node:child_process';

// Release checks belong to the selected checkout, even when invoked from a Git hook.
export function releaseEnvironment(env = process.env) {
  return Object.fromEntries(
    Object.entries(env).filter(([key]) => !key.toUpperCase().startsWith('GIT_')),
  );
}

export function releaseGit(root, args) {
  return execFileSync('git', ['--no-pager', '--no-replace-objects', ...args], {
    cwd: root,
    env: releaseEnvironment(),
    encoding: 'utf8',
  }).trim();
}
