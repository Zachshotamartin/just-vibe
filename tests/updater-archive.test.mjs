import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { adapters } from '../plugins/just-vibe/scripts/lib/editor-adapters.mjs';
import { updater } from '../plugins/just-vibe/scripts/lib/updater.mjs';
import { runCommand } from '../plugins/just-vibe/scripts/lib/process.mjs';
import { commandInvocation } from '../plugins/just-vibe/scripts/lib/command.mjs';

test('updater executes actual pinned archives and rolls back the recorded installed version offline', { timeout: 120000 }, async t => {
  const base=fs.realpathSync(fs.mkdtempSync(join(tmpdir(),'jv-archive-update-'))), root=join(base,'project'), source=join(base,'source');
  t.after(()=>fs.rmSync(base,{recursive:true,force:true}));fs.mkdirSync(root);fs.mkdirSync(source);
  const env={...process.env,npm_config_cache:join(base,'cache'),npm_config_offline:'true',npm_config_audit:'false',npm_config_fund:'false',npm_config_update_notifier:'false'};
  const npm=(args,cwd)=>{const [bin,argv]=commandInvocation('npm',args);return execFileSync(bin,argv,{cwd,env,encoding:'utf8',maxBuffer:4*1024*1024});};
  // Copy the actual runtime/installer payload. No alternate installer or fake success result.
  for(const path of ['bin','plugins','.agents','.claude-plugin'])fs.cpSync(resolve(path),join(source,path),{recursive:true});
  for(const path of ['package.json','README.md','LICENSE','CHANGELOG.md'])fs.copyFileSync(resolve(path),join(source,path));
  const baseVersion=JSON.parse(fs.readFileSync(resolve('package.json'))).version;
  const [major,minor,patch]=baseVersion.split('.').map(Number), nextVersion=`${major}.${minor}.${patch+1}`;
  const archives=new Map();
  for(const version of [baseVersion,nextVersion]) {
    for(const path of ['package.json','plugins/just-vibe/.claude-plugin/plugin.json','plugins/just-vibe/.codex-plugin/plugin.json']) {
      const full=join(source,path),pkg=JSON.parse(fs.readFileSync(full));pkg.version=version;fs.writeFileSync(full,JSON.stringify(pkg,null,2)+'\n');
    }
    const packed=JSON.parse(npm(['pack','--ignore-scripts','--json','--pack-destination',base],source))[0];
    const bytes=fs.readFileSync(join(base,packed.filename));archives.set(version,{bytes,integrity:'sha512-'+createHash('sha512').update(bytes).digest('base64')});
  }
  let executions=0, offline=false;
  const options={home:join(base,'home'),fetch:async url=>{
    if(offline)throw Error('Offline registry fixture');
    const version=String(url).includes('/-/')?String(url).match(/just-vibe-(\d+\.\d+\.\d+)\.tgz$/)[1]:String(url).split('/').at(-1),a=archives.get(version);
    if(!a)throw Error('Unexpected archive version');
    return String(url).includes('/-/')?new Response(a.bytes):Response.json({name:'just-vibe',version,engines:{node:'>=22'},dist:{integrity:a.integrity,tarball:`https://registry.npmjs.org/just-vibe/-/just-vibe-${version}.tgz`}});
  },runCommand:async(argv,options)=>{executions++;return runCommand(argv,{...options,env:{...options.env,...env,JUST_VIBE_HOME:options.env.JUST_VIBE_HOME}});}};
  adapters(root,'install',{target:'pi',profile:'core'});
  const manifest=join(root,'.just-vibe/adapters/pi/plugin/.codex-plugin/plugin.json'),installed=()=>JSON.parse(fs.readFileSync(manifest)).version;
  assert.equal(installed(),baseVersion);
  let plan=await updater(root,'preview',{id:'upgrade',revision:0,version:nextVersion,targets:['pi']},options);
  offline=true;await assert.rejects(updater(root,'apply',{id:plan.id,revision:plan.revision,hash:plan.hash},options),/Offline/);assert.equal(executions,0);assert.equal(installed(),baseVersion);offline=false;
  plan=await updater(root,'apply',{id:plan.id,revision:plan.revision,hash:plan.hash},options);
  assert.equal(plan.status,'completed',JSON.stringify(plan.results));assert.equal(installed(),nextVersion);
  let rollback=await updater(root,'rollback-preview',{id:plan.id,revision:plan.revision,hash:plan.hash,newId:'rollback'},options);
  assert.equal(rollback.release.version,baseVersion);
  rollback=await updater(root,'apply',{id:rollback.id,revision:rollback.revision,hash:rollback.hash},options);
  assert.equal(rollback.status,'completed',JSON.stringify(rollback.results));assert.equal(installed(),baseVersion);assert.equal(executions,2);
  assert.equal(JSON.parse(fs.readFileSync(join(root,'.just-vibe/adapters/pi/selection.json'))).profile,'core');
});
