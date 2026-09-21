import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync, readlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = resolve(repo, 'docs/audits/ecc-snapshot.json');
const hash = value => createHash('sha256').update(value).digest('hex');
const safePath = path => typeof path === 'string' && path.length > 0 &&
  !isAbsolute(path) && !path.includes('\\') && !path.split('/').some(p => !p || p === '..' || p === '.');

export function readSnapshot(path = snapshotPath) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// This validates inventory integrity, not semantic parity or model performance.
export function validateSnapshot(snapshot, root = repo) {
  assert.equal(snapshot.schemaVersion, 1);
  assert.match(snapshot.upstream.commit, /^[a-f0-9]{40}$/);
  assert.match(snapshot.upstream.repository, /^https:\/\/github\.com\/affaan-m\/ECC$/);
  const groups = new Map();
  const verdicts = new Set(['covered', 'partial', 'absent', 'alternative', 'external', 'experimental', 'maintenance']);
  for (const group of snapshot.groups) {
    assert.ok(!groups.has(group.id), `Duplicate group: ${group.id}`);
    assert.ok(verdicts.has(group.verdict), `Invalid verdict: ${group.id}`);
    for (const key of ['title', 'current', 'difference', 'requires', 'acceptance'])
      assert.ok(typeof group[key] === 'string' && group[key].trim(), `Missing ${key}: ${group.id}`);
    for (const path of group.localEvidence) {
      assert.ok(safePath(path), `Unsafe evidence path: ${path}`);
      assert.ok(lstatSync(resolve(root, path)).isFile(), `Missing local evidence: ${path}`);
    }
    groups.set(group.id, group);
  }
  const files = new Map();
  for (const file of snapshot.files) {
    assert.ok(safePath(file.path), `Unsafe upstream path: ${file.path}`);
    assert.ok(!files.has(file.path), `Duplicate upstream file: ${file.path}`);
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
    assert.ok(['file', 'symlink'].includes(file.type));
    assert.ok(file.classification && file.groups.length, `Unclassified file: ${file.path}`);
    for (const id of file.groups) assert.ok(groups.has(id), `Unknown file group: ${id}`);
    files.set(file.path, file);
  }
  const surfaces = new Set();
  for (const surface of snapshot.surfaces) {
    assert.ok(!surfaces.has(surface.id), `Duplicate surface: ${surface.id}`);
    assert.ok(groups.has(surface.group), `Unknown surface group: ${surface.id}`);
    assert.ok(files.has(surface.path), `Missing source: ${surface.id}`);
    assert.ok(surface.scope && surface.kind, `Missing scope/kind: ${surface.id}`);
    assert.ok(files.get(surface.path).groups.includes(surface.group), `Surface not indexed: ${surface.id}`);
    assert.ok(verdicts.has(surface.verdict), `Invalid surface verdict: ${surface.id}`);
    surfaces.add(surface.id);
  }
  // Derive these inventories from the frozen file list, not from hardcoded totals.
  for (const [prefix, regex] of [
    ['skill:', /^skills\/([^/]+)\/SKILL\.md$/],
    ['command:', /^commands\/([^/]+)\.md$/],
    ['agent:', /^agents\/([^/]+)\.md$/],
    ['rule:', /^rules\/(.+)\.md$/],
    ['context:', /^contexts\/([^/]+)\.md$/],
  ]) {
    for (const path of files.keys()) {
      const match = path.match(regex);
      if (match) assert.ok(surfaces.has(prefix + match[1]), `Unmapped entry point: ${path}`);
    }
  }
  for (const [family, count] of Object.entries(snapshot.counts)) {
    const actual = family === 'files' ? files.size : snapshot.surfaces.filter(s => s.family === family).length;
    assert.equal(actual, count, `Wrong inventory count: ${family}`);
  }
  const evidence = new Set(snapshot.groups.flatMap(g => g.localEvidence));
  assert.deepEqual(Object.keys(snapshot.localEvidence).sort(), [...evidence].sort());
  for (const digest of Object.values(snapshot.localEvidence)) assert.match(digest, /^[a-f0-9]{64}$/);
  return { files: files.size, surfaces: surfaces.size, groups: groups.size, counts: snapshot.counts };
}

