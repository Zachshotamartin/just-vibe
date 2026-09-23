import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { behaviorRules } from '../plugins/just-vibe/scripts/lib/behavior-rules.mjs';
import { policy } from '../plugins/just-vibe/scripts/lib/action-policy.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
import { sessions, parseSession } from '../plugins/just-vibe/scripts/lib/native-sessions.mjs';
import { createMcpServer } from '../plugins/just-vibe/scripts/lib/mcp-server.mjs';
import { managedFiles } from '../plugins/just-vibe/scripts/lib/managed-files.mjs';
import { managedFragment } from '../plugins/just-vibe/scripts/lib/managed-fragment.mjs';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { boundedJobs } from '../plugins/just-vibe/scripts/lib/bounded-jobs.mjs';
import { mcpHealth } from '../plugins/just-vibe/scripts/lib/mcp-health.mjs';
import { configurationInventory } from '../plugins/just-vibe/scripts/lib/config-inventory.mjs';
import { services } from '../plugins/just-vibe/scripts/lib/dev-services.mjs';
import { canary } from '../plugins/just-vibe/scripts/lib/canary.mjs';
import { usageLedger } from '../plugins/just-vibe/scripts/lib/usage-ledger.mjs';
import { telemetry } from '../plugins/just-vibe/scripts/lib/telemetry.mjs';
import { operator } from '../plugins/just-vibe/scripts/lib/operator.mjs';
import { processAlive, withFileLock, atomicFile } from '../plugins/just-vibe/scripts/lib/file-lock.mjs';
const lib = pathToFileURL(resolve('plugins/just-vibe/scripts/lib/')).href + '/';
function fixture(t) {
  const base = fs.realpathSync.native(fs.mkdtempSync(join(tmpdir(), 'jv-regression-'))), root = join(base, 'project');
  fs.mkdirSync(root); t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  return { base, root, options: { home: join(base, 'home') } };
}
const tick = () => new Promise(r => setTimeout(r, 10));
async function until(check) { const end = Date.now() + 10000; while (!check()) { if (Date.now() > end) throw Error('Fixture timed out'); await tick(); } }
function child(code, args = []) {
  const p = spawn(process.execPath, ['--input-type=module', '-e', code, ...args]); let stdout = '', stderr = '';
  p.stdout.on('data', b => stdout += b); p.stderr.on('data', b => stderr += b);
  return { p, done: new Promise(r => p.on('exit', (status, signal) => r({ status, signal, stdout, stderr }))) };
}
async function trust(f, id, source = 'console.log("fixture")') {
  fs.writeFileSync(join(f.root, id + '.mjs'), source);
  let s = await runners(f.root, 'list', {}, f.options);
  s = await runners(f.root, 'configure', { id, revision: s.revision, config: { command: [process.execPath, id + '.mjs'], purpose: 'Inert regression fixture' } }, f.options);
  const hash = s.runners.find(r => r.id === id).hash;
  await runners(f.root, 'trust', { id, revision: s.revision, hash }, f.options);
  return { id, hash };
}
async function job(f, runner, verifier, extra = {}) {
  let s = await boundedJobs(f.root, 'create', { id: 'job', revision: 0, kind: 'schedule', objective: 'Inert regression fixture', runner: runner.id, runnerHash: runner.hash, ...(verifier ? { verifier: verifier.id, verifierHash: verifier.hash } : {}), deadline: new Date(Date.now() + 60000).toISOString(), ...extra }, f.options);
  return boundedJobs(f.root, 'enable', { id: s.id, revision: s.revision, enabled: true, reason: 'Fixture execution' }, f.options);
}

