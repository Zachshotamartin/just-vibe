import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import path from 'node:path';
import * as orbit from './fixtures/orbit/service.mjs';
import * as harbor from './fixtures/harbor/service.mjs';

// Independent contract assertions. No network, filesystem writes, live keys or model calls.
export const checks = {
  async authorization(api) {
    const rows = [{ id: 'invoice-a', tenant: 'a' }, { id: 'invoice-b', tenant: 'b' }];
    const actor = { authenticated: true, tenant: 'a' };
    assert.deepEqual(api.invoiceFor(actor, 'invoice-a', rows), rows[0], 'valid owner access');
    assert.equal(api.invoiceFor({ ...actor, authenticated: false }, 'invoice-a', rows), null, 'anonymous rejection');
    assert.equal(api.invoiceFor(actor, 'invoice-b', rows), null, 'tenant isolation');
  },
  async traversal(api) {
    const root = path.resolve('fixture-storage');
    assert.equal(api.storagePath(root, 'nested/item.txt'), path.join(root, 'nested/item.txt'), 'valid nested storage');
    assert.throws(() => api.storagePath(root, '../fixture-storage-other/item.txt'), /outside storage/, 'sibling-prefix escape');
    assert.throws(() => api.storagePath(root, '../item.txt'), /outside storage/, 'parent escape');
  },
  async assignment(api) {
    const user = { displayName: 'A', role: 'reader', tenant: 'a' };
    assert.equal(api.profilePatch(user, { displayName: 'B' }).displayName, 'B', 'valid name edit');
    const changed = api.profilePatch(user, { displayName: 'B', role: 'admin', tenant: 'b' });
    assert.equal(changed.role, 'reader', 'server-owned role');
    assert.equal(changed.tenant, 'a', 'server-owned tenant');
  },
  async destination(api) {
    const calls = [];
    const transport = async (url, options) => {
      calls.push(url);
      // Simulate a public-to-private redirect; never perform an actual request.
      if (options.redirect === 'follow') { calls.push('https://127.0.0.1/internal'); return 'private'; }
      assert.equal(options.redirect, 'error', 'redirect enforcement');
      return 'public-item';
    };
    const result = await api.readUpstream({ id: 'book', url: 'https://api.example.test/items/book' }, transport);
    assert.equal(result, 'public-item', 'fixed destination content');
    assert.deepEqual(calls, ['https://api.example.test/items/book'], 'no internal redirect');
  },
  async replay(api) {
    const key = 'synthetic-fixture-key', raw = JSON.stringify({ id: 'delivery-1' });
    const signature = createHmac('sha256', key).update(raw).digest('hex');
    const seen = new Set(), ledger = [];
    assert.throws(() => api.processWebhook(raw, '00', key, seen, ledger), /signature/, 'invalid signature');
    assert.deepEqual(ledger, [], 'no effect before signature');
    assert.equal(api.processWebhook(raw, signature, key, seen, ledger), 'applied', 'valid signed event');
    api.processWebhook(raw, signature, key, seen, ledger);
    assert.deepEqual(ledger, ['delivery-1'], 'one effect for duplicate event');
  }
};

export async function controls() {
  const outcomes = [];
  for (const [name, check] of Object.entries(checks)) {
    await check(harbor);
    // Every seeded failure must reach a contract assertion, not fail setup/import.
    await assert.rejects(() => check(orbit), error => error.code === 'ERR_ASSERTION');
    // A reject-everything remediation must fail legitimate behavior too.
    const disabled = new Proxy({}, { get() { return () => { throw Error('disabled'); }; } });
    await assert.rejects(() => check(disabled));
    outcomes.push({ case: name, corrected: 'pass', seededDefect: 'detected-by-assertion', rejectEverything: 'rejected' });
  }
  return outcomes;
}
