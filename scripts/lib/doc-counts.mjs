import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Hand-written counts drift. A sentence that states a current count must match the catalog;
// a sentence that names a release (v0.10.0, "Version 0.10.0") is historical and is skipped.
const CLAIMS = [
  { key: 'mcpTools', pattern: /\b(\d+)\s+MCP tools\b|\bMCP catalog (?:now )?(?:has|contains|lists) (\d+) tools\b/g },
  { key: 'skillNames', pattern: /\b(\d+) (?:shipped )?skill names\b/g },
  { key: 'workflows', pattern: /\b(\d+) canonical workflows\b/g },
  { key: 'profiles', pattern: /\b(\d+) (?:engineering|task|role) profiles\b/g },
];
const HISTORICAL = /\bv\d+\.\d+|\b\d+\.\d+\.\d+\b|\bVersion \d/i;
export const COUNTED_DOCS = ['plugins/just-vibe/references', 'docs/runtime-tools.md', 'docs/compatibility.md', 'docs/command-quality.md',
  'README.md', 'website/README.md', 'website/src/pages/docs'];

export function countClaims(text, actual) {
  const stale = [];
  for (const sentence of text.split(/(?<=[.!?])\s+|\n{2,}/)) {
    if (HISTORICAL.test(sentence)) continue;
    for (const { key, pattern } of CLAIMS) for (const match of sentence.matchAll(pattern)) {
      const value = Number(match[1] ?? match[2]);
      if (actual[key] !== undefined && value !== actual[key]) stale.push({ key, stated: value, actual: actual[key], text: match[0] });
    }
  }
  return stale;
}

function files(root, path) {
  const full = join(root, path);
  if (!statSync(full, { throwIfNoEntry: false })) return [];
  if (statSync(full).isFile()) return [full];
  return readdirSync(full, { recursive: true }).map(name => join(full, name)).filter(name => /\.(?:md|astro)$/.test(name) && statSync(name).isFile());
}

export function staleDocCounts(root, actual) {
  return COUNTED_DOCS.flatMap(path => files(root, path)).flatMap(file =>
    countClaims(readFileSync(file, 'utf8'), actual).map(claim => ({ file: relative(root, file), ...claim })));
}