test('R1 real hook enforcement survives audit contention and composes later policy guards', t => {
  const f = fixture(t), store = runtimeStore(f.root, f.options);
  let rules = behaviorRules(f.root, 'save', { revision: 0, rule: { id: 'guard', event: 'command', action: 'block', enabled: true, conditions: [{ field: 'command', operator: 'contains', value: 'forbidden' }], message: 'Forbidden fixture' } }, f.options);
  const invoke = command => {
    const r = spawnSync(process.execPath, [resolve('plugins/just-vibe/scripts/hooks.mjs')], { input: JSON.stringify({ cwd: f.root, session_id: 's', tool_use_id: command, hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } }), encoding: 'utf8', env: { ...process.env, JUST_VIBE_HOME: f.options.home } });
    assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout);
  };
  const lock = join(store.home, store.prefix, 'behavior-rules.json.lock');
  fs.writeFileSync(lock, JSON.stringify({ pid: process.pid }));
  assert.equal(invoke('forbidden').hookSpecificOutput.permissionDecision, 'deny');
  fs.unlinkSync(lock);
  behaviorRules(f.root, 'save', { revision: rules.revision, rule: { ...rules.rules[0], action: 'warn', conditions: [{ field: 'command', operator: 'contains', value: 'git' }] } }, f.options);
  policy(f.root, 'configure', { revision: 0, settings: { enabled: true, rules: ['git-no-verify'] } }, f.options);
  fs.writeFileSync(lock, JSON.stringify({ pid: process.pid }));
  assert.equal(invoke('git commit --no-verify').hookSpecificOutput.permissionDecision, 'deny');
  fs.unlinkSync(lock);
  fs.writeFileSync(join(store.home, store.prefix, 'behavior-rules.json'), '{malformed');
  assert.equal(invoke('anything').hookSpecificOutput.permissionDecision, 'deny');
});

test('R2 restricted MCP capture and import cannot replace or re-scope user history', async t => {
  const f = fixture(t), user = join(f.base, 'user'); fs.mkdirSync(user);
  const text = JSON.stringify([{ role: 'user', content: 'Private fixture history' }]);
  fs.writeFileSync(join(user, 'chat.json'), text); fs.writeFileSync(join(f.root, 'chat.json'), text);
  const initial = sessions(f.root, 'import', { id: 'private', revision: 0, host: 'generic', path: 'chat.json', location: { root: user, scope: 'user' }, allowUnbound: true }, f.options);
  const server = createMcpServer(f.root, { ...f.options, allowWrite: true, allowUser: false });
  await server({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25' } });
  await server({ jsonrpc: '2.0', method: 'notifications/initialized' });
  for (const [operation, data] of [['capture', { snapshot: { objective: 'Replace', summary: 'Replacement' } }], ['import', { host: 'generic', path: 'chat.json', allowUnbound: true }]]) {
    const payload = { id: initial.id, revision: initial.revision, ...data };
    assert.throws(() => sessions(f.root, operation, payload, { ...f.options, allowUser: false }), /disabled/);
    const result = await server({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'workbench_manage', arguments: { family: 'sessions', operation, payload } } });
    assert.equal(result.result.isError, true); assert.match(JSON.stringify(result), /disabled/);
    assert.throws(() => sessions(f.root, operation, payload, f.options), /scope/);
  }
  assert.equal(sessions(f.root, 'show', { id: initial.id }, f.options).revision, initial.revision);
});

test('R3 shared configuration serializes different connector writers and preserves both after retry', async t => {
  const f = fixture(t); fs.writeFileSync(join(f.root, '.mcp.json'), JSON.stringify({ mcpServers: { foreign: { command: 'existing' } } }));
  const code = `import fs from 'node:fs';import {join} from 'node:path';import {syncBuiltinESMExports} from 'node:module';const root=process.argv[1], rename=fs.renameSync;fs.renameSync=(a,b)=>{if(b===join(root,'.mcp.json')){fs.writeFileSync(root+'/ready','1');const end=Date.now()+10000;while(!fs.existsSync(root+'/go')){if(Date.now()>end)throw Error('Barrier timeout');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10);}}return rename(a,b)};syncBuiltinESMExports();const {managedFragment}=await import(${JSON.stringify(lib+'managed-fragment.mjs')});managedFragment(root,'alpha','.mcp.json','mcp',{mcpServers:{'just-vibe-alpha':{command:'alpha'}}},'install');`;
  const a = child(code, [f.root]); t.after(() => a.p.kill());
  await until(() => fs.existsSync(join(f.root, 'ready')));
  assert.throws(() => managedFragment(f.root, 'beta', '.mcp.json', 'mcp', { mcpServers: { 'just-vibe-beta': { command: 'beta' } } }, 'install'), /updated|writer/);
  fs.writeFileSync(join(f.root, 'go'), '1'); assert.equal((await a.done).status, 0);
  managedFragment(f.root, 'beta', '.mcp.json', 'mcp', { mcpServers: { 'just-vibe-beta': { command: 'beta' } } }, 'install');
  assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(join(f.root, '.mcp.json'))).mcpServers).sort(), ['foreign','just-vibe-alpha','just-vibe-beta']);
});

