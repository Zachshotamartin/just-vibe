import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadCatalog, pluginRoot } from './catalog.mjs';
import { fail, identifier, line, lines, record } from './catalog-schema.mjs';
import { normalize } from './search.mjs';
import { loadMethods } from './method-library.mjs';

const text = value => typeof value === 'string' && Boolean(value.trim());
// Router and catalog entry points, not role methods; a profile link to them re-enters routing.
export const META_WORKFLOWS = ['auto', 'do', 'help', 'tools', 'setup', 'profile', 'profiles'];
const profileFields = ['id', 'name', 'family', 'summary', 'priorities', 'decision', 'verification', 'boundary', 'workflows', 'example', 'contribution'];

// Callers that bundle the catalogs (the website) pass the method records they imported.
export function validateProfiles(data, commands = loadCatalog(), methods = null) {
  let known = null;
  const methodIds = () => (known ??= new Set((methods ?? loadMethods()).map(m => m.id)));
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
    record(p, label, profileFields, ['searchTerms', 'methods']);
    for (const field of ['name', 'summary']) line(p[field], label, field, { table: true });
    for (const field of ['decision', 'boundary', 'example', 'contribution']) line(p[field], label, field);
    for (const field of ['priorities', 'verification']) lines(p[field], label, field, { max: 6 });
    lines(p.workflows, label, 'workflows', { max: 5, each: identifier });
    if (p.searchTerms !== undefined) lines(p.searchTerms, label, 'searchTerms', { max: 20 });
    // Specialist method guides the role needs even when the brief lacks their trigger words.
    if (p.methods !== undefined) lines(p.methods, label, 'methods', { max: 5, each: (id, l, f) => { identifier(id, l, f); if (!methodIds().has(id)) fail(l, f, `names an unknown method: ${id}.`); } });
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

// Profile search shares the workflow router's normalization (stems, stopwords, phrases), so
// "and", "design" or "build" no longer decide the ranking. Distinctive name words and searchTerms
// dominate; summaries count by rarity; examples, contributions and checks are weak detail evidence.
const PROFILE_PHRASES = [[/\bfull[-\s]?stack\b/gi, ' fullstack '], [/\b(?:developer|dev|programmer)s?\b/gi, ' engineer ']];
const STEM_SYNONYMS = { architectur: ['architect'] };
const profileStems = text => normalize(PROFILE_PHRASES.reduce((t, [re, to]) => t.replace(re, to), text))
  .flatMap(t => [t.stem, ...(STEM_SYNONYMS[t.stem] || [])]);
const profileIndexes = new WeakMap();
function profileIndex(data) {
  if (profileIndexes.has(data)) return profileIndexes.get(data);
  const entries = data.profiles.map(p => ({
    profile: p,
    identity: new Set(profileStems(`${p.id.replace(/-/g, ' ')} ${p.name}`)),
    family: new Set(profileStems(p.family.replace(/-/g, ' '))),
    summary: new Set(profileStems(p.summary)),
    detail: new Set(profileStems([...p.priorities, p.decision, ...p.verification, p.boundary, p.example, p.contribution].join(' '))),
    terms: (p.searchTerms || []).map(profileStems).filter(t => t.length),
  }));
  const df = key => { const counts = {}; for (const e of entries) for (const t of e[key]) counts[t] = (counts[t] || 0) + 1; return counts; };
  const text = {};
  for (const e of entries) for (const t of new Set([...e.summary, ...e.detail])) text[t] = (text[t] || 0) + 1;
  const index = { entries, identity: df('identity'), summary: df('summary'), detail: df('detail'), text };
  profileIndexes.set(data, index);
  return index;
}
const contains = (tokens, term) => tokens.some((_, i) => term.every((t, j) => tokens[i + j] === t));

export function searchProfiles(data, query = '') {
  const exact = query.trim().toLowerCase();
  const tokens = [...new Set(profileStems(query))];
  const { entries, identity, summary, detail, text } = profileIndex(data);
  return entries.map(({ profile: p, ...e }) => {
    if (p.id === exact || p.name.toLowerCase() === exact) return { ...p, score: 1000 };
    let score = 0;
    for (const t of tokens) {
      // A word in most profile names ("engineer") identifies nothing on its own, and a name word that
      // is also ordinary task vocabulary ("build", "design", "test") is weaker evidence than "kubernetes".
      if (e.identity.has(t)) score += identity[t] > 12 ? 1 : !text[t] || text[t] <= 8 ? 10 : text[t] <= 20 ? 6 : 3;
      else if (e.summary.has(t)) score += summary[t] <= 2 ? 4 : summary[t] <= 5 ? 3 : summary[t] <= 12 ? 2 : 1;
      else if (e.detail.has(t)) score += detail[t] <= 5 ? 1 : detail[t] <= 20 ? 0.5 : 0;
      else if (e.family.has(t)) score += 1;
    }
    for (const term of e.terms) if (contains(tokens, term)) score += Math.min(8 + 2 * (term.length - 1), 14);
    return { ...p, score };
  }).filter(p => !tokens.length || p.score > 0).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
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
