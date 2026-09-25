// Lexical workflow search. Requests and catalog text share one normalization, so a
// word earns the same evidence however it is inflected. Evidence is graded:
//   id tokens that distinguish a workflow within its family (8), searchTerms matched as whole
//   terms or contiguous phrases (5-9 by length), summary words weighted by rarity (1-4) and rare
//   procedure/example words (0-1). A family prefix such as "ml" is shared context (+2),
//   and a lone generic id word needs corroboration before it counts as a name.
import { parseInvocation } from './invocation.mjs';

const MODE_ORDER = { inspect: 0, plan: 1, apply: 2 };
const STOP = new Set(('the a an and or to for of in on with my this that it is are be can please me do how what why i we our '
  + 'from into onto where just out per up over about some any all there here when then than also so if as at by via its their '
  + 'they them these those was were been being has have had will would should could may might must get got let lets one '
  + 'vibe i\'m it\'s im its you your yours us not no don\'t dont need needs needed want wants like make does did').split(/\s+/));
// Multi-word domain terms and abbreviations normalized identically in requests and catalog text.
const PHRASES = [
  [/\b(?:machine|deep|reinforcement|transfer)\s+learning\b/g, ' ml '],
  // Regression as a model type is not a bug regression.
  [/\b(?:linear|logistic|isotonic|ridge|lasso|poisson|quantile|polynomial)\s+regression\b|\bregression\s+(?:model|problem|task|analysis)s?\b|\bclassification\s+or\s+regression\b/g, ' mlregression '],
  [/\blearning\s+rates?\b/g, ' learningrate '],
  [/\bpr[-\s]?auc\b|\bpr\s+curves?\b|\bprecision[-\s]recall\b/g, ' prauc '],
  [/\bpull\s+requests?\b/g, ' pr '],
  [/\b(?:environment|env)\s+var(?:iable)?s?\b/g, ' env '],
  [/\bdatabases?\b/g, ' db database '],
  [/\bgh\b/g, ' github '],
  [/\broll(?:ing|ed|s)?\s+out\b/g, ' rollout '],
  [/\broll(?:ing|ed|s)?\s+back\b/g, ' rollback '],
  [/\bset(?:ting|s)?\s+up\b/g, ' setup '],
  [/\blog(?:ging|s)?\s+in\b/g, ' login '],
  [/\bsign(?:ing|ed|s)?\s+(?:up|in)\b/g, ' signin '],
  [/\bre-?render(?:s|ing|ed)?\b/g, ' rerender '],
  [/\bfront[-\s]end\b/g, ' frontend '],
  [/\bback[-\s]end\b/g, ' backend '],
  [/\bend[-\s]to[-\s]end\b/g, ' e2e '],
  [/\bci\s*\/\s*cd\b/g, ' ci cd '],
  [/\bspecif(?:y|ies|ied|ication|ications)\b/g, ' spec '],
  [/\b(?:tim(?:es|ed|ing)|time)\s+out\b/g, ' timeout '],
];
// Expansions add related vocabulary at half weight; they never create a name match.
const SYNONYM_WORDS = { ci: ['checks', 'actions', 'pipeline'], a11y: ['accessibility', 'keyboard', 'focus'], db: ['sql', 'postgres', 'sqlite'],
  rerender: ['rendering', 'freezes'], leakage: ['contamination', 'leak', 'future'], recovery: ['recover', 'restore'], env: ['environment', 'variables'],
  ml: ['model', 'training', 'dataset'] };
// Generic single-token ids that are ordinary English words need corroborating evidence.
const HOMONYMS = new Set(['build', 'copy', 'design', 'docs', 'goal', 'help', 'learn', 'map', 'match', 'polish', 'profile', 'profiles',
  'remember', 'resume', 'scope', 'setup', 'skill', 'spec', 'tasks', 'tools', 'trace', 'challenge', 'compare', 'test', 'release']);
// General workflows named by a mode verb say how to work; a specialist id says what to work on.
const MODE_VERBS = new Set(['plan', 'review', 'build', 'fix', 'design', 'explain', 'test', 'verify', 'debug', 'refactor',
  'trace', 'compare', 'polish', 'match', 'copy', 'scope', 'spec']);
// Id words that are common in ordinary requests even though the catalog rarely uses them.
const EVERYDAY = new Set(['upgrade', 'system', 'monitor', 'config', 'analysis', 'batch', 'async', 'form', 'lock', 'scale',
  'slice', 'drift', 'flow', 'index', 'status', 'package', 'setup', 'unit', 'profile', 'dataset', 'rollout', 'recover', 'component', 'issue'].map(w => w));
