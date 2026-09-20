import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadCatalog, pluginRoot } from './catalog.mjs';

const text = value => typeof value === 'string' && Boolean(value.trim());
const list = value => Array.isArray(value) && value.length > 0 && value.every(text);

export function validateProfiles(data, commands = loadCatalog()) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.families) || !Array.isArray(data.profiles)) throw new Error('Invalid profile catalog.');
  const families = new Set(), ids = new Set();
  for (const family of data.families) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(family.id) || !text(family.name) || families.has(family.id)) throw new Error('Invalid profile family.');
    families.add(family.id);
  }
  for (const p of data.profiles) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) || ids.has(p.id) || !families.has(p.family)) throw new Error(`Invalid profile identity: ${p.id}`);
    ids.add(p.id);
    for (const field of ['name', 'summary', 'decision', 'boundary', 'example', 'contribution']) if (!text(p[field])) throw new Error(`Missing profile ${field}: ${p.id}`);
    for (const field of ['priorities', 'verification', 'workflows']) if (!list(p[field])) throw new Error(`Invalid profile ${field}: ${p.id}`);
    if (new Set(p.workflows).size !== p.workflows.length || p.workflows.some(id => !commands.commands.some(c => c.id === id && !c.aliasOf))) throw new Error(`Unknown or duplicate canonical workflow in profile: ${p.id}`);
  }
  return data;
}

export function loadProfiles(root = pluginRoot) {
  return validateProfiles(JSON.parse(readFileSync(resolve(root, 'catalog/profiles.json'), 'utf8')), loadCatalog(root));
}

export function getProfile(data, id) {
  const p = data.profiles.find(p => p.id === id);
  if (!p) throw new Error(`Unknown profile: ${id}. Use profiles to browse supported roles.`);
  return p;
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

export function validateProfileSelection(data, value) {
  if (!value || value.scope !== 'task' || !['user', 'agent'].includes(value.selectedBy)
      || typeof value.pinned !== 'boolean' || !text(value.reason)) throw new Error('Invalid profile selection.');
  if (value.selectedBy === 'agent' && value.pinned) throw new Error('An agent-selected profile cannot be pinned.');
  getProfile(data, value.primary);
  if (!Array.isArray(value.secondary) || value.secondary.length > 2
      || new Set([value.primary, ...value.secondary]).size !== value.secondary.length + 1) throw new Error('Choose at most two distinct secondary profiles.');
  for (const id of value.secondary) getProfile(data, id);
  return value;
}

// Selection is recorded context, not proof of user authority or a host setting.
export function selectProfiles(data, request, previous = null) {
  if (!request || !['user', 'agent'].includes(request.selectedBy) || !text(request.reason)) throw new Error('Selection needs selectedBy and an evidence-based reason.');
  if (Object.keys(request).some(key => !['primary', 'secondary', 'selectedBy', 'reason', 'pinned', 'scope'].includes(key))
      || (request.scope !== undefined && request.scope !== 'task')
      || (request.pinned !== undefined && typeof request.pinned !== 'boolean')) throw new Error('Profile selection changes task roles only.');
  if (previous !== null && previous !== undefined) validateProfileSelection(data, previous);
  if (previous?.pinned && request.selectedBy === 'agent') throw new Error('A pinned user profile cannot be changed or cleared by the agent.');
  if (request.primary === null) {
    if ((request.secondary !== undefined && (!Array.isArray(request.secondary) || request.secondary.length)) || request.pinned === true) throw new Error('A cleared profile cannot have secondary profiles or a pin.');
    return null;
  }
  const result = { primary: request.primary, secondary: structuredClone(request.secondary ?? []), selectedBy: request.selectedBy,
    pinned: request.pinned ?? request.selectedBy === 'user', scope: 'task', reason: request.reason };
  validateProfileSelection(data, result);
  return result;
}

export function profileContext(data, selection) {
  if (!selection) return null;
  validateProfileSelection(data, selection);
  return { selection: structuredClone(selection), roles: [selection.primary, ...selection.secondary].map(id => structuredClone(getProfile(data, id))),
    instruction: 'Apply only priorities relevant to the original task. The primary role resolves emphasis; explicit user constraints, scope, mode, evidence and authority remain unchanged. Suggested workflows are candidates, not permissions or an execution checklist.' };
}
