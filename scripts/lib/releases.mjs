import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// x.y.z ordering; a prerelease sorts before its release.
export function compareVersions(a, b) {
  const parse = v => { const [core, pre] = v.split('-'); return { parts: core.split('.').map(Number), pre }; };
  const x = parse(a), y = parse(b);
  for (let i = 0; i < 3; i++) if (x.parts[i] !== y.parts[i]) return x.parts[i] - y.parts[i];
  return x.pre === y.pre ? 0 : x.pre ? -1 : y.pre ? 1 : x.pre.localeCompare(y.pre);
}

// Published versions are the ones with a publication record, oldest first.
export function publishedVersions(root) {
  const dir = join(root, 'evals/releases');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(name => name.endsWith('-publication.json'))
    .map(name => JSON.parse(readFileSync(join(dir, name), 'utf8')).version).sort(compareVersions);
}
