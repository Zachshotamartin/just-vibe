import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCache} from '../src/cache.mjs';
test('tenant isolation',async()=>{
  const cache=createCache(async tenant=>tenant);
  assert.equal(await cache.get('one','shared'),'one');
  assert.equal(await cache.get('two','shared'),'two');
});
