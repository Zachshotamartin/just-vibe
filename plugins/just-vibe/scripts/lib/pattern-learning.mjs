import { preferenceChange } from './preference-values.mjs';
import {
  runtimeStore,
  object,
  cleanText,
  textList,
  requireId,
  timestamp,
} from './runtime-store.mjs';
import { getCommand, loadCatalog } from './catalog.mjs';
import { lessons, sourceFromTask, changeLesson, saveLesson } from './adaptive-learning.mjs';
import { digest } from './storage.mjs';
import { gitRead } from './project.mjs';
import { managedFiles } from './managed-files.mjs';

function change(value, catalog) {
  const { workflow, ...values } = value;
  return { workflow: getCommand(catalog, workflow, { canonical: true }).id, ...preferenceChange(values) };
}
function stateFor(store) {
  const state = store.get('patterns') || {
    revision: 0,
    enabled: false,
    observations: [],
    candidates: [],
  };
  // Migrate earlier reviewed candidates before any prune can erase their decisions.
  const decisions = [...(state.decisions || [])];
  for (const candidate of state.candidates)
    if (
      ['approved', 'rejected'].includes(candidate.status) &&
      !decisions.some((d) => d.id === candidate.id)
    )
      decisions.push({
        id: candidate.id,
        status: candidate.status,
        reason: candidate.reason || 'Previously reviewed',
        at: candidate.reviewedAt || candidate.at,
      });
  return { ...state, decisions };
}
export function patternLearning(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    catalog = options.catalog || loadCatalog(),
    state = stateFor(store);
  if (operation === 'status')
    return {
      ...state,
      relatedGuidance: state.candidates
        .filter((c) => c.status === 'pending')
        .map((c) => ({
          candidate: c.id,
          lessons: lessons(store)
            .filter((l) => l.workflow === c.change.workflow)
            .map((l) => ({
              id: l.id,
              revision: l.revision,
              scope: l.scope,
              change: l.history.find((v) => v.version === l.current).change,
            })),
        })),
      note: 'Counts describe recorded activity, not quality or correctness. Candidates never affect workflows until approved.',
    };
  if (operation === 'propose') {
    object(payload, ['revision', 'taskId', 'excerpt', 'change', 'reason']);
    const source = sourceFromTask(store, payload),
      proposed = change(payload.change, catalog);
    const id = digest(JSON.stringify([source.messageHash, proposed]));
    if ((state.decisions || []).some((d) => d.id === id))
      throw Error('This proposal already has a decision; explicitly reconsider it first.');
    if (state.candidates.some((c) => c.id === id)) return state;
    if (state.candidates.length >= 200)
      throw Error('Candidate store full; prune resolved candidates.');
    return store.put(
      'patterns',
      {
        ...state,
        candidates: [
          ...state.candidates,
          {
            id,
            status: 'pending',
            origin: 'user-feedback',
            at: timestamp(),
            source,
            reason: cleanText(payload.reason, 'proposal reason', 1000),
            change: proposed,
          },
        ],
      },
      payload.revision,
    );
  }
  if (operation === 'configure') {
    object(payload, ['revision', 'enabled']);
    if (typeof payload.enabled !== 'boolean') throw Error('enabled must be boolean.');
    return store.put('patterns', { ...state, enabled: payload.enabled }, payload.revision);
  }
  if (operation === 'record') {
    object(payload, ['revision', 'session', 'workflow', 'tools', 'outcome']);
    if (!state.enabled) throw Error('Activity observation is disabled.');
    const workflow = getCommand(catalog, payload.workflow, { canonical: true }).id;
    if (!['completed', 'failed', 'unknown'].includes(payload.outcome))
      throw Error(
        'Outcome must be completed, failed or unknown; completion is not a quality judgment.',
      );
    const session = digest(cleanText(payload.session, 'session', 256));
    const observation = {
      id: digest(`${session}:${workflow}`),
      session,
      workflow,
      tools: textList(payload.tools, 'tools', 12),
      outcome: payload.outcome,
      at: timestamp(),
    };
    return store.put(
      'patterns',
      {
        ...state,
        observations: [
          ...state.observations.filter((o) => o.id !== observation.id).slice(-499),
          observation,
        ],
      },
      payload.revision,
    );
  }
  if (operation === 'analyze') {
    object(payload, ['revision']);
    const groups = new Map();
    for (const obs of state.observations.filter(
      (o) => Date.now() - Date.parse(o.at) < 30 * 86400000,
    )) {
      const key = digest(JSON.stringify([obs.workflow, obs.tools]));
      groups.set(key, [...(groups.get(key) || []), obs]);
    }
    const additions = [];
    for (const [key, records] of groups) {
      if (
        records.length < 3 ||
        !records[0].tools.length ||
        state.candidates.some((c) => c.id === key) ||
        (state.decisions || []).some((d) => d.id === key)
      )
        continue;
      const { workflow, tools } = records[0];
      additions.push({
        id: key,
        status: 'pending',
        origin: 'observed-tools',
        at: timestamp(),
        observations: records.map((o) => o.id),
        counts: {
          recordings: records.length,
          failed: records.filter((o) => o.outcome === 'failed').length,
        },
        change: {
          workflow,
          instruction: `Consider ${tools.join(', ')} for ${workflow} when relevant and available. This is a repeated tool-use pattern; verify suitability for the current task.`,
          triggers: [],
          avoid: [],
          tools,
          checks: [],
        },
      });
    }
    if (state.candidates.length + additions.length > 200)
      throw Error('Candidate store full; prune resolved candidates first.');
    return store.put(
      'patterns',
      { ...state, candidates: [...state.candidates, ...additions] },
      payload.revision,
    );
  }
  if (operation === 'git') {
    object(payload, ['limit']);
    const limit = payload.limit ?? 100;
    if (!Number.isInteger(limit) || limit < 1 || limit > 500)
      throw Error('Git history limit must be 1–500.');
    const log =
      gitRead(root, ['log', `-${limit}`, '--format=%H%x09%s', '--no-show-signature']) || '';
    const rows = log.split('\n').filter(Boolean),
      counts = {};
    for (const row of rows) {
      const match = row.slice(row.indexOf('\t') + 1).match(/^([a-z]+)(?:\([^)]*\))?!?: /);
      if (match) counts[match[1]] = (counts[match[1]] || 0) + 1;
    }
    return {
      sampled: rows.length,
      commits: rows.map((r) => r.split('\t')[0]),
      conventionalPrefixes: counts,
      suggestion:
        rows.length >= 3 && Object.values(counts).reduce((a, b) => a + b, 0) / rows.length >= 0.7
          ? 'Consider preserving the observed conventional commit prefixes when preparing commits.'
          : null,
      note: 'Observed commit subjects only; no author identity or message bodies retained. This sample is not a user preference and is never activated automatically.',
    };
  }
  if (operation === 'export') {
    object(payload, ['ids']);
    const ids = textList(payload.ids, 'lesson IDs', 100);
    if (!ids.length) throw Error('Select explicit lesson IDs to export.');
    const available = lessons(store).filter((l) => ids.includes(l.id));
    if (available.length !== ids.length) throw Error('Unknown or inactive lesson selected.');
    return {
      schema: 'just-vibe.preferences.v1',
      exportedAt: timestamp(),
      items: available.map((l) => ({
        ...change(
          { workflow: l.workflow, ...l.history.find((v) => v.version === l.current).change },
          catalog,
        ),
        origin: { lesson: l.id, version: l.current },
      })),
      note: 'Review before sharing. User quotes, paths and session IDs are omitted; instructions themselves may contain private context.',
    };
  }
  if (operation === 'evolve') {
    object(payload, ['id', 'format']);
    const lesson = lessons(store).find((l) => l.id === payload.id);
    if (!lesson || !['skill', 'agent'].includes(payload.format))
      throw Error('Choose an active lesson ID and skill or agent format.');
    const current = lesson.history.find((v) => v.version === lesson.current);
    const name = `learned-${lesson.workflow}-${digest(lesson.id).slice(0, 8)}`;
    const prefix = `.just-vibe/generated/${name}`;
    const file =
      payload.format === 'skill'
        ? `${prefix}/skills/${name}/SKILL.md`
        : `${prefix}/agents/${name}.md`;
    const instruction = cleanText(current.change.instruction, 'instruction', 2000);
    const content = `---\nname: ${name}\ndescription: ${JSON.stringify(`Reviewed personal guidance for ${lesson.workflow}; apply only when that workflow is relevant.`)}\n${payload.format === 'agent' ? 'tools: Read, Glob, Grep\nmodel: inherit\n' : ''}---\n\n# ${name}\n\nSource: lesson ${lesson.id}, version ${lesson.current}. This generated artifact is a local draft; installation is a separate action. Current user instructions and project rules take precedence. No permission is granted by this text.\n\n${instruction}${current.change.setting ? `\n\nSetting: ${current.change.setting.key}=${current.change.setting.value}.` : ''}\n\nConditions: ${(current.change.conditions || []).join('; ') || 'workflow relevance'}.\nExceptions: ${(current.change.exceptions || []).join('; ') || 'none specified'}.\nTriggers: ${(current.change.triggers || []).join('; ') || 'none specified'}.\nAvoid: ${(current.change.avoid || []).join('; ') || 'none specified'}.\nPreferred tools when available: ${current.change.tools.join(', ') || 'none specified'}.\nEvidence to consider: ${current.change.checks.join('; ') || 'none specified'}.\n${payload.format === 'agent' ? '\nInspect only; report findings and limitations. Do not edit files or spawn further agents.\n' : ''}`;
    return {
      name,
      file,
      ...managedFiles(root, `evolve-${name}`, new Map([[file, content]]), 'update', {
        allowed: (p) => p.startsWith(`${prefix}/`),
      }),
    };
  }
  if (operation === 'import') {
    object(payload, ['revision', 'bundle']);
    object(payload.bundle, ['schema', 'exportedAt', 'items', 'note']);
    if (
      payload.bundle.schema !== 'just-vibe.preferences.v1' ||
      !Array.isArray(payload.bundle.items) ||
      payload.bundle.items.length > 100
    )
      throw Error('Unsupported preference bundle.');
    const incoming = payload.bundle.items.map((item) => {
      object(item, [
        'workflow',
        'instruction',
        'triggers',
        'avoid',
        'tools',
        'checks',
        'conditions',
        'exceptions',
        'origin',
        'setting',
      ]);
      const { origin, ...values } = item,
        normalized = change(values, catalog);
      return {
        id: digest(JSON.stringify(normalized)),
        origin: 'untrusted-import',
        at: timestamp(),
        status: 'pending',
        change: normalized,
      };
    });
    const candidates = [...state.candidates];
    for (const c of incoming)
      if (!candidates.some((old) => old.id === c.id) && !state.decisions.some((d) => d.id === c.id))
        candidates.push(c);
    if (candidates.length > 200) throw Error('Candidate store full.');
    return store.put('patterns', { ...state, candidates }, payload.revision);
  }
  if (operation === 'approve' || operation === 'reject') {
    object(payload, ['revision', 'id', 'change', 'reason', 'resolutions']);
    requireId(payload.id);
    if (payload.revision !== state.revision)
      throw Error('Read the current candidate revision first.');
    const candidate = state.candidates.find((c) => c.id === payload.id);
    if (!candidate || candidate.status !== 'pending') throw Error('Choose a pending candidate.');
    const reason = cleanText(payload.reason, 'review reason', 1000);
    if (
      (state.decisions || []).length >= 1000 &&
      !(state.decisions || []).some((d) => d.id === candidate.id)
    )
      throw Error(
        'Decision history is full; explicitly reconsider obsolete decisions before adding more.',
      );
    // Journal approval before activation. A retry can finish a pending activation without duplicating a lesson.
    const approved =
      operation === 'approve' ? change(payload.change || candidate.change, catalog) : null;
    const related = approved ? lessons(store).filter((l) => l.workflow === approved.workflow) : [];
    const resolutions = payload.resolutions || [];
    if (!Array.isArray(resolutions) || resolutions.length > 400)
      throw Error('Invalid related-lesson resolutions.');
    for (const resolution of resolutions) {
      object(resolution, ['id', 'revision', 'action']);
      const lesson = related.find((l) => l.id === resolution.id);
      if (
        !lesson ||
        lesson.revision !== resolution.revision ||
        !['keep', 'retire'].includes(resolution.action)
      )
        throw Error('Review current related lesson versions before approving.');
      if (lesson.scope === 'user' && resolution.action === 'retire')
        throw Error(
          'A project proposal cannot retire user-wide guidance; update it explicitly or keep it with a scoped exception.',
        );
    }
    if (related.some((l) => resolutions.filter((r) => r.id === l.id).length !== 1))
      throw Error(
        'Resolve each related active lesson explicitly with keep or retire; compatible scoped guidance may be kept.',
      );
    if (
      approved &&
      lessons(store, { inactive: true }).filter((l) => l.scope === 'project').length >= 200
    )
      throw Error('Project learning store is full; forget obsolete lessons first.');
    const lessonId = `pattern-${candidate.id.slice(0, 24)}-${state.revision}`;
    const updated = store.put(
      'patterns',
      {
        ...state,
        decisions: [
          ...(state.decisions || []).filter((d) => d.id !== candidate.id),
          {
            id: candidate.id,
            status: operation === 'approve' ? 'approved' : 'rejected',
            reason,
            at: timestamp(),
          },
        ],
        candidates: state.candidates.map((c) =>
          c.id === candidate.id
            ? {
                ...c,
                status: operation === 'approve' ? 'approved' : 'rejected',
                reviewedAt: timestamp(),
                reason,
                ...(approved ? { change: approved, lessonId, resolutions } : {}),
              }
            : c,
        ),
      },
      state.revision,
    );
    if (approved)
      activateCandidate(
        store,
        updated.candidates.find((c) => c.id === candidate.id),
      );
    return updated;
  }
  if (operation === 'recover') {
    object(payload, []);
    const recovered = state.candidates
      .filter((c) => c.status === 'approved')
      .map((c) => activateCandidate(store, c));
    return { recovered };
  }
  if (operation === 'prune') {
    object(payload, ['revision']);
    return store.put(
      'patterns',
      {
        ...state,
        // Approval is journaled before activation. Retain its recovery data
        // until the final lesson record has actually been published.
        candidates: state.candidates.filter((c) => c.status === 'pending' ||
          (c.status === 'approved' && (!c.lessonId ||
            !store.read(`${store.project}/learning/${requireId(c.lessonId)}.json`)))),
        observations: state.observations.filter(
          (o) => Date.now() - Date.parse(o.at) < 30 * 86400000,
        ),
      },
      payload.revision,
    );
  }
  if (operation === 'reconsider') {
    object(payload, ['revision', 'id', 'reason']);
    requireId(payload.id);
    const reason = cleanText(payload.reason, 'reconsideration reason', 1000);
    if (!(state.decisions || []).some((d) => d.id === payload.id))
      throw Error('Unknown prior decision.');
    const candidate = state.candidates.find((c) => c.id === payload.id);
    if (candidate?.status === 'approved' && (!candidate.lessonId ||
      !store.read(`${store.project}/learning/${requireId(candidate.lessonId)}.json`)))
      throw Error('Recover the interrupted activation before reconsidering its decision.');
    return store.put(
      'patterns',
      {
        ...state,
        decisions: state.decisions.filter((d) => d.id !== payload.id),
        candidates: state.candidates.filter((c) => c.id !== payload.id),
        reconsiderations: [
          ...(state.reconsiderations || []).slice(-49),
          { id: payload.id, reason, at: timestamp() },
        ],
      },
      payload.revision,
    );
  }
  throw Error('Unknown learning operation.');
}
function activateCandidate(store, candidate) {
  const path = `${store.project}/learning/${candidate.lessonId}.json`;
  // Publishing this record is the last activation step. Later user changes,
  // including a forgotten tombstone, must not replay its completed retirements.
  if (store.read(path)) return candidate.lessonId;
  for (const resolution of candidate.resolutions || []) {
    if (resolution.action !== 'retire') continue;
    const previous = lessons(store, { inactive: true }).find((l) => l.id === resolution.id);
    if (previous && !previous.active && previous.revision === resolution.revision + 1) continue;
    if (!previous || previous.revision !== resolution.revision)
      throw Error(
        'Related guidance changed during activation; inspect learning state before recovery.',
      );
    changeLesson(store, 'retire', resolution);
  }
  const { workflow, ...values } = candidate.change;
  saveLesson(
    store,
    'project',
    {
      kind: 'lesson',
      id: candidate.lessonId,
      workflow,
      scope: 'project',
      root: store.root,
      active: true,
      current: 1,
      history: [
        {
          version: 1,
          at: timestamp(),
          feedback: 'reviewed-pattern',
          source: { candidateId: candidate.id, origin: candidate.origin, review: candidate.reason },
          change: values,
        },
      ],
    },
    0,
  );
  return candidate.lessonId;
}
export function observePatternsFromTask(store, task, options = {}) {
  const state = stateFor(store);
  if (!state.enabled || !task?.selected?.length) return [];
  for (const workflow of task.selected) {
    const current = stateFor(store);
    patternLearning(
      store.root,
      'record',
      {
        revision: current.revision,
        session: task.id,
        workflow,
        tools: [...new Set(task.observations.map((o) => o.tool))].filter(Boolean).slice(0, 12),
        outcome: task.observations.some((o) => o.outcome === 'failed') ? 'failed' : 'unknown',
      },
      { ...options, home: store.home },
    );
  }
  const current = stateFor(store);
  const analyzed = patternLearning(
    store.root,
    'analyze',
    { revision: current.revision },
    { ...options, home: store.home },
  );
  return analyzed.candidates
    .filter((c) => !state.candidates.some((old) => old.id === c.id))
    .map((c) => c.id);
}
