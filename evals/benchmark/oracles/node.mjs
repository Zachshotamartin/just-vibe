import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
const [id, root] = process.argv.slice(2), checks = [];
async function check(name, fn) { try { await fn(); checks.push({name,pass:true}); } catch(error) { checks.push({name,pass:false,detail:error.stack}); } }
const deferred = () => { let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}; };
const tick = () => new Promise(resolve=>setImmediate(resolve));
const bounded = promise => Promise.race([promise,new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('Promise did not settle promptly')),300);})]);
if (id === 'async-cache') {
  const {createCache}=await import(pathToFileURL(join(root,'src/cache.mjs')));
  const {createView}=await import(pathToFileURL(join(root,'src/view.mjs')));
  await check('tenant identity, delimiter collisions and falsey values',async()=>{
    const cache=createCache(async(t,k)=>`${t}|${k}`);
    assert.equal(await cache.get('a','x'),'a|x');assert.equal(await cache.get('b','x'),'b|x');
    assert.equal(await cache.get('a:b','c'),'a:b|c');assert.equal(await cache.get('a','b:c'),'a|b:c');
    let calls=0;const empty=createCache(async()=>{calls++;return undefined;});
    assert.equal(await empty.get('a','e'),undefined);assert.equal(await empty.get('a','e'),undefined);assert.equal(calls,1);
  });
  await check('pending coalescing and expiry measured from completion',async()=>{
    let now=0,calls=0;const gate=deferred();const cache=createCache(()=>{calls++;return gate.promise;},{ttl:10,now:()=>now});
    const first=cache.get('t','x'),second=cache.get('t','x');await tick();assert.equal(calls,1);
    now=50;gate.resolve(0);assert.deepEqual(await Promise.all([first,second]),[0,0]);
    now=59;assert.equal(await cache.get('t','x'),0);assert.equal(calls,1);
    now=60;await cache.get('t','x');assert.equal(calls,2);
    let n=0;const zero=createCache(async()=>++n,{ttl:0,now:()=>0});
    assert.deepEqual(await Promise.all([zero.get('t','z'),zero.get('t','z')]),[1,1]);await zero.get('t','z');assert.equal(n,2);
  });
  await check('one waiter cancellation cannot poison shared work',async()=>{
    const gate=deferred(),controller=new AbortController();let calls=0;
    const cache=createCache((t,k,options)=>{calls++;assert.ok(!options?.signal);return gate.promise;});
    const first=cache.get('t','k',{signal:controller.signal});const second=cache.get('t','k');
    const rejected=assert.rejects(bounded(first),e=>e.name==='AbortError');controller.abort();await rejected;
    gate.resolve('value');assert.equal(await second,'value');assert.equal(await cache.get('t','k'),'value');assert.equal(calls,1);
  });
  await check('pre-abort and listener cleanup on settlement',async()=>{
    let calls=0;const cache=createCache(()=>++calls);const aborted=new AbortController();aborted.abort();
    await assert.rejects(()=>cache.get('t','k',{signal:aborted.signal}),e=>e.name==='AbortError');assert.equal(calls,0);
    let listeners=new Set();const signal={aborted:false,addEventListener(type,fn){assert.equal(type,'abort');listeners.add(fn)},removeEventListener(type,fn){listeners.delete(fn)}};
    assert.equal(await cache.get('t','k',{signal}),1);assert.equal(listeners.size,0);
    const failed=createCache(()=>Promise.reject(Error('backend')));await assert.rejects(()=>failed.get('t','k',{signal}),/backend/);assert.equal(listeners.size,0);
  });
  await check('detached old success cannot overwrite or delete new generation',async()=>{
    const a=deferred(),b=deferred();let n=0;const cache=createCache(()=>++n===1?a.promise:b.promise);
    const old=cache.get('t','k');await tick();cache.invalidate('t','k');const fresh=cache.get('t','k');await tick();
    b.resolve('new');assert.equal(await fresh,'new');a.resolve('old');assert.equal(await old,'old');assert.equal(await cache.get('t','k'),'new');assert.equal(n,2);
  });
  await check('detached old failure cannot clear newer pending work',async()=>{
    const a=deferred(),b=deferred();let n=0;const cache=createCache(()=>++n===1?a.promise:b.promise);
    const old=cache.get('t','k');const rejection=assert.rejects(old,/old failure/);await tick();cache.invalidate('t','k');const fresh=cache.get('t','k');await tick();
    a.reject(Error('old failure'));await rejection;const joined=cache.get('t','k');await tick();assert.equal(n,2);b.resolve('fresh');assert.deepEqual(await Promise.all([fresh,joined]),['fresh','fresh']);
  });
  await check('synchronous failures and asynchronous failures are retryable',async()=>{
    let calls=0;const cache=createCache(()=>{calls++;if(calls===1)throw Error('sync');if(calls===2)return Promise.reject(Error('async'));return null;});
    await assert.rejects(()=>cache.get('t','k'),/sync/);await assert.rejects(()=>cache.get('t','k'),/async/);assert.equal(await cache.get('t','k'),null);assert.equal(calls,3);
  });
  await check('latest view result, stale failure and permanent disposal',async()=>{
    const requests=[],events=[];const view=createView({get(){const d=deferred();requests.push(d);return d.promise;}},value=>events.push(value));
    const a=view.select('t','a'),b=view.select('t','b');requests[1].resolve('B');await b;requests[0].resolve('A');await a;assert.equal(events.at(-1).value,'B');
    const c=view.select('t','c'),d=view.select('t','d');requests[3].resolve('D');await d;requests[2].reject(Error('old'));await c;assert.equal(events.at(-1).value,'D');
    const e=view.select('t','e');view.dispose();const length=events.length;requests[4].resolve('E');await e;assert.equal(events.length,length);
    await bounded(view.select('t','after-dispose'));assert.equal(requests.length,5);assert.equal(events.length,length);
  });
} else if(id==='scoped-commit') {
  const {total,formatLabel,currency}=await import(pathToFileURL(join(root,'src/invoice.mjs')));
  await check('missing and zero adjustment',()=>{assert.equal(total([{price:20,quantity:2}],null),40);assert.equal(total([{price:20,quantity:2}]),40);assert.equal(total([{price:20,quantity:2}],{amount:0}),40)});
  await check('negative surcharge and no-clamp compatibility',()=>{assert.equal(total([{price:20,quantity:2}],{amount:-7}),47);assert.equal(total([],{amount:7}),-7)});
  await check('unrelated worktree behavior preserved',()=>{assert.equal(formatLabel('a'),'Receipt a');assert.equal(currency(),'EUR')});
} else throw Error('Unknown Node oracle');
console.log(JSON.stringify({checks}));process.exitCode=checks.every(c=>c.pass)?0:1;
