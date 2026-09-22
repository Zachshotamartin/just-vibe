import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { agentQa } from '../plugins/just-vibe/scripts/lib/agent-qa.mjs';
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'jv-qa-')); t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, 'app.js'), 'export const version = 1;');
  const payload = { id: 'upload', revision: 0, title: 'Upload', request: 'Upload a recording on mobile.', target: 'http://127.0.0.1:3000/', maxAttempts: 2, criteria: [{ id: 'complete', text: 'Processing completes', sourceQuote: 'Upload a recording on mobile.', kind: 'browser', path: '/', viewport: { width: 390, height: 844 }, steps: [{ action: 'text', selector: '[role=status]', contains: 'Complete' }] }] };
  return { root, payload };
}
test('QA plans require observable assertions, request quotes and bounded authorized targets', async t => {
  const { root, payload } = fixture(t);
  const invalid = structuredClone(payload); invalid.criteria[0].steps = [{ action: 'click', selector: 'button' }];
  await assert.rejects(agentQa(root, 'create', invalid), /assertion/);
  invalid.criteria[0] = { ...payload.criteria[0], sourceQuote: 'Not in request' };
  await assert.rejects(agentQa(root, 'create', invalid), /literal quotes/);
  await assert.rejects(agentQa(root, 'create', { ...payload, target: 'https://user:password@example.test/' }), /credentials/);
  for (const viewport of [{}, { width: 390 }, { height: 844 }, { width: 390, height: 0 }]) {
    await assert.rejects(agentQa(root, 'create', { ...payload, criteria: [{ ...payload.criteria[0], viewport }] }), /width and height/);
  }
  const record = await agentQa(root, 'create', payload); assert.equal(record.revision, 1);
  await assert.rejects(agentQa(root, 'run', { id: 'upload', revision: 1, reason: 'Initial' }), /Authorize/);
  await assert.rejects(agentQa(root, 'run', { id: 'upload', revision: 0, reason: 'Initial', authorizeTarget: payload.target }), /revision/i);
});
test('missing browser support is blocked, retained in reports and never passed; changed source stales it', async t => {
  const { root, payload } = fixture(t); await agentQa(root, 'create', payload);
  const result = await agentQa(root, 'run', { id: 'upload', revision: 1, reason: 'Initial', authorizeTarget: payload.target });
  assert.equal(result.verdict, 'incomplete'); assert.equal(result.criteria[0].result, 'blocked'); assert.ok(result.path.endsWith('.html'));
  writeFileSync(join(root, 'app.js'), 'export const version = 2;');
  assert.equal((await agentQa(root, 'show', { id: 'upload' })).criteria[0].result, 'stale');
  const retry = await agentQa(root, 'run', { id: 'upload', revision: result.revision, reason: 'Recheck prerequisite', authorizeTarget: payload.target });
  assert.equal(retry.attempts.length, 2);
  await assert.rejects(agentQa(root, 'run', { id: 'upload', revision: retry.revision, reason: 'Extra', authorizeTarget: payload.target }), /budget/);
});

test('an interrupted browser run leaves an incomplete attempt rather than reusing earlier evidence', async t => {
  const { root, payload } = fixture(t);
  const { mkdirSync, existsSync } = await import('node:fs');
  const { spawn } = await import('node:child_process');
  mkdirSync(join(root, 'node_modules/playwright'), { recursive: true });
  writeFileSync(join(root, 'node_modules/playwright/package.json'), '{"main":"index.cjs"}');
  writeFileSync(join(root, 'node_modules/playwright/index.cjs'), "exports.chromium={launch:async()=>new Promise(()=>setInterval(()=>{},1000))};");
  await agentQa(root, 'create', payload);
  const moduleUrl = new URL('../plugins/just-vibe/scripts/lib/agent-qa.mjs', import.meta.url).href;
  const code = `import {agentQa} from ${JSON.stringify(moduleUrl)}; await agentQa(${JSON.stringify(root)},'run',${JSON.stringify({id:'upload',revision:1,reason:'Interrupt fixture',authorizeTarget:payload.target})});`;
  const child = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: 'ignore' });
  const closed = new Promise((done, reject) => { child.on('close', done); child.on('error', reject); });
  t.after(async () => { child.kill('SIGKILL'); await closed; });
  const deadline=Date.now()+5000;
  let pending;
  while(Date.now()<deadline){pending=await agentQa(root,'show',{id:'upload'});if(pending.attempts.length)break;await new Promise(done=>setTimeout(done,20));}
  assert.equal(pending.attempts.length,1);assert.equal(pending.criteria[0].result,'running');
  child.kill('SIGKILL');await closed;
  const report=await agentQa(root,'report',{id:'upload'});
  assert.equal(report.verdict,'incomplete');assert.ok(existsSync(report.path));
});