test('R4 owned installer recovers real process exits at every publication boundary without torn files', t => {
  for (const phase of ['before-journal', 'after-journal', 'before-file', 'after-file', 'after-record', 'after-cleanup']) {
    const f = fixture(t), target = join(f.root, 'owned.txt');
    managedFiles(f.root, 'fixture', new Map([['owned.txt','old']]), 'install', { allowed: p => p === 'owned.txt' });
    fs.chmodSync(target, 0o640);
    const code = `import fs from 'node:fs';import {join} from 'node:path';import {syncBuiltinESMExports} from 'node:module';const [root,phase]=process.argv.slice(1), rename=fs.renameSync, unlink=fs.unlinkSync;fs.renameSync=(a,b)=>{if(phase==='before-journal'&&b.endsWith('fixture-pending.json'))process.exit(77);if(phase==='before-file'&&b===join(root,'owned.txt'))process.exit(77);const r=rename(a,b);if((phase==='after-journal'&&b.endsWith('fixture-pending.json'))||(phase==='after-file'&&b===join(root,'owned.txt'))||(phase==='after-record'&&b.endsWith('fixture.json')))process.exit(77);return r};fs.unlinkSync=p=>{const r=unlink(p);if(phase==='after-cleanup'&&p.endsWith('fixture-pending.json'))process.exit(77);return r};syncBuiltinESMExports();const {managedFiles}=await import(${JSON.stringify(lib+'managed-files.mjs')});managedFiles(root,'fixture',new Map([['owned.txt','new'.repeat(2000)]]),'update',{allowed:p=>p==='owned.txt'});`;
    const r = spawnSync(process.execPath, ['--input-type=module','-e',code,f.root,phase], { encoding:'utf8' }); assert.equal(r.status,77,r.stderr);
    assert.ok(['old','new'.repeat(2000)].includes(fs.readFileSync(target,'utf8')));
    managedFiles(f.root,'fixture',new Map([['owned.txt','new'.repeat(2000)]]),'update',{allowed:p=>p==='owned.txt'});
    assert.equal(fs.readFileSync(target,'utf8'),'new'.repeat(2000));
    if (process.platform !== 'win32') assert.equal(fs.statSync(target).mode & 0o777, 0o640);
    assert.equal(managedFiles(f.root,'fixture',new Map([['owned.txt','new'.repeat(2000)]]),'doctor',{allowed:p=>p==='owned.txt'}).interrupted,false);
    fs.writeFileSync(target,'user edit');
    assert.throws(()=>managedFiles(f.root,'fixture',new Map([['owned.txt','replacement']]),'update',{allowed:p=>p==='owned.txt'}),/edited/);
    assert.equal(fs.readFileSync(target,'utf8'),'user edit');
  }
});

