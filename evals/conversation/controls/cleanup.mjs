import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
export function cleanupToken(root) {
  const git = args => execFileSync('git', args, { cwd: root });
  const hash = createHash('sha256').update(git(['ls-files', '--stage', '-z']));
  const names = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).toString().split('\0').filter(Boolean);
  for (const name of [...new Set(names)].sort()) {
    hash.update(JSON.stringify(name));
    try { const bytes = readFileSync(join(root, name)); hash.update(`${bytes.length}:`); hash.update(bytes); }
    catch (error) { if (error.code !== 'ENOENT') throw error; hash.update('absent'); }
  }
  return hash.digest('hex');
}
