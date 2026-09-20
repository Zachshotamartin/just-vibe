import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
export function cleanupToken(root) {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const hash = createHash('sha256');
  for (const name of [...new Set(files)].sort()) {
    hash.update(name + '\0');
    try { hash.update(readFileSync(join(root, name))); } catch (e) { if (e.code !== 'ENOENT') throw e; hash.update('missing'); }
  }
  return hash.digest('hex');
}
