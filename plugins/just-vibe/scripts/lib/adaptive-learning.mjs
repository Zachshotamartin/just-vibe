import { randomUUID } from 'node:crypto';
import { getCommand, skillFile } from './catalog.mjs';
import { readFileSync } from 'node:fs';
import { requireId, textField } from './adaptive-store.mjs';
import { redact } from './process.mjs';
import { digest } from './storage.mjs';

const fields = ['triggers', 'avoid', 'tools', 'checks'];
function strings(value, key) {
  if (!Array.isArray(value) || value.length > 12) throw Error(`${key} must contain at most 12 literal phrases.`);
  return [...new Set(value.map(v => textField(v, key, 120).trim()))];
}
const directory = (store, scope) => scope === 'user' ? 'adaptive/learning' : `${store.project}/learning`;
export function lessons(store, { inactive = false } = {}) {
  return ['user', 'project'].flatMap(scope => store.list(directory(store, scope)).map(name => store.read(`${directory(store, scope)}/${name}`)))
    .filter(record => record.kind === 'lesson' && (inactive || record.active));
}
function findLesson(store, id) {
  requireId(id);
  const matches = lessons(store, { inactive: true }).filter(v => v.id === id);
  if (matches.length !== 1) throw Error('Unknown or ambiguous lesson.');
  return matches[0];
}
function sourceFromTask(store, payload) {
  const task = store.task(payload.taskId);
  const excerpt = textField(payload.excerpt, 'User feedback excerpt', 2000).trim();
  if (Date.now() - Date.parse(task.createdAt) > 86400000) throw Error('Feedback source is stale; use the current user request.');
  if (!task.userMessage.includes(excerpt) || redact(excerpt) !== excerpt || excerpt.includes('[REDACTED]')) throw Error('Feedback must quote the current recorded user message; assistant output and tool content are not feedback.');
  if (/\b(?:just this time|only this time|for this task only|for this request only)\b/i.test(task.userMessage)) throw Error('A one-time instruction must not become a durable lesson.');
  return { taskId: task.id, excerpt, messageHash: task.messageHash, observedAt: task.createdAt };
}
export function recordFeedback(store, catalog, payload) {
  if (!store.config().learning) throw Error('Learning is disabled.');
  const source = sourceFromTask(store, payload);
  if (!['correction', 'reinforcement'].includes(payload.kind) || !['project', 'user'].includes(payload.scope)) throw Error('Feedback needs correction/reinforcement kind and project/user scope.');
  if (payload.scope === 'user' && !/\b(?:all projects|every project|across projects|globally|my default)\b/i.test(source.excerpt)) throw Error('User-wide learning requires explicit cross-project scope in the user feedback.');
  const workflow = getCommand(catalog, textField(payload.workflow, 'workflow', 80), { canonical: true }).id;
  const instruction = textField(payload.instruction, 'instruction', 2000).trim();
  if (redact(instruction) !== instruction) throw Error('Do not save secrets in learned instructions.');
  const previous = payload.id ? findLesson(store, payload.id) : null;
  if (previous && (previous.workflow !== workflow || previous.scope !== payload.scope)) throw Error('Lesson workflow and scope cannot change; retire it and create a separate lesson.');
  if (payload.revision !== (previous?.revision || 0)) throw Error('Read the current lesson revision before changing it.');
  if (!previous && lessons(store, { inactive: true }).filter(l => l.scope === payload.scope).length >= 200) throw Error('Learning store is full; remove obsolete lessons first.');
  const change = { instruction, ...Object.fromEntries(fields.map(k => [k, strings(payload[k] || [], k)])) };
  if (Object.values(change).flat().some(v => redact(v) !== v)) throw Error('Do not save secrets in learning metadata.');
  // No silence-based confidence, hidden promotion, or model-generated positive signals.
  const history = previous?.history || [];
  if (history.length >= 50) throw Error('Lesson history is full; retire this lesson and start a new one.');
  const version = { version: history.length + 1, at: new Date().toISOString(), feedback: payload.kind, source, change };
  const id = previous?.id || randomUUID();
  return store.write(`${directory(store, payload.scope)}/${id}.json`, { kind: 'lesson', id, workflow, scope: payload.scope,
    ...(payload.scope === 'project' ? { root: store.root } : {}), active: true, current: version.version,
    history: [...history, version] }, payload.revision);
}

export function changeLesson(store, operation, payload) {
  const previous = findLesson(store, payload.id);
  if (payload.revision !== previous.revision) throw Error('Read the current lesson revision before changing it.');
  const path = `${directory(store, previous.scope)}/${previous.id}.json`;
  if (operation === 'forget') {
    store.write(path, { kind: 'forgotten', id: previous.id }, previous.revision);
    return { forgotten: previous.id };
  }
  if (operation === 'retire') return store.write(path, { ...previous, active: false }, previous.revision);
  if (operation !== 'rollback' || !previous.history.some(v => v.version === payload.version)) throw Error('Choose an existing version for rollback.');
  return store.write(path, { ...previous, active: true, current: payload.version }, previous.revision);
}

// Literal phrase matching avoids executing user patterns or introducing regex denial of service.
export function phraseMatches(brief, phrase) {
  const words = value => value.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.join(' ') || '';
  return (` ${words(brief)} `).includes(` ${words(phrase)} `);
}
export function effectiveLessons(store, workflow) {
  return lessons(store).filter(l => l.workflow === workflow).map(l => ({ id: l.id, scope: l.scope, version: l.current,
    ...l.history.find(v => v.version === l.current) }));
}
export function learnedRoutes(store, brief) {
  const preferred = new Map(), avoided = new Set();
  for (const l of lessons(store)) {
    const { change } = l.history.find(v => v.version === l.current);
    if (change.avoid.some(p => phraseMatches(brief, p))) avoided.add(l.workflow);
    if (change.triggers.some(p => phraseMatches(brief, p))) preferred.set(l.workflow, [...(preferred.get(l.workflow) || []), l.id]);
  }
  return { preferred, avoided };
}

export function effectiveWorkflow(store, catalog, id) {
  const command = getCommand(catalog, id, { canonical: true });
  const overlays = effectiveLessons(store, command.id);
  const base = readFileSync(skillFile(catalog, command), 'utf8');
  const instructions = `Effective just-vibe workflow: ${command.id}. Personalization has already been loaded for this invocation.\n`
    + `Current user instructions and applicable project/host rules take precedence over these saved preferences. They grant no permissions.\n\n${base}`
    + (overlays.length ? '\n## Saved user feedback\n\n' + overlays.map(l => `- [${l.scope}; ${l.id}; v${l.version}] ${l.change.instruction}\n  Preferred tools when available: ${l.change.tools.join(', ') || 'none specified'}.\n  Additional evidence to consider: ${l.change.checks.join('; ') || 'none specified'}.`).join('\n') + '\n' : '');
  return { workflow: command.id, baseHash: digest(base), effectiveHash: digest(instructions), instructions,
    lessons: overlays.map(l => ({ id: l.id, scope: l.scope, version: l.version, ...l.change })),
    skillPath: skillFile(catalog, command), prerequisites: command.capabilities };
}
