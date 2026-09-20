import test from 'node:test';
import assert from 'node:assert/strict';
import {total} from '../src/invoice.mjs';
test('ordinary discount',()=>assert.equal(total([{price:20,quantity:2}],{amount:7}),33));