test('R4 locks preserve live owners and malformed ownership', t => {
  const f=fixture(t), lock=join(f.root,'operation.lock');
  withFileLock(lock,()=>assert.throws(()=>withFileLock(lock,()=>{}),/updated/));
  fs.mkdirSync(lock);assert.throws(()=>withFileLock(lock,()=>{}),/ownership/);assert.ok(fs.statSync(lock).isDirectory());
  const code = `import fs from 'node:fs';import assert from 'node:assert/strict';import {syncBuiltinESMExports} from 'node:module';const path=process.argv[1], lstat=fs.lstatSync;fs.writeFileSync(path,JSON.stringify({pid:process.pid}));let released=false;fs.lstatSync=p=>{if(p===path&&!released){released=true;fs.unlinkSync(path);}return lstat(p);};syncBuiltinESMExports();const {withFileLock}=await import(${JSON.stringify(lib+'file-lock.mjs')});assert.throws(()=>withFileLock(path,()=>assert.fail('Must retry after an uncertain acquisition')),e=>e.code==='STATE_LOCKED');let entered=false;withFileLock(path,()=>{entered=true});assert.equal(entered,true);`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code, join(f.root, 'released.lock')], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  if (process.platform !== 'win32') {
    const previous = process.umask(0o077);
    try { const path = join(f.root, 'permissions'); atomicFile(path, 'complete', 0o640); assert.equal(fs.statSync(path).mode & 0o777, 0o640); }
    finally { process.umask(previous); }
  }
});

test('R4 shared fragment recovery preserves foreign entries and blocks other writers until reconciled', t => {
  for (const phase of ['after-journal', 'after-file', 'after-record']) {
    const f = fixture(t), path = join(f.root, '.mcp.json');
    fs.writeFileSync(path, JSON.stringify({ mcpServers: { foreign: { command: 'existing' } } }));
    fs.chmodSync(path, 0o640);
    const desired = { mcpServers: { 'just-vibe-alpha': { command: 'alpha' } } };
    const code = `import fs from 'node:fs';import {join} from 'node:path';import {syncBuiltinESMExports} from 'node:module';const [root,phase]=process.argv.slice(1), rename=fs.renameSync;fs.renameSync=(a,b)=>{const r=rename(a,b);if((phase==='after-journal'&&b.endsWith('alpha-fragment-pending.json'))||(phase==='after-file'&&b===join(root,'.mcp.json'))||(phase==='after-record'&&b.endsWith('alpha-fragment.json')))process.exit(77);return r};syncBuiltinESMExports();const {managedFragment}=await import(${JSON.stringify(lib+'managed-fragment.mjs')});managedFragment(root,'alpha','.mcp.json','mcp',${JSON.stringify(desired)},'install');`;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', code, f.root, phase], { encoding: 'utf8' });
    assert.equal(result.status, 77, result.stderr);
    assert.throws(() => managedFragment(f.root, 'beta', '.mcp.json', 'mcp', {}, 'install'), /Recover the interrupted/);
    managedFragment(f.root, 'alpha', '.mcp.json', 'mcp', desired, 'install');
    const record = JSON.parse(fs.readFileSync(join(f.root, '.just-vibe/installations/alpha-fragment.json')));
    assert.equal(record.revision, 1);
    if (process.platform !== 'win32') assert.equal(fs.statSync(path).mode & 0o777, 0o640);
    assert.deepEqual(JSON.parse(fs.readFileSync(path)).mcpServers, { foreign: { command: 'existing' }, ...desired.mcpServers });
    managedFragment(f.root, 'beta', '.mcp.json', 'mcp', { mcpServers: { 'just-vibe-beta': { command: 'beta' } } }, 'install');
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(path)).mcpServers).length, 3);
  }
});

