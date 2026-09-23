import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync, readFileSync, symlinkSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { agentQa } from '../plugins/just-vibe/scripts/lib/agent-qa.mjs';
import { main } from '../plugins/just-vibe/scripts/toolkit.mjs';
const root=resolve('.tmp/qa-boundaries');rmSync(root,{recursive:true,force:true});mkdirSync(root,{recursive:true});
writeFileSync(join(root,'package.json'),'{"private":true}');symlinkSync(resolve('website/node_modules'),join(root,'node_modules'),process.platform==='win32'?'junction':'dir');
let hits=0, brokenExport=false;
const other=createServer((_req,res)=>{hits++;res.end('<p>Other origin reached</p>');});
await new Promise(done=>other.listen(0,'127.0.0.1',done));
const otherOrigin=`http://127.0.0.1:${other.address().port}`;
const server=createServer((req,res)=>{
  if(req.url==='/redirect'){res.writeHead(302,{location:otherOrigin+'/destination'});res.end();return;}
  if(req.url==='/chain'){res.writeHead(302,{location:'/redirect'});res.end();return;}
  if(req.url==='/auth'&&!req.headers.cookie?.includes('session=fixture')){res.writeHead(401);res.end();return;}
  res.setHeader('Content-Type','text/html');
  const body = {
    '/optional': `<p role="status">Still processing</p><script>fetch('${otherOrigin}/metrics').catch(()=>{});</script>`,
    '/clip-path': '<div style="clip-path:circle(40%)"><button>Custom clipped shape</button></div>',
    '/self-clip': '<button style="clip-path:inset(100%)">Invisible control</button>',
    '/root-clip': '<style>html{clip-path:inset(100%)}</style><button>Invisible control</button>',
    '/rotated-clip': '<div style="margin:100px;width:100px;height:100px;overflow:hidden;rotate:45deg"><button style="margin-top:40px;width:120px;height:20px;padding:0">Cut</button></div>',
    '/clipped': '<div style="width:40px;overflow:hidden"><button style="width:300px">Hidden control</button></div>',
    '/scaled': '<div style="width:100px;overflow:hidden;transform:scale(.25);transform-origin:top left"><button style="width:300px">Hidden control</button></div>',
    '/shadow-clip': '<div style="width:40px;overflow:hidden"><custom-control></custom-control></div><script>document.querySelector("custom-control").attachShadow({mode:"open"}).innerHTML="<button style=width:300px>Hidden control</button>";</script>',
    '/slot-clip': '<custom-control><button style="width:300px">Hidden slotted control</button></custom-control><script>document.querySelector("custom-control").attachShadow({mode:"open"}).innerHTML="<div style=width:40px;overflow:hidden><slot></slot></div>";</script>',
    '/shadow-visible': '<custom-control></custom-control><script>document.querySelector("custom-control").attachShadow({mode:"open"}).innerHTML="<button style=width:150px>Ready control</button>";</script>',
    '/transparent': '<div style="opacity:0"><button>Invisible control</button><p>Complete</p></div>',
    '/fade-in': '<div style="opacity:0"><button>Ready control</button></div><script>setTimeout(()=>document.querySelector("div").style.opacity="1",150)</script>',
    '/text-hidden-child': '<div id="status">Processing<span style="opacity:0">Complete</span></div>',
    '/text-hidden-fragment': '<div id="status">Com<span style="opacity:0">plete</span></div>',
    '/text-hidden-slot': '<custom-status id="status">Complete</custom-status><script>document.querySelector("custom-status").attachShadow({mode:"open"}).innerHTML="<slot style=opacity:0></slot>";</script>',
    '/text-zero-scale': '<div id="status">Processing<span style="display:inline-block;transform:scale(0)">Complete</span></div>',
    '/text-display-none': '<div id="status">Com<span style="display:none">Old status</span>plete</div>',
    '/text-visible-sibling': '<div id="status">Complete<span style="opacity:0">Old status</span></div>',
    '/text-visible-markup': '<div id="status">Com<strong>plete</strong><span style="opacity:0">Old status</span></div>',
    '/text-visible-transform': '<div id="status" style="text-transform:uppercase">Complete<span style="opacity:0">Old status</span></div>',
    '/text-child-fade-in': '<div id="status">Processing<span style="opacity:0">Complete</span></div><script>setTimeout(()=>document.querySelector("span").style.opacity="1",150)</script>',
    '/slow': '<p>Processing</p><script>setTimeout(()=>document.querySelector("p").textContent="Complete",6200)</script>',
    '/auth': '<p>Signed in</p><div id="private" style="position:absolute;top:100px;left:10px;width:100px;height:50px">Private data</div>',
  }[req.url] || (brokenExport ? '<p>Processing<span style="opacity:0">Ready</span></p>' : '<p>Ready</p>');
  res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">'+body);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const target=`http://127.0.0.1:${server.address().port}/`,request='Verify this scenario works.';
const criterion=(id,path,steps,extra={})=>({id,text:request,sourceQuote:request,kind:'browser',path,viewport:{width:390,height:844},steps,...extra});
async function plan(id,c,extra={}) {return agentQa(root,'create',{id,revision:0,title:id,request,target,criteria:[c],coverage:{reviewed:true,reviewNote:'Reviewed fixture requirement.',requirements:[{id:'requirement',text:request,sourceQuote:request,criteria:[c.id]}]},...extra});}
const run=(id,extra={})=>agentQa(root,'run',{id,revision:1,reason:'Regression verification',authorizeTarget:target,timeoutMs:1000,...extra});
try {
  await plan('optional',criterion('complete','/optional',[{action:'text',selector:'p',contains:'Complete'}]));
  const optional=await run('optional');assert.equal(optional.criteria[0].result,'failed');assert.equal(optional.criteria[0].networkRestrictionsObserved,true);assert.equal(hits,0);
  const cli = id => main(['qa', 'show', '--root', root, '--stdin'], { input: async () => JSON.stringify({ id }), log: () => {}, error: message => assert.fail(message) });
  assert.equal(await cli('optional'), 2, 'Failed assertions must fail the CLI acceptance gate');
  await plan('clip',criterion('layout','/clipped',[{action:'layout',selectors:['button']}]));
  const clipped=await run('clip');assert.equal(clipped.criteria[0].result,'failed');assert.match(clipped.criteria[0].detail,/box|Clipped/);
  await plan('scaled', criterion('layout', '/scaled', [{ action: 'layout', selectors: ['button'] }]));
  assert.equal((await run('scaled')).criteria[0].result, 'failed', 'Ancestor clipping must compare dimensions in the same rendered coordinate space');
  for (const path of ['shadow-clip', 'slot-clip']) {
    await plan(path, criterion('layout', '/' + path, [{ action: 'layout', selectors: ['button'] }]));
    assert.equal((await run(path)).criteria[0].result, 'failed', `${path} must inspect the rendered ancestor chain`);
  }
  await plan('shadow-visible', criterion('layout', '/shadow-visible', [{ action: 'layout', selectors: ['button'] }]));
  assert.equal((await run('shadow-visible')).verdict, 'passed', 'Ordinary shadow controls remain supported');
  for (const action of ['visible', 'text', 'layout']) {
    const step = action === 'layout' ? { action, selectors: ['button'] } : action === 'text' ? { action, selector: 'p', contains: 'Complete' } : { action, selector: 'button' };
    await plan('transparent-' + action, criterion('visible', '/transparent', [step]));
    assert.equal((await run('transparent-' + action)).criteria[0].result, 'failed', `${action} must not pass fully transparent content`);
  }
  await plan('fade-in', criterion('visible', '/fade-in', [{ action: 'visible', selector: 'button' }]));
  assert.equal((await run('fade-in')).verdict, 'passed', 'Wait for normal entrance animations within the step timeout');
  for (const [path, expected] of [['text-hidden-child', 'failed'], ['text-hidden-fragment', 'failed'], ['text-hidden-slot', 'failed'], ['text-zero-scale', 'failed'], ['text-display-none', 'passed'], ['text-visible-sibling', 'passed'], ['text-visible-markup', 'passed'], ['text-visible-transform', 'passed'], ['text-child-fade-in', 'passed']]) {
    await plan(path, criterion('text', '/' + path, [{ action: 'text', selector: '#status', contains: path === 'text-visible-transform' ? 'COMPLETE' : 'Complete' }]));
    assert.equal((await run(path)).criteria[0].result, expected, `${path}: invisible descendant text must not establish visible completion`);
  }
  await plan('custom-clip',criterion('layout','/clip-path',[{action:'layout',selectors:['button']}]));
  assert.equal((await run('custom-clip')).criteria[0].result,'needs-human');
  for (const path of ['self-clip', 'root-clip', 'rotated-clip']) {
    await plan(path, criterion('layout', '/' + path, [{ action: 'layout', selectors: ['button'] }]));
    assert.equal((await run(path)).criteria[0].result, 'needs-human', `${path} must not pass using only rectangular bounds`);
  }
  await plan('redirect',criterion('redirect','/chain',[{action:'text',selector:'p',contains:'Other origin reached'}]));
  const redirect=await run('redirect');assert.notEqual(redirect.criteria[0].result,'passed');assert.equal(redirect.criteria[0].networkRestrictionsObserved,true);assert.equal(hits,0,'Unapproved origin must receive no request, even through a redirect chain');
  await plan('authorized',criterion('redirect','/chain',[{action:'text',selector:'p',contains:'Other origin reached'}]),{allowedOrigins:[otherOrigin]});
  await assert.rejects(run('authorized'),/Authorize every additional origin/);
  const authorized=await run('authorized',{authorizeOrigins:[otherOrigin]});assert.equal(authorized.verdict,'passed',JSON.stringify(authorized.criteria));assert.ok(hits>0);
  assert.equal(await cli('authorized'), 0, 'Reviewed passing evidence must succeed at the CLI');
  mkdirSync(join(root,'.just-vibe/qa-auth'),{recursive:true});
  writeFileSync(join(root,'.just-vibe/qa-auth/state.json'),JSON.stringify({cookies:[{name:'session',value:'fixture',domain:'127.0.0.1',path:'/',expires:-1,httpOnly:true,secure:false,sameSite:'Lax'}],origins:[]}),{mode:0o600});
  await plan('auth',criterion('session','/auth',[{action:'text',selector:'p',contains:'Signed in'}],{maskSelectors:['#private']}));
  await assert.rejects(run('auth',{storageState:'.just-vibe/qa-auth/state.json'}),/authorizeAuth/);
  const auth=await run('auth',{storageState:'.just-vibe/qa-auth/state.json',authorizeAuth:true});assert.equal(auth.verdict,'passed',JSON.stringify(auth.criteria));
  assert.ok(!readFileSync(auth.path,'utf8').includes('session=fixture'));
  const {chromium}=createRequire(resolve('website/package.json'))('playwright'),browser=await chromium.launch();
  try {const page=await browser.newPage();const data=readFileSync(join(root,auth.criteria[0].screenshot.path)).toString('base64');
    const pixel=await page.evaluate(async base64=>{const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext('2d');c.drawImage(image,0,0);return [...c.getImageData(20,110,1,1).data];},data);
    assert.deepEqual(pixel,[255,0,255,255],'Configured private content must be masked in the real screenshot');
  } finally {await browser.close();}
  await plan('exportable',criterion('ready','/',[{action:'text',selector:'p',contains:'Ready'}]),{coverage:{reviewed:false,reviewNote:'Pending review',requirements:[{id:'requirement',text:request,sourceQuote:request,criteria:['ready']}]}});
  const unreviewed=await run('exportable');assert.equal(unreviewed.assertionVerdict,'passed');assert.equal(unreviewed.verdict,'incomplete');
  await assert.rejects(agentQa(root,'export-test',{id:unreviewed.id,revision:unreviewed.revision,directory:'not-approved'}),/reviewed request coverage/);
  await agentQa(root,'coverage',{id:unreviewed.id,revision:unreviewed.revision,coverage:{...unreviewed.coverage,reviewed:true,reviewNote:'Reviewed every request clause'}});
  const passed=await agentQa(root,'show',{id:'exportable'});assert.equal(passed.verdict,'passed');
  const exported=await agentQa(root,'export-test',{id:passed.id,revision:passed.revision,directory:'regression'});
  const test=await promisify(execFile)(process.execPath,['--test',join(root,'regression/acceptance.test.mjs')],{cwd:root,timeout:30000});assert.match(test.stdout,/pass 2/);assert.equal(exported.files.length,5);assert.ok(!readFileSync(join(root,'regression/plan.json'),'utf8').includes('qa-artifacts'));
  brokenExport = true;
  try {
    await assert.rejects(promisify(execFile)(process.execPath, ['--test', join(root, 'regression/acceptance.test.mjs')], { cwd: root, timeout: 30000 }), error => {
      assert.match(error.stdout, /Expected visible text: Ready/);
      return true;
    }, 'Exported checks must also reject invisible completion text');
  } finally { brokenExport = false; }
  await assert.rejects(agentQa(root,'export-test',{id:passed.id,revision:passed.revision,directory:'regression'}),/fresh passing|exist/);
  await plan('slow', criterion('complete', '/slow', [{ action: 'text', selector: 'p', contains: 'Complete' }]));
  const slow = await run('slow', { timeoutMs: 10000 });
  assert.equal(slow.verdict, 'passed');
  await agentQa(root, 'export-test', { id: slow.id, revision: slow.revision, directory: 'slow-regression' });
  assert.equal(JSON.parse(readFileSync(join(root, 'slow-regression/plan.json'), 'utf8')).timeoutMs, 10000);
  const slowTest = await promisify(execFile)(process.execPath, ['--test', join(root, 'slow-regression/acceptance.test.mjs')], { cwd: root, timeout: 30000 });
  assert.match(slowTest.stdout, /pass 2/, 'Exported checks must preserve the timeout of the passing journey');
  console.log('QA boundaries passed: CLI verdict gates, optional network failure, scaled/shadow/slot clipping, transparent targets and descendant text, visible markup/transforms and fade-ins, redirected origins, explicit authorization, authenticated session, screenshot masks and exported regression timing.');
} finally {await Promise.all([new Promise(done=>server.close(done)),new Promise(done=>other.close(done))]);}
