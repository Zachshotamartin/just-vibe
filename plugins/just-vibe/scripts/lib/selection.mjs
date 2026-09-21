import {
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { join } from 'node:path';
import { RULE_PACKS, renderRule } from './rule-packs.mjs';
import { object } from './runtime-store.mjs';
export const INSTALL_PROFILES = {
  full: null,
  core: ['general', 'installation'],
  frontend: [
    'general',
    'installation',
    'react',
    'vite',
    'ui',
    'vercel',
    'git',
    'github',
    'testing',
  ],
  backend: [
    'general',
    'installation',
    'backend',
    'api',
    'database',
    'git',
    'github',
    'security',
    'testing',
  ],
  ml: [
    'general',
    'installation',
    'data',
    'ml-data',
    'ml-experiments',
    'ml-evaluation',
    'ml-deployment',
    'llm',
    'git',
    'github',
  ],
};
export function selectPayload(catalog, selection = {}) {
  object(selection, ['profile', 'packs', 'rules']);
  const profile = selection.profile || 'full';
  if (!Object.hasOwn(INSTALL_PROFILES, profile))
    throw Error(`Unknown install profile. Choose ${Object.keys(INSTALL_PROFILES).join(', ')}.`);
  const packs = selection.packs || [];
  if (!Array.isArray(packs) || packs.some((p) => !catalog.packs.some((c) => c.id === p)))
    throw Error('Unknown install pack.');
  const rules = selection.rules || [];
  if (!Array.isArray(rules) || rules.some((r) => !RULE_PACKS.some((p) => p.id === r)))
    throw Error('Unknown language rule pack.');
  const selectedPacks = packs.length
    ? new Set(['general', 'installation', ...packs])
    : profile === 'full'
      ? null
      : new Set(INSTALL_PROFILES[profile]);
  const ids = catalog.commands
    .filter((c) => !selectedPacks || selectedPacks.has(c.pack))
    .map((c) => c.id);
  for (const id of [...ids]) {
    const c = catalog.commands.find((c) => c.id === id);
    if (c.aliasOf && !ids.includes(c.aliasOf)) ids.push(c.aliasOf);
  }
  return { schemaVersion: 1, profile, packs, rules: [...new Set(rules)], ids: ids.sort() };
}
export function applySelection(plugin, selection, catalog) {
  const resolved = selectPayload(catalog, selection),
    ids = new Set(resolved.ids);
  for (const c of catalog.commands) {
    const path = join(plugin, c.skillPath);
    const reference = path.replace(/SKILL\.md$/, 'REFERENCE.md');
    if (!ids.has(c.id) && existsSync(path)) renameSync(path, reference);
    else if (ids.has(c.id) && !existsSync(path) && existsSync(reference))
      renameSync(reference, path);
  }
  // Keep excluded methods readable and their links valid, without exposing them
  // as native skills. Runtime assets and reference material remain complete.
  const excluded = new Set(catalog.commands.filter((c) => !ids.has(c.id)).map((c) => c.id));
  function rewrite(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) rewrite(path);
      else if (entry.isFile() && path.endsWith('.md')) {
        const text = readFileSync(path, 'utf8');
        const next = text.replace(/([a-z0-9-]+)\/(?:SKILL|REFERENCE)\.md/g, (match, id) =>
          excluded.has(id) ? `${id}/REFERENCE.md` : ids.has(id) ? `${id}/SKILL.md` : match,
        );
        if (next !== text) writeFileSync(path, next);
      }
    }
  }
  rewrite(join(plugin, 'skills'));
  rewrite(join(plugin, 'references'));
  if (existsSync(join(plugin, 'agents'))) rewrite(join(plugin, 'agents'));
  for (const id of resolved.rules) {
    const directory = join(plugin, 'skills', `just-vibe-rules-${id}`);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'SKILL.md'), renderRule(RULE_PACKS.find((p) => p.id === id)));
  }
  writeFileSync(join(plugin, 'selection.json'), JSON.stringify(resolved, null, 2) + '\n');
  return resolved;
}
