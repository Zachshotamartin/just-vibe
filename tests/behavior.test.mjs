import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { suite, prepare, grade } from '../evals/behavior/harness.mjs';
import { loadCatalog, materializeAliases } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
function scratch(t) { const root=mkdtempSync(join(tmpdir(),'just-vibe-behavior-'));t.after(()=>rmSync(root,{recursive:true,force:true}));return root; }
function answer(root,body) {writeFileSync(join(root,'answer.json'),JSON.stringify(body));}
const oracles=JSON.parse(readFileSync(new URL('../evals/behavior/oracles.json',import.meta.url))).cases;

test('fixture preparation excludes evaluator answers and refuses reuse of prior outputs',t=>{
 const root=scratch(t), catalog=loadCatalog();
 for(const fixture of suite.cases){
  for(const id of fixture.commands)assert.ok(catalog.commands.some(c=>c.id===id));
  const out=join(root,fixture.id), run=prepare({id:fixture.id,out,arm:'just-vibe'});
  const manifest=JSON.parse(readFileSync(join(out,'run.json'),'utf8'));
  assert.ok(Object.keys(manifest.inputs).every(p=>!p.includes('oracles')&&!p.includes('grade.json')));
  assert.ok(manifest.instructions.every(p=>p.startsWith('_instructions/just-vibe/skills/')));
  assert.ok('_instructions/just-vibe/references/security/review.md' in manifest.inputs);
  assert.ok('_instructions/just-vibe/references/examples/general.md' in manifest.inputs);
  assert.throws(()=>prepare({id:fixture.id,out}),/fresh output/);
  assert.ok(readFileSync(run.prompt,'utf8').includes('Do not inspect'));
 }
});

test('report graders accept known facts and reject wrong facts and modified inputs',t=>{
 const root=scratch(t);
 for(const fixture of suite.cases.filter(c=>!oracles[c.id].code)){
  const out=join(root,fixture.id);prepare({id:fixture.id,out,arm:'baseline'});
  answer(out,oracles[fixture.id].expected);
  assert.equal(grade({run:out}).status,'passed-fixture');
  const wrong=structuredClone(oracles[fixture.id].expected),key=Object.keys(wrong)[0];wrong[key]='unsupported claim';answer(out,wrong);
  assert.equal(grade({run:out}).status,'failed-fixture');
  answer(out,oracles[fixture.id].expected);writeFileSync(join(out,'workspace/task.md'),'Changed input');
  assert.equal(grade({run:out}).status,'failed-fixture');
 }
});

test('code graders reject real seeded bugs and accept behavior-preserving corrections',t=>{
 const root=scratch(t);
 const repairs={
  checkout:['checkout.mjs','export function total(items,coupon){return items.reduce((s,x)=>s+x.price*x.quantity,0)-(coupon?.amount??0)}'],
  'react-race':['loader.mjs','export function createLoader(fetch,publish){let version=0,dead=false;return {async select(id){const token=++version;try{const account=await fetch(id);if(!dead&&token===version)publish({account,error:null})}catch(e){if(!dead&&token===version)publish({account:null,error:e.message})}},dispose(){dead=true;version++}}}'],
  idempotency:['orders.mjs','export function service(create){const m=new Map();return async(key,p)=>{const hash=JSON.stringify([p.sku,p.quantity]);const old=m.get(key);if(old){if(old.hash!==hash)throw Error("conflict");return old.result}const result=Promise.resolve().then(()=>create(p));m.set(key,{hash,result});return result}}'],
  authz:['access.mjs','export function canRead(user,doc){return user.tenantId===doc.tenantId&&(user.id===doc.ownerId||user.role==="admin")}'],
 };
 for(const [id,[file,repair]]of Object.entries(repairs)){
  const out=join(root,id);prepare({id,out,arm:'baseline'});answer(out,oracles[id].expected);
  assert.equal(grade({run:out}).status,'failed-fixture',`Original ${id} should fail`);
  writeFileSync(join(out,'workspace',file),repair);
  assert.equal(grade({run:out}).status,'passed-fixture',`Corrected ${id} should pass`);
 }
});

test('regression-test grader rejects vacuous tests and requires sensitivity to independent mutants',t=>{
 const out=join(scratch(t),'regression');prepare({id:'regression-test',out,arm:'baseline'});answer(out,{});
 const path=join(out,'workspace/regression.test.mjs');
 writeFileSync(path,'import test from "node:test"; test("empty",()=>{});');
 assert.equal(grade({run:out}).status,'failed-fixture');
 writeFileSync(path,'import test from "node:test";import assert from "node:assert/strict";import {total} from "./checkout.mjs";test("coupon boundaries",()=>{const items=[{price:100,quantity:2}];assert.equal(total(items,null),200);assert.equal(total(items,{amount:0}),200);});');
 assert.equal(grade({run:out}).status,'passed-fixture');
});

test('alias source records cannot override behavioral fields even with apparently valid values',()=>{
 const raw=JSON.parse(readFileSync(new URL('../plugins/just-vibe/catalog/commands.json',import.meta.url)));
 for(const field of ['writeScope','procedure','defaultMode','branches']){
  const c=structuredClone(raw);c.commands.find(x=>x.id==='do')[field]=field==='defaultMode'?'apply':'override';
  assert.throws(()=>materializeAliases(c),/must inherit/);
 }
});