// Words that anchor a family-specific workflow (vite-upgrade needs "vite", git-split needs a Git word, ...).
const ANCHORS = { arch: ['architecture', 'architectural'], db: ['db', 'sql', 'postgres', 'postgresql', 'mysql', 'sqlite'],
  git: ['git', 'commit', 'branch', 'rebase', 'stash', 'reflog'], github: ['github'], vercel: ['vercel'], vite: ['vite'],
  ops: ['production', 'incident', 'outage'], test: ['test'], ui: ['ui', 'interface'], react: ['react', 'hook', 'jsx', 'tsx', 'useeffect', 'usestate', 'usememo', 'nextjs'],
  security: ['security', 'vulnerability', 'attack'], backend: ['backend', 'server'], data: ['data', 'pipeline', 'etl', 'warehouse'],
  decision: ['decision', 'decide'], llm: ['llm', 'prompt', 'rag', 'embedding', 'chatbot'], api: ['api', 'endpoint'],
  ml: ['ml', 'model', 'prediction', 'training', 'dataset', 'classifier', 'prauc'] };
const FAMILY_HIT = 3;

// Words whose final "ed" is part of the stem.
const ED_STEMS = new Set(['embed', 'shred', 'bred', 'sled', 'fled']);
const undouble = w => (/([b-df-hj-np-tv-z])\1$/.test(w) && !/(?:ll|ss|zz)$/.test(w) ? w.slice(0, -1) : w);
export function stem(word) {
  let w = word;
  if (w.length <= 3 || /\d/.test(w)) return w;
  // Plural first, then one derivational/inflectional suffix, so "migrations" and "migrate" agree.
  if (/ies$/.test(w) && w.length > 4) w = `${w.slice(0, -3)}y`;
  else if (/(?:ss|us|is)$/.test(w)) return w;
  else if (/(?:ches|shes|xes|zes|sses)$/.test(w)) w = w.slice(0, -2);
  else if (/s$/.test(w)) w = w.slice(0, -1);
  if (/ing$/.test(w) && w.length > 5) w = undouble(w.slice(0, -3));
  else if (/ed$/.test(w) && w.length > 4 && !/eed$/.test(w) && !ED_STEMS.has(w)) w = undouble(w.slice(0, -2));
  else if (/ization$/.test(w) && w.length > 8) w = w.slice(0, -5);
  else if (/ation$/.test(w) && w.length > 7) w = w.slice(0, -3);
  return w.length >= 4 && w.endsWith('e') ? w.slice(0, -1) : w;
}
// Plural forms keep full name weight; -ing/-ed forms ("learning", "checked") are weaker evidence.
const inflected = (surface, base) => surface !== base && surface !== `${base}s` && surface !== `${base}es` && !(base.endsWith('y') && surface === `${base.slice(0, -1)}ies`);

const SYNONYMS = Object.fromEntries(Object.entries(SYNONYM_WORDS).map(([key, words]) => [stem(key), words.map(stem)]));

