import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadCatalog, pluginRoot } from './catalog.mjs';
import { fail, identifier, line, lines, record } from './catalog-schema.mjs';

const text = value => typeof value === 'string' && Boolean(value.trim());
// Router and catalog entry points, not role methods; a profile link to them re-enters routing.
export const META_WORKFLOWS = ['auto', 'do', 'help', 'tools', 'setup', 'profile', 'profiles'];
const profileFields = ['id', 'name', 'family', 'summary', 'priorities', 'decision', 'verification', 'boundary', 'workflows', 'example', 'contribution'];

export function validateProfiles(data, commands = loadCatalog()) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.families) || !Array.isArray(data.profiles)) throw new Error('Invalid profile catalog.');
  const families = new Set(), ids = new Set(), names = new Set();
  for (const family of data.families) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(family?.id) || !text(family.name) || families.has(family.id)) throw new Error('Invalid profile family.');
    record(family, `Profile family ${family.id}`, ['id', 'name']);
    line(family.name, `Profile family ${family.id}`, 'name', { table: true });
    families.add(family.id);
  }
  for (const p of data.profiles) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p?.id) || ids.has(p.id) || !families.has(p.family)) throw new Error(`Invalid profile identity: ${p?.id}`);
    ids.add(p.id);
    const label = `Profile ${p.id}`;
    record(p, label, profileFields, ['searchTerms']);
    for (const field of ['name', 'summary']) line(p[field], label, field, { table: true });
    for (const field of ['decision', 'boundary', 'example', 'contribution']) line(p[field], label, field);
    for (const field of ['priorities', 'verification']) lines(p[field], label, field, { max: 6 });
    lines(p.workflows, label, 'workflows', { max: 5, each: identifier });
    if (p.searchTerms !== undefined) lines(p.searchTerms, label, 'searchTerms', { max: 20 });
    if (names.has(p.name.toLowerCase())) fail(label, 'name', 'duplicates another profile name.');
    names.add(p.name.toLowerCase());
    if (p.workflows.some(id => !commands.commands.some(c => c.id === id && !c.aliasOf))) throw new Error(`Unknown or duplicate canonical workflow in profile: ${p.id}`);
    if (p.workflows.some(id => META_WORKFLOWS.includes(id))) fail(label, 'workflows', `must link task methods, not router or catalog commands (${META_WORKFLOWS.join(', ')}).`);
  }
  for (const family of families) if (!data.profiles.some(p => p.family === family)) throw new Error(`Profile family has no profiles: ${family}`);
  return data;
}

export function loadProfiles(root = pluginRoot) {
  return validateProfiles(JSON.parse(readFileSync(resolve(root, 'catalog/profiles.json'), 'utf8')), loadCatalog(root));
}

// Ids resolve case-insensitively and by display name; a miss suggests the closest roles.
export function getProfile(data, id) {
  const wanted = typeof id === 'string' ? id.trim().toLowerCase() : '';
  const found = data.profiles.find(p => p.id === wanted || p.name.toLowerCase() === wanted);
  if (found) return found;
  const near = wanted ? searchProfiles(data, wanted).slice(0, 3).map(p => p.id) : [];
  throw new Error(`Unknown profile: ${id}.${near.length ? ` Closest: ${near.join(', ')}.` : ''} Use profiles to browse supported roles.`);
}

export function searchProfiles(data, query = '') {
  const exact = query.trim().toLowerCase();
  const words = exact.match(/[a-z0-9]+/g) || [];
  const synonyms = { architecture: ['architect'], ml: ['machine', 'learning'], sre: ['site', 'reliability'], a11y: ['accessibility'] };
  for (const word of [...words]) words.push(...(synonyms[word] || []));
  return data.profiles.map(p => {
    const identity = `${p.id} ${p.name} ${p.family}`.toLowerCase().match(/[a-z0-9]+/g) || [];
    const detail = `${p.summary} ${p.priorities.join(' ')}`.toLowerCase().match(/[a-z0-9]+/g) || [];
    const score = p.id === exact || p.name.toLowerCase() === exact ? 1000
      : words.reduce((score, word) => score + (identity.includes(word) ? 10 : detail.includes(word) ? 1 : 0), 0);
    return { ...p, score };
  }).filter(p => !words.length || p.score > 0).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

const SELECTION_FIELDS = ['primary', 'secondary', 'selectedBy', 'reason', 'pinned', 'scope'];
const invalid = detail => new Error(`Invalid profile selection: ${detail}.`);
// Stored selections use canonical ids so pin and distinctness checks compare like with like.
const storedId = (data, id) => {
  const canonical = getProfile(data, id).id;
  if (canonical !== id) throw invalid(`store the profile id ${canonical}, not ${id}`);
};

export function validateProfileSelection(data, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid('expected an object');
  if (value.scope !== 'task') throw invalid('scope must be "task"');
  if (!['user', 'agent'].includes(value.selectedBy)) throw invalid('selectedBy must be user or agent');
  if (typeof value.pinned !== 'boolean') throw invalid('pinned must be true or false');
  if (!text(value.reason)) throw invalid('reason is required');
  if (value.selectedBy === 'agent' && value.pinned) throw new Error('An agent-selected profile cannot be pinned.');
  storedId(data, value.primary);
  if (!Array.isArray(value.secondary) || value.secondary.length > 2
      || new Set([value.primary, ...value.secondary]).size !== value.secondary.length + 1) throw new Error('Choose at most two distinct secondary profiles.');
  for (const id of value.secondary) storedId(data, id);
  return value;
}

// Selection is recorded context, not proof of user authority or a host setting.
export function selectProfiles(data, request, previous = null) {
  if (!request || !['user', 'agent'].includes(request.selectedBy) || !text(request.reason)) throw invalid('selectedBy (user or agent) and an evidence-based reason are required');
  const unknown = Object.keys(request).filter(key => !SELECTION_FIELDS.includes(key));
  if (unknown.length) throw invalid(`unknown field ${unknown.join(', ')}; a selection changes task roles only`);
  if (request.scope !== undefined && request.scope !== 'task') throw invalid('scope must be "task"');
  if (request.pinned !== undefined && typeof request.pinned !== 'boolean') throw invalid('pinned must be true or false');
  if (request.secondary !== undefined && request.secondary !== null && !Array.isArray(request.secondary)) throw invalid('secondary must be a list of profile ids');
  if (previous !== null && previous !== undefined) validateProfileSelection(data, previous);
  if (previous?.pinned && request.selectedBy === 'agent') throw new Error('A pinned user profile cannot be changed or cleared by the agent.');
  if (request.primary === null) {
    if ((request.secondary !== undefined && (!Array.isArray(request.secondary) || request.secondary.length)) || request.pinned === true) throw new Error('A cleared profile cannot have secondary profiles or a pin.');
    return null;
  }
  const result = { primary: getProfile(data, request.primary).id, secondary: (request.secondary ?? []).map(id => getProfile(data, id).id), selectedBy: request.selectedBy,
    pinned: request.pinned ?? request.selectedBy === 'user', scope: 'task', reason: request.reason };
  validateProfileSelection(data, result);
  return result;
}
