#!/usr/bin/env node
// Searches the router's numeric weights (DEFAULT_WEIGHTS) against the routing corpus without
// grading on the requests it tuned on. Five folds are stratified by command: each fold tunes on
// the other four and reports on itself. Only when the held-out mean improves on both first choice
// and absence does a final pass tune on the whole corpus and print weights to adopt, together with
// the catalog-example scores they must not regress. Lexical routing only (no assistance gate).
//
//   node scripts/tune-routing.mjs [--folds=5] [--passes=2] [--absence=3] [--json]
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { DEFAULT_WEIGHTS } from '../plugins/just-vibe/scripts/lib/search.mjs';
import { catalogExamples, loadCorpus, measureRouting } from './lib/routing-corpus.mjs';

const arg = (name, fallback) => Number(process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback);
const FOLDS = arg('folds', 5), PASSES = arg('passes', 2), ABSENCE = arg('absence', 3), json = process.argv.includes('--json');
const catalog = loadCatalog();
const corpus = loadCorpus();

// Fold membership is deterministic: requests of each command are dealt round-robin.
const seen = new Map();
const fold = corpus.map((item) => { const n = seen.get(item.command) || 0; seen.set(item.command, n + 1); return n % FOLDS; });

const measure = (requests, weights) => measureRouting(requests, { catalog, assist: false, weights }).summary;
// First choice matters most, and a workflow missing from the candidates is worse than a low
// rank: the agent can still choose a low-ranked workflow, but not an absent one. With absence
// weighted 1:1 the search traded absences for first choices, so it is weighted 3:1 by default.
const objective = (m) => m.first + 0.5 * m.top3 - ABSENCE * m.absent;

// Moves: scale real weights, shift integer thresholds; tier arrays move one element at a time
// and document-frequency limits stay strictly ascending.
const INTEGER = new Set(['summaryHitDf', 'genericDf', 'summaryDf', 'detailDf', 'stackPackLexical']);
const FIXED = new Set(['explicitName']);
function neighbours(weights) {
  const out = [];
  for (const [key, value] of Object.entries(weights)) {
    if (FIXED.has(key)) continue;
    const values = Array.isArray(value) ? value : [value];
    values.forEach((v, i) => {
      const moves = INTEGER.has(key) ? [-2, -1, 1, 2].map((d) => v + d) : [0.5, 0.75, 1.25, 1.5, 2].map((m) => Math.round(v * m * 100) / 100);
      for (const next of moves) {
        if (next < 0 || (INTEGER.has(key) && next < 1) || next === v) continue;
        const changed = Array.isArray(value) ? value.map((x, j) => (j === i ? next : x)) : next;
        if (Array.isArray(changed) && INTEGER.has(key) && changed.some((x, j) => j && x <= changed[j - 1])) continue;
        out.push({ key, index: Array.isArray(value) ? i : null, from: v, to: next, weights: { ...weights, [key]: changed } });
      }
    });
  }
  return out;
}

function tune(requests, log = () => {}) {
  let best = { ...DEFAULT_WEIGHTS }, bestScore = objective(measure(requests, best));
  for (let pass = 0; pass < PASSES; pass++) {
    let improved = false;
    for (const key of Object.keys(DEFAULT_WEIGHTS)) {
      for (const candidate of neighbours(best).filter((n) => n.key === key)) {
        const score = objective(measure(requests, candidate.weights));
        if (score > bestScore + 1e-3) { best = candidate.weights; bestScore = score; improved = true; log(`  pass ${pass + 1}: ${key}${candidate.index === null ? '' : `[${candidate.index}]`} ${candidate.from} -> ${candidate.to} (${score.toFixed(3)})`); }
      }
    }
    if (!improved) break;
  }
  return best;
}

const changes = (weights) => Object.fromEntries(Object.entries(weights).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(DEFAULT_WEIGHTS[k])));
const mean = (rows, key) => Math.round((1000 * rows.reduce((n, r) => n + r[key], 0)) / rows.length) / 1000;
const report = { folds: [], heldOut: null, adopted: null };
const say = json ? () => {} : console.log;

for (let k = 0; k < FOLDS; k++) {
  const train = corpus.filter((_, i) => fold[i] !== k), test = corpus.filter((_, i) => fold[i] === k);
  say(`Fold ${k + 1}/${FOLDS}: tuning on ${train.length}, holding out ${test.length}`);
  const tuned = tune(train, say);
  const before = measure(test, DEFAULT_WEIGHTS), after = measure(test, tuned);
  report.folds.push({ fold: k + 1, changes: changes(tuned), before, after });
  say(`  held out: first ${before.first} -> ${after.first}, top3 ${before.top3} -> ${after.top3}, absent ${before.absent} -> ${after.absent}`);
}
const field = (side, key) => mean(report.folds.map((f) => f[side]), key);
report.heldOut = Object.fromEntries(['first', 'top3', 'absent'].map((key) => [key, { before: field('before', key), after: field('after', key) }]));
const generalizes = report.heldOut.first.after > report.heldOut.first.before && report.heldOut.absent.after < report.heldOut.absent.before;
say(`Held-out mean: ${JSON.stringify(report.heldOut)}`);
if (generalizes) {
  say('Held-out folds improved on first choice and absence; tuning on the whole corpus.');
  const tuned = tune(corpus, say), examples = catalogExamples(catalog);
  report.adopted = { weights: tuned, changes: changes(tuned), corpus: { before: measure(corpus, DEFAULT_WEIGHTS), after: measure(corpus, tuned) },
    examples: { before: measure(examples, DEFAULT_WEIGHTS), after: measure(examples, tuned) } };
  const e = report.adopted.examples;
  report.adopted.examplesRegress = e.after.first < e.before.first || e.after.top3 < e.before.top3 || e.after.absent > e.before.absent;
  say(`Proposed changes: ${JSON.stringify(report.adopted.changes)}`);
  say(`Catalog examples: ${JSON.stringify(e)}${report.adopted.examplesRegress ? ' (REGRESSION: do not adopt)' : ''}`);
} else say('Held-out folds did not improve on both first choice and absence; keep the current weights.');
if (json) console.log(JSON.stringify(report, null, 2));
