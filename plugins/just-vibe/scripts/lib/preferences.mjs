import { redact } from './process.mjs';
import { adaptiveStore } from './adaptive-store.mjs';
import { lessons, changeLesson, phraseMatches } from './adaptive-learning.mjs';
import { routeRequest } from './assistant-runtime.mjs';
import { loadCatalog } from './catalog.mjs';
import { object, cleanText, textList } from './runtime-store.mjs';
import { digest } from './storage.mjs';

const fields = ['triggers', 'avoid', 'tools', 'checks', 'conditions', 'exceptions'];
function draftChange(input) {
  object(input, ['instruction', ...fields]);
  const change = { instruction: cleanText(input.instruction, 'instruction', 2000),
    ...Object.fromEntries(fields.map(key => [key, textList(input[key] || [], key, 12)])) };
  if (Object.values(change).flat().some(v => redact(v) !== v)) throw Error('Do not save secrets in preferences.');
  return change;
}
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
      note: 'Saved user instructions are local. Current requests take precedence. No learning from silence or successful tests.' };
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
      const affected = after.includes(lesson.workflow);
      return { brief, expectedAffected: sample.expectedAffected, affected, matchesExpectation: affected === sample.expectedAffected,
        before, after, matchedTriggers: change.triggers.filter(p => phraseMatches(brief, p)),
        matchedAvoid: change.avoid.filter(p => phraseMatches(brief, p)),
        instruction: affected ? change.instruction : null };
    });
    return { id: lesson.id, revision: lesson.revision, draft: change, cases,
      related: lessons(store).filter(l => l.id !== lesson.id && l.workflow === lesson.workflow).map(l => ({ id: l.id, scope: l.scope, instruction: currentChange(l).instruction })),
      limitation: 'Preview assumes this lesson is enabled and its shortlisted workflow is selected. Routing uses literal phrases. Conditions and exceptions still require agent judgment; this does not predict adherence or resolve semantic conflicts.' };
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
