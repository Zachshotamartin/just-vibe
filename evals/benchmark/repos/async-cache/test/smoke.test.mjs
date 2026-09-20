import test from 'node:test';
import assert from 'node:assert/strict';
import { createCache } from '../src/cache.mjs';
test('settled values are reused before expiry', async () => {
  let calls = 0;
  const cache = createCache(async () => ++calls, { now: () => 0 });
  assert.equal(await cache.get('t', 'k'), 1);
  assert.equal(await cache.get('t', 'k'), 1);
});
