import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gradeTrial} from './harness.mjs';
const json=path=>JSON.parse(readFileSync(path,'utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');
const median=values=>{if(!values.length)return null;const a=[...values].sort((a,b)=>a-b),i=Math.floor(a.length/2);return a.length%2?a[i]:(a[i-1]+a[i])/2;};

export function summarize(rows){
  return Object.fromEntries([...new Set(rows.map(r=>r.arm))].map(arm=>{
    const trials=rows.filter(r=>r.arm===arm),metrics=trials.map(r=>r.metrics).filter(Boolean);
    const totalMetric=key=>{const available=metrics.filter(m=>Number.isFinite(m[key]));return available.length?available.reduce((n,m)=>n+m[key],0):null;};
    const usageFields=['input_tokens','cached_input_tokens','output_tokens','reasoning_output_tokens'];
    const usage=Object.fromEntries(usageFields.map(key=>{
      const available=metrics.filter(m=>Number.isFinite(m.usage?.[key]));
      return [key,{sumAvailable:available.length?available.reduce((n,m)=>n+m.usage[key],0):null,availableTrials:available.length}];
    }));
    return [arm,{passed:trials.filter(r=>r.correct).length,trials:trials.length,artifactPassed:trials.filter(r=>r.artifactCorrect).length,
      completed:metrics.filter(m=>m.turnCompleted&&m.exitCode===0&&!m.timedOut).length,timeouts:metrics.filter(m=>m.timedOut).length,
      medianWallMs:median(metrics.map(m=>m.wallMs).filter(Number.isFinite)),wallTimeAvailableTrials:metrics.filter(m=>Number.isFinite(m.wallMs)).length,
      toolCalls:totalMetric('toolCalls'),failedCommands:totalMetric('failedCommands'),userInterventions:totalMetric('userInterventions'),
      countMetricsAvailableTrials:Object.fromEntries(['toolCalls','failedCommands','userInterventions'].map(key=>[key,metrics.filter(m=>Number.isFinite(m[key])).length])),usage,costUsd:null}];
  }));
}
export function paired(rows,left,right){
  const comparisons=[];
  for(const a of rows.filter(r=>r.arm===left)){
    const b=rows.find(r=>r.arm===right&&r.case===a.case&&r.repetition===a.repetition);
    if(b)comparisons.push({case:a.case,repetition:a.repetition,left:a.correct,right:b.correct});
  }
  return {left,right,pairs:comparisons.length,bothPass:comparisons.filter(p=>p.left&&p.right).length,leftOnly:comparisons.filter(p=>p.left&&!p.right).length,rightOnly:comparisons.filter(p=>!p.left&&p.right).length,neither:comparisons.filter(p=>!p.left&&!p.right).length,comparisons};
}

export function exportStudy(directory,{regrade=false}={}){
  const plan=json(join(directory,'study.json')),trials=[];
  for(const job of plan.order){
    const root=join(directory,job.directory);
    if(!existsSync(join(root,'metrics.json'))&&!existsSync(join(root,'harness-error.json')))throw Error(`Study unfinished: ${job.directory}`);
    const grade=existsSync(join(root,'harness-error.json'))?json(join(root,'harness-error.json')):regrade?gradeTrial(root):json(join(root,'grade.json'));
    const manifest=json(join(root,'run.json'));
    const hashes={};for(const name of ['prompt.txt','events.jsonl','answer.md','run.json','test-evidence.json'])if(existsSync(join(root,name)))hashes[name]=hash(readFileSync(join(root,name)));
    const instructionHashes=Object.fromEntries(Object.entries(manifest.inputs).filter(([p])=>p.startsWith('_instructions/')));
    trials.push({case:job.id,arm:job.arm,repetition:job.repetition,sourceVersion:manifest.sourceVersion,profile:manifest.profile,
      correct:grade.correct,artifactCorrect:grade.artifactCorrect,scorerVersion:grade.scorerVersion??1,
      priorScore:existsSync(join(root,'grade-v1.json'))?{scorerVersion:1,correct:json(join(root,'grade-v1.json')).correct}:null,
      checks:grade.checks.map(({name,pass})=>({name,pass})),metrics:grade.metrics,
      instructionBundleSha256:hash(JSON.stringify(instructionHashes)),instructionFileCount:Object.keys(instructionHashes).length,
      selectedInstructions:manifest.instructions.map(path=>({path,sha256:manifest.inputs[path]})),artifactHashes:hashes});
  }
  const source=fileURLToPath(new URL('./',import.meta.url));
  return {schemaVersion:1,exportedAt:new Date().toISOString(),scorer:{version:2,files:Object.fromEntries(['harness.mjs','oracles/node.mjs','oracles/python.py','support/python-test-report.py','support/commit-tree.mjs'].map(p=>[p,hash(readFileSync(join(source,p)))]))},protocol:{...plan,order:undefined},summary:summarize(trials),
    paired:[['just-vibe','baseline'],['just-vibe','ecc'],['just-vibe-profile','just-vibe']].map(([a,b])=>paired(trials,a,b)).filter(p=>p.pairs),trials,
    limitations:['Newly authored bounded fixture repositories, not third-party production repositories.','Matched supplied ECC instructions at a pinned snapshot; native hooks/memory integrations are excluded.','Two repeats per original case/arm are insufficient to establish general superiority.','No monetary charge is reported by this authenticated CLI; cached input is a subset of input.','A stable model name does not guarantee an immutable service backend.','See the protocol for pilots and the uniform scorer correction; original scores are retained.']};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [directory,output,...flags]=process.argv.slice(2);
  if(!directory||!output||flags.some(f=>f!=='--regrade'))throw Error('Usage: node report.mjs STUDY OUTPUT.json [--regrade]');
  const report=exportStudy(directory,{regrade:flags.includes('--regrade')});writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));
}
