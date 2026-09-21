import {
  runtimeStore,
  object,
  cleanText,
  textList,
  requireId,
  timestamp,
} from './runtime-store.mjs';
import { lessons } from './adaptive-learning.mjs';
import { loadCatalog, getCommand } from './catalog.mjs';
import { digest, projectRoot } from './storage.mjs';
import { stableJson } from './workbench.mjs';

const hash = (value) => digest(stableJson(value));
function normalize(bundle) {
  object(bundle, ['format', 'exportedAt', 'source', 'memories', 'goals', 'lessons', 'decisions']);
  if (
    bundle.format !== 'just-vibe.context.v1' ||
    Buffer.byteLength(JSON.stringify(bundle)) > 512 * 1024
  )
    throw Error('Expected a context v1 bundle up to 512 KiB; export a narrower selection.');
  const list = (value, max) => {
    if (!Array.isArray(value) || value.length > max) throw Error('Invalid context collection.');
    return value;
  };
  const memories = list(bundle.memories, 200).map((m) => {
    object(m, ['id', 'title', 'body', 'tags', 'source']);
    return {
      id: requireId(m.id),
      title: cleanText(m.title, 'title', 200),
      body: cleanText(m.body, 'body', 12000),
      tags: textList(m.tags),
      source: cleanText(m.source, 'source', 1000),
    };
  });
  const goals = list(bundle.goals, 100).map((g) => {
    object(g, ['id', 'objective', 'criteria', 'constraints', 'next']);
    const criteria = textList(g.criteria, 'criteria');
    if (!criteria.length) throw Error('Imported goals require criteria.');
    return {
      id: requireId(g.id),
      objective: cleanText(g.objective, 'objective'),
      criteria,
      constraints: textList(g.constraints),
      next: textList(g.next),
    };
  });
  const catalog = loadCatalog();
  const proposed = list(bundle.lessons, 200).map((l) => {
    object(l, [
      'workflow',
      'instruction',
      'triggers',
      'avoid',
      'tools',
      'checks',
      'conditions',
      'exceptions',
    ]);
    return {
      workflow: getCommand(catalog, l.workflow, { canonical: true }).id,
      instruction: cleanText(l.instruction, 'instruction', 2000),
      ...Object.fromEntries(
        ['triggers', 'avoid', 'tools', 'checks', 'conditions', 'exceptions'].map((k) => [
          k,
          textList(l[k], k, 12),
        ]),
      ),
    };
  });
  const decisions = list(bundle.decisions || [], 1000).map((d) => {
    object(d, ['id', 'status', 'reason', 'at']);
    requireId(d.id);
    if (!['approved', 'rejected'].includes(d.status)) throw Error('Invalid decision.');
    return {
      id: d.id,
      status: d.status,
      reason: cleanText(d.reason, 'decision reason', 1000),
      at: cleanText(d.at, 'decision date', 100),
    };
  });
  for (const entries of [memories, goals, decisions])
    if (new Set(entries.map((e) => e.id)).size !== entries.length)
      throw Error('Duplicate IDs in bundle.');
  return { memories, goals, lessons: proposed, decisions };
}
function planImport(store, bundle) {
  const imported = normalize(bundle),
    at = timestamp(),
    changes = [],
    collisions = [];
  function merge(name, values, key, maximum) {
    const file = `${store.prefix}/${name}.json`,
      previous = store.read(file);
    const old = previous?.[key] || [];
    const additions = values.filter((v) => {
      if (old.some((o) => o.id === v.id)) {
        collisions.push({ collection: name, id: v.id });
        return false;
      }
      return true;
    });
    if (old.length + additions.length > maximum)
      throw Error(`Destination ${name} capacity exceeded.`);
    if (additions.length) {
      const expected = previous?.revision || 0;
      const value = {
        schemaVersion: 1,
        ...previous,
        root: store.root,
        [key]: [...old, ...additions],
        revision: expected + 1,
      };
      changes.push({ file, expected, beforeHash: hash(previous), afterHash: hash(value), value });
    }
  }
  merge(
    'memory',
    imported.memories.map((m) => ({
      ...m,
      contentHash: digest(m.body),
      createdAt: at,
      updatedAt: at,
      retired: false,
    })),
    'entries',
    200,
  );
  merge(
    'goals',
    imported.goals.map((g) => ({
      ...g,
      status: 'active',
      blockers: [],
      progress: [],
      createdAt: at,
      updatedAt: at,
      criteria: g.criteria.map((text, i) => ({
        id: `c${i + 1}`,
        text,
        status: 'pending',
        evidence: [],
      })),
      importedAt: at,
      note: 'Transferred context; current authorization and fresh verification are required.',
    })),
    'goals',
    100,
  );
  const prior = store.get('patterns') || {
    schemaVersion: 1,
    root: store.root,
    revision: 0,
    enabled: false,
    observations: [],
    candidates: [],
    decisions: [],
  };
  const candidates = [...prior.candidates];
  for (const change of imported.lessons) {
    const id = digest(JSON.stringify(change));
    if (candidates.some((c) => c.id === id) || (prior.decisions || []).some((d) => d.id === id)) {
      collisions.push({ collection: 'lessons', id });
      continue;
    }
    candidates.push({ id, status: 'pending', origin: 'context-transfer', at, change });
  }
  const decisions = [...(prior.decisions || [])];
  for (const d of imported.decisions)
    if (!decisions.some((old) => old.id === d.id)) decisions.push(d);
  if (candidates.length > 200 || decisions.length > 1000)
    throw Error('Destination learning capacity exceeded.');
  if (
    candidates.length !== prior.candidates.length ||
    decisions.length !== (prior.decisions || []).length
  ) {
    const file = `${store.prefix}/patterns.json`,
      before = store.read(file),
      value = { ...prior, candidates, decisions, revision: prior.revision + 1 };
    changes.push({
      file,
      expected: prior.revision,
      beforeHash: hash(before),
      afterHash: hash(value),
      value,
    });
  }
  return {
    changes,
    collisions,
    counts: {
      memories: imported.memories.length,
      goals: imported.goals.length,
      lessons: imported.lessons.length,
      decisions: imported.decisions.length,
    },
  };
}
function recover(store, journal) {
  for (const step of journal.changes) {
    if (!['memory', 'goals', 'patterns'].some((n) => step.file === `${store.prefix}/${n}.json`))
      throw Error('Invalid transfer journal target.');
    const current = store.read(step.file),
      currentHash = hash(current);
    if (currentHash === step.afterHash) continue;
    if (currentHash !== step.beforeHash)
      throw Error(
        'Destination changed during transfer; preserve the journal and reconcile before recovery.',
      );
    store.write(step.file, step.value, step.expected);
  }
  return store.put(
    'transfer',
    {
      status: 'complete',
      bundleHash: journal.bundleHash,
      completedAt: timestamp(),
      counts: journal.counts,
      collisions: journal.collisions,
    },
    journal.revision,
  );
}
export function portableContext(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  if (operation === 'export') {
    object(payload, ['memoryIds', 'goalIds', 'lessonIds']);
    const select = (values, ids) => {
      if (ids === undefined) return values;
      const chosen = textList(ids, 'selected IDs', 200);
      if (chosen.some((id) => !values.some((v) => v.id === id))) throw Error('Unknown export ID.');
      return values.filter((v) => chosen.includes(v.id));
    };
    const bundle = {
      format: 'just-vibe.context.v1',
      exportedAt: timestamp(),
      source: digest(store.root),
      memories: select(
        (store.get('memory')?.entries || []).filter((m) => !m.retired),
        payload.memoryIds,
      ).map(({ id, title, body, tags, source }) => ({ id, title, body, tags, source })),
      goals: select(
        (store.get('goals')?.goals || []).filter((g) => g.status !== 'retired'),
        payload.goalIds,
      ).map((g) => ({
        id: g.id,
        objective: g.objective,
        criteria: g.criteria.map((c) => c.text),
        constraints: g.constraints,
        next: g.next,
      })),
      lessons: select(
        lessons(store).filter((l) => l.scope === 'project'),
        payload.lessonIds,
      ).map((l) => ({
        workflow: l.workflow,
        ...l.history.find((v) => v.version === l.current).change,
      })),
      decisions: store.get('patterns')?.decisions || [],
    };
    normalize(bundle);
    return bundle;
  }
  if (operation === 'status') return store.get('transfer') || { revision: 0, status: 'none' };
  if (operation === 'recover') {
    object(payload, []);
    const journal = store.get('transfer');
    return journal?.status === 'applying'
      ? recover(store, journal)
      : { status: journal?.status || 'none' };
  }
  object(payload, ['bundle', 'revision', 'destination']);
  if (operation === 'transfer') {
    const destination = projectRoot(cleanText(payload.destination, 'destination', 1000));
    if (destination === store.root) throw Error('Choose a different destination project.');
    const bundle = portableContext(root, 'export', {}, options);
    return portableContext(destination, 'import', { bundle, revision: payload.revision }, options);
  }
  if (!['preview', 'import'].includes(operation))
    throw Error('Unknown context transfer operation.');
  const plan = planImport(store, payload.bundle);
  if (operation === 'preview')
    return {
      ...plan,
      changes: plan.changes.map((c) => ({ file: c.file, expectedRevision: c.expected })),
      note: 'Existing IDs are preserved. Preferences stay pending; goal evidence and all execution permissions are excluded.',
    };
  const previous = store.get('transfer');
  if (previous?.status === 'applying') throw Error('Recover the interrupted transfer first.');
  const journal = store.put(
    'transfer',
    { status: 'applying', bundleHash: hash(payload.bundle), ...plan },
    payload.revision,
  );
  return recover(store, journal);
}
