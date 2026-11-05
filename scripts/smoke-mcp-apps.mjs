import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createMcpServer } from '../plugins/just-vibe/scripts/lib/mcp-server.mjs';
import { planCanvas, inspectCanvas } from '../plugins/just-vibe/scripts/lib/plan-canvas.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
import { APP_MIME } from '../plugins/just-vibe/scripts/lib/mcp-apps.mjs';
const require = createRequire(new URL('../website/package.json', import.meta.url));
const { chromium } = require('playwright');

// A fixture MCP Apps host: it loads a ui:// resource into a sandboxed iframe
// under the spec's default CSP, answers the bridge, and forwards only
// app-visible tool calls to a real just-vibe MCP server.
const HOST_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Fixture MCP Apps host</title>
<style>body{margin:0;font-family:system-ui}iframe{width:100%;border:0;height:900px}</style></head><body>
<iframe id="view" title="App view" sandbox="allow-scripts"></iframe>
<script>
const params = new URLSearchParams(location.search), frame = document.getElementById('view');
const rpc = (method, params) => fetch('/rpc', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ method, params }) }).then(r => r.json());
const csp = "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' data:; connect-src 'none'";
let tools = [];
window.log = [];
window.addEventListener('message', async (event) => {
  if (event.source !== frame.contentWindow) return;
  const message = event.data, reply = (body) => frame.contentWindow.postMessage({ jsonrpc: '2.0', id: message.id, ...body }, '*');
  window.log.push(message.method || 'response');
  if (message.method === 'ui/initialize') reply({ result: { protocolVersion: '2026-01-26', hostInfo: { name: 'fixture-host', version: '1' }, hostCapabilities: {}, hostContext: { theme: 'light', displayMode: 'inline' } } });
  else if (message.method === 'ui/notifications/initialized') frame.contentWindow.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-input', params: { arguments: JSON.parse(params.get('input') || '{}') } }, '*');
  else if (message.method === 'ui/notifications/size-changed') frame.style.height = Math.max(400, message.params.height) + 'px';
  else if (message.method === 'tools/call') {
    const tool = tools.find(t => t.name === message.params.name);
    // Host rule: a view may call only tools whose visibility includes "app".
    if (!tool || !(tool._meta?.ui?.visibility || ['model', 'app']).includes('app')) return reply({ error: { code: -32602, message: 'Tool is not available to this view' } });
    const response = await rpc('tools/call', message.params);
    reply(response.error ? { error: response.error } : { result: response.result });
  }
});
(async () => {
  tools = (await rpc('tools/list')).result.tools;
  const content = (await rpc('resources/read', { uri: params.get('uri') })).result.contents[0];
  if (content.mimeType !== ${JSON.stringify(APP_MIME)}) throw Error('Unexpected app MIME type');
  frame.srcdoc = content.text.replace('<head>', '<head><meta http-equiv="Content-Security-Policy" content="' + csp + '">');
})();
</script></body></html>`;

const temp = mkdtempSync(join(tmpdir(), 'jv-mcp-apps-')), root = join(temp, 'project'), options = { home: join(temp, 'home'), allowWrite: true };
const directory = resolve('.tmp/mcp-apps-browser');
mkdirSync(root); mkdirSync(directory, { recursive: true });
writeFileSync(join(root, 'plan.md'), '# Retry plan\n\n1. Keep the payment API contract.\n2. Reuse the idempotency key on retry.\n');
await planCanvas(root, 'create', { id: 'plan', revision: 0, title: 'Retry plan', path: 'plan.md' }, options);

const handler = createMcpServer(root, options);
let nextId = 0;
await handler({ jsonrpc: '2.0', id: ++nextId, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [APP_MIME] } } }, clientInfo: { name: 'fixture-host', version: '1' } } });
await handler({ jsonrpc: '2.0', method: 'notifications/initialized' });

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/?')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(HOST_PAGE);
  }
  if (req.method === 'POST' && req.url === '/rpc') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { method, params } = JSON.parse(body);
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(await handler({ jsonrpc: '2.0', id: ++nextId, method, params })));
  }
  res.writeHead(404); res.end();
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const origin = `http://127.0.0.1:${server.address().port}`;
const hostUrl = (uri, input) => `${origin}/?uri=${encodeURIComponent(uri)}&input=${encodeURIComponent(JSON.stringify(input))}`;

let browser;
const errors = [];
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto(hostUrl('ui://just-vibe/plan-review', { id: 'plan' }));
  const view = page.frameLocator('#view');
  await view.getByRole('heading', { name: 'Retry plan' }).waitFor();
  await view.getByRole('button', { name: 'Annotate line 4', exact: true }).click();
  await view.getByLabel('Feedback or review reason').fill('Confirm the key survives a process restart.');
  await view.getByRole('button', { name: 'Add annotation' }).click();
  await view.locator('#feedback p').first().waitFor();
  await view.getByLabel('Feedback or review reason').fill('Approved after the annotation.');
  await view.getByRole('button', { name: 'Approve version' }).click();
  await page.waitForFunction(() => window.log.filter(m => m === 'tools/call').length >= 4);
  let record;
  for (let n = 0; n < 50 && !record?.verdict; n++) {
    record = inspectCanvas(runtimeStore(root, options), 'plan');
    if (!record.verdict) await new Promise(ok => setTimeout(ok, 100));
  }
  assert.deepEqual([record.verdict.kind, record.verdict.source, record.verdict.reason], ['approve', 'mcp-app', 'Approved after the annotation.']);
  assert.deepEqual(record.feedback.map(f => [f.kind, f.source, f.anchor ?? null]), [['annotation', 'mcp-app', 4], ['approve', 'mcp-app', null]]);
  assert.ok((await page.evaluate(() => window.log)).includes('ui/notifications/size-changed'), 'The view reports its size');
  await page.screenshot({ path: join(directory, 'plan-review.png'), fullPage: true });

  await page.goto(hostUrl('ui://just-vibe/preferences', {}));
  await page.frameLocator('#view').getByRole('heading', { name: 'Workflow preferences' }).waitFor();
  await page.frameLocator('#view').getByText('0 saved preferences.').waitFor();
  await page.frameLocator('#view').getByText('Create a preference').waitFor();
  await page.screenshot({ path: join(directory, 'preferences.png'), fullPage: true });

  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ ok: true, screenshots: directory, verdict: record.verdict.source }, null, 2));
} finally {
  await browser?.close();
  server.close();
  rmSync(temp, { recursive: true, force: true });
}
