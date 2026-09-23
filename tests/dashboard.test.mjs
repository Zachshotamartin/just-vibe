import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dashboardMain } from '../plugins/just-vibe/scripts/dashboard.mjs';
test('dashboard demo opens an isolated local project and removes only its own data on close',async t=>{
  let opened,printed;
  const app=await dashboardMain(['--demo'],{log:value=>{printed=JSON.parse(value);},open:async url=>{opened=url;}});
  t.after(()=>app.close());assert.equal(opened,app.url);assert.equal(printed.demo,true);
  const headers={'x-operator-token':new URL(app.url).hash.slice(1)};
  const identity=await(await fetch(app.origin+'/api/identity',{headers})).json();
  assert.equal(identity.demo,true);assert.ok(identity.project.includes('just-vibe-demo-'));
  assert.equal((await(await fetch(app.origin+'/api/preferences',{headers})).json()).lessons.length,1);
  assert.ok(existsSync(identity.project));await app.close();assert.equal(existsSync(identity.project),false);
  await assert.rejects(dashboardMain(['--demo','--root','/tmp'],{log:()=>{}}),/isolated/);
});
test('dashboard no-open does not invoke a browser',async t=>{
  const app=await dashboardMain(['--demo','--no-open'],{log:()=>{},open:()=>{throw Error('must not run');}});t.after(()=>app.close());assert.ok(app.url);
});
