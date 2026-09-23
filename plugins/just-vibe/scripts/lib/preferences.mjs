import { adaptiveStore } from './adaptive-store.mjs';
import { lessons, changeLesson, phraseMatches, saveLesson } from './adaptive-learning.mjs';
import { routeRequest } from './assistant-runtime.mjs';
import { loadCatalog } from './catalog.mjs';
import { object, cleanText } from './runtime-store.mjs';
import { digest } from './storage.mjs';

import { preferenceChange as draftChange } from './preference-values.mjs';
import { randomUUID } from 'node:crypto';
import { getCommand } from './catalog.mjs';
import { resolvePreferences } from './adaptive-learning.mjs';

function selected(store, input) {
  const matches = lessons(store, { inactive: true }).filter(l => l.id === input.id);
  if (matches.length !== 1) throw Error('Unknown or ambiguous lesson.');
  const lesson = matches[0];
  if (input.revision !== lesson.revision) throw Error('Lesson changed. Refresh before editing or previewing.');
  return lesson;
}
const currentChange = lesson => lesson.history.find(v => v.version === lesson.current).change;

export function preferences(root, operation, input = {}, options = {}) {
  const store = adaptiveStore(root, options);
  if (operation === 'list') {
    object(input, []);
    return { lessons: lessons(store, { inactive: true }), settings: store.config(),
      conflicts: [...new Set(lessons(store).map(l => l.workflow))].flatMap(workflow => resolvePreferences(store, workflow).conflicts.map(c => ({ workflow, ...c }))),
      note: 'Saved user instructions are local. Current requests take precedence. No learning from silence or successful tests.' };
  }
  if (operation === 'create') {
    object(input, ['workflow', 'scope', 'draft']);
    if (!['user', 'project'].includes(input.scope) || (input.scope === 'user' && store.allowUser === false)) throw Error('Choose an available project or user scope');
    if (lessons(store, { inactive: true }).filter(l => l.scope === input.scope).length >= 200) throw Error('Preference store is full; remove obsolete lessons first');
    const workflow = getCommand(loadCatalog(), input.workflow, { canonical: true }).id;
    const change = draftChange(input.draft), id = randomUUID(), at = new Date().toISOString();
    const source = { kind: 'explicit-create', surface: options.preferenceSurface === 'operator' ? 'local-operator' : 'local-cli', excerpt: change.instruction, messageHash: digest(JSON.stringify(change)), observedAt: at };
    return saveLesson(store, input.scope, { kind: 'lesson', id, workflow, scope: input.scope, ...(input.scope === 'project' ? { root: store.root } : {}), active: true, current: 1, history: [{ version: 1, at, feedback: 'correction', source, change }] }, 0);
  }
  if (operation === 'activity') {
    object(input, []);
    const all = lessons(store, { inactive: true });
    const tasks = store.list(`${store.project}/tasks`).map(n => store.read(`${store.project}/tasks/${n}`)).filter(t => t?.kind === 'task').sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 100);
    return { tasks: tasks.map(task => ({ id: task.id, revision: task.revision, host: task.host, at: task.updatedAt, selected: task.selected, ignoredLessons: task.ignoredLessons || [],
      loads: (task.loaded || []).map(load => ({ workflow: load.workflow, at: load.at, lessons: load.lessons.map(l => ({ ...l, currentVersion: all.find(p => p.id === l.id)?.current ?? null })), delivery: 'loaded', behavior: 'not independently verified' })),
      tools: [...new Set((task.observations || []).map(o => o.tool))], conflicts: (task.selected || []).flatMap(workflow => resolvePreferences(store, workflow, task).conflicts.map(c => ({ workflow, ...c }))) })),
      lessons: all.map(l => ({ id: l.id, workflow: l.workflow, version: l.current, active: l.active })), note: 'Saved is not loaded. Loaded is not verified behavior. Tool activity and host reports do not prove adherence.' };
  }
  if (operation === 'exclude') {
    object(input, ['taskId', 'revision', 'lessonIds']);
    const task = store.task(input.taskId);
    if (task.revision !== input.revision) throw Error('Task changed; refresh before changing exclusions');
    if (!Array.isArray(input.lessonIds) || input.lessonIds.length > 400 || input.lessonIds.some(id => !lessons(store, { inactive: true }).some(l => l.id === id))) throw Error('Select known preference IDs');
    return store.saveTask({ ...task, ignoredLessons: [...new Set(input.lessonIds)], updatedAt: new Date().toISOString(), preferenceOverrideSource: options.preferenceSurface === 'operator' ? 'local-operator' : 'local-cli' });
  }
  if (operation === 'preview') {
    object(input, ['id', 'revision', 'draft', 'cases', 'host']);
    const lesson = selected(store, input), change = draftChange(input.draft || currentChange(lesson));
    if (!Array.isArray(input.cases) || !input.cases.length || input.cases.length > 12)
      throw Error('Provide 1–12 example requests with expectedAffected true or false.');
    if (input.host !== undefined && !['codex', 'claude'].includes(input.host)) throw Error('Choose codex or claude.');
    const catalog = loadCatalog();
    // Substitute this draft only inside a read-only view. No record is changed.
    const hypothetical = { ...lesson, active: true, history: lesson.history.map(v => v.version === lesson.current ? { ...v, change } : v) };
    const view = { ...store, read: path => {
      const value = store.read(path);
      return value?.kind === 'lesson' && value.id === lesson.id ? hypothetical : value;
    } };
    const cases = input.cases.map(sample => {
      object(sample, ['brief', 'expectedAffected']);
      const brief = cleanText(sample.brief, 'Example request', 2000);
      if (typeof sample.expectedAffected !== 'boolean') throw Error('Specify expectedAffected for every example.');
      const before = routeRequest(store, catalog, brief, { host: input.host }).recommendations.map(r => r.id);
      const after = routeRequest(view, catalog, brief, { host: input.host }).recommendations.map(r => r.id);
      const resolution = resolvePreferences(view, lesson.workflow);
      const affected = after.includes(lesson.workflow) && resolution.overlays.some(l => l.id === lesson.id);
      return { brief, expectedAffected: sample.expectedAffected, affected, matchesExpectation: affected === sample.expectedAffected,
        before, after, conflicts: resolution.conflicts, suppressed: resolution.suppressed, matchedTriggers: change.triggers.filter(p => phraseMatches(brief, p)),
        matchedAvoid: change.avoid.filter(p => phraseMatches(brief, p)),
        instruction: affected ? change.instruction : null };
    });
    return { id: lesson.id, revision: lesson.revision, draft: change, cases,
      related: lessons(store).filter(l => l.id !== lesson.id && l.workflow === lesson.workflow).map(l => ({ id: l.id, scope: l.scope, instruction: currentChange(l).instruction })),
      limitation: 'Preview assumes this lesson is enabled and its shortlisted workflow is selected. Routing uses literal phrases. Conditions and exceptions still require agent judgment; structured setting conflicts are held back; this does not predict adherence or resolve semantic conflicts.' };
  }
  if (operation === 'edit') {
    object(input, ['id', 'revision', 'draft']);
    const lesson = selected(store, input), change = draftChange(input.draft);
    if (lesson.history.length >= 50) throw Error('Lesson history is full; retire it and save a new instruction.');
    const version = lesson.history.length + 1, at = new Date().toISOString();
    const source = { kind: 'explicit-edit', surface: options.preferenceSurface === 'operator' ? 'local-operator' : 'local-cli', excerpt: change.instruction, messageHash: digest(JSON.stringify(change)), observedAt: at };
    return store.write(`${lesson.scope === 'user' ? 'adaptive' : store.project}/learning/${lesson.id}.json`,
      { ...lesson, current: version, history: [...lesson.history, { version, at, feedback: 'correction', source, change }] }, lesson.revision);
  }
  if (operation === 'toggle') {
    object(input, ['id', 'revision', 'enabled']);
    const lesson = selected(store, input);
    if (typeof input.enabled !== 'boolean') throw Error('enabled must be boolean.');
    return changeLesson(store, input.enabled ? 'rollback' : 'retire', { id: lesson.id, revision: lesson.revision, version: lesson.current });
  }
  if (operation === 'rollback') {
    object(input, ['id', 'revision', 'version']);
    selected(store, input);
    return changeLesson(store, 'rollback', input);
  }
  throw Error('Unknown preferences operation.');
}
