import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RULE_PACKS } from './rule-packs.mjs';

export function selectedRules(store, catalog) {
  const path = join(catalog.root, 'selection.json');
  const installed = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')).rules || [] : [];
  const configured = store.read(`${store.project}/runtime/integration.json`)?.rules;
  const ids = configured ?? installed;
  if (!Array.isArray(ids) || ids.some((id) => !RULE_PACKS.some((r) => r.id === id)))
    throw Error('Invalid selected rule packs; inspect setup configuration.');
  return RULE_PACKS.filter((r) => ids.includes(r.id));
}
export function ruleInstructions(packs) {
  return packs.length
    ? '\n## Selected technical rules\n\nApply each pack only to relevant files and the current task.\n' +
        packs
          .map(
            (r) =>
              `\n### ${r.id}: ${r.files.join(', ')}\n${r.rules.map((text) => `- ${text}`).join('\n')}`,
          )
          .join('\n') +
        '\n'
    : '';
}
