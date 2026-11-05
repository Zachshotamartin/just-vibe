import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { serveMcp } from '../plugins/just-vibe/scripts/lib/mcp-transport.mjs';
import { createMcpServer } from '../plugins/just-vibe/scripts/lib/mcp-server.mjs';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { assistantRuntime } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { patternLearning } from '../plugins/just-vibe/scripts/lib/pattern-learning.mjs';
import { planCanvas } from '../plugins/just-vibe/scripts/lib/plan-canvas.mjs';
import { supportsElicitation } from '../plugins/just-vibe/scripts/lib/mcp-elicitation.mjs';
import { APP_MIME, supportsApps } from '../plugins/just-vibe/scripts/lib/mcp-apps.mjs';

const catalog = loadCatalog();
const APPS = { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: [APP_MIME] } } };

// A client end of the stdio transport: write lines in, read parsed lines out.
function connect(handler, options) {
  const input = new PassThrough(), output = new PassThrough(), lines = [], waiters = [];
  let text = '';
  output.on('data', chunk => {
    text += chunk;
    let newline;
    while ((newline = text.indexOf('\n')) !== -1) {
      const message = JSON.parse(text.slice(0, newline));
      text = text.slice(newline + 1);
      const waiter = waiters.findIndex(w => w.match(message));
      if (waiter >= 0) waiters.splice(waiter, 1)[0].resolve(message);
      else lines.push(message);
    }
  });
  const done = serveMcp(input, output, handler, options);
  const next = match => {
    const found = lines.findIndex(match);
    if (found >= 0) return Promise.resolve(lines.splice(found, 1)[0]);
    return new Promise(resolve => waiters.push({ match, resolve }));
  };
  return {
    send: message => input.write(JSON.stringify(message) + '\n'),
    response: id => next(m => m.id === id && !m.method),
    request: method => next(m => m.method === method),
    lines, done, end: () => input.end(),
  };
}

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'jv-mcp-protocol-')), root = join(dir, 'project');
  mkdirSync(root);
  writeFileSync(join(root, 'plan.md'), '# Plan\n\n1. Keep the API.\n2. Add retries.\n');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return { root, options: { home: join(dir, 'home'), catalog, allowWrite: true } };
}
async function open(f, capabilities = {}, protocolVersion = '2025-11-25') {
  const client = connect(createMcpServer(f.root, f.options));
  client.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion, capabilities, clientInfo: { name: 'fixture', version: '1' } } });
  client.send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  const init = await client.response(1);
  let id = 1;
  client.call = async (name, args) => {
    const sent = ++id;
    client.send({ jsonrpc: '2.0', id: sent, method: 'tools/call', params: { name, arguments: args } });
    const { result } = await client.response(sent);
    return { ...result, data: result.isError ? result.content[0].text : JSON.parse(result.content[0].text) };
  };
  client.rpc = async (method, params) => {
    const sent = ++id;
    client.send({ jsonrpc: '2.0', id: sent, method, ...(params ? { params } : {}) });
    return client.response(sent);
  };
  return { client, init };
}

test('the transport runs requests concurrently up to its limit and keeps arrival order for starts', async () => {
  const started = [], release = {};
  const client = connect(async (message) => {
    started.push(message.id);
    await new Promise(resolve => { release[message.id] = resolve; });
    return { jsonrpc: '2.0', id: message.id, result: { id: message.id } };
  }, { maxInFlight: 2 });
  for (const id of [1, 2, 3]) client.send({ jsonrpc: '2.0', id, method: 'slow' });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(started, [1, 2]);
  release[2]();
  assert.deepEqual((await client.response(2)).result, { id: 2 });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(started, [1, 2, 3]);
  release[1](); release[3]();
  await client.response(1); await client.response(3);
  client.end();
  await client.done;
});

test('server-to-client requests route responses, errors and timeouts, and ignore unknown ids', async () => {
  const client = connect(async (message, peer) => {
    try {
      const answer = await peer.request('elicitation/create', { message: message.method }, { timeoutMs: message.method === 'quick' ? 30 : 5000 });
      return { jsonrpc: '2.0', id: message.id, result: { answer } };
    } catch (error) {
      return { jsonrpc: '2.0', id: message.id, result: { failed: error.message, code: error.code } };
    }
  });
  client.send({ jsonrpc: '2.0', id: 'a', method: 'ask' });
  const outbound = await client.request('elicitation/create');
  assert.match(outbound.id, /^just-vibe-\d+$/);
  client.send({ jsonrpc: '2.0', id: 'unknown-response', result: { ignored: true } });
  client.send({ jsonrpc: '2.0', id: outbound.id, result: { action: 'accept' } });
  assert.deepEqual((await client.response('a')).result, { answer: { action: 'accept' } });
  client.send({ jsonrpc: '2.0', id: 'b', method: 'ask' });
  const second = await client.request('elicitation/create');
  client.send({ jsonrpc: '2.0', id: second.id, error: { code: -32600, message: 'User refused' } });
  assert.deepEqual((await client.response('b')).result, { failed: 'User refused', code: -32600 });
  client.send({ jsonrpc: '2.0', id: 'c', method: 'quick' });
  await client.request('elicitation/create');
  assert.equal((await client.response('c')).result.code, 'MCP_TIMEOUT');
  client.send({ jsonrpc: '2.0', id: 'd', method: 'ask' });
  await client.request('elicitation/create');
  client.end();
  assert.equal((await client.response('d')).result.code, 'MCP_CLOSED');
  await client.done;
  assert.ok(!client.lines.some(line => line.id === 'unknown-response'));
});

