import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
export function fingerprint(root) {
  const hash = createHash('sha256');
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) walk(path);
      else { hash.update(relative(root, path) + '\0'); hash.update(readFileSync(path)); }
    }
  }
  walk(root);
  return { complete: true, digest: hash.digest('hex') };
}
