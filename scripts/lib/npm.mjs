import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Invoke npm's JS entry point directly, including on Windows; never shell-expand paths.
export function npm(args, options = {}) {
  const candidates = [process.env.npm_execpath,
    resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')];
  const entry = candidates.find(path => path && /npm-cli\.js$/.test(path) && existsSync(path));
  if (entry) return execFileSync(process.execPath, [entry, ...args], options);
  if (process.platform === 'win32') throw new Error('Run this check through npm run so npm_execpath is available.');
  return execFileSync('npm', args, options);
}