test('capability checks accept form elicitation and the MCP Apps extension only', () => {
  assert.equal(supportsElicitation({ elicitation: {} }), true);
  assert.equal(supportsElicitation({ elicitation: { form: {} } }), true);
  assert.equal(supportsElicitation({ elicitation: { url: {} } }), false);
  assert.equal(supportsElicitation({}), false);
  assert.equal(supportsApps(APPS), true);
  assert.equal(supportsApps({ extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: ['text/html'] } } }), false);
});

test('clients without elicitation or apps keep the existing tools and flows', async (t) => {
  const f = fixture(t);
  const { client, init } = await open(f);
  assert.deepEqual(Object.keys(init.result.capabilities), ['tools']);
  const names = (await client.rpc('tools/list')).result.tools.map(tool => tool.name);
  assert.ok(names.includes('queue_manage') && !names.includes('canvas_present') && !names.includes('canvas_app'));
  assert.equal((await client.rpc('resources/list')).error.code, -32601);
  await planCanvas(f.root, 'create', { id: 'plan', revision: 0, title: 'Plan', path: 'plan.md' }, f.options);
  const asked = await client.call('canvas_manage', { operation: 'ask', id: 'plan' });
  assert.equal(asked.isError, true);
  assert.match(asked.data, /cannot show a review dialog/);
  client.end();
  await client.done;
});

