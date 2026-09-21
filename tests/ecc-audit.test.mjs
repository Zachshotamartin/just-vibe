import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readSnapshot, validateSnapshot, compareFiles, audit, renderInventory, renderRequirements } from '../scripts/audit-ecc.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const snapshot = readSnapshot();
const digest = text => createHash('sha256').update(text).digest('hex');

test('frozen ECC audit accounts for every canonical surface and indexed file', () => {
  const result = validateSnapshot(snapshot);
  assert.equal(result.files, 3734);
  assert.equal(result.surfaces, 1243);
  assert.equal(result.groups, 58);
  assert.deepEqual([result.counts.skill, result.counts.command, result.counts.agent], [292, 94, 68]);
  assert.equal(snapshot.upstream.commit, '2b6e839771e53096d8451a213d40dc64ec8acac0');
});

test('removing a mapped skill still fails if the claimed surface count is reduced too', () => {
  const altered = structuredClone(snapshot);
  altered.surfaces = altered.surfaces.filter(s => s.id !== 'skill:hookify-rules');
  altered.counts.skill--;
  assert.throws(() => validateSnapshot(altered), /Unmapped entry point/);
});

test('inventories reject duplicate IDs, invented evidence and unclassified files', () => {
  const duplicate = structuredClone(snapshot);
  duplicate.surfaces.push(duplicate.surfaces[0]);
  assert.throws(() => validateSnapshot(duplicate), /Duplicate surface/);
  const source = structuredClone(snapshot);
  source.surfaces[0].path = 'missing-source.md';
  assert.throws(() => validateSnapshot(source), /Missing source/);
  const classification = structuredClone(snapshot);
  classification.files[0].groups = [];
  assert.throws(() => validateSnapshot(classification), /Unclassified file/);
  const traversal = structuredClone(snapshot);
  traversal.groups[0].localEvidence = ['../outside'];
  assert.throws(() => validateSnapshot(traversal), /Unsafe evidence path/);
});

test('source drift distinguishes additions, removals, content changes and symlink changes', () => {
  const before = [
    { path: 'same', type: 'file', sha256: '1' },
    { path: 'changed', type: 'file', sha256: '1' },
    { path: 'removed', type: 'file', sha256: '1' },
    { path: 'kind', type: 'file', sha256: '1' },
  ];
  const after = [
    { path: 'same', type: 'file', sha256: '1' },
    { path: 'changed', type: 'file', sha256: '2' },
    { path: 'added', type: 'file', sha256: '1' },
    { path: 'kind', type: 'symlink', sha256: '1' },
  ];
  assert.deepEqual(compareFiles(before, after), {
    added: ['added'], removed: ['removed'], changed: ['changed', 'kind'],
  });
});

test('audit detects stale local evidence and changed upstream without executing code', () => {
  const temp = mkdtempSync(join(tmpdir(), 'just-vibe-ecc-audit-'));
  try {
    mkdirSync(join(temp, 'upstream'));
    const code = 'throw new Error("must never execute");\n';
    writeFileSync(join(temp, 'upstream', 'entry.js'), code);
    writeFileSync(join(temp, 'local.md'), 'original');
    const fixture = {
      schemaVersion: 1, upstream: snapshot.upstream,
      groups: [{ id: 'example', title: 'Example', verdict: 'partial', current: 'Evidence', difference: 'Missing behavior', requires: 'Work', acceptance: 'Check', localEvidence: ['local.md'] }],
      files: [{ path: 'entry.js', type: 'file', sha256: digest(code), classification: 'runtime-source', groups: ['example'] }],
      surfaces: [{ id: 'runtime:entry', family: 'runtime', path: 'entry.js', group: 'example', kind: 'source', scope: 'entry', verdict: 'partial' }],
      counts: { files: 1, runtime: 1 }, localEvidence: { 'local.md': digest('original') },
    };
    assert.equal(audit({ snapshot: fixture, root: temp, upstream: join(temp, 'upstream') }).fresh, true);
    writeFileSync(join(temp, 'local.md'), 'edited');
    writeFileSync(join(temp, 'upstream', 'entry.js'), code + '// drift\n');
    const result = audit({ snapshot: fixture, root: temp, upstream: join(temp, 'upstream') });
    assert.equal(result.fresh, false);
    assert.deepEqual(result.localChanged, ['local.md']);
    assert.deepEqual(result.upstreamDrift.changed, ['entry.js']);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('published audit tables reproduce the ledger without omitting optional or experimental gaps', () => {
  assert.equal(readFileSync(resolve(root, 'docs/ecc-surface-inventory.md'), 'utf8'), renderInventory(snapshot));
  const report = readFileSync(resolve(root, 'docs/ecc-complete-audit.md'), 'utf8');
  const body = report.split('<!-- BEGIN GENERATED REQUIREMENTS -->\n\n')[1].split('\n<!-- END GENERATED REQUIREMENTS -->')[0];
  assert.equal(body, renderRequirements(snapshot));
  assert.ok(snapshot.groups.some(g => g.id === 'graph' && g.verdict === 'experimental'));
  assert.ok(snapshot.groups.some(g => g.id === 'custom-hooks' && g.difference.includes('no Hookify evaluator')));
  assert.ok(snapshot.groups.some(g => g.id === 'sessions' && g.verdict === 'partial'));
});
