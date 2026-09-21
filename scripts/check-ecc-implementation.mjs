import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const hash = (path) =>
  createHash('sha256')
    .update(readFileSync(resolve(root, path)))
    .digest('hex');
export function checkImplementation({ implementation } = {}) {
  const snapshot = JSON.parse(readFileSync(resolve(root, 'docs/audits/ecc-snapshot.json'))),
    ledger = implementation || JSON.parse(readFileSync(resolve(root, 'docs/audits/ecc-implementation.json')));
  if (ledger.sourceCommit !== snapshot.upstream.commit)
    throw Error('Implementation baseline changed.');
  const existing = new Set([
    'workflow',
    'architecture',
    'vite',
    'database',
    'learning',
    'install',
    'continuity',
    'context-health',
    'deprecated',
  ]);
  const expected = snapshot.groups
    .filter((g) => !existing.has(g.id))
    .map((g) => g.id)
    .sort();
  if (JSON.stringify(ledger.items.map((i) => i.id).sort()) !== JSON.stringify(expected))
    throw Error('Implementation ledger omits or duplicates baseline groups.');
  for (const item of ledger.items) {
    if (
      !['runtime', 'method', 'integration', 'maintenance'].includes(item.delivery) ||
      item.status !== 'implemented' ||
      !item.evidence.length ||
      !item.verification.length ||
      !item.limits
    )
      throw Error(`Incomplete delivery record: ${item.id}`);
    const acceptance = item.acceptanceReview;
    if (!acceptance || !['partial', 'pending', 'verified'].includes(acceptance.status) ||
        !Array.isArray(acceptance.checks) || !Array.isArray(acceptance.remaining) ||
        (acceptance.status === 'verified' && (acceptance.remaining.length || !acceptance.checks.length)) ||
        (acceptance.status !== 'verified' && !acceptance.remaining.length))
      throw Error(`Acceptance must distinguish observed checks from remaining work: ${item.id}`);
    for (const check of acceptance.checks) {
      if (!check.path || check.path.startsWith('/') || check.path.split('/').includes('..') ||
          !existsSync(resolve(root, check.path)) || !check.case ||
          !readFileSync(resolve(root, check.path), 'utf8').includes(check.case) ||
          !['passed', 'pending'].includes(check.result) || !check.environment ||
          (acceptance.status === 'verified' && check.result !== 'passed'))
        throw Error(`Invalid acceptance evidence: ${item.id}`);
    }
    for (const evidence of item.evidence) {
      if (
        !evidence.path ||
        evidence.path.startsWith('/') ||
        evidence.path.split('/').includes('..') ||
        !existsSync(resolve(root, evidence.path)) ||
        hash(evidence.path) !== evidence.sha256
      )
        throw Error(`Stale implementation evidence: ${item.id}/${evidence.path}`);
    }
  }
  return {
    sourceCommit: ledger.sourceCommit,
    groups: ledger.items.length,
    status: ledger.status,
    delivery: ledger.items.reduce((a, i) => ((a[i.delivery] = (a[i.delivery] || 0) + 1), a), {}),
    acceptance: ledger.items.reduce((a, i) => ((a[i.acceptanceReview.status] = (a[i.acceptanceReview.status] || 0) + 1), a), {}),
    note: 'Source integrity and acceptance-accounting validation only; this command does not run the named tests. Partial/pending acceptance is not completion or universal ECC parity.',
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  console.log(JSON.stringify(checkImplementation(), null, 2));
