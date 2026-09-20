import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog, getCommand } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { createRun } from '../plugins/just-vibe/scripts/lib/run.mjs';
import { main } from '../plugins/just-vibe/scripts/toolkit.mjs';

const catalog = loadCatalog();
const scenarios = JSON.parse(readFileSync(new URL('../evals/scenarios.json', import.meta.url))).scenarios;

test('every invocation preserves scenario context and mode through both host mappings', async t => {
  const root = mkdtempSync(join(tmpdir(), 'just-vibe-scenarios-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(scenarios.map(s => s.id).sort(), catalog.commands.map(c => c.id).sort());
  for (const scenario of scenarios) {
    const brief = `${scenario.brief}\nAdditional context: preserve existing changes.\nDo not publish or spend money.`;
    const run = createRun(catalog, scenario.id, { root, brief, mode: scenario.mode,
      context: { constraints: ['Preserve existing changes', 'Do not publish or spend money'] } });
    assert.equal(run.brief, brief, scenario.id);
    assert.equal(run.mode, scenario.mode);
    assert.equal(run.command, getCommand(catalog, scenario.id, { canonical: true }).id);
    for (const host of ['codex', 'claude']) {
      const lines = [];
      assert.equal(await main(['show', scenario.id, '--target', host, '--json'], { log: s => lines.push(s) }), 0);
      const result = JSON.parse(lines[0]);
      assert.ok(result.instructions.length > 500);
      assert.equal(result.id, scenario.id);
      assert.ok(result.invocation.includes(scenario.id));
    }
  }
});

test('session CLI carries a read-only task through observation and verified completion without writing files', async t => {
  const root = mkdtempSync(join(tmpdir(), 'just-vibe-session-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  async function session(op, payload) {
    const lines = [], errors = [];
    const status = await main(['session', op], { input: async () => JSON.stringify(payload), log: s => lines.push(s), error: s => errors.push(s) });
    assert.equal(status, 0, errors.join('\n'));
    return JSON.parse(lines[0]);
  }
  let run = await session('create', { command: 'auto', root, brief: 'Orient this project without changing it.', mode: 'inspect', context: { successCriteria: ['Project inspected'] } });
  run = await session('start', { run, stage: { id: 'orientation', command: 'orient', effect: 'read', target: root, action: 'Inspect manifests' } });
  const lines = [];
  assert.equal(await main(['inspect', '--root', root], { log: s => lines.push(s) }), 0);
  const observation = JSON.parse(lines[0]);
  const outcome = { status: 'completed', summary: 'Inspected empty fixture project.',
    evidence: [{ reference: 'inspect stdout', detail: `Found ${observation.manifests.length} manifests.`, result: 'pass' }],
    criteria: [{ criterion: 'Project inspected', result: 'pass', evidence: [0] }] };
  run = await session('record', { run, outcome: { ...outcome, id: 'orientation' } });
  run = await session('finish', { run, outcome });
  assert.equal(run.status, 'completed');
  assert.equal(run.mode, 'inspect');
});