test('R5 cancellation from a separate CLI kills the owned child and never starts the verifier', async t => {
  const f=fixture(t), r=await trust(f,'main','import fs from "node:fs";fs.writeFileSync("child-pid",String(process.pid));setInterval(()=>{},1000);'), v=await trust(f,'verify','import fs from "node:fs";fs.writeFileSync("verified","bad");');
  const s=await job(f,r,v), pending=boundedJobs(f.root,'tick',{id:s.id,revision:s.revision},f.options);
  await until(()=>fs.existsSync(join(f.root,'child-pid')));
  const pid=Number(fs.readFileSync(join(f.root,'child-pid'),'utf8'));
  t.after(()=>{try{process.kill(pid,'SIGKILL')}catch{}});
  const current=await boundedJobs(f.root,'show',{id:s.id},f.options);
  const cancel=spawnSync(process.execPath,[resolve('plugins/just-vibe/scripts/toolkit.mjs'),'jobs','cancel','--root',f.root,'--stdin'],{encoding:'utf8',env:{...process.env,JUST_VIBE_HOME:f.options.home},input:JSON.stringify({id:s.id,revision:current.revision,reason:'Stop fixture'})});
  assert.equal(cancel.status,0,cancel.stderr);
  const final=await pending;assert.equal(final.status,'cancelled');assert.equal(final.runs[0].execution.cancelled,true);assert.equal(final.runs[0].verification,null);
  assert.equal(fs.existsSync(join(f.root,'verified')),false);assert.equal(processAlive(pid),false);
});

test('R5 deadline and revoked trust prevent follow-up verification', async t => {
  for(const cause of ['deadline','trust']) {
    const f=fixture(t),r=await trust(f,'main'),v=await trust(f,'verify'),s=await job(f,r,v);let finish, calls=0, clock=Date.now();
    const pending=boundedJobs(f.root,'tick',{id:s.id,revision:s.revision},{...f.options,now:()=>clock,runCommand:async()=>{calls++;await new Promise(r=>finish=r);return {status:0,stdout:'ok'}}});
    await until(()=>finish);
    if(cause==='deadline')clock=Date.parse(s.deadline)+1;
    else {const list=await runners(f.root,'list',{},f.options);await runners(f.root,'untrust',{id:r.id,hash:r.hash,revision:list.revision},f.options);}
    finish();const final=await pending;assert.equal(calls,1);assert.equal(final.runs[0].verification,null);assert.equal(final.runs[0].passed,false);
    assert.equal(final.status,cause==='deadline'?'exhausted':'cancelled');
  }
});

test('R6 reconnect reserves before execution and dead attempts require explicit recovery', async t => {
  const f=fixture(t),r=await trust(f,'reconnect');fs.writeFileSync(join(f.root,'.mcp.json'),JSON.stringify({mcpServers:{fixture:{command:'unused'}}}));
  const server=configurationInventory(f.root).servers[0],p={key:server.key,configHash:server.configHash,revision:0,runner:r.id,runnerHash:r.hash};let finish,calls=0;
  const opts={...f.options,runCommand:async()=>{calls++;await new Promise(r=>finish=r);return {status:0}}};
  const first=mcpHealth(f.root,'reconnect',p,opts);await until(()=>finish);
  await assert.rejects(mcpHealth(f.root,'reconnect',p,opts),/revision|reserved/);
  let state=await mcpHealth(f.root,'status',{},f.options);
  await assert.rejects(mcpHealth(f.root,'reconnect',{...p,revision:state.revision},opts),/reserved/);
  await assert.rejects(mcpHealth(f.root,'recover',{...p,revision:state.revision,reason:'Still running'},f.options),/still running/);
  finish();assert.equal((await first).server.status,'reconnect-command-completed');assert.equal(calls,1);
  // Abruptly exit after reservation/dispatch; the durable record must not replay.
  const code=`const {mcpHealth}=await import(${JSON.stringify(lib+'mcp-health.mjs')});await mcpHealth(process.argv[1],'reconnect',JSON.parse(process.argv[3]),{home:process.argv[2],runCommand:()=>process.exit(77)});`;
  state=await mcpHealth(f.root,'status',{},f.options);
  const crashed=spawnSync(process.execPath,['--input-type=module','-e',code,f.root,f.options.home,JSON.stringify({...p,revision:state.revision})],{encoding:'utf8'});assert.equal(crashed.status,77,crashed.stderr);
  state=await mcpHealth(f.root,'status',{},f.options);
  await assert.rejects(mcpHealth(f.root,'reconnect',{...p,revision:state.revision},opts),/reserved/);
  const recovered=await mcpHealth(f.root,'recover',{...p,revision:state.revision,reason:'Inspected inert execution'},f.options);
  assert.equal(recovered.servers[0].status,'reconnect-inconclusive');assert.equal(calls,1);
});

