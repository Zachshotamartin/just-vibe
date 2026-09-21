import { runtimeStore, object, cleanText, requireId, timestamp } from './runtime-store.mjs';
import { configurationInventory } from './config-inventory.mjs';
import { activity } from './activity.mjs';
import { digest } from './storage.mjs';
import { boundedList } from './capability-io.mjs';

function tokens(text) {
  return new Set(
    (text.toLowerCase().match(/[a-z]{3,}/g) || []).filter(
      (t) => !['the', 'and', 'for', 'with', 'this', 'when', 'use', 'skill'].includes(t),
    ),
  );
}
function portfolioInternal(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('skill-portfolio') || {
      revision: 0,
      observations: [],
      reviews: [],
      amendments: [],
    };
  if (operation === 'status') return state;
  if (operation === 'scan') {
    object(payload, ['locations']);
    const inventory = configurationInventory(root, payload, options),
      usage = activity(root, 'show', { days: 30 }, options);
    const skills = inventory.skills.map((s) => {
      const history = state.observations.filter((o) => o.id === s.id),
        last = history.at(-1);
      const workflow = s.name.replace(/^just-vibe-/, ''),
        observed = usage.workflows.find((w) => w.workflow === workflow);
      const own = s.name.startsWith('just-vibe-');
      return {
        ...s,
        previousHash: last?.hash || null,
        changed: last ? last.hash !== s.hash : null,
        observedUse:
          own && observed
            ? {
                selected: observed.selected,
                loaded: observed.loaded,
                toolFailures: observed.toolFailures,
              }
            : 'unknown',
        review: state.reviews.findLast((r) => r.skill === s.id && r.hash === s.hash) || null,
        findings: [
          !s.frontmatter && 'missing-frontmatter',
          !s.description && 'missing-description',
          s.brokenReferences.length > 0 && 'broken-local-reference',
        ].filter(Boolean),
      };
    });
    const overlaps = [];
    for (let i = 0; i < skills.length && i < 500; i++)
      for (let j = i + 1; j < skills.length && j < 500; j++) {
        const a = tokens(skills[i].description),
          b = tokens(skills[j].description),
          shared = [...a].filter((t) => b.has(t)).length;
        const similarity = shared / Math.max(1, new Set([...a, ...b]).size);
        if (shared >= 6 && similarity >= 0.6)
          overlaps.push({
            skills: [skills[i].id, skills[j].id],
            sharedTerms: shared,
            reason: 'similar trigger vocabulary; requires content review',
          });
        if (overlaps.length >= 100) break;
      }
    return {
      revision: state.revision,
      skills,
      overlaps: overlaps.slice(0, 100),
      duplicates: inventory.skillDuplicates,
      partial: inventory.partial || skills.length > 500,
      note: 'Usage outside just-vibe is unobserved, not zero. Similar wording is a review candidate, not proof of duplication or poor quality. Reference dates require live source verification.',
    };
  }
  object(payload, [
    'revision',
    'locations',
    'skill',
    'hash',
    'verdict',
    'reason',
    'id',
    'patch',
    'status',
    'evidence',
  ]);
  if (payload.revision !== state.revision) throw Error('Read current portfolio revision first.');
  if (operation === 'record') {
    const report = portfolio(root, 'scan', { locations: payload.locations }, options);
    const observations = [
      ...state.observations,
      ...report.skills.map((s) => ({
        id: s.id,
        name: s.name,
        hash: s.hash,
        at: timestamp(),
        path: s.path,
        scope: s.scope,
      })),
    ].slice(-500);
    return store.put('skill-portfolio', { ...state, observations }, state.revision);
  }
  if (operation === 'review' || operation === 'propose') {
    const report = portfolio(root, 'scan', { locations: payload.locations }, options),
      skill = report.skills.find((s) => s.id === payload.skill);
    if (!skill || skill.hash !== payload.hash)
      throw Error('Review the current skill source identity.');
    const reason = cleanText(payload.reason, 'review evidence', 3000);
    if (operation === 'review') {
      if (!['keep', 'improve', 'update', 'retire', 'merge'].includes(payload.verdict))
        throw Error('Unknown review verdict.');
      return store.put(
        'skill-portfolio',
        {
          ...state,
          reviews: [
            ...state.reviews,
            {
              skill: skill.id,
              hash: skill.hash,
              verdict: payload.verdict,
              reason,
              at: timestamp(),
              scope: skill.scope,
            },
          ].slice(-200),
        },
        state.revision,
      );
    }
    const id = requireId(payload.id);
    if (state.amendments.some((a) => a.id === id) || state.amendments.length >= 100)
      throw Error('Duplicate amendment or capacity reached.');
    return store.put(
      'skill-portfolio',
      {
        ...state,
        amendments: [
          ...state.amendments,
          {
            id,
            scope: skill.scope,
            skill: skill.id,
            hash: skill.hash,
            reason,
            patch: cleanText(payload.patch, 'proposed amendment', 8000),
            status: 'pending',
            at: timestamp(),
          },
        ],
      },
      state.revision,
    );
  }
  if (operation === 'resolve') {
    const amendment = state.amendments.find((a) => a.id === payload.id);
    if (amendment && options.allowUser === false && amendment.scope !== 'project')
      throw Error('User-scope portfolio access is disabled.');
    if (!amendment || !['accepted', 'rejected', 'superseded'].includes(payload.status))
      throw Error('Choose an amendment and review outcome.');
    const evidence = cleanText(payload.evidence, 'resolution evidence', 3000);
    return store.put(
      'skill-portfolio',
      {
        ...state,
        amendments: state.amendments.map((a) =>
          a === amendment ? { ...a, status: payload.status, evidence, resolvedAt: timestamp() } : a,
        ),
      },
      state.revision,
    );
  }
  throw Error('Unknown portfolio operation.');
}
export function portfolio(root, operation, payload = {}, options = {}) {
  const result = portfolioInternal(root, operation, payload, options);
  if (options.allowUser === false)
    for (const key of ['observations', 'reviews', 'amendments'])
      if (result[key]) result[key] = result[key].filter((entry) => entry.scope === 'project');
  return result;
}