export function normalize(text) {
  let value = String(text).toLowerCase().replace(/[‘’ʼ]/g, '\'');
  for (const [pattern, replacement] of PHRASES) value = value.replace(pattern, replacement);
  return (value.match(/[a-z0-9]+(?:'[a-z]+)?/g) || []).filter(w => !STOP.has(w)).map(surface => ({ surface, stem: stem(surface) }));
}
const stems = text => normalize(text).map(t => t.stem);

function familyPrefixes(catalog) {
  const counts = {};
  for (const c of catalog.commands) if (c.id.includes('-')) counts[c.id.split('-')[0]] = (counts[c.id.split('-')[0]] || 0) + 1;
  return new Set(Object.keys(counts).filter(prefix => counts[prefix] >= 3));
}

const indexes = new WeakMap();
function buildIndex(catalog) {
  const families = familyPrefixes(catalog);
  const entries = new Map();
  const summaryDf = {}, detailDf = {}, textDf = {};
  for (const command of catalog.commands) for (const t of new Set(stems([command.summary, command.selection, ...command.procedure, ...command.examples.map(e => e.brief)].join(' ')))) textDf[t] = (textDf[t] || 0) + 1;
  // A core id word is generic when many workflows use it (check, plan, model) or people use it everywhere (upgrade, system).
  const generic = surface => textDf[stem(surface)] >= 13 || EVERYDAY.has(surface) || EVERYDAY.has(stem(surface));
  for (const command of catalog.commands) {
    const idTokens = command.id.split('-');
    const family = idTokens.length > 1 && families.has(idTokens[0]) ? idTokens[0] : null;
    const entry = {
      family,
      general: command.pack === 'general',
      core: (family ? idTokens.slice(1) : idTokens).map(surface => ({ surface, stem: stem(surface), generic: generic(surface) })),
      summary: new Set(stems(command.summary)),
      detail: new Set(stems([command.pack, ...command.procedure, ...command.examples.map(e => e.brief)].join(' '))),
      terms: (command.searchTerms || []).map(stems).filter(t => t.length),
    };
    for (const t of entry.summary) summaryDf[t] = (summaryDf[t] || 0) + 1;
    for (const t of entry.detail) detailDf[t] = (detailDf[t] || 0) + 1;
    entries.set(command, entry);
  }
  return { entries, summaryDf, detailDf };
}
function index(catalog) {
  if (!indexes.has(catalog)) indexes.set(catalog, buildIndex(catalog));
  const built = indexes.get(catalog);
  // Rebuild if the caller replaced command objects after the first search.
  if (catalog.commands.some(c => !built.entries.has(c))) indexes.set(catalog, buildIndex(catalog));
  return indexes.get(catalog);
}

const summaryWeight = df => (df <= 2 ? 4 : df <= 5 ? 3 : df <= 12 ? 2 : 1);
const detailWeight = df => (df <= 15 ? 1 : df <= 40 ? 0.5 : 0);
const contains = (sequence, phrase) => sequence.some((_, i) => phrase.every((t, j) => sequence[i + j] === t));

function scoreCommand(entry, query, { summaryDf, detailDf }) {
  const own = new Set(query.filter(t => !t.expanded).map(t => t.stem));
  const sequence = query.filter(t => !t.expanded).map(t => t.stem);
  const coreStems = new Set(entry.core.map(t => t.stem));
  const anchors = entry.family ? (ANCHORS[entry.family] || [entry.family]).map(stem) : [];
  const familyHit = Boolean(entry.family) && anchors.some(a => own.has(a));
  const termHits = entry.terms.filter(term => (term.length === 1 ? own.has(term[0]) : contains(sequence, term)));
  const summaryHit = [...own].some(t => !coreStems.has(t) && entry.summary.has(t) && summaryDf[t] <= 5);
  const matched = entry.core.filter(t => own.has(t.stem));
  const corroborated = familyHit || termHits.length > 0 || summaryHit;
  // -ing/-ed forms ("learning", "checked") count only with corroborating evidence.
  const strong = matched.filter(t => query.some(q => !q.expanded && q.stem === t.stem && (!inflected(q.surface, t.surface) || corroborated)));
  const whole = matched.length === entry.core.length && strong.length === matched.length;
  const allGeneric = entry.core.every(t => t.generic);
  const adjacent = entry.core.length > 1 && contains(sequence, entry.core.map(t => t.stem));
  // A matched id word names the workflow (8) when it is specific, or when a generic id is anchored by its
  // family word, a search term, a distinctive summary word or (for multi-word ids) the adjacent id phrase.
  let idScore = 0;
  for (const token of matched) {
    const isStrong = strong.includes(token);
    let named;
    if (!entry.family && entry.core.length === 1) named = isStrong && (!HOMONYMS.has(token.surface) || corroborated);
    else if (entry.family) named = isStrong && (!token.generic || familyHit || termHits.length > 0 || (whole && !allGeneric));
    else named = isStrong && (!token.generic || adjacent || termHits.length > 0 || (whole && !allGeneric));
    idScore += named ? (entry.general && MODE_VERBS.has(token.surface) && entry.core.length === 1 ? 7 : 8) : 4;
  }
  let score = idScore + (familyHit ? FAMILY_HIT : 0);
  // A longer matched phrase is more specific evidence: one word 5, two words 6, up to 9.
  for (const term of termHits) score += Math.min(4 + term.length, 9);
  for (const token of query) {
    if (coreStems.has(token.stem) && !token.expanded) continue;
    if (termHits.some(term => term.includes(token.stem)) && !token.expanded) continue;
    let value = entry.summary.has(token.stem) ? summaryWeight(summaryDf[token.stem]) : entry.detail.has(token.stem) ? detailWeight(detailDf[token.stem]) : 0;
    if (token.expanded) value /= 2;
    score += value;
  }
  return Math.round(score * 10) / 10;
}

export const bySafety = (a, b) => (MODE_ORDER[a.defaultMode] ?? 3) - (MODE_ORDER[b.defaultMode] ?? 3) || a.id.localeCompare(b.id);

export function searchCommands(catalog, query = '', { pack, limit = 1000 } = {}) {
  if (pack && !catalog.packs.some(p => p.id === pack)) throw new Error(`Unknown pack: ${pack}`);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('limit must be between 1 and 1000.');
  const exact = (parseInvocation(query)?.id || query.trim()).toLowerCase();
  const exactCommand = catalog.commands.find(c => c.id === exact && (!pack || c.pack === pack));
  // A hyphenated id is a precise lookup; a one-word id is also an ordinary word, so related workflows follow it.
  if (exactCommand && (exact.includes('-') || parseInvocation(query))) return [{ command: exactCommand, score: 100 }];
  const exactPack = catalog.packs.find(p => p.id === exact.replace(/\s+/g, '-') || p.name.toLowerCase() === exact);
  if (exactPack && !pack && !exactCommand) pack = exactPack.id;
  const own = normalize(query);
  const expanded = own.flatMap(t => (SYNONYMS[t.stem] || []).filter(w => !own.some(o => o.stem === w)).map(w => ({ surface: w, stem: w, expanded: true })));
  const tokensForQuery = [...own, ...expanded];
  const built = index(catalog);
  const scored = catalog.commands.filter(c => !pack || c.pack === pack).map(command => {
    let score = scoreCommand(built.entries.get(command), tokensForQuery, built);
    if (command === exactCommand) score = 100;
    if (exactPack && command.pack === exactPack.id) score += 40;
    return { command, score };
  }).filter(c => !own.length || c.score > 0 || (exactPack && c.command.pack === exactPack.id));
  return scored.sort((a, b) => b.score - a.score || bySafety(a.command, b.command)).slice(0, limit);
}

export function commandById(catalog, id) {
  return catalog.commands.find(c => c.id === id) || null;
}