test('R6 health retention never evicts unresolved reconnect reservations', async t => {
  const f = fixture(t), r = await trust(f, 'reconnect');
  fs.writeFileSync(join(f.root, '.mcp.json'), JSON.stringify({ mcpServers: { fixture: { command: 'unused' } } }));
  const server = configurationInventory(f.root).servers[0], store = runtimeStore(f.root, f.options);
  const pending = { key: 'pending', scope: 'project', status: 'reconnecting', attempt: { id: 'retained', pid: process.pid } };
  let s = store.put('mcp-health', { servers: [pending, ...Array.from({ length: 99 }, (_, i) => ({ key: 'old-' + i, status: 'reachable' }))] }, 0);
  const payload = { key: server.key, configHash: server.configHash, runner: r.id, runnerHash: r.hash };
  await mcpHealth(f.root, 'observe', { ...payload, revision: s.revision, outcome: 'success' }, f.options);
  s = store.get('mcp-health');
  assert.equal(s.servers.length, 100); assert.deepEqual(s.servers.find(v => v.key === pending.key), pending);
  s = store.put('mcp-health', { servers: Array.from({ length: 100 }, (_, i) => ({ ...pending, key: 'reserved-' + i })) }, s.revision);
  let executions = 0;
  await assert.rejects(mcpHealth(f.root, 'reconnect', { ...payload, revision: s.revision }, { ...f.options, runCommand: async () => { executions++; return { status: 0 }; } }), /capacity/);
  assert.equal(executions, 0); assert.equal(store.get('mcp-health').revision, s.revision);
});

test('R7 supervisor refuses pre-stopped, expired or revoked startup reservations', async t => {
  for(const cause of ['stop','deadline','trust']) {
    const f=fixture(t),r=await trust(f,'main','import fs from "node:fs";fs.writeFileSync("started","bad")');
    let s=await services(f.root,'configure',{id:'service',revision:0,runner:r.id,hash:r.hash,durationSeconds:5},f.options);
    const store=runtimeStore(f.root,f.options),at=new Date().toISOString();
    store.put('service-run-fixture',{id:'fixture',service:'service',state:'starting',runner:r.id,hash:r.hash,deadline:new Date(Date.now()+(cause==='deadline'?-1000:10000)).toISOString(),createdAt:at,updatedAt:at,stopRequested:false,output:''},0);
    s=store.put('service-service',{...s,run:'fixture'},s.revision);
    if(cause==='stop')await services(f.root,'stop',{id:'service',revision:s.revision},f.options);
    if(cause==='trust'){const rs=await runners(f.root,'list',{},f.options);await runners(f.root,'untrust',{id:r.id,hash:r.hash,revision:rs.revision},f.options);}
    const result=spawnSync(process.execPath,[resolve('plugins/just-vibe/scripts/service-supervisor.mjs'),'--root',f.root,'--home',f.options.home,'--run','fixture'],{encoding:'utf8',timeout:10000});
    assert.equal(result.status,0,result.stderr);assert.equal(fs.existsSync(join(f.root,'started')),false);
    assert.ok(['stopped','failed'].includes(store.get('service-run-fixture').state));
  }
});

