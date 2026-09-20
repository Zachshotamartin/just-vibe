import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync,cpSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {prepareTrial,prepareStudy,gradeTrial,parseEvents,regressionSensitivity,runTrial,cases} from '../evals/benchmark/harness.mjs';
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
test('regression sensitivity retains completed assertions but rejects setup failures',()=>{
  assert.equal(regressionSensitivity('node',{status:1,stdout:"not ok 1\ncode: 'ERR_ASSERTION'\n",error:{code:'ETIMEDOUT'}}),true);
  assert.equal(regressionSensitivity('node',{status:1,stdout:'SyntaxError: unexpected token'}),false);
  assert.equal(regressionSensitivity('node',{status:null,stdout:'',error:{code:'ETIMEDOUT'}}),false);
  assert.equal(regressionSensitivity('python',{stdout:JSON.stringify({tests:2,failures:[{exception:'ValueError',behavior_failure:true}]})}),true);
  assert.equal(regressionSensitivity('python',{stdout:JSON.stringify({tests:1,failures:[{exception:'ImportError',behavior_failure:false}]})}),false);
  assert.equal(regressionSensitivity('python',{stdout:'not a result'}),false);
});
test('comparison reporting retains failed denominators and unavailable metrics',()=>{
  const rows=[{arm:'baseline',case:'a',repetition:1,correct:true,artifactCorrect:true,metrics:{turnCompleted:true,exitCode:0,wallMs:100,usage:{input_tokens:20,cached_input_tokens:10,output_tokens:4}}},{arm:'baseline',case:'a',repetition:2,correct:false,metrics:null},{arm:'just-vibe',case:'a',repetition:1,correct:false,metrics:{timedOut:true,wallMs:200,usage:null}}];
  const summary=summarize(rows);assert.equal(summary.baseline.trials,2);assert.equal(summary.baseline.passed,1);assert.equal(summary.baseline.usage.input_tokens.sumAvailable,20);assert.equal(summary.baseline.usage.input_tokens.availableTrials,1);assert.equal(summary['just-vibe'].usage.input_tokens.sumAvailable,null);assert.equal(summary.baseline.costUsd,null);
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
