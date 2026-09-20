import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
export function fingerprint(root) {
  let complete = true;
  const hash = createHash('sha256');
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) { complete = false; continue; }
      if (entry.isDirectory()) walk(path);
      else { const bytes = readFileSync(path); hash.update(JSON.stringify([relative(root, path), bytes.length])); hash.update(bytes); }
    }
  }
  walk(root); return { complete, digest: hash.digest('hex') };
}