function inventory(root, prefix = '') {
  const result = [];
  for (const entry of readdirSync(resolve(root, prefix), { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) result.push(...inventory(root, path));
    else if (entry.isFile() || entry.isSymbolicLink()) {
      const absolute = resolve(root, path);
      result.push({ path, type: entry.isSymbolicLink() ? 'symlink' : 'file', sha256:
        hash(entry.isSymbolicLink() ? readlinkSync(absolute) : readFileSync(absolute)) });
    }
  }
  return result.sort((a, b) => a.path.localeCompare(b.path, 'en'));
}

export function compareFiles(before, after) {
  const old = new Map(before.map(f => [f.path, f]));
  const current = new Map(after.map(f => [f.path, f]));
  return {
    added: [...current.keys()].filter(p => !old.has(p)).sort(),
    removed: [...old.keys()].filter(p => !current.has(p)).sort(),
    changed: [...current.keys()].filter(p => old.has(p) &&
      (current.get(p).sha256 !== old.get(p).sha256 || current.get(p).type !== old.get(p).type)).sort(),
  };
}

export function audit({ snapshot = readSnapshot(), root = repo, upstream } = {}) {
  const summary = validateSnapshot(snapshot, root);
  const localChanged = Object.entries(snapshot.localEvidence).filter(([path, digest]) =>
    hash(readFileSync(resolve(root, path))) !== digest).map(([path]) => path);
  const drift = upstream ? compareFiles(snapshot.files, inventory(resolve(upstream))) : null;
  return { ...summary, commit: snapshot.upstream.commit, localChanged, upstreamDrift: drift,
    fresh: localChanged.length === 0 && (!drift || Object.values(drift).every(paths => paths.length === 0)),
    note: 'Inventory and source freshness only. No external code is executed; no feature parity or live-host verification is inferred.' };
}

const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const sourceUrl = (snapshot, path) => `${snapshot.upstream.repository}/blob/${snapshot.upstream.commit}/${path.split('/').map(encodeURIComponent).join('/')}`;

export function renderInventory(snapshot) {
  const lines = [
    '# ECC source-surface inventory', '',
    `Generated from the reviewed [snapshot](audits/ecc-snapshot.json) at commit \`${snapshot.upstream.commit}\`. See the [complete audit and implementation requirements](ecc-complete-audit.md).`, '',
    'Every entry below is mapped to a reviewed capability group. Rows are entry points, configuration records or supporting runtime files, not a count of independent features. Host copies, aliases and translations are not counted as new product capabilities. Source presence does not mean the feature was executed or verified.', '',
    'Verdicts: **covered** = scoped purpose exists; **partial** = related implementation with remaining depth/functionality; **absent** = no dedicated implementation; **alternative** = different implementation/policy; **external** = separately provided service/recipe; **experimental** = upstream alpha; **maintenance** = repository/release infrastructure.', '',
  ];
  const families = [...new Set(snapshot.surfaces.map(s => s.family))].sort();
  for (const family of families) {
    lines.push(`## ${family}`, '', '| Source entry | Form | Verdict | Capability group |', '| --- | --- | --- | --- |');
    for (const s of snapshot.surfaces.filter(s => s.family === family))
      lines.push(`| [${cell(s.name)}](${sourceUrl(snapshot, s.path)}) | ${s.kind} | ${s.verdict} | [${s.group}](ecc-complete-audit.md#${s.group}) |`);
    lines.push('');
  }
  lines.push('## Supporting files', '',
    `All ${snapshot.files.length.toLocaleString('en')} upstream files, including supporting skill scripts, translations, assets, tests, schemas, install metadata and compatibility copies, have a SHA-256 identity and classification in [the machine-readable ledger](audits/ecc-snapshot.json). A file classification accounts for scope; it is not a claim of line-by-line correctness review.`, '');
  return lines.join('\n');
}

export function renderRequirements(snapshot) {
  const lines = [];
  for (const g of snapshot.groups) {
    const surfaces = snapshot.surfaces.filter(s => s.group === g.id);
    const representative = [...new Set(surfaces.map(s => s.path))].slice(0, 6);
    lines.push(`<a id="${g.id}"></a>`, '', `### ${g.title}`, '',
      `**Disposition:** ${g.verdict}. **Priority:** ${g.priority}.`, '',
      `**Current:** ${g.current}`, '', `**Difference:** ${g.difference}`, '',
      `**Requires:** ${g.requires}`, '', `**Acceptance:** ${g.acceptance}`, '',
      `**Local evidence:** ${g.localEvidence.map(p => /^(scripts|website|tests)\//.test(p)
        ? `\`${p}\` (repository checkout)` : `[${p.split('/').at(-1)}](../${p})`).join(', ')}.`, '',
      `**Upstream examples:** ${representative.map(p => `[${p}](${sourceUrl(snapshot, p)})`).join(', ') || 'See the complete source index'}. All related rows appear in the [surface inventory](ecc-surface-inventory.md).`, '');
  }
  return lines.join('\n');
}

export function renderReports(snapshot = readSnapshot(), root = repo) {
  validateSnapshot(snapshot, root);
  writeFileSync(resolve(root, 'docs/ecc-surface-inventory.md'), renderInventory(snapshot));
  const file = resolve(root, 'docs/ecc-complete-audit.md');
  const text = readFileSync(file, 'utf8');
  const start = '<!-- BEGIN GENERATED REQUIREMENTS -->', end = '<!-- END GENERATED REQUIREMENTS -->';
  assert.equal(text.split(start).length, 2, 'Expected one requirements start marker');
  assert.equal(text.split(end).length, 2, 'Expected one requirements end marker');
  assert.ok(text.indexOf(start) < text.indexOf(end), 'Reversed requirements markers');
  writeFileSync(file, `${text.slice(0, text.indexOf(start) + start.length)}\n\n${renderRequirements(snapshot)}\n${text.slice(text.indexOf(end))}`);
}

export function main(args = process.argv.slice(2)) {
  let upstream, render = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--upstream' && args[i + 1] && !args[i + 1].startsWith('--')) upstream = args[++i];
    else if (args[i] === '--render') render = true;
    else if (args[i] !== '--check') throw Error('Usage: npm run audit:ecc -- [--check] [--render] [--upstream <clean extracted source directory>]');
  }
  if (render) renderReports();
  const result = audit({ upstream });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.fresh) process.exitCode = 1;
}

if (process.argv[1] && relative(resolve(process.argv[1]), fileURLToPath(import.meta.url)) === '') {
  try { main(); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
