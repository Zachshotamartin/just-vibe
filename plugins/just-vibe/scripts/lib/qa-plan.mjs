import { readFileSync, lstatSync } from 'node:fs';
import { object, text, name, safePath } from './workbench.mjs';
import { redact } from './process.mjs';

export function validateCoverage(value, request, criteria) {
  if (value === undefined) return { reviewed: false, requirements: [] };
  object(value, ['reviewed', 'reviewNote', 'requirements']);
  if (typeof value.reviewed !== 'boolean') throw Error('Coverage reviewed must be boolean');
  text(value.reviewNote, 'Coverage review note', 2000);
  if (redact(value.reviewNote) !== value.reviewNote) throw Error('Coverage must not contain secrets');
  if (!Array.isArray(value.requirements) || !value.requirements.length || value.requirements.length > 30) throw Error('Map 1–30 request requirements');
  const ids = new Set();
  for (const r of value.requirements) {
    object(r, ['id', 'text', 'sourceQuote', 'criteria', 'uncoveredReason']); name(r.id);
    text(r.text, 'Requirement', 2000); text(r.sourceQuote, 'Request quote', 2000);
    if (ids.has(r.id) || !request.includes(r.sourceQuote)) throw Error('Requirements need unique IDs and literal request quotes');
    ids.add(r.id);
    if (!Array.isArray(r.criteria) || r.criteria.length > 12 || new Set(r.criteria).size !== r.criteria.length || r.criteria.some(id => !criteria.some(c => c.id === id))) throw Error('Map known criterion IDs');
    if (!r.criteria.length) text(r.uncoveredReason, 'Uncovered requirement reason', 2000);
    if ([r.text, r.sourceQuote, r.uncoveredReason || ''].some(v => redact(v) !== v)) throw Error('Coverage must not contain secrets');
  }
  return value;
}
export function coverageStatus(record) {
  const c = record.coverage;
  const complete = c?.reviewed === true && c.requirements.length > 0 && c.requirements.every(r => r.criteria.length > 0);
  return { complete, uncovered: (c?.requirements || []).filter(r => !r.criteria.length), note: complete ? 'Declared requirements are mapped. Completeness is a reviewed interpretation of the request, not a proof that no requirement was omitted.' : 'Acceptance is incomplete: review the request map and explicitly cover or report omitted requirements. Passing assertions alone do not establish complete delivery.' };
}
export function allowedOrigins(target, values = []) {
  if (!Array.isArray(values) || new Set(values.filter(v => v !== new URL(target).origin)).size > 8 || values.length > 9) throw Error('Allow at most eight origins');
  const origins = values.map(value => {
    text(value, 'Allowed origin', 2000); const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== value || url.username || url.password) throw Error('Use exact HTTP(S) origins without paths or credentials');
    return url.origin;
  });
  return [...new Set([new URL(target).origin, ...origins])];
}
export function authState(root, input, origins) {
  if (input.storageState === undefined) return undefined;
  if (input.authorizeAuth !== true) throw Error('Explicitly authorize use of the saved test session with authorizeAuth:true');
  const file = safePath(root, input.storageState, { managed: true });
  if (!input.storageState.startsWith('.just-vibe/qa-auth/')) throw Error('Keep test sessions in .just-vibe/qa-auth/');
  if (!lstatSync(file).isFile() || lstatSync(file).size > 2 * 1024 * 1024) throw Error('Test session must be a regular JSON file up to 2 MiB');
  let state;
  try { state = JSON.parse(readFileSync(file, 'utf8')); } catch { throw Error('Invalid saved test session JSON'); }
  if (!Array.isArray(state.cookies) || !Array.isArray(state.origins)) throw Error('Use Playwright storage state');
  const hosts = origins.map(o => new URL(o).hostname);
  return { cookies: state.cookies.filter(c => typeof c.domain === 'string' && hosts.some(h => h === c.domain.replace(/^\./, '') || (c.domain.startsWith('.') && h.endsWith(c.domain)))), origins: state.origins.filter(o => origins.includes(o.origin)) };
}
