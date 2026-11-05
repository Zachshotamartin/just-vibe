import { randomBytes } from 'node:crypto';
import { renderCanvas } from './canvas-ui.mjs';
import { learningClient } from './learning-client.mjs';
import { inspectCanvas, submitCanvasFeedback } from './plan-canvas.mjs';
import { preferences } from './preferences.mjs';
import { runtimeStore, object } from './runtime-store.mjs';

export const APP_EXTENSION = 'io.modelcontextprotocol/ui';
export const APP_MIME = 'text/html;profile=mcp-app';
export const APP_SOURCE = 'mcp-app';
const PLAN_REVIEW = 'ui://just-vibe/plan-review', PREFERENCES = 'ui://just-vibe/preferences';
const PREFERENCE_REQUESTS = ['preferences', 'preferences-activity', 'preferences-action', 'preferences-preview'];

export function supportsApps(capabilities) {
  const mimeTypes = capabilities?.extensions?.[APP_EXTENSION]?.mimeTypes;
  return Array.isArray(mimeTypes) && mimeTypes.includes(APP_MIME);
}

// Runs inside the host's sandboxed iframe. It speaks the MCP Apps JSON-RPC
// bridge over postMessage and calls one app-only tool through the host.
export function mcpAppBridge(toolName) {
  let next = 0;
  const pending = new Map(), inputs = [], listeners = [];
  const post = (message) => window.parent.postMessage({ jsonrpc: '2.0', ...message }, '*');
  window.addEventListener('message', (event) => {
    const message = event.data;
    if (event.source !== window.parent || !message || message.jsonrpc !== '2.0') return;
    if (!message.method && pending.has(message.id)) {
      const { ok, fail, timer } = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(timer);
      if (message.error) fail(Error(message.error.message || 'Host request failed'));
      else ok(message.result);
    } else if (message.method === 'ui/notifications/tool-input') {
      inputs.push(message.params?.arguments || {});
      listeners.forEach((listener) => listener(message.params?.arguments || {}));
    } else if (message.method === 'ui/resource-teardown' && message.id !== undefined) {
      post({ id: message.id, result: {} });
    } else if (message.method === 'ping' && message.id !== undefined) {
      post({ id: message.id, result: {} });
    }
  });
  function request(method, params) {
    const id = ++next;
    return new Promise((ok, fail) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        fail(Error('The host did not answer ' + method + '.'));
      }, 30000);
      pending.set(id, { ok, fail, timer });
      post({ id, method, params });
    });
  }
  const ready = request('ui/initialize', {
    protocolVersion: '2026-01-26',
    appInfo: { name: 'just-vibe', version: '1' },
    appCapabilities: {},
  }).then((result) => {
    post({ method: 'ui/notifications/initialized', params: {} });
    if (typeof ResizeObserver === 'function')
      new ResizeObserver(() => post({ method: 'ui/notifications/size-changed', params: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight } })).observe(document.documentElement);
    return result;
  });
  async function call(args) {
    await ready;
    const result = await request('tools/call', { name: toolName, arguments: args });
    const text = (result?.content || []).find((c) => c.type === 'text')?.text || '';
    if (result?.isError) throw Error(text || 'Request failed');
    return JSON.parse(text);
  }
  // Tool input names what this view shows; it can arrive before or after initialize.
  const toolInput = () => (inputs.length ? Promise.resolve(inputs.at(-1)) : new Promise((resolve) => listeners.push(resolve)));
  return { ready, call, toolInput };
}

// Maps the review page's two fetch routes onto the canvas_app tool.
export function canvasAppTransport(bridgeFactory) {
  const bridge = bridgeFactory('canvas_app');
  const target = bridge.toolInput().then((args) => {
    if (typeof args.id !== 'string') throw Error('The host did not say which review to show.');
    return args.id;
  });
  return async (path, body) => {
    const id = await target;
    if (path === '/api/review') return bridge.call({ operation: 'review', id });
    if (path === '/api/feedback') return bridge.call({ operation: 'feedback', id, ...body });
    throw Error('Unsupported review request.');
  };
}

export function preferencesAppClient(learning, bridgeFactory) {
  const bridge = bridgeFactory('preferences_app'), state = {};
  const rows = document.getElementById('rows'), status = document.getElementById('status');
  const api = (request, body) => bridge.call(body ? { request, body } : { request });
  async function load() {
    try {
      const [data, activity] = await Promise.all([api('preferences'), api('preferences-activity')]);
      state.activity = activity;
      state.conflicts = data.conflicts;
      rows.replaceChildren();
      learning(data.lessons, { api, rows, status, reload: load, state });
      status.textContent = data.lessons.length + ' saved preference' + (data.lessons.length === 1 ? '' : 's') + '.';
    } catch (error) {
      status.textContent = error.message;
    }
  }
  load();
}

const PREFERENCES_STYLE = ':root{color-scheme:light;font-family:system-ui,sans-serif;color:#282922;background:#f5f3ed;font-size:16px}*{box-sizing:border-box}body{margin:0}main{max-width:960px;margin:auto;padding:1.5rem 4vw}h1{font:400 clamp(1.6rem,4vw,2.4rem)/1.15 Georgia,serif;margin:0 0 .5rem}p{line-height:1.6;color:#54564c}button,input,textarea,select{font:inherit}button{cursor:pointer;border:1px solid #9c9d90;border-radius:6px;padding:.5rem .8rem;background:transparent;color:inherit;margin:.25rem .5rem .25rem 0}button:hover{background:#e7e6db}button:focus-visible,input:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid #536946;outline-offset:3px}label{display:block;margin:.75rem 0}textarea,input{display:block;width:100%;margin-top:.35rem;padding:.6rem;border:1px solid #9c9d90;border-radius:6px;background:#fffefa}textarea{min-height:5rem;resize:vertical}details{border-top:1px solid #d1d1c6;padding:.8rem 0}summary{cursor:pointer;font-weight:600}#status{overflow-wrap:anywhere}';

