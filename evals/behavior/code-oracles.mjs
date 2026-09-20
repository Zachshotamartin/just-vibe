import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
const [id, root] = process.argv.slice(2);
const moduleAt = name => import(pathToFileURL(join(root, name)).href);
function deferred() { let resolve, reject; const promise = new Promise((a,b) => {resolve=a;reject=b;});return {promise,resolve,reject}; }
if (id === 'checkout') {
  const {total} = await moduleAt('checkout.mjs');
  assert.equal(total([{price:100,quantity:2}],null),200);
  assert.equal(total([{price:100,quantity:2}],{amount:0}),200);
  assert.equal(total([{price:100,quantity:2}],{amount:25}),175);
  assert.equal(total([],{amount:25}),-25);
} else if (id === 'react-race') {
  const {createLoader} = await moduleAt('loader.mjs');
  const events=[], requests=[];
  const loader=createLoader(() => {const d=deferred();requests.push(d);return d.promise;},e=>events.push(e));
  const a=loader.select('A'), b=loader.select('B');
  requests[1].resolve({id:'B'});await b; requests[0].resolve({id:'A'});await a;
  assert.equal(events.at(-1).account.id,'B');
  const c=loader.select('C'),d=loader.select('D');
  requests[3].resolve({id:'D'});await d;requests[2].reject(Error('stale failure'));await c;
  assert.equal(events.at(-1).account.id,'D');
  const e=loader.select('E');loader.dispose();const count=events.length;requests[4].resolve({id:'E'});await e;
  assert.equal(events.length,count);
} else if (id === 'idempotency') {
  const {service} = await moduleAt('orders.mjs');
  let calls=0; const gate=deferred();
  const order=service(async payload => {calls++;await gate.promise;return {orderId:'one',...payload};});
  const p=order('key',{sku:'a',quantity:2}),q=order('key',{quantity:2,sku:'a'});
  gate.resolve(); const [a,b]=await Promise.all([p,q]);assert.deepEqual(a,b);assert.equal(calls,1);
  await assert.rejects(async()=>order('key',{sku:'a',quantity:3}));assert.equal(calls,1);
  const next=await order('different',{sku:'a',quantity:2});assert.equal(calls,2);assert.equal(next.sku,'a');
} else if (id === 'authz') {
  const {canRead} = await moduleAt('access.mjs');
  const doc={ownerId:'u1',tenantId:'t1'};
  assert.equal(canRead({id:'u1',tenantId:'t1',role:'user'},doc),true);
  assert.equal(canRead({id:'u2',tenantId:'t1',role:'admin'},doc),true);
  assert.equal(canRead({id:'u2',tenantId:'t1',role:'user'},doc),false);
  assert.equal(canRead({id:'u1',tenantId:'t2',role:'user'},doc),false);
  assert.equal(canRead({id:'u2',tenantId:'t2',role:'admin'},doc),false);
} else if (id === 'regression-test') {
  const scratch=mkdtempSync(join(tmpdir(),'just-vibe-mutation-'));
  try {
    cpSync(join(root,'regression.test.mjs'),join(scratch,'regression.test.mjs'));
    const good=readFileSync(join(root,'checkout.mjs'),'utf8');
    for (const [source,shouldPass] of [[good,true],[good.replace('(coupon?.amount ?? 0)','coupon.amount'),false],[good.replace('(coupon?.amount ?? 0)','(coupon?.amount || 17)'),false]]) {
      writeFileSync(join(scratch,'checkout.mjs'),source);
      const r=spawnSync(process.execPath,['--test','regression.test.mjs'],{cwd:scratch,encoding:'utf8',timeout:5000});
      if(r.error)throw r.error;
      assert.equal(r.status===0,shouldPass,`Regression sensitivity mismatch: ${r.stdout}\n${r.stderr}`);
      if(!shouldPass)assert.match(r.stdout,/AssertionError|TypeError/,'Mutation must fail behavior, not environment setup');
    }
  } finally {rmSync(scratch,{recursive:true,force:true});}
} else throw Error('Unknown code oracle');
console.log(`${id}: independent behavior checks passed`);
