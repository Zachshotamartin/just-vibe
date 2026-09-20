import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync,cpSync,readFileSync,writeFileSync,existsSync,chmodSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
import {prepareTrial,prepareStudy,gradeTrial,parseEvents,regressionSensitivity,runTrial,runStudy,options,cases} from '../evals/benchmark/harness.mjs';
import {summarize,paired,exportStudy} from '../evals/benchmark/report.mjs';
const fixtureRoot=resolve('tests/fixtures/benchmark');
function temporary(t){const root=mkdtempSync(join(tmpdir(),'just-vibe-benchmark-'));t.after(()=>rmSync(root,{recursive:true,force:true}));return root;}
const git=(cwd,args,env={})=>execFileSync('git',args,{cwd,encoding:'utf8',env:{...process.env,...env}}).trimEnd();
const complete=out=>writeFileSync(join(out,'metrics.json'),JSON.stringify({turnCompleted:true,exitCode:0,timedOut:false}));
test('event accounting preserves missing usage and failed turns',()=>{
  assert.equal(parseEvents('').usage,null);
  const report=parseEvents([JSON.stringify({type:'turn.completed',usage:{input_tokens:25,cached_input_tokens:10,output_tokens:7}}),JSON.stringify({type:'turn.completed',usage:{input_tokens:5,output_tokens:2}}),JSON.stringify({type:'turn.failed',error:{message:'failed'}}),'malformed'].join('\n'));
  assert.deepEqual(report.usage,{input_tokens:30,cached_input_tokens:10,output_tokens:9});assert.equal(report.completed,false);assert.equal(report.invalidLines,1);assert.deepEqual(report.errors,['failed']);
});
test('model-run configuration mistakes fail before attempts are created',async t=>{
  assert.throws(()=>options(['prepare','--out','somewhere','--repetition','1']),/Unknown/);
  assert.throws(()=>options(['run','--study','somewhere']),/Missing/);
  const root=temporary(t),out=join(root,'study');const plan=prepareStudy({out,selectedCases:['ledger'],selectedArms:['baseline'],repetitions:1});
  await assert.rejects(()=>runStudy(out,{codex:process.execPath,model:'fixture',authHome:root,seconds:5}),/no trials started/);
  assert.equal(existsSync(join(out,plan.order[0].directory,'metrics.json')),false);assert.equal(existsSync(join(out,plan.order[0].directory,'harness-error.json')),false);
});
test('regression sensitivity retains completed assertions but rejects setup failures',()=>{
  assert.equal(regressionSensitivity('node',{status:1,stdout:"not ok 1\ncode: 'ERR_ASSERTION'\n",error:{code:'ETIMEDOUT'}}),true);
  assert.equal(regressionSensitivity('node',{status:1,stdout:'SyntaxError: unexpected token'}),false);
  assert.equal(regressionSensitivity('node',{status:null,stdout:'',error:{code:'ETIMEDOUT'}}),false);
  assert.equal(regressionSensitivity('python',{status:1,stdout:JSON.stringify({tests:2,failures:[{exception:'ValueError',behavior_failure:true}]})}),true);
  assert.equal(regressionSensitivity('python',{status:0,stdout:JSON.stringify({tests:2,failures:[{exception:'ValueError',behavior_failure:true}]})}),false);
  assert.equal(regressionSensitivity('python',{stdout:JSON.stringify({tests:1,failures:[{exception:'ImportError',behavior_failure:false}]})}),false);
  assert.equal(regressionSensitivity('python',{stdout:'not a result'}),false);
});
test('Python emits real assertion evidence before a later test hangs',async t=>{
  const root=temporary(t);mkdirSync(join(root,'test'));
  writeFileSync(join(root,'test/test_regression.py'),"import unittest, time\nclass Checks(unittest.TestCase):\n def test_a(self): self.assertEqual(1,2)\n def test_z(self):\n  print('HANG_ENTERED',flush=True)\n  time.sleep(60)\n");
  const binary=process.env.JUST_VIBE_PYTHON||(process.platform==='darwin'?'/usr/bin/python3':process.platform==='win32'?'python':'python3');
  const child=spawn(binary,[resolve('evals/benchmark/support/python-test-report.py'),'--stream'],{cwd:root,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='',stoppedAfterEvidence=false,expired=false;
  const timer=setTimeout(()=>{expired=true;child.kill('SIGKILL');},10000);
  child.stdout.on('data',data=>{stdout+=data;if(!stoppedAfterEvidence&&stdout.includes('HANG_ENTERED')&&regressionSensitivity('python',{status:null,stdout})){stoppedAfterEvidence=true;child.kill('SIGTERM');}});
  child.stderr.on('data',data=>{stderr+=data;});child.on('error',error=>{stderr+=error.message;});
  const status=await new Promise(done=>child.on('close',done));clearTimeout(timer);
  assert.equal(expired,false,stderr);assert.equal(stoppedAfterEvidence,true,stdout+stderr);assert.equal(regressionSensitivity('python',{status,stdout}),true,stdout+stderr);
});
test('comparison reporting retains failed denominators and unavailable metrics',()=>{
  const rows=[{arm:'baseline',case:'a',repetition:1,correct:true,artifactCorrect:true,metrics:{turnCompleted:true,exitCode:0,wallMs:100,usage:{input_tokens:20,cached_input_tokens:10,output_tokens:4}}},{arm:'baseline',case:'a',repetition:2,correct:false,metrics:null},{arm:'just-vibe',case:'a',repetition:1,correct:false,metrics:{timedOut:true,wallMs:200,usage:null}}];
  const summary=summarize(rows);assert.equal(summary.baseline.trials,2);assert.equal(summary.baseline.passed,1);assert.equal(summary.baseline.usage.input_tokens.sumAvailable,20);assert.equal(summary.baseline.usage.input_tokens.availableTrials,1);assert.equal(summary['just-vibe'].usage.input_tokens.sumAvailable,null);assert.equal(summary.baseline.costUsd,null);
  assert.equal(summary.baseline.toolCalls,null);assert.equal(summary.baseline.countMetricsAvailableTrials.toolCalls,0);
  const pair=paired(rows,'baseline','just-vibe');assert.equal(pair.pairs,1);assert.equal(pair.leftOnly,1);assert.equal(pair.rightOnly,0);
});
test('failed CLI attempts remain failures and remove only ephemeral authentication links',{skip:process.platform==='win32'},async t=>{
  const root=temporary(t),out=join(root,'trial'),authHome=join(root,'auth');mkdirSync(authHome);writeFileSync(join(authHome,'auth.json'),'{}');
  prepareTrial({out,id:'scoped-commit',arm:'baseline'});
  // Node understands --version but is not a Codex CLI, so execution must fail.
  const result=await runTrial(out,{codex:process.execPath,authHome,model:'fixture',seconds:5});
  assert.equal(result.correct,false);assert.equal(result.metrics.turnCompleted,false);assert.equal(result.metrics.usage,null);
  assert.equal(existsSync(join(out,'host')),false);assert.equal(readFileSync(join(authHome,'auth.json'),'utf8'),'{}');
  await assert.rejects(()=>runTrial(out,{codex:process.execPath,authHome,model:'fixture',seconds:5}),/immutable/);
});
test('cancellation stops an owned CLI that ignores graceful termination',{skip:process.platform==='win32',timeout:15000},async t=>{
  const root=temporary(t),out=join(root,'trial'),authHome=join(root,'auth'),cli=join(root,'fake-cli.cjs');mkdirSync(authHome);writeFileSync(join(authHome,'auth.json'),'{}');
  writeFileSync(cli,"#!/usr/bin/env node\nif(process.argv.includes('--version')) { console.log('fixture-cli'); process.exit(0); }\nprocess.on('SIGTERM',()=>{}); require('node:fs').writeFileSync('.fake-ready','ready'); process.stdin.resume(); setInterval(()=>{},1000);\n");chmodSync(cli,0o755);
  const manifest=prepareTrial({out,id:'scoped-commit',arm:'baseline'}),controller=new AbortController();
  const pending=runTrial(out,{codex:cli,authHome,model:'fixture',seconds:10,signal:controller.signal});
  const deadline=Date.now()+5000;while(!existsSync(join(manifest.workspace,'.fake-ready'))&&Date.now()<deadline)await new Promise(done=>setTimeout(done,20));
  assert.equal(existsSync(join(manifest.workspace,'.fake-ready')),true);controller.abort();
  const result=await pending;assert.equal(result.metrics.cancelled,true);assert.equal(result.metrics.timedOut,false);assert.equal(result.metrics.exitSignal,'SIGKILL');assert.equal(result.correct,false);
  assert.equal(existsSync(join(out,'host')),false);assert.equal(readFileSync(join(authHome,'auth.json'),'utf8'),'{}');
});
test('study ordering is reproducible and invalid selections are rejected',t=>{
  const root=temporary(t);const options={selectedArms:['baseline'],repetitions:2,seed:17};
  const a=prepareStudy({out:join(root,'a'),...options}),b=prepareStudy({out:join(root,'b'),...options});
  assert.deepEqual(a.order,b.order);assert.equal(a.order.length,8);assert.equal(a.eccRevision,null);
  assert.throws(()=>exportStudy(join(root,'a')),/unfinished/);
  assert.throws(()=>prepareStudy({out:join(root,'c'),...options,selectedCases:['not-a-case']}),/known cases/);
});
for(const fixture of cases)test(`independent ${fixture.id} oracle rejects defects and accepts a correct control`,t=>{
  const root=temporary(t),out=join(root,'trial');const manifest=prepareTrial({out,id:fixture.id,arm:'baseline'}),workspace=manifest.workspace;
  assert.equal(gradeTrial(out).artifactCorrect,false);
  cpSync(join(fixtureRoot,fixture.id),workspace,{recursive:true});
  if(fixture.gitCommit){
    const path=join(workspace,'src/invoice.mjs');let work=readFileSync(path,'utf8').replace('(adjustment.amount || 5)','(adjustment?.amount ?? 0)');writeFileSync(path,work);
    const committed=git(workspace,['show','HEAD:src/invoice.mjs']).replace('(adjustment.amount || 5)','(adjustment?.amount ?? 0)')+'\n';
    const index=join(root,'temporary-index'),env={GIT_INDEX_FILE:index};git(workspace,['read-tree','HEAD'],env);
    const blob=execFileSync('git',['hash-object','-w','--stdin'],{cwd:workspace,input:committed,encoding:'utf8'}).trim();
    git(workspace,['update-index','--add','--cacheinfo',`100644,${blob},src/invoice.mjs`],env);
    git(workspace,['add','test/regression.test.mjs'],env);git(workspace,['commit','--quiet','-m','Fix missing and zero adjustments'],env);
    const staged=work.replace("return 'EUR'","return 'USD'");const stagedBlob=execFileSync('git',['hash-object','-w','--stdin'],{cwd:workspace,input:staged,encoding:'utf8'}).trim();
    git(workspace,['update-index','--cacheinfo',`100644,${stagedBlob},src/invoice.mjs`]);git(workspace,['add','test/regression.test.mjs']);
  }
  const noRun=gradeTrial(out);assert.equal(noRun.artifactCorrect,true,JSON.stringify(noRun.checks.filter(c=>!c.pass)));assert.equal(noRun.correct,false,'Artifacts alone do not prove a completed agent run');
  complete(out);const passed=gradeTrial(out);assert.equal(passed.correct,true,JSON.stringify(passed.checks.filter(c=>!c.pass)));
  if(fixture.gitCommit){
    const realHead=git(workspace,['rev-parse','HEAD']),alternate=join(root,'bad-candidate-index'),env={GIT_INDEX_FILE:alternate};
    git(workspace,['read-tree','HEAD'],env);
    const wrong=git(workspace,['show','HEAD:src/invoice.mjs']).replace('(adjustment?.amount ?? 0)','(adjustment?.amount ?? 5)');
    const blob=execFileSync('git',['hash-object','-w','--stdin'],{cwd:workspace,input:wrong,encoding:'utf8'}).trim();git(workspace,['update-index','--cacheinfo',`100644,${blob},src/invoice.mjs`],env);
    git(workspace,['commit','--amend','--quiet','-m','Incorrect committed fallback'],env);
    const incorrect=gradeTrial(out);assert.equal(incorrect.correct,false);assert.equal(incorrect.checks.find(c=>c.name==='committed implementation satisfies the contract independently').pass,false);
    // Restore only this test-created fixture ref; leave its worktree and real index intact.
    git(workspace,['update-ref','HEAD',realHead]);
  }
  writeFileSync(join(workspace,'README.md'),'Changed contract');const tampered=gradeTrial(out);assert.equal(tampered.correct,false);assert.equal(tampered.checks[0].pass,false);
  assert.equal(existsSync(join(out,'mutation-workspace')),false);
});
