import {test} from 'node:test';
import assert from 'node:assert/strict';
import {total} from '../src/invoice.mjs';
test('explicit zero and omitted adjustment',()=>{
  assert.equal(total([{price:20,quantity:2}],{amount:0}),40);
  assert.equal(total([{price:20,quantity:2}]),40);
});
