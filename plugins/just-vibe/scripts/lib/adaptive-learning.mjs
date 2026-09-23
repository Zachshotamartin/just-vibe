import { randomUUID } from 'node:crypto';
import { getCommand, skillFile } from './catalog.mjs';
import { readFileSync, mkdirSync } from 'node:fs';
import { requireId, textField } from './adaptive-store.mjs';
import { redact } from './process.mjs';
import { digest, within } from './storage.mjs';
import { withFileLock } from './file-lock.mjs';
import { selectedRules, ruleInstructions } from './effective-rules.mjs';

const fields = ['triggers', 'avoid', 'tools', 'checks', 'conditions', 'exceptions'];
function strings(value, key) {
  if (!Array.isArray(value) || value.length > 12) throw Error(`${key} must contain at most 12 literal phrases.`);
  return [...new Set(value.map(v => textField(v, key, 120).trim()))];
}
const directory = (store, scope) => scope === 'user' ? 'adaptive/learning' : `${store.project}/learning`;
export function lessons(store, { inactive = false } = {}) {
  return (store.allowUser === false ? ['project'] : ['user', 'project']).flatMap(scope => store.list(directory(store, scope)).map(name => store.read(`${directory(store, scope)}/${name}`)))
    .filter(record => record.kind === 'lesson' && (inactive || record.active));
}
export function saveLesson(store, scope, value, revision = 0) {
  if (!['project', 'user'].includes(scope) || (scope === 'user' && store.allowUser === false)) throw Error('Choose an available lesson scope.');
  const path = `${directory(store, scope)}/${requireId(value.id)}.json`;
  if (revision !== 0) return store.write(path, value, revision);
  mkdirSync(store.home, { recursive: true, mode: 0o700 });
  // Each lesson has its own revision lock, but capacity is shared by all new
  // records in this scope, including feedback and recovered approvals.
  return withFileLock(within(store.home, `${directory(store, scope)}/.creation.json.lock`), () => {
    if (lessons(store, { inactive: true }).filter(l => l.scope === scope).length >= 200)
      throw Error('Learning store is full; forget obsolete lessons first.');
    return store.write(path, value, 0);
  });
}
function findLesson(store, id) {
  requireId(id);
  const matches = lessons(store, { inactive: true }).filter(v => v.id === id);
  if (matches.length !== 1) throw Error('Unknown or ambiguous lesson.');
  return matches[0];
}
export function sourceFromTask(store, payload) {
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
  return saveLesson(store, payload.scope, { kind: 'lesson', id, workflow, scope: payload.scope,
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
export function resolvePreferences(store, workflow, task) {
  const all = effectiveLessons(store, workflow), ignored = new Set(task?.ignoredLessons || []);
  const eligible = all.filter(l => !ignored.has(l.id)), conflicts = [], suppressed = [];
  const groups = new Map();
  for (const lesson of eligible) if (lesson.change.setting) {
    const key = lesson.change.setting.key;
    groups.set(key, [...(groups.get(key) || []), lesson]);
  }
  for (const [key, group] of groups) {
    if (group.some(l => l.change.conditions?.length || l.change.exceptions?.length)) {
      conflicts.push({ key, kind: 'conditional-setting-review', ids: group.map(l => l.id), detail: 'These settings have natural-language conditions or exceptions. Evaluate applicability for the current task; an applicable project setting overrides a user default. Do not silently discard the fallback or guess which condition holds.' });
      continue;
    }
    const scoped = group.some(l => l.scope === 'project') ? group.filter(l => l.scope === 'project') : group;
    suppressed.push(...group.filter(l => !scoped.includes(l)).map(l => l.id));
    if (new Set(scoped.map(l => l.change.setting.value)).size > 1) {
      conflicts.push({ key, kind: 'conflicting-setting', ids: scoped.map(l => l.id), detail: 'Different values at the same scope. Resolve or ignore a preference for this task; none of these conflicting settings is loaded.' });
      suppressed.push(...scoped.map(l => l.id));
    }
  }
  const unstructured = eligible.filter(l => !l.change.setting);
  if (unstructured.length > 1 && new Set(unstructured.map(l => l.change.instruction)).size > 1) conflicts.push({ kind: 'review-overlap', ids: unstructured.map(l => l.id), detail: 'Several instructions affect this workflow. Review for semantic conflicts; literal analysis cannot determine whether they disagree.' });
  return { overlays: eligible.filter(l => !suppressed.includes(l.id)), ignored: [...ignored], suppressed, conflicts };
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

export function effectiveWorkflow(store, catalog, id, task) {
  const command = getCommand(catalog, id, { canonical: true });
  const { overlays, conflicts, suppressed, ignored } = resolvePreferences(store, command.id, task);
  const base = readFileSync(skillFile(catalog, command), 'utf8');
  const rules = selectedRules(store, catalog);
  const instructions = `Effective just-vibe workflow: ${command.id}. Personalization has already been loaded for this invocation.\n`
    + `Current user instructions and applicable project/host rules take precedence over these saved preferences. They grant no permissions.\n\n${base}` + ruleInstructions(rules)
    + (conflicts.length ? '\nPreference review: ' + JSON.stringify(conflicts) + '\n' : '')
    + (overlays.length ? '\n## Saved user feedback\n\n' + overlays.map(l => `- [${l.scope}; ${l.id}; v${l.version}] ${l.change.instruction}${l.change.setting ? `\n  Setting: ${l.change.setting.key}=${l.change.setting.value}.` : ''}\n  Apply when: ${(l.change.conditions || []).join('; ') || 'this workflow is relevant'}.\n  Exceptions: ${(l.change.exceptions || []).join('; ') || 'none specified; current user instructions take precedence'}.\n  Preferred tools when available: ${l.change.tools.join(', ') || 'none specified'}.\n  Additional evidence to consider: ${l.change.checks.join('; ') || 'none specified'}.`).join('\n') + '\n' : '');
  return { workflow: command.id, conflicts, suppressed, ignored, baseHash: digest(base), effectiveHash: digest(instructions), instructions,
    lessons: overlays.map(l => ({ id: l.id, scope: l.scope, version: l.version, ...l.change })),
    rules: rules.map((r) => r.id), skillPath: skillFile(catalog, command), prerequisites: command.capabilities };
}
