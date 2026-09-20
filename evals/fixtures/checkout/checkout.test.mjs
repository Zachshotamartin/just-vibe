import test from 'node:test';
import assert from 'node:assert/strict';
import { total } from './checkout.mjs';

test('checkout without a coupon charges the listed price', () => {
  assert.deepEqual(total(2000, null, 100), { error: null, totalCents: 2000 });
});
test('valid coupon preserves the response contract and discount', () => {
  assert.deepEqual(total(2000, { expiresAt: 200, percent: 10 }, 100), { error: null, totalCents: 1800 });
});
test('expired coupon preserves the existing error contract', () => {
  assert.deepEqual(total(2000, { expiresAt: 100, percent: 10 }, 100), { error: 'EXPIRED_DISCOUNT', totalCents: null });
});