test('elicitation lets the user decide a lesson approval, and declining records nothing', async (t) => {
  const f = fixture(t);
  const task = assistantRuntime(f.root, 'start', { sessionId: 'elicit', brief: 'Remember to prefer early returns in review.' }, f.options);
  const proposed = patternLearning(f.root, 'propose', { revision: 0, taskId: task.id, excerpt: task.userMessage, reason: 'User asked', change: { workflow: 'review', instruction: 'Prefer early returns.' } }, f.options);
  const id = proposed.candidates[0].id;
  const { client } = await open(f, { elicitation: { form: {} } });
  const review = client.call('learning_review', { operation: 'approve', revision: proposed.revision, id, reason: 'The user said so in chat' });
  const declined = await client.request('elicitation/create');
  assert.equal(declined.params.mode, 'form');
  assert.match(declined.params.message, /Prefer early returns/);
  assert.match(declined.params.message, /From your message: "Remember to prefer early returns/);
  assert.deepEqual(declined.params.requestedSchema.required, ['decision']);
  client.send({ jsonrpc: '2.0', id: declined.id, result: { action: 'decline' } });
  assert.deepEqual((await review).data.recorded, false);
  assert.equal(patternLearning(f.root, 'status', {}, f.options).candidates[0].status, 'pending');
  const approval = client.call('learning_review', { operation: 'approve', revision: proposed.revision, id, reason: 'The user said so in chat' });
  const asked = await client.request('elicitation/create');
  client.send({ jsonrpc: '2.0', id: asked.id, result: { action: 'accept', content: { decision: 'approve', reason: 'Yes, keep it short' } } });
  const approved = await approval;
  assert.equal(approved.isError, false, approved.data);
  assert.deepEqual([approved.data.recorded, approved.data.decision, approved.data.source], [true, 'approve', 'user-elicitation']);
  const state = patternLearning(f.root, 'status', {}, f.options);
  assert.deepEqual([state.decisions[0].status, state.decisions[0].reason, state.decisions[0].source], ['approved', 'Yes, keep it short', 'user-elicitation']);
  assert.equal(state.candidates[0].reviewSource, 'user-elicitation');
  client.end();
  await client.done;
});

test('canvas ask binds the elicited verdict to the version shown and needs text for changes', async (t) => {
  const f = fixture(t);
  await planCanvas(f.root, 'create', { id: 'plan', revision: 0, title: 'Retry plan', path: 'plan.md' }, f.options);
  const { client } = await open(f, { elicitation: {} }, '2025-06-18');
  const blank = client.call('canvas_manage', { operation: 'ask', id: 'plan' });
  const first = await client.request('elicitation/create');
  assert.equal(first.params.mode, undefined);
  assert.match(first.params.message, /Review "Retry plan" \(plan\.md, version [a-f0-9]{12}\)/);
  assert.match(first.params.message, /2\. Add retries\./);
  client.send({ jsonrpc: '2.0', id: first.id, result: { action: 'accept', content: { verdict: 'changes' } } });
  assert.match((await blank).data, /needs feedback text/);
  const approve = client.call('canvas_manage', { operation: 'ask', id: 'plan' });
  const second = await client.request('elicitation/create');
  writeFileSync(join(f.root, 'plan.md'), '# Plan\n\nChanged while the dialog was open.\n');
  client.send({ jsonrpc: '2.0', id: second.id, result: { action: 'accept', content: { verdict: 'approve' } } });
  assert.match((await approve).data, /Artifact changed/);
  writeFileSync(join(f.root, 'plan.md'), '# Plan\n\n1. Keep the API.\n2. Add retries.\n');
  const third = client.call('canvas_manage', { operation: 'ask', id: 'plan' });
  const dialog = await client.request('elicitation/create');
  client.send({ jsonrpc: '2.0', id: dialog.id, result: { action: 'accept', content: { verdict: 'approve', feedback: 'Ship it' } } });
  const answered = await third;
  assert.deepEqual([answered.data.kind, answered.data.verdict.source, answered.data.verdict.reason], ['approve', 'user-elicitation', 'Ship it']);
  client.end();
  await client.done;
});

test('MCP Apps clients get ui resources, linked tools and app-only tools that record their surface', async (t) => {
  const f = fixture(t);
  await planCanvas(f.root, 'create', { id: 'plan', revision: 0, title: 'Retry plan', path: 'plan.md' }, f.options);
  const { client, init } = await open(f, APPS);
  assert.deepEqual(init.result.capabilities.resources, { listChanged: false });
  const tools = (await client.rpc('tools/list')).result.tools;
  const byName = Object.fromEntries(tools.map(tool => [tool.name, tool]));
  assert.deepEqual(byName.canvas_present._meta, { ui: { resourceUri: 'ui://just-vibe/plan-review' } });
  assert.deepEqual(byName.canvas_app._meta.ui.visibility, ['app']);
  assert.deepEqual(byName.preferences_app._meta.ui, { resourceUri: 'ui://just-vibe/preferences', visibility: ['app'] });
  const listed = (await client.rpc('resources/list')).result.resources;
  assert.deepEqual(listed.map(r => [r.uri, r.mimeType]), [['ui://just-vibe/plan-review', APP_MIME], ['ui://just-vibe/preferences', APP_MIME]]);
  for (const { uri } of listed) {
    const content = (await client.rpc('resources/read', { uri })).result.contents[0];
    assert.equal(content.mimeType, APP_MIME);
    assert.match(content.text, /^<!doctype html>/);
    assert.match(content.text, /ui\/initialize/);
    assert.ok(content.text.includes(uri.endsWith('plan-review') ? "bridgeFactory('canvas_app')" : "bridgeFactory('preferences_app')"));
    assert.deepEqual(content._meta.ui.csp, { connectDomains: [], resourceDomains: [] });
  }
  assert.equal((await client.rpc('resources/read', { uri: 'ui://just-vibe/missing' })).error.code, -32002);
  const shown = await client.call('canvas_present', { id: 'plan' });
  assert.equal(shown.data.title, 'Retry plan');
  const review = (await client.call('canvas_app', { operation: 'review', id: 'plan' })).data;
  const saved = await client.call('canvas_app', { operation: 'feedback', id: 'plan', revision: review.revision, artifactHash: review.artifact.hash, kind: 'approve', text: 'Approved in the view' });
  assert.deepEqual([saved.data.verdict.kind, saved.data.verdict.source], ['approve', 'mcp-app']);
  const prefs = await client.call('preferences_app', { request: 'preferences' });
  assert.ok(Array.isArray(prefs.data.lessons));
  assert.match((await client.call('preferences_app', { request: 'preferences-action', body: { operation: 'delete', payload: {} } })).data, /Unsupported preference action/);
  client.end();
  await client.done;
});

test('MCP Apps tools stay hidden from read-only connections', async (t) => {
  const f = fixture(t);
  f.options.allowWrite = false;
  const { client } = await open(f, APPS);
  const names = (await client.rpc('tools/list')).result.tools.map(tool => tool.name);
  assert.ok(!names.some(name => ['canvas_present', 'canvas_app', 'preferences_present', 'preferences_app', 'queue_manage'].includes(name)));
  assert.ok(names.includes('queue_read'));
  client.end();
  await client.done;
});