test('R7 stop waits for transient startup ownership before acknowledging cancellation', async t => {
  const f = fixture(t), r = await trust(f, 'main');
  let s = await services(f.root, 'configure', { id: 'service', revision: 0, runner: r.id, hash: r.hash, durationSeconds: 5 }, f.options);
  const store = runtimeStore(f.root, f.options);
  store.put('service-run-fixture', { id: 'fixture', service: 'service', state: 'starting', stopRequested: false }, 0);
  s = store.put('service-service', { ...s, run: 'fixture' }, s.revision);
  const lock = join(store.home, store.prefix, 'service-run-fixture.startup.lock');
  const code = `import fs from 'node:fs';const {withFileLock}=await import(${JSON.stringify(lib+'file-lock.mjs')});withFileLock(process.argv[1],()=>{fs.writeFileSync(process.argv[2]+'/ready','1');const until=Date.now()+10000;while(!fs.existsSync(process.argv[2]+'/go')){if(Date.now()>until)throw Error('Barrier timeout');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10);}});`;
  const writer = child(code, [lock, f.root]); t.after(() => writer.p.kill());
  await until(() => fs.existsSync(join(f.root, 'ready')));
  let settled = false;
  const stopping = services(f.root, 'stop', { id: s.id, revision: s.revision }, f.options).finally(() => { settled = true; });
  await new Promise(resolve => setTimeout(resolve, 40));
  assert.equal(settled, false);
  fs.writeFileSync(join(f.root, 'go'), '1');
  assert.equal((await writer.done).status, 0);
  assert.equal((await stopping).stopRequested, true);
  assert.equal(store.get('service-run-fixture').stopRequested, true);
});

test('R8 canary aborts active fetch and preserves stop without later targets or notifications', async t => {
  const f=fixture(t),r=await trust(f,'notify');
  const s=await canary(f.root,'configure',{id:'watch',revision:0,targets:[{id:'one',url:'http://127.0.0.1/one'},{id:'two',url:'http://127.0.0.1/two'}],durationSeconds:5,notifyRunner:r.id,notifyHash:r.hash},f.options);
  let requests=0,notifications=0,aborted=false;
  const pending=canary(f.root,'watch',{id:s.id,revision:s.revision},{...f.options,fetch:async(_url,init)=>{requests++;return new Promise((_resolve,reject)=>init.signal.addEventListener('abort',()=>{aborted=true;reject(new DOMException('Stopped','AbortError'))},{once:true}));},runCommand:async()=>{notifications++;return {status:0}}});
  await until(()=>requests===1);const current=await canary(f.root,'show',{id:s.id},f.options);
  await canary(f.root,'stop',{id:s.id,revision:current.revision,reason:'Stop now'},f.options);
  const final=await pending;assert.equal(final.status,'stopped');assert.equal(aborted,true);assert.equal(requests,1);assert.equal(notifications,0);
});

test('R9 transcript windows disclose truncation, retain distinct suffixes and reject stale/private sources', t => {
  const f=fixture(t), messages=[{role:'user',content:'x'.repeat(4100)+' first constraint'},{role:'user',content:'x'.repeat(4100)+' second constraint'}];
  const parsed=parseSession(JSON.stringify(messages),'generic');assert.equal(parsed.messages.length,2);assert.equal(parsed.truncated,true);assert.ok(parsed.truncation.omittedCharacters>200);
  fs.writeFileSync(join(f.root,'chat.json'),JSON.stringify(messages));
  sessions(f.root,'import',{id:'chat',revision:0,host:'generic',path:'chat.json',allowUnbound:true},f.options);
  const window=sessions(f.root,'window',{id:'chat',offset:1,limit:1,characterOffset:4100,characterLimit:100},f.options);
  assert.match(window.messages[0].text,/second constraint/);assert.equal(window.messages[0].index,1);
  assert.equal(sessions(f.root,'export',{id:'chat',format:'json'},f.options).truncated,true);
  assert.match(sessions(f.root,'export',{id:'chat',format:'markdown'},f.options).markdown,/Truncated import/);
  fs.writeFileSync(join(f.root,'chat.json'),'[]');assert.throws(()=>sessions(f.root,'window',{id:'chat'},f.options),/changed/);
});

