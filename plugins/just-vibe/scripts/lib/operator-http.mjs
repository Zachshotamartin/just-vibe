import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { operator } from './operator.mjs';
import { loadMethods } from './method-library.mjs';
import { loadCatalog } from './catalog.mjs';
import { redactValue } from './process.mjs';
import { adapters, ADAPTERS } from './editor-adapters.mjs';
import { object } from './runtime-store.mjs';
import { digest } from './storage.mjs';
export async function startOperatorServer(root, options = {}) {
  const token = options.token || randomBytes(32).toString('hex');
  const previews = new Map();
  let origin;
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (
      req.headers.host !== new URL(origin).host ||
      (req.headers.origin && req.headers.origin !== origin)
    ) {
      res.writeHead(403);
      res.end('Origin refused');
      return;
    }
    try {
      const url = new URL(req.url, origin);
      if (req.method === 'GET' && url.pathname === '/') {
        const nonce = randomBytes(16).toString('hex');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader(
          'Content-Security-Policy',
          `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`,
        );
        res.end(page(nonce));
        return;
      }
      const supplied = req.headers['x-operator-token'];
      if (
        typeof supplied !== 'string' ||
        Buffer.byteLength(supplied) !== Buffer.byteLength(token) ||
        !timingSafeEqual(Buffer.from(supplied), Buffer.from(token))
      ) {
        res.writeHead(403);
        res.end('Operator token required');
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      if (req.method === 'GET' && url.pathname === '/api/status') {
        res.end(JSON.stringify(redactValue(await operator(root, 'status', {}, options))));
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/catalog') {
        const catalog = loadCatalog();
        res.end(
          JSON.stringify({
            installationEnabled: options.allowInstall === true,
            targets: ADAPTERS.filter((a) => a.skills && a.id !== 'hermes').map((a) => a.id),
            commands: [
              ...catalog.commands.map((c) => ({
                id: c.id,
                pack: c.pack,
                summary: c.summary,
                selection: c.selection,
                procedure: c.procedure,
              })),
              ...loadMethods().map((m) => ({ ...m, summary: m.scope, kind: 'method' })),
            ],
            note: 'Offline canonical catalog. Installation and execution use the explicit CLI; browsing never installs tools.',
          }),
        );
        return;
      }
      if (
        req.method === 'POST' &&
        ['/api/action', '/api/install-preview', '/api/install-apply'].includes(url.pathname)
      ) {
        if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json')
          throw Error('Same-origin JSON action required.');
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 12000) throw Error('Action too large.');
        }
        const data = JSON.parse(body);
        if (url.pathname.startsWith('/api/install-')) {
          if (options.allowInstall !== true)
            throw Error(
              'Start the local board with --allow-install to enable project adapter management.',
            );
          if (url.pathname === '/api/install-preview') {
            object(data, ['target', 'operation', 'profile']);
            if (
              !ADAPTERS.some((a) => a.id === data.target && a.skills && a.id !== 'hermes') ||
              !['install', 'update', 'uninstall'].includes(data.operation)
            )
              throw Error('Select a project skill adapter and supported operation.');
            const input = {
              target: data.target,
              ...(data.profile ? { profile: data.profile } : {}),
            };
            const plan = adapters(root, data.operation, { ...input, dryRun: true });
            const id = randomBytes(16).toString('hex'),
              hash = digest(JSON.stringify(plan));
            if (previews.size >= 20) previews.delete(previews.keys().next().value);
            previews.set(id, {
              plan,
              hash,
              input,
              operation: data.operation,
              expires: Date.now() + 300000,
            });
            res.end(JSON.stringify({ id, hash, plan }));
            return;
          }
          object(data, ['id', 'hash']);
          const preview = previews.get(data.id);
          if (!preview || preview.hash !== data.hash || preview.expires <= Date.now())
            throw Error('Installation preview expired; review it again.');
          const current = adapters(root, preview.operation, { ...preview.input, dryRun: true });
          if (digest(JSON.stringify(current)) !== preview.hash)
            throw Error('Installation inputs changed; request a new preview.');
          previews.delete(data.id);
          res.end(JSON.stringify(adapters(root, preview.operation, preview.input)));
          return;
        }
        if (!['acknowledge', 'release', 'drop-merge', 'request-dispatch', 'retire-dispatch'].includes(data.operation))
          throw Error(
            'This interface only changes local coordination records; run/apply actions use the CLI.',
          );
        res.end(JSON.stringify(await operator(root, data.operation, data.payload, options)));
        return;
      }
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: String(error.message).slice(0, 1000) }));
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
  return {
    server,
    origin,
    url: `${origin}/#${token}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
function page(nonce) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>just-vibe local operator</title><style>body{font:16px/1.6 system-ui;margin:0;background:#f6f5f1;color:#242724}main{max-width:1120px;margin:auto;padding:36px 24px}nav{display:flex;gap:12px;flex-wrap:wrap}button,input,select{font:inherit;padding:10px 14px;border:1px solid #6d726d;border-radius:5px;background:white;color:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid #416f46;outline-offset:3px}input{width:min(90%,500px);margin:20px 0}article{border-top:1px solid #c6cdc6;padding:20px 0;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px}h1{font-size:clamp(32px,6vw,56px);line-height:1.12;letter-spacing:-.04em}h2{margin:0}#status{min-height:1.6em}.muted{color:#596159}[hidden]{display:none!important}@media(prefers-reduced-motion:no-preference){article{animation:enter .2s ease-out}@keyframes enter{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}}</style><main><p class="muted">just-vibe / local workspace</p><h1>Work, evidence, and tools.</h1><nav aria-label="Views"><button id="work">Workspace</button><button id="catalog">Tool catalog</button><button id="refresh">Refresh</button></nav><label for="search">Filter the current view</label><br><input id="search" type="search" placeholder="Name, status, or purpose"><p id="status" role="status" aria-live="polite"></p><section id="install" hidden aria-label="Project adapter management"><h2>Manage project skills</h2><p>Preview the owned files before applying. This does not authenticate a host or enable hooks.</p><label for="target">Editor</label> <select id="target"></select> <label for="operation">Action</label> <select id="operation"><option>install</option><option>update</option><option>uninstall</option></select> <label for="profile">Profile</label> <select id="profile"><option>core</option><option>frontend</option><option>backend</option><option>ml</option><option>full</option></select> <button id="preview">Preview changes</button><pre id="plan" tabindex="0"></pre><button id="apply" hidden>Apply reviewed changes</button></section><section id="rows" aria-label="Results"></section></main><script nonce="${nonce}">const token=location.hash.slice(1);history.replaceState(null,'',location.pathname);let mode='work',records=[],generation=0;const status=document.querySelector('#status'),rows=document.querySelector('#rows'),search=document.querySelector('#search');async function api(path,body){const r=await fetch('/api/'+path,{method:body?'POST':'GET',headers:{'x-operator-token':token,...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const value=await r.json();if(!r.ok)throw Error(value.error||'Request failed');return value;}function draw(){rows.replaceChildren();const filtered=records.filter(r=>JSON.stringify(r).toLowerCase().includes(search.value.toLowerCase()));status.textContent=filtered.length+' records';for(const r of filtered){const a=document.createElement('article'),h=document.createElement('h2'),p=document.createElement('p'),details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');h.textContent=r.title||r.id||r.kind;p.textContent=r.summary||r.status||r.message||r.reason||'';summary.textContent='Inspect record';pre.textContent=JSON.stringify(r,null,2);details.append(summary,pre);a.append(h,p,details);if(r.action){const b=document.createElement('button');b.textContent=r.action.label;b.onclick=async()=>{b.disabled=true;try{await api('action',{operation:r.action.operation,payload:r.action.payload});await load();}catch(e){status.textContent=e.message;b.disabled=false;}};a.append(b);}rows.append(a);}}async function load(){const attempt=++generation;status.textContent='Loading local records…';try{if(mode==='catalog'){const c=await api('catalog');if(attempt!==generation)return;document.querySelector('#install').hidden=!c.installationEnabled;const target=document.querySelector('#target');if(!target.options.length)for(const id of c.targets){const o=document.createElement('option');o.value=id;o.textContent=id;target.append(o);}records=c.commands;}else{document.querySelector('#install').hidden=true;const s=await api('status');if(attempt!==generation)return;records=[...s.workers.jobs.map(r=>({...r,kind:'worker'})),...s.jobs.jobs.map(r=>({...r,kind:'job'})),...s.claims.map(r=>({...r,kind:'claim',action:{label:'Release claim',operation:'release',payload:{id:r.id,owner:r.owner,revision:s.revision}}})),...s.conflicts.map((r,i)=>({...r,id:'conflict-'+i,kind:'conflict'})),...s.inbox.map(r=>({...r,kind:'message',...(!r.acknowledged?{action:{label:'Acknowledge',operation:'acknowledge',payload:{id:r.id,revision:s.revision}}}:{})})),...s.merges.map(r=>({...r,kind:'merge-review'})),...s.dispatch.map(r=>({...r,kind:'dispatch',...(r.status==='finished'?{action:{label:'Retire finished request',operation:'retire-dispatch',payload:{id:r.id,revision:s.revision}}}:{})}))];}draw();}catch(e){status.textContent=e.message;}}document.querySelector('#work').onclick=()=>{mode='work';load();};document.querySelector('#catalog').onclick=()=>{mode='catalog';load();};document.querySelector('#refresh').onclick=load;search.oninput=draw;let installPreview;const apply=document.querySelector('#apply'),plan=document.querySelector('#plan');for(const id of ['target','operation','profile'])document.getElementById(id).onchange=()=>{installPreview=null;apply.hidden=true;plan.textContent='';};document.querySelector('#preview').onclick=async()=>{apply.hidden=true;try{installPreview=await api('install-preview',{target:document.querySelector('#target').value,operation:document.querySelector('#operation').value,profile:document.querySelector('#profile').value});plan.textContent=JSON.stringify(installPreview.plan,null,2);apply.hidden=false;}catch(e){status.textContent=e.message;}};apply.onclick=async()=>{apply.disabled=true;try{await api('install-apply',{id:installPreview.id,hash:installPreview.hash});plan.textContent='Owned project files updated. Restart the selected host to discover them.';apply.hidden=true;installPreview=null;}catch(e){status.textContent=e.message;}finally{apply.disabled=false;}};load();</script></html>`;
}
