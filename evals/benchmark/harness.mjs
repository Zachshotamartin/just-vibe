#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, existsSync, realpathSync, symlinkSync, rmSync } from 'node:fs';
import { resolve, relative, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync, execFileSync, spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { pluginRoot } from '../../plugins/just-vibe/scripts/lib/catalog.mjs';

const here=fileURLToPath(new URL('./',import.meta.url));
const json=path=>JSON.parse(readFileSync(path,'utf8'));
export const cases=json(join(here,'cases.json')).cases;
export const arms=['baseline','just-vibe','just-vibe-profile','ecc'];
const hash=value=>createHash('sha256').update(value).digest('hex');
const git=(root,args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',env:{...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:process.platform==='win32'?'NUL':'/dev/null'}}).trimEnd();
function sourceIdentity(){
  const root=fileURLToPath(new URL('../../',import.meta.url));
  try{if(realpathSync(git(root,['rev-parse','--show-toplevel']))!==realpathSync(root))return {revision:null,dirty:null};return {revision:git(root,['rev-parse','HEAD']),dirty:Boolean(git(root,['status','--porcelain']))};}
  catch{return {revision:null,dirty:null};}
}
export function snapshot(root) {
  const result={};
  function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){
    if(e.name==='.git'||e.name==='__pycache__')continue;
    const path=join(dir,e.name),key=relative(root,path).replaceAll('\\','/');
    if(e.isSymbolicLink())result[key]='symlink';else if(e.isDirectory())walk(path);else result[key]=hash(readFileSync(path));
  }}walk(root);return result;
}
function write(path,body){mkdirSync(dirname(path),{recursive:true});writeFileSync(path,body);}
function save(path,value){write(path,JSON.stringify(value,null,2)+'\n');}
function shuffle(values,seed){let n=seed>>>0;const a=[...values];for(let i=a.length-1;i>0;i--){n=(Math.imul(1664525,n)+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function prepareTrial({out,id,arm,eccRoot,repetition=1}){
  if(existsSync(out))throw Error('Trial output must be fresh.');
  const fixture=cases.find(c=>c.id===id);if(!fixture||!arms.includes(arm))throw Error('Unknown case or arm.');
  if(arm==='ecc'&&(!eccRoot||fixture.ecc.some(p=>!existsSync(join(eccRoot,p)))))throw Error('Pinned ECC sources are required.');
  const root=resolve(out),workspace=join(root,'workspace');mkdirSync(root,{recursive:true});cpSync(join(here,'repos',id),workspace,{recursive:true});
  git(workspace,['init','--quiet']);git(workspace,['config','user.name','Fixture User']);git(workspace,['config','user.email','fixture@example.invalid']);
  git(workspace,['add','--all']);git(workspace,['commit','--quiet','-m','Initial fixture']);
  const base=git(workspace,['rev-parse','HEAD']);
  if(fixture.gitCommit){
    const source=join(workspace,'src/invoice.mjs');writeFileSync(source,readFileSync(source,'utf8').replace('`Invoice ${id}`','`Receipt ${id}`'));
    writeFileSync(join(workspace,'notes.md'),'Existing staged planning note. Preserve it.\n');git(workspace,['add','src/invoice.mjs','notes.md']);
    writeFileSync(source,readFileSync(source,'utf8').replace("return 'USD'","return 'EUR'"));
    writeFileSync(join(workspace,'scratch.txt'),'Existing untracked scratch work. Preserve it.\n');
  }
  write(join(workspace,'.git/info/exclude'),'_instructions/\n__pycache__/\n');
  const instructions=[];
  if(arm.startsWith('just-vibe')){
    cpSync(pluginRoot,join(workspace,'_instructions/just-vibe'),{recursive:true});
    for(const id of fixture.commands)instructions.push(`_instructions/just-vibe/skills/${id}/SKILL.md`);
    if(arm==='just-vibe-profile')instructions.push(`_instructions/just-vibe/references/profiles/${fixture.profile}.md`);
  }else if(arm==='ecc'){
    for(const path of fixture.ecc){
      const target=join(workspace,'_instructions/ecc',path);mkdirSync(dirname(target),{recursive:true});
      if(path.startsWith('skills/'))cpSync(dirname(join(eccRoot,path)),dirname(target),{recursive:true});else cpSync(join(eccRoot,path),target);
      instructions.push(`_instructions/ecc/${path}`);
    }
    if(existsSync(join(eccRoot,'LICENSE')))cpSync(join(eccRoot,'LICENSE'),join(workspace,'_instructions/ecc/LICENSE'));
  }
  const task=readFileSync(join(workspace,'TASK.md'),'utf8');
  const role=arm==='just-vibe-profile'?`Use ${fixture.profile} as the explicitly selected primary task profile. Preserve the task's scope and constraints.`:arm==='just-vibe'?'For this controlled trial, profiles are disabled: do not select or read a role profile.':'';
  const prompt=`Complete the task in this fresh repository: ${workspace}.\n${instructions.length?`Read these supplied instructions, then inspect the repository: ${instructions.join(', ')}.`:'No toolkit instructions are supplied; use the task and project evidence.'}\n${role}\n\n${task}\n\nTrial constraints: work only in this repository. Do not read other trials, source toolkit checkouts, evaluator files, authentication/config directories or prior answers. Do not use network, install dependencies, spawn agents, change host settings or perform external actions. You may run local tests and create temporary test artifacts, removing only artifacts you create. Preserve user files. Python is available at ${python()} on this trial host; do not use a no-op shim on PATH. Git commits are authorized only when TASK.md explicitly requests one. Never add agent self-attribution. Finish with a concise report of changes, actual checks and limitations. Do not claim hidden checks ran. No follow-up user answers will be supplied; make reasonable decisions within the written contract or report a concrete blocker.\n`;
  write(join(root,'prompt.txt'),prompt);
  const manifest={schemaVersion:1,case:id,arm,repetition,workspace,base,allowedWrites:fixture.allowedWrites,gitCommit:Boolean(fixture.gitCommit),preparedAt:new Date().toISOString(),instructions,inputs:snapshot(workspace),promptSha256:hash(prompt),profile:arm==='just-vibe-profile'?fixture.profile:null,sourceVersion:json(join(pluginRoot,'.codex-plugin/plugin.json')).version};
  if(arm==='ecc')manifest.eccRevision=git(eccRoot,['rev-parse','HEAD']);
  save(join(root,'run.json'),manifest);return manifest;
}
export function prepareStudy({out,eccRoot,repetitions=2,seed=5192026,selectedCases=cases.map(c=>c.id),selectedArms=arms}){
  if(existsSync(out))throw Error('Study output must be fresh.');
  if(!Number.isInteger(repetitions)||repetitions<1||repetitions>10)throw Error('Repetitions must be 1–10.');
  if(!Number.isInteger(seed)||!selectedCases.length||!selectedArms.length||new Set(selectedCases).size!==selectedCases.length||new Set(selectedArms).size!==selectedArms.length||selectedCases.some(id=>!cases.some(c=>c.id===id))||selectedArms.some(arm=>!arms.includes(arm)))throw Error('Unique known cases/arms and an integer seed are required.');
  const jobs=[];for(const id of selectedCases)for(let repetition=1;repetition<=repetitions;repetition++)for(const arm of selectedArms)jobs.push({id,arm,repetition});
  mkdirSync(out,{recursive:true});const order=shuffle(jobs,seed);
  for(const job of order){job.directory=`${job.id}/${job.arm}/${job.repetition}`;prepareTrial({out:join(out,job.directory),id:job.id,arm:job.arm,repetition:job.repetition,eccRoot});}
  const source=sourceIdentity();
  const plan={schemaVersion:1,preparedAt:new Date().toISOString(),seed,repetitions,sourceRevision:source.revision,sourceDirty:source.dirty,eccRevision:selectedArms.includes('ecc')?git(eccRoot,['rev-parse','HEAD']):null,cases:selectedCases,arms:selectedArms,order,oracleHashes:snapshot(join(here,'oracles')),fixtureHashes:snapshot(join(here,'repos')),harnessSha256:hash(readFileSync(fileURLToPath(import.meta.url))),note:'Author-created multi-file fixture repositories; supplied instructions, not full native plugin hooks. Fresh contexts, randomized order and immutable trial inputs. Public tasks are not a permanent blind benchmark.'};
  save(join(out,'study.json'),plan);return plan;
}
export function parseEvents(text){
  const events=[],invalid=[];for(const line of text.split('\n').filter(Boolean)){try{events.push(JSON.parse(line))}catch{invalid.push(line)}}
  const completed=events.filter(e=>e.type==='turn.completed'),failed=events.some(e=>e.type==='turn.failed');
  const usage=completed.length?{}:null;
  if(usage)for(const e of completed)for(const [key,value]of Object.entries(e.usage||{}))if(typeof value==='number')usage[key]=(usage[key]||0)+value;
  const items=events.filter(e=>e.type==='item.completed').map(e=>e.item);
  return {usage,completed:completed.length>0&&!failed,invalidLines:invalid.length,toolCalls:items.filter(i=>['command_execution','file_change','mcp_tool_call','web_search'].includes(i?.type)).length,
    failedCommands:items.filter(i=>i?.type==='command_execution'&&typeof i.exit_code==='number'&&i.exit_code!==0).length,
    errors:events.filter(e=>['error','turn.failed'].includes(e.type)).map(e=>e.message||e.error?.message),
    finalMessages:items.filter(i=>i?.type==='agent_message').map(i=>i.text)};
}
function cleanEnv(){const env={...process.env,PYTHONDONTWRITEBYTECODE:'1'};for(const key of ['NODE_OPTIONS','NODE_TEST_CONTEXT','NODE_V8_COVERAGE'])delete env[key];return env;}
function python(){return process.env.JUST_VIBE_PYTHON||(process.platform==='darwin'?'/usr/bin/python3':process.platform==='win32'?'python':'python3');}
export function regressionSensitivity(language,result){
  if(language==='python'){
    try{const report=JSON.parse(result.stdout);return report.tests>0&&report.failures.some(f=>f.behavior_failure===true);}catch{return false;}
  }
  // TAP emits completed assertion evidence immediately, even if a later test hangs.
  return result.status!==0&&/code: ['"]ERR_ASSERTION['"]/.test(result.stdout||'');
}
export function gradeTrial(directory){
  const root=resolve(directory),manifest=json(join(root,'run.json')),workspace=realpathSync(join(root,'workspace'));
  if(workspace!==realpathSync(manifest.workspace))throw Error('Workspace identity mismatch.');
  const current=snapshot(workspace),changed=[...new Set([...Object.keys(current),...Object.keys(manifest.inputs)])].filter(p=>current[p]!==manifest.inputs[p]);
  const checks=[{name:'only permitted files changed',pass:changed.every(p=>manifest.allowedWrites.includes(p))},{name:'no symlink artifacts',pass:!Object.values(current).includes('symlink')}];
  const fixture=cases.find(c=>c.id===manifest.case);const head=git(workspace,['rev-parse','HEAD']);
  if(!fixture.gitCommit)checks.push({name:'no unrequested commits',pass:head===manifest.base});
  if(checks.every(c=>c.pass)){
    const file=fixture.language==='python'?'python.py':'node.mjs';const binary=fixture.language==='python'?python():process.execPath;
    const result=spawnSync(binary,[join(here,'oracles',file),fixture.id,workspace],{encoding:'utf8',timeout:20000,env:cleanEnv(),maxBuffer:1024*1024});
    try{const evidence=JSON.parse(result.stdout);if(!Array.isArray(evidence.checks)||!evidence.checks.length||evidence.checks.some(c=>typeof c.name!=='string'||typeof c.pass!=='boolean'))throw Error('Invalid oracle report');checks.push(...evidence.checks);checks.push({name:'oracle process completed consistently',pass:!result.error&&result.status===(evidence.checks.every(c=>c.pass)?0:1),detail:result.error?.message});}
    catch{checks.push({name:'independent behavior assertions',pass:false,detail:result.error?.message||result.stderr||'Oracle produced no report'});}
  }else checks.push({name:'behavior execution withheld for input integrity failure',pass:false});
  const regression=fixture.language==='python'?'test/test_regression.py':'test/regression.test.mjs';
  checks.push({name:'regression test artifact exists',pass:existsSync(join(workspace,regression))});
  if(existsSync(join(workspace,regression))&&checks.slice(0,2).every(c=>c.pass)){
    const args=fixture.language==='python'?['-m','unittest','discover','-s','test']:['--test','test/'];
    // Node's explicit file list works consistently across supported versions.
    if(fixture.language==='node')args.splice(1,1,...readdirSync(join(workspace,'test')).filter(p=>p.endsWith('.test.mjs')).map(p=>`test/${p}`));
    if(fixture.language==='node')args.splice(1,0,'--test-reporter=tap');
    const result=spawnSync(fixture.language==='python'?python():process.execPath,args,{cwd:workspace,encoding:'utf8',timeout:15000,env:cleanEnv()});
    checks.push({name:'project and authored regression tests pass',pass:result.status===0,detail:result.status===0?undefined:(result.error?.message||result.stdout+result.stderr)});
    const mutation=join(root,'mutation-workspace');if(existsSync(mutation))rmSync(mutation,{recursive:true,force:true});
    cpSync(workspace,mutation,{recursive:true,filter:src=>!['.git','_instructions'].includes(src.split(/[\\/]/).at(-1))});
    for(const p of fixture.allowedWrites.filter(p=>p.startsWith('src/'))){
      let original=readFileSync(join(here,'repos',fixture.id,p),'utf8');
      if(fixture.gitCommit)original=original.replace('`Invoice ${id}`','`Receipt ${id}`').replace("return 'USD'","return 'EUR'");
      writeFileSync(join(mutation,p),original);
    }
    const mutantArgs=fixture.language==='python'?[join(here,'support/python-test-report.py')]:args;
    const mutant=spawnSync(fixture.language==='python'?python():process.execPath,mutantArgs,{cwd:mutation,encoding:'utf8',timeout:15000,env:cleanEnv()});
    save(join(root,'test-evidence.json'),{scorerVersion:2,fixed:{status:result.status,error:result.error?.message,stdout:result.stdout,stderr:result.stderr},original:{status:mutant.status,error:mutant.error?.message,stdout:mutant.stdout,stderr:mutant.stderr}});
    checks.push({name:'regression tests detect original defect',pass:regressionSensitivity(fixture.language,mutant),detail:mutant.status===0?'Original defective code passed authored tests':mutant.error?.message});
    rmSync(mutation,{recursive:true,force:true});
  }
  if(fixture.gitCommit){
    try{
    checks.push({name:'exactly one requested commit',pass:git(workspace,['rev-list','--count',`${manifest.base}..HEAD`])==='1'});
    const paths=git(workspace,['diff','--name-only',manifest.base,'HEAD']).split('\n').filter(Boolean).sort();
    checks.push({name:'commit includes only requested fix and new test',pass:JSON.stringify(paths)===JSON.stringify(['src/invoice.mjs','test/regression.test.mjs'])});
    const committed=git(workspace,['show','HEAD:src/invoice.mjs']),index=git(workspace,['show',':src/invoice.mjs']),worktree=readFileSync(join(workspace,'src/invoice.mjs'),'utf8');
    checks.push({name:'same-file staged and unstaged distinctions survive',pass:committed.includes('`Invoice ${id}`')&&committed.includes("return 'USD'")&&index.includes('`Receipt ${id}`')&&index.includes("return 'USD'")&&worktree.includes('`Receipt ${id}`')&&worktree.includes("return 'EUR'")});
    const candidate=join(root,'committed-workspace');
    try{
      if(existsSync(candidate))rmSync(candidate,{recursive:true,force:true});mkdirSync(candidate);
      for(const path of git(workspace,['ls-tree','-r','--name-only','-z','HEAD']).split('\0').filter(Boolean)){
        if(relative(candidate,resolve(candidate,path)).startsWith('..'))throw Error('Invalid committed path');
        write(join(candidate,path),execFileSync('git',['show',`HEAD:${path}`],{cwd:workspace}));
      }
      const behavior=spawnSync(process.execPath,[join(here,'support/commit-tree.mjs'),candidate],{encoding:'utf8',timeout:10000,env:cleanEnv()});
      checks.push({name:'committed implementation satisfies the contract independently',pass:behavior.status===0,detail:behavior.status===0?undefined:behavior.error?.message||behavior.stderr});
      const candidateTests=spawnSync(process.execPath,['--test',...readdirSync(join(candidate,'test')).filter(p=>p.endsWith('.test.mjs')).map(p=>`test/${p}`)],{cwd:candidate,encoding:'utf8',timeout:15000,env:cleanEnv()});
      checks.push({name:'committed tests pass without unrelated worktree edits',pass:candidateTests.status===0,detail:candidateTests.status===0?undefined:candidateTests.error?.message||candidateTests.stdout+candidateTests.stderr});
    }finally{rmSync(candidate,{recursive:true,force:true});}
    const message=git(workspace,['log','-1','--format=%B']),identity=git(workspace,['log','-1','--format=%an <%ae>|%cn <%ce>']);
    checks.push({name:'user identity and no agent attribution',pass:identity==='Fixture User <fixture@example.invalid>|Fixture User <fixture@example.invalid>'&&!/co-authored-by|generated.by|\b(?:claude|codex|openai)\b/i.test(message)});
    checks.push({name:'unrelated staged note and untracked file remain',pass:git(workspace,['status','--porcelain','--','notes.md','scratch.txt'])==='A  notes.md\n?? scratch.txt'});
    }catch(error){checks.push({name:'requested Git state is readable',pass:false,detail:error.message});}
  }
  const metrics=existsSync(join(root,'metrics.json'))?json(join(root,'metrics.json')):null;
  const artifactCorrect=checks.every(c=>c.pass);
  checks.push({name:'agent turn completed within limit',pass:Boolean(metrics?.turnCompleted&&metrics.exitCode===0&&!metrics.timedOut&&!metrics.cancelled&&!metrics.spawnError)});
  const result={schemaVersion:1,scorerVersion:2,case:manifest.case,arm:manifest.arm,repetition:manifest.repetition,changed,checks,artifactCorrect,correct:checks.every(c=>c.pass),metrics,gradedAt:new Date().toISOString(),promptSha256:manifest.promptSha256,instructionHashes:Object.fromEntries(Object.entries(manifest.inputs).filter(([p])=>p.startsWith('_instructions/')))};
  if(existsSync(join(root,'grade.json'))&&!existsSync(join(root,'grade-v1.json'))&&!json(join(root,'grade.json')).scorerVersion)cpSync(join(root,'grade.json'),join(root,'grade-v1.json'));
  save(join(root,'grade.json'),result);return result;
}
export async function runTrial(directory,{codex,authHome,model,effort='medium',seconds=240,signal}){
  const root=resolve(directory),manifest=json(join(root,'run.json'));
  if(JSON.stringify(snapshot(manifest.workspace))!==JSON.stringify(manifest.inputs))throw Error('Prepared trial inputs changed.');
  if(['metrics.json','events.jsonl','stderr.log'].some(p=>existsSync(join(root,p))))throw Error('Attempts are immutable; prepare a fresh trial to repeat.');
  if(!model||!codex||!authHome||!Number.isFinite(seconds)||seconds<1)throw Error('Explicit model, CLI, auth home and time limit required.');
  if(signal?.aborted)throw Error('Trial cancelled before launch.');
  const auth=join(resolve(authHome),'auth.json');if(!existsSync(auth))throw Error('Saved CLI authentication is unavailable.');
  const cliVersion=execFileSync(codex,['--version'],{encoding:'utf8'}).trim();
  const host=join(root,'host');mkdirSync(host,{recursive:true});
  symlinkSync(auth,join(host,'auth.json'));write(join(host,'empty-gitconfig'),'');
  const args=['exec','--ignore-user-config','--ignore-rules','--ephemeral','--json','--sandbox','workspace-write','--add-dir',join(manifest.workspace,'.git'),'--enable','skip_host_skill_discovery','--disable','plugins','--disable','apps','--disable','multi_agent','--disable','hooks','-m',model,'-c',`model_reasoning_effort=${JSON.stringify(effort)}`,'-c','web_search="disabled"','-C',manifest.workspace,'-o',join(root,'answer.md'),'-'];
  const env={};for(const key of ['PATH','HOME','USER','LOGNAME','TMPDIR','LANG','LC_ALL','SHELL','SystemRoot','ComSpec','PATHEXT'])if(process.env[key])env[key]=process.env[key];
  Object.assign(env,{CODEX_HOME:host,PYTHONDONTWRITEBYTECODE:'1',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:join(host,'empty-gitconfig')});
  const startedAt=new Date().toISOString(),start=performance.now();let stdout='',stderr='',timedOut=false,cancelled=false;
  const child=spawn(codex,args,{cwd:manifest.workspace,env,stdio:['pipe','pipe','pipe'],detached:process.platform!=='win32'});
  const kill=signal=>{try{if(process.platform!=='win32')process.kill(-child.pid,signal);else child.kill(signal)}catch{}};
  let hardTimer;const terminate=()=>{kill('SIGTERM');hardTimer??=setTimeout(()=>kill('SIGKILL'),3000);};
  const abort=()=>{cancelled=true;terminate();};signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(()=>{timedOut=true;terminate();},seconds*1000);
  child.stdout.on('data',b=>{stdout+=b;writeFileSync(join(root,'events.jsonl'),stdout)});child.stderr.on('data',b=>{stderr+=b;writeFileSync(join(root,'stderr.log'),stderr)});
  let spawnError;child.on('error',e=>{spawnError=e.message});child.stdin.on('error',()=>{});child.stdin.end(readFileSync(join(root,'prompt.txt')));
  const exitCode=await new Promise(done=>child.on('close',done));clearTimeout(timer);clearTimeout(hardTimer);signal?.removeEventListener('abort',abort);
  const parsed=parseEvents(stdout);const metrics={model,effort,startedAt,finishedAt:new Date().toISOString(),wallMs:Math.round(performance.now()-start),exitCode,exitSignal:child.signalCode??null,timedOut,cancelled,spawnError,usage:parsed.usage,turnCompleted:parsed.completed,invalidEventLines:parsed.invalidLines,toolCalls:parsed.toolCalls,failedCommands:parsed.failedCommands,errors:parsed.errors,userInterventions:0,costUsd:null,costReason:'CLI reports tokens, not a verified per-run monetary charge.',host:{cli:cliVersion,sandbox:'workspace-write',writableGitMetadata:true,externalTools:false,plugins:false,hostSkillDiscovery:false}};
  try{save(join(root,'metrics.json'),metrics);}finally{rmSync(host,{recursive:true,force:true});}
  return gradeTrial(root);
}
export async function runStudy(out,options){
  const plan=json(join(out,'study.json'));if(JSON.stringify(plan.oracleHashes)!==JSON.stringify(snapshot(join(here,'oracles'))))throw Error('Oracle changed after study preparation.');
  if(JSON.stringify(plan.fixtureHashes)!==JSON.stringify(snapshot(join(here,'repos'))))throw Error('Fixture changed after study preparation.');
  if(!options.model||!options.codex||!options.authHome||!Number.isFinite(options.seconds)||options.seconds<1)throw Error('Explicit model, CLI, auth home and positive time limit required before starting a study.');
  if(!existsSync(join(resolve(options.authHome),'auth.json')))throw Error('Saved CLI authentication is unavailable; no trials started.');
  execFileSync(options.codex,['--version'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
  let next=0;const results=[];async function worker(){while(next<plan.order.length&&!options.signal?.aborted){
    const job=plan.order[next++],directory=join(out,job.directory);let result;
    try{result=existsSync(join(directory,'metrics.json'))?gradeTrial(directory):await runTrial(directory,options);}
    catch(error){result={schemaVersion:1,case:job.id,arm:job.arm,repetition:job.repetition,correct:false,artifactCorrect:false,metrics:existsSync(join(directory,'metrics.json'))?json(join(directory,'metrics.json')):null,checks:[{name:'harness execution completed',pass:false,detail:error.message}]};save(join(directory,'harness-error.json'),result);}
    results.push(result);console.log(JSON.stringify({case:job.id,arm:job.arm,repetition:job.repetition,correct:result.correct,wallMs:result.metrics?.wallMs,tokens:result.metrics?.usage,failed:result.checks.filter(c=>!c.pass).map(c=>c.name)}));
  }}
  const concurrency=options.concurrency??2;if(!Number.isInteger(concurrency)||concurrency<1||concurrency>4)throw Error('Concurrency must be 1–4.');
  await Promise.all(Array.from({length:concurrency},worker));save(join(out,'results.json'),results);return results;
}
export function options(argv){
  const [operation,...rest]=argv,result={};
  const allowed={prepare:['out','ecc-root','repetitions','seed','cases','arms'],run:['study','codex','auth-home','model','effort','seconds','concurrency'],grade:['trial']}[operation];
  if(!allowed)throw Error('Use prepare, run or grade.');
  for(let i=0;i<rest.length;i+=2){if(!rest[i].startsWith('--')||!rest[i+1]||rest[i+1].startsWith('--'))throw Error('Options require values.');const key=rest[i].slice(2);if(!allowed.includes(key))throw Error(`Unknown ${operation} option: ${rest[i]}`);if(key in result)throw Error('Duplicate option');result[key]=rest[i+1];}
  for(const key of {prepare:['out'],run:['study','codex','auth-home','model'],grade:['trial']}[operation])if(!result[key])throw Error(`Missing --${key}`);
  return {operation,o:result};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const {operation,o}=options(process.argv.slice(2));
    if(operation==='prepare')console.log(JSON.stringify(prepareStudy({out:o.out,eccRoot:o['ecc-root'],repetitions:Number(o.repetitions??2),seed:Number(o.seed??5192026),...(o.cases?{selectedCases:o.cases.split(',')}:{}),...(o.arms?{selectedArms:o.arms.split(',')}:{})}),null,2));
    else if(operation==='run'){
      const controller=new AbortController(),abort=()=>controller.abort();process.on('SIGINT',abort);process.on('SIGTERM',abort);
      try{await runStudy(o.study,{codex:resolve(o.codex),authHome:resolve(o['auth-home']),model:o.model,effort:o.effort||'medium',seconds:Number(o.seconds??240),concurrency:Number(o.concurrency??2),signal:controller.signal});}
      finally{process.removeListener('SIGINT',abort);process.removeListener('SIGTERM',abort);if(controller.signal.aborted)process.exitCode=130;}
    }
    else if(operation==='grade')console.log(JSON.stringify(gradeTrial(o.trial),null,2));
    else throw Error('Use prepare --out DIR --ecc-root DIR, run --study DIR --codex PATH --auth-home DIR --model ID, or grade --trial DIR.');
  }catch(error){console.error(error.stack);process.exitCode=1;}
}