test('R10 usage preserves prior valuations and discloses unknown price-boundary deltas and currencies', t => {
  const f=fixture(t),rate=(input,effectiveAt,expiresAt,currency='USD')=>({model:'fixture',currency,input,output:0,cacheRead:0,cacheWrite:0,effectiveAt,expiresAt,source:'https://example.test/prices'});
  let s=usageLedger(f.root,'pricing',{revision:0,rates:[rate(1,'2025-01-01','2025-02-01'),rate(2,'2025-02-01','2025-03-01'),rate(3,'2025-03-01','2027-01-01','EUR')]},f.options);
  for(const [at,input] of [['2025-01-31',1e6],['2025-02-02',2e6],['2025-02-03',3e6],['2025-03-02',4e6],['2025-03-03',5e6]])
    s=usageLedger(f.root,'observe',{revision:s.revision,session:'one',model:'fixture',at,input},f.options);
  let report=usageLedger(f.root,'report',{},f.options);assert.deepEqual(report.totals,{USD:3,EUR:3});assert.equal(report.unpriced,1);assert.equal(report.sessions[0].unpricedSegments,2);assert.equal(report.sessions[0].estimate.amount,null);
  usageLedger(f.root,'pricing',{revision:s.revision,rates:[rate(99,'2020-01-01','2030-01-01')]},f.options);
  assert.deepEqual(usageLedger(f.root,'report',{},f.options).totals,report.totals);
  const current=usageLedger(f.root,'rates',{},f.options);
  assert.throws(()=>usageLedger(f.root,'pricing',{revision:current.revision,rates:[rate(1,'2020-01-01','2030-01-01'),rate(2,'2025-01-01','2026-01-01')]},f.options),/Overlapping/);
  const store=runtimeStore(f.root,f.options),state=store.get('usage-ledger');store.put('usage-ledger',{...state,snapshots:[{session:'legacy',model:'fixture',at:'2025-01-01',input:100,output:0,cacheRead:0,cacheWrite:0}]},state.revision);
  assert.equal(usageLedger(f.root,'report',{},f.options).unpriced,1);
});

test('R11 observed dispatch transitions have distinct event IDs while unchanged exports deduplicate', async t => {
  const f=fixture(t),r=await trust(f,'main');await job(f,r);
  let s=await operator(f.root,'request-dispatch',{id:'request',revision:0,job:'job'},f.options);
  const before=(await telemetry(f.root,'events',{},f.options)).events.find(e=>e.kind==='dispatch');
  assert.deepEqual((await telemetry(f.root,'events',{},f.options)).events.find(e=>e.kind==='dispatch'),before);
  await operator(f.root,'dispatch',{id:'request',revision:s.revision},{...f.options,runCommand:async()=>({status:0})});
  const after=(await telemetry(f.root,'events',{},f.options)).events.find(e=>e.kind==='dispatch');
  assert.notEqual(before.id,after.id);assert.equal(before.entityId,after.entityId);assert.equal(after.outcome,'finished');assert.ok(Date.parse(after.at)>=Date.parse(before.at));
});

test('R12 terminal dispatch retirement restores capacity and retains durable duplicate protection', async t => {
  const f=fixture(t),r=await trust(f,'main');await job(f,r);const store=runtimeStore(f.root,f.options);
  let s=store.put('operator',{claims:[],inbox:[],merges:[],dispatch:Array.from({length:100},(_,i)=>({id:'old-'+i,requestId:'request-'+i,job:'job',status:'finished',outcome:'ready',at:new Date().toISOString()}))},0);
  await assert.rejects(operator(f.root,'request-dispatch',{id:'next',job:'job',revision:s.revision},f.options),/capacity/);
  s=await operator(f.root,'retire-dispatch',{id:'old-0',revision:s.revision},f.options);
  s=await operator(f.root,'request-dispatch',{id:'next',job:'job',revision:s.revision},f.options);assert.equal(s.dispatch.length,100);
  const dupe=await operator(f.root,'request-dispatch',{id:'old-0',requestId:'request-0',job:'job',revision:s.revision},f.options);assert.equal(dupe.duplicate,true);assert.equal(dupe.retired,true);
  await assert.rejects(operator(f.root,'retire-dispatch',{id:'next',revision:s.revision},f.options),/finished/);
  await assert.rejects(operator(f.root,'request-dispatch',{id:'old-0',requestId:'different',job:'job',revision:s.revision},f.options),/ID already/);
});