function nonce() {
  return randomBytes(16).toString('hex');
}
export function renderPreferencesApp() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preferences · just-vibe</title><style>${PREFERENCES_STYLE}</style></head><body><main><h1>Workflow preferences</h1><p id="status" role="status" aria-live="polite">Loading preferences…</p><div id="rows"></div></main><script nonce="${nonce()}">(${preferencesAppClient.toString()})(${learningClient.toString()}, ${mcpAppBridge.toString()});
</script></body></html>`;
}

export const APP_RESOURCES = [
  { uri: PLAN_REVIEW, name: 'Plan review', description: 'Annotate, approve or request changes on a local just-vibe review.', render: () => renderCanvas(nonce(), { app: `(${canvasAppTransport.toString()})(${mcpAppBridge.toString()})` }) },
  { uri: PREFERENCES, name: 'Workflow preferences', description: 'Create, edit, preview, pause and roll back saved workflow preferences.', render: renderPreferencesApp },
];
export function listAppResources() {
  return { resources: APP_RESOURCES.map(({ uri, name, description }) => ({ uri, name, description, mimeType: APP_MIME })) };
}
export function readAppResource(uri) {
  const resource = APP_RESOURCES.find(r => r.uri === uri);
  if (!resource) return null;
  // No external origins: the views talk only to the host bridge.
  return { contents: [{ uri, mimeType: APP_MIME, text: resource.render(), _meta: { ui: { prefersBorder: true, csp: { connectDomains: [], resourceDomains: [] } } } }] };
}

const appOnly = uri => ({ ui: { resourceUri: uri, visibility: ['app'] } });
const str = { type: 'string', minLength: 1, maxLength: 12000 };
const closed = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });

function canvasApp(root, args, options) {
  const store = runtimeStore(root, options);
  if (args.operation === 'review') return inspectCanvas(store, args.id);
  const { operation, id, ...feedback } = args;
  return submitCanvasFeedback(store, id, feedback, APP_SOURCE);
}
function preferencesApp(root, args, options) {
  if (args.request === 'preferences') return preferences(root, 'list', {}, options);
  if (args.request === 'preferences-activity') return preferences(root, 'activity', {}, options);
  object(args.body, ['operation', 'payload']);
  const permitted = args.request === 'preferences-preview' ? ['preview'] : ['edit', 'toggle', 'rollback', 'create', 'exclude'];
  if (!permitted.includes(args.body.operation)) throw Error('Unsupported preference action.');
  return preferences(root, args.body.operation, args.body.payload, { ...options, preferenceSurface: APP_SOURCE });
}

// Listed only when the client advertises MCP Apps. Hosts must hide
// visibility ["app"] tools from the model and reject model calls to them;
// this server cannot tell who initiated a call, so those tools rely on that rule.
export const APP_TOOLS = [
  {
    name: 'canvas_present', write: true, app: true,
    description: 'Show a local review in the host as an interactive view where the user annotates, approves or requests changes. Then wait for the verdict with canvas_read wait.',
    inputSchema: closed({ id: str }, ['id']),
    _meta: { ui: { resourceUri: PLAN_REVIEW } },
    run: (root, args, options) => {
      const record = inspectCanvas(runtimeStore(root, options), args.id);
      return { id: args.id, title: record.title, path: record.artifact.path, artifactHash: record.artifact.hash, revision: record.revision, effectiveVerdict: record.effectiveVerdict, note: 'The user reviews this version in the host view. A verdict there is recorded with source mcp-app.' };
    },
  },
  {
    name: 'canvas_app', write: true, app: true,
    description: 'Review view only: read the review or submit the user\'s feedback.',
    inputSchema: closed({
      operation: { type: 'string', enum: ['review', 'feedback'] }, id: str, revision: { type: 'integer', minimum: 0 },
      artifactHash: str, kind: { type: 'string', enum: ['comment', 'annotation', 'approve', 'changes'] }, text: str, anchor: { type: 'integer', minimum: 1 },
    }, ['operation', 'id']),
    _meta: appOnly(PLAN_REVIEW),
    run: canvasApp,
  },
  {
    name: 'preferences_present', write: true, app: true,
    description: 'Show saved workflow preferences in the host as an interactive view where the user creates, edits, previews, pauses or rolls them back.',
    inputSchema: closed({}),
    _meta: { ui: { resourceUri: PREFERENCES } },
    run: (root, args, options) => ({ preferences: preferences(root, 'list', {}, options).lessons.length, note: 'The user manages preferences in the host view. Changes there are recorded with surface mcp-app.' }),
  },
  {
    name: 'preferences_app', write: true, app: true,
    description: 'Preferences view only: read preferences and activity, or apply the user\'s preference action.',
    inputSchema: closed({ request: { type: 'string', enum: PREFERENCE_REQUESTS }, body: { type: 'object' } }, ['request']),
    _meta: appOnly(PREFERENCES),
    run: preferencesApp,
  },
];
