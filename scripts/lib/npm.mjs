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

// npm <=11 emits an array; npm 12 keys pack results by package name.
export function packResult(output) {
  const parsed = JSON.parse(output);
  const results = Array.isArray(parsed) ? parsed : Object.values(parsed);
  if (results.length !== 1 || !results[0]?.filename || !Array.isArray(results[0]?.files)) {
    throw new Error('Expected exactly one npm archive with its file inventory.');
  }
  return results[0];
}
