import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { discoverCapabilities, recommend } from '../plugins/just-vibe/scripts/lib/discovery.mjs';
import { routeContext, executionStrategy } from '../plugins/just-vibe/scripts/lib/routing.mjs';
import { main } from '../plugins/just-vibe/scripts/toolkit.mjs';
const catalog = loadCatalog();
function fixture(t) { const root = mkdtempSync(join(tmpdir(), 'jv-routing-')); t.after(() => rmSync(root, { recursive: true, force: true })); return root; }

test('routing uses stack and intent while preserving exclusions and explicit selection', t => {
  const root = fixture(t); writeFileSync(join(root, 'package.json'), JSON.stringify({ dependencies: { react: '19', vite: '7' } }));
  const found = discoverCapabilities(root);
  const brief = 'Fix the stale response from the request when the account changes. Do not push.';
  const result = recommend(catalog, found, brief);
  assert.equal(result.brief, brief); assert.equal(result.recommendations[0].id, 'react-async');
  assert.ok(result.recommendations[0].selectionReasons.some(r => r.includes('react')));
  assert.ok(result.recommendations.every(r => !r.id.includes('push')));
  assert.equal(recommend(catalog, found, 'Use backend-concurrency to repair stale request handling').recommendations[0].id, 'backend-concurrency');
  assert.equal(recommend(catalog, found, 'Do not push.').recommendations.length, 0);
});

test('Python manifest context is read as data and supports ML intent', t => {
  const root = fixture(t); writeFileSync(join(root, 'pyproject.toml'), '[project]\ndependencies = ["torch>=2.0", "scikit-learn"]\n');
  assert.deepEqual(routeContext(root).frameworks.sort(), ['scikit-learn', 'torch']);
  assert.equal(recommend(catalog, discoverCapabilities(root), 'Resume training from a checkpoint').recommendations[0].id, 'ml-train');
});

test('instruction memory routes to remember without taking over runtime memory work', t => {
  const root = fixture(t), found = discoverCapabilities(root);
  for (const brief of ['Update CLAUDE.md from this conversation', 'Save our decisions in AGENTS.md for both hosts', 'Preserve this conversation context for next time']) {
    assert.equal(recommend(catalog, found, brief).recommendations[0].id, 'remember');
  }
  for (const brief of ['Fix the application memory leak', 'Reduce GPU memory usage during training']) {
    assert.notEqual(recommend(catalog, found, brief).recommendations[0]?.id, 'remember');
  }
  const brief = 'Fix the stale response from the request. Do not update CLAUDE.md.';
  const result = recommend(catalog, found, brief);
  assert.equal(result.brief, brief);
  assert.equal(result.recommendations[0].id, 'react-async');
});

test('starter discovery stays small while the full catalog remains accessible', async t => {
  const root = fixture(t), outputs = [];
  assert.equal(await main(['tools', '--root', root, '--json'], { log: x => outputs.push(JSON.parse(x)) }), 0);
  assert.ok(outputs[0].starter && outputs[0].tools.length <= 16);
  assert.equal(await main(['tools', '--root', root, '--all', '--json'], { log: x => outputs.push(JSON.parse(x)) }), 0);
  assert.equal(outputs[1].tools.length, catalog.commands.length);
});

test('execution strategy distinguishes simple work, dependencies, continuation and remote effects', () => {
  assert.equal(executionStrategy('Fix the label typo. Do not deploy.').suggested, 'quick');
  for (const request of ['Deploy the approved preview', 'Resume the interrupted task', 'Implement it, then test it, then publish it']) assert.equal(executionStrategy(request).suggested, 'tracked');
});
