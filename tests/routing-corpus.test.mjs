import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { loadCorpus, catalogExamples, measureRouting } from '../scripts/lib/routing-corpus.mjs';

// Ratchet: raise these when routing improves; lowering one needs a reviewed reason.
// Corpus: 1,183 realistic requests from the September 2026 review (tests/fixtures/routing/corpus.json).
const CORPUS = { first: 0.352, top3: 0.532, absent: 0.293, activates: 0.538, activeFirst: 0.377 };
// The catalog's own examples, excluding entry points the router never suggests.
const EXAMPLES = { first: 0.682, top3: 0.888, absent: 0.048 };

const catalog = loadCatalog();
const check = (summary, floor, t) => {
  t.diagnostic(JSON.stringify(summary));
  for (const key of ['first', 'top3', 'activates', 'activeFirst']) if (key in floor) assert.ok(summary[key] >= floor[key], `${key} ${summary[key]} fell below ${floor[key]}`);
  assert.ok(summary.absent <= floor.absent, `absent ${summary.absent} rose above ${floor.absent}`);
};

test('realistic requests route to an acceptable workflow at or above the ratchet', t => {
  check(measureRouting(loadCorpus(), { catalog }).summary, CORPUS, t);
});

test('catalog example requests route to their own workflow at or above the ratchet', t => {
  check(measureRouting(catalogExamples(catalog), { catalog, assist: false }).summary, EXAMPLES, t);
});
