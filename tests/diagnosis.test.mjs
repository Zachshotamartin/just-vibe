import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { diagnosis } from '../plugins/just-vibe/scripts/lib/diagnosis.mjs';
import { assistantRuntime } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { assistantHook } from '../plugins/just-vibe/scripts/lib/assistant-hooks.mjs';
import { adaptiveStore } from '../plugins/just-vibe/scripts/lib/adaptive-store.mjs';
test('diagnosis separates configuration, hook delivery, selection, loading and tool observations', t => {
 const dir=mkdtempSync(join(tmpdir(),'jv-diagnosis-')),root=join(dir,'app'),options={home:join(dir,'home')};mkdirSync(root);writeFileSync(join(root,'app.mjs'),'export const x = 1;');t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const status=()=>diagnosis(root,'status',{host:'codex'},options).stages.map(s=>s.observed);
 assert.deepEqual(status(),[false,false,false,false]);
 const task=assistantRuntime(root,'start',{brief:'Fix app.mjs bug',host:'codex',sessionId:'direct'},options);
 assert.deepEqual(status(),[false,false,false,false]);
 assistantHook({cwd:root,session_id:'native',hook_event_name:'UserPromptSubmit',prompt:'Fix app.mjs bug'}, {...options,host:'codex'});
 assert.deepEqual(status(),[true,false,false,false]);
 assistantRuntime(root,'select',{taskId:task.id,workflows:['fix'],mode:'apply',reason:'Repair the requested bug'},options);
 assistantRuntime(root,'load',{taskId:task.id,workflow:'fix'},options);
 assert.deepEqual(status(),[true,true,true,false]);
 const store=adaptiveStore(root,options),native=store.read(store.sessionPath('codex','native'));
 assistantHook({cwd:root,session_id:'native',hook_event_name:'PostToolUse',tool_name:'Read',tool_input:{file_path:join(root,'app.mjs')},tool_response:'fixture'}, {...options,host:'codex'});
 assert.deepEqual(status(),[true,true,true,true]);assert.ok(native.taskId);
 assert.throws(()=>diagnosis(root,'trial',{host:'codex'},options),/useAccount/);
});

test('task-specific diagnosis cannot borrow a newer task receipt and retains its own receipt', t => {
  const dir=mkdtempSync(join(tmpdir(),'jv-diagnosis-match-')),root=join(dir,'app'),options={home:join(dir,'home'),host:'codex'};
  mkdirSync(root); writeFileSync(join(root,'app.mjs'),'export const x=1'); t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const a=assistantRuntime(root,'start',{brief:'Fix app.mjs bug A',host:'codex',sessionId:'a'},options);
  assistantHook({cwd:root,session_id:'b',hook_event_name:'UserPromptSubmit',prompt:'Fix app.mjs bug B'},options);
  const store=adaptiveStore(root,options),b=store.read(store.sessionPath('codex','b')).taskId;
  const stage=id=>diagnosis(root,'status',{taskId:id,host:'codex'},options).stages[0];
  assert.equal(stage(a.id).observed,false); assert.equal(stage(b).observed,true);
  assistantHook({cwd:root,session_id:'c',hook_event_name:'UserPromptSubmit',prompt:'Fix app.mjs bug C'},options);
  assert.equal(stage(b).evidence[0].taskId,b);
  assert.throws(()=>diagnosis(root,'status',{taskId:b,host:'claude'},options),/different host/);
});

test('a host process startup failure is surfaced even when its harness writes an empty report', {skip:process.platform==='win32'}, async t => {
  const dir=mkdtempSync(join(tmpdir(),'jv-diagnosis-failure-')), root=join(dir,'app'),bin=join(dir,'bin'); mkdirSync(root);mkdirSync(bin);
  const { chmodSync }=await import('node:fs'); writeFileSync(join(bin,'claude'),'#!/bin/sh\nexit 42\n');chmodSync(join(bin,'claude'),0o700);
  const { execFile }=await import('node:child_process'),{promisify}=await import('node:util');
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const module=new URL('../plugins/just-vibe/scripts/lib/diagnosis.mjs',import.meta.url).href;
  const code=`import {diagnosis} from ${JSON.stringify(module)}; try { await diagnosis(${JSON.stringify(root)},'trial',{host:'claude',useAccount:true});process.exitCode=2; } catch(e) { console.log(e.message); }`;
  const result=await promisify(execFile)(process.execPath,['--input-type=module','-e',code],{env:{...process.env,PATH:bin+':'+process.env.PATH},timeout:20000});
  assert.match(result.stdout,/no host report.*process exit/);
});
