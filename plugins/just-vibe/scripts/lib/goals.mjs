import {
  runtimeStore,
  object,
  cleanText,
  textList,
  requireId,
  timestamp,
} from './runtime-store.mjs';
import { within, digest, fingerprint, compareSnapshot } from './storage.mjs';
import { lstatSync, readFileSync } from 'node:fs';

export function goals(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  const state = store.get('goals') || { revision: 0, goals: [] };
  if (operation === 'list') return state;
  object(payload, [
    'id',
    'revision',
    'objective',
    'criteria',
    'constraints',
    'next',
    'blockers',
    'progress',
    'criterion',
    'evidence',
    'reason',
    'status',
  ]);
  const id = requireId(payload.id),
    previous = state.goals.find((g) => g.id === id);
  if (operation === 'show' || operation === 'resume') {
    if (!previous) throw Error('Unknown goal.');
    const snapshot = fingerprint(store.root);
    const goal = {
      ...previous,
      criteria: previous.criteria.map((c) => ({
        ...c,
        evidence: c.evidence.map((e) => checkEvidence(store.root, e, snapshot)),
      })),
    };
    return {
      revision: state.revision,
      goal,
      note:
        operation === 'resume'
          ? 'Recheck stale evidence and current authorization. A saved goal supplies context, not permission for unrelated external actions or unlimited background work.'
          : 'Criterion evidence is attributed. Host reports are not independently verified.',
    };
  }
  if (payload.revision !== state.revision)
    throw Error('Read the current goals revision before updating.');
  let next;
  if (operation === 'create') {
    if (previous) throw Error('Goal already exists; update or reopen it.');
    if (state.goals.length >= 100) throw Error('Goal store full; remove retired goals first.');
    const criteria = textList(payload.criteria, 'completion criteria', 20);
    if (!criteria.length) throw Error('At least one concrete completion criterion is required.');
    next = {
      id,
      objective: cleanText(payload.objective, 'objective', 4000),
      criteria: criteria.map((text, i) => ({
        id: `c${i + 1}`,
        text,
        status: 'pending',
        evidence: [],
      })),
      constraints: textList(payload.constraints, 'constraints'),
      next: textList(payload.next, 'next steps'),
      blockers: [],
      progress: [],
      status: 'active',
      createdAt: timestamp(),
      updatedAt: timestamp(),
    };
  } else {
    if (!previous) throw Error('Unknown goal.');
    next = { ...previous, updatedAt: timestamp() };
    if (operation === 'update') {
      if (!['active', 'blocked'].includes(previous.status))
        throw Error('Reopen the goal before updating it.');
      if (payload.objective !== undefined)
        next.objective = cleanText(payload.objective, 'objective', 4000);
      const criteria =
        payload.criteria === undefined
          ? previous.criteria.map((c) => c.text)
          : textList(payload.criteria, 'completion criteria', 20);
      if (!criteria.length) throw Error('At least one concrete completion criterion is required.');
      const scopeChanged =
        next.objective !== previous.objective ||
        JSON.stringify(criteria) !== JSON.stringify(previous.criteria.map((c) => c.text));
      if (scopeChanged) {
        if (next.objective !== previous.objective && payload.criteria === undefined)
          throw Error(
            'An objective change requires explicit completion criteria for the revised scope.',
          );
        const history = previous.scopeHistory || [];
        if (history.length >= 10)
          throw Error('Goal scope history is full; create a separate goal.');
        next.scopeHistory = [
          ...history,
          {
            at: timestamp(),
            objective: previous.objective,
            criteria: previous.criteria.map(({ id, text, status, evidence }) => ({
              id,
              text,
              status,
              lastEvidence: evidence.at(-1) || null,
            })),
          },
        ];
        next.criteria = criteria.map((text, i) => ({
          id: `c${i + 1}`,
          text,
          status: 'pending',
          evidence: [],
        }));
      }
      for (const key of ['constraints', 'next', 'blockers'])
        if (payload[key] !== undefined) next[key] = textList(payload[key], key);
      if (payload.progress !== undefined)
        next.progress = [
          ...next.progress.slice(-49),
          { at: timestamp(), text: cleanText(payload.progress, 'progress', 2000) },
        ];
      next.status = next.blockers.length ? 'blocked' : 'active';
    } else if (operation === 'evidence') {
      if (!['active', 'blocked'].includes(previous.status))
        throw Error('Reopen the goal before changing evidence.');
      const criterion = previous.criteria.find((c) => c.id === payload.criterion);
      if (!criterion) throw Error('Unknown criterion.');
      if (!['satisfied', 'pending', 'failed'].includes(payload.status))
        throw Error('Criterion status must be satisfied, pending or failed.');
      object(payload.evidence, ['kind', 'path', 'summary']);
      const evidence = {
        kind: payload.evidence.kind,
        summary: cleanText(payload.evidence.summary, 'evidence summary', 2000),
        at: timestamp(),
        snapshot: fingerprint(store.root),
      };
      if (evidence.kind === 'artifact') {
        const path = cleanText(payload.evidence.path, 'artifact path', 500),
          full = within(root, path),
          stat = lstatSync(full);
        if (!stat.isFile() || stat.size > 1024 * 1024)
          throw Error('Evidence artifact must be a regular file up to 1 MiB.');
        evidence.path = path;
        evidence.hash = digest(readFileSync(full));
      } else if (evidence.kind !== 'host-report')
        throw Error('Evidence kind must be artifact or host-report.');
      next.criteria = previous.criteria.map((c) =>
        c.id === criterion.id
          ? { ...c, status: payload.status, evidence: [...c.evidence.slice(-9), evidence] }
          : c,
      );
    } else if (operation === 'complete') {
      if (!['active', 'blocked'].includes(previous.status))
        throw Error('Only an active or blocked goal can be completed.');
      const snapshot = fingerprint(store.root);
      if (
        previous.blockers.length ||
        previous.criteria.some(
          (c) =>
            c.status !== 'satisfied' ||
            !c.evidence.length ||
            checkEvidence(store.root, c.evidence.at(-1), snapshot).stale,
        )
      )
        throw Error(
          'Completion requires satisfied criteria with current evidence and no unresolved blockers.',
        );
      next.status = 'complete';
      next.completedAt = timestamp();
      next.next = [];
    } else if (operation === 'reopen') {
      if (!['complete', 'retired'].includes(previous.status))
        throw Error('Only a completed or retired goal can be reopened; update an active goal.');
      next.status = 'active';
      next.blockers = [];
      next.criteria = previous.criteria.map((c) => ({ ...c, status: 'pending' }));
      next.reason = cleanText(payload.reason, 'reopen reason', 1000);
      delete next.completedAt;
    } else if (operation === 'retire') {
      next.status = 'retired';
      next.reason = cleanText(payload.reason, 'retirement reason', 1000);
    } else if (operation === 'forget') {
      if (previous.status !== 'retired') throw Error('Retire a goal before forgetting it.');
      return store.put('goals', { goals: state.goals.filter((g) => g.id !== id) }, state.revision);
    } else throw Error('Unknown goal operation.');
  }
  return store.put(
    'goals',
    { goals: [...state.goals.filter((g) => g.id !== id), next] },
    state.revision,
  );
}
function checkEvidence(root, evidence, snapshot) {
  const freshness = compareSnapshot(evidence.snapshot, snapshot);
  if (evidence.kind !== 'artifact')
    return { ...evidence, verification: 'attributed-host-report', ...freshness };
  try {
    const file = within(root, evidence.path),
      stat = lstatSync(file);
    return {
      ...evidence,
      ...freshness,
      stale: freshness.stale ||
        !stat.isFile() || stat.size > 1024 * 1024 || digest(readFileSync(file)) !== evidence.hash,
    };
  } catch {
    return { ...evidence, stale: true };
  }
}
