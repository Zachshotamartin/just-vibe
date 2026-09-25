import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog, getCommand } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { discoverCapabilities, listTools } from '../plugins/just-vibe/scripts/lib/discovery.mjs';
import { workflowRequirements } from '../plugins/just-vibe/scripts/lib/capability-guidance.mjs';

const catalog = loadCatalog();
function folder(t) { const root = mkdtempSync(join(tmpdir(), 'jv-caps-')); t.after(() => rmSync(root, { recursive: true, force: true })); return root; }
const status = (found, id) => listTools(catalog, found, { query: id, all: true }).find(c => c.id === id);

test('provider workflows declare the provider they need, so unobserved access is not reported as ready (A5-04)', t => {
  const found = discoverCapabilities(folder(t));
  for (const [id, capability] of [['github-issue', 'github.context'], ['github-release', 'github.context'], ['vercel-preview', 'vercel.context'], ['vercel-release-check', 'vercel.context']]) {
    const entry = status(found, id);
    assert.notEqual(entry.status, 'available', id);
    assert.ok(entry.reasons.some(r => r.startsWith(`${capability}:`)), id);
  }
  const available = listTools(catalog, found, { pack: 'github', available: true }).map(c => c.id);
  assert.deepEqual(available, [], 'No GitHub workflow is ready without GitHub access');
});

test('workflows that need a local checkout declare git.repo (A5-04, A2-17)', t => {
  const found = discoverCapabilities(folder(t));
  for (const id of ['github-pr', 'github-fix-ci', 'github-address-review', 'pr', 'release']) {
    assert.ok(getCommand(catalog, id).capabilities.includes('git.repo'), id);
    assert.equal(status(found, id).status, 'blocked', `${id} cannot run outside a Git repository`);
  }
  assert.ok(!getCommand(catalog, 'review').capabilities.includes('git.repo'), 'Repository and file reviews need no Git');
});

test('research and buy-versus-build declare current external evidence (A1-07, B1-05)', t => {
  const found = discoverCapabilities(folder(t));
  for (const id of ['research', 'decision-buy-build']) {
    const entry = status(found, id);
    assert.equal(entry.status, 'unknown', id);
    assert.ok(entry.reasons.some(r => r.startsWith('web.research:')), id);
  }
  assert.doesNotMatch(getCommand(catalog, 'research').modePolicy, /decision deadline/);
});

test('visual workflows require browser evidence when they apply changes (A2-05)', () => {
  for (const id of ['design', 'polish', 'match']) {
    const command = getCommand(catalog, id);
    assert.ok(workflowRequirements(command, 'apply', 'Polish the billing page spacing').some(r => r.id === 'browser'), id);
    assert.ok(!workflowRequirements(command, 'inspect', 'Review the billing page spacing').some(r => r.id === 'browser'), id);
    assert.ok(!workflowRequirements(command, 'apply', 'Polish the spacing without opening a browser').some(r => r.id === 'browser'), `${id} honors a no-browser brief`);
  }
});

test('rendered-interaction workflows declare browser evidence; comparing supplied captures does not (A6-12)', t => {
  const found = discoverCapabilities(folder(t));
  for (const id of ['ui-accessibility', 'ui-responsive', 'ui-motion']) {
    assert.ok(getCommand(catalog, id).capabilities.includes('browser.inspect'), id);
    assert.notEqual(status(found, id).status, 'available', `${id} is not ready without an observed browser`);
  }
  assert.ok(!getCommand(catalog, 'ui-visual-diff').capabilities.includes('browser.inspect'), 'ui-visual-diff compares supplied captures by default');
});

test('ML deployment and LLM workflows declare the evidence their methods read (A9-06)', () => {
  const caps = id => getCommand(catalog, id).capabilities;
  for (const id of ['ml-serving', 'ml-batch', 'ml-inference-perf', 'ml-rollout']) assert.ok(caps(id).includes('ml.artifacts'), id);
  for (const id of ['ml-monitor', 'llm-cost']) assert.ok(caps(id).includes('telemetry.read'), id);
  for (const id of ['llm-prompt', 'llm-structured', 'llm-retrieval', 'llm-cost']) assert.ok(!caps(id).includes('ml.artifacts'), `${id} reads no training artifacts`);
  for (const id of ['llm-evals', 'llm-rag', 'llm-tools', 'llm-injection']) assert.ok(caps(id).length > 0, `${id} declares its evidence`);
});
