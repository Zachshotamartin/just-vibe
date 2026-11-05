import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, extname, isAbsolute, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findExecutable } from './command.mjs';
import { runners, trustedCommand } from './trusted-runners.mjs';
import { openLanguageServer } from './lsp-client.mjs';
import { boundedText, boundedList, integer } from './capability-io.mjs';
import { within, privateName, projectRoot, digest } from './storage.mjs';
import { cleanText, object } from './runtime-store.mjs';
import { redact } from './process.mjs';

// Language servers this project knows how to start. A server can execute project code (tsconfig
// plugins, build scripts, Python environments), so none starts until the user configures and
// trusts it as the runner lsp-<id>; the runner identity pins the binary and its arguments.
export const LANGUAGE_SERVERS = [
  { id: 'typescript', binaries: ['typescript-language-server'], args: ['--stdio'], npm: true,
    extensions: { '.ts': 'typescript', '.tsx': 'typescriptreact', '.mts': 'typescript', '.cts': 'typescript', '.js': 'javascript', '.jsx': 'javascriptreact', '.mjs': 'javascript', '.cjs': 'javascript' } },
  { id: 'python', binaries: ['basedpyright-langserver', 'pyright-langserver'], args: ['--stdio'], npm: true, extensions: { '.py': 'python', '.pyi': 'python' } },
  { id: 'go', binaries: ['gopls'], args: [], extensions: { '.go': 'go' } },
  { id: 'rust', binaries: ['rust-analyzer'], args: [], extensions: { '.rs': 'rust' } },
];
// Claude Code starts plugin language servers itself, in every project, so only servers on PATH
// qualify (a project's node_modules/.bin would run that repository's binary everywhere). Each
// binary's hash is recorded so doctor can report a changed server.
export function claudeLspConfiguration({ env = process.env } = {}) {
  const servers = {}, binaries = [];
  for (const server of LANGUAGE_SERVERS) {
    const located = locateServer('', server, { env, local: false });
    if (!located) continue;
    const [command, ...args] = located.command;
    servers[server.id] = { command, args, extensionToLanguage: server.extensions };
    binaries.push({ id: server.id, command, sha256: fileHash(command) });
  }
  return { servers, binaries };
}
export const fileHash = path => { try { return digest(readFileSync(realpathSync(path))); } catch { return null; } };
const SEVERITY = { 1: 'error', 2: 'warning', 3: 'information', 4: 'hint' };
const runnerId = server => `lsp-${server.id}`;
export const serverForFile = file => LANGUAGE_SERVERS.find(s => Object.hasOwn(s.extensions, extname(file).toLowerCase())) || null;

// Project-local npm binaries are found first because they match the project's own compiler.
export function locateServer(root, server, { env = process.env, local = true } = {}) {
  for (const name of server.binaries) {
    const project = server.npm && local ? join(root, 'node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name) : null;
    if (project && existsSync(project)) return { command: [project, ...server.args], local: true };
    const found = findExecutable(name, env);
    if (found) return { command: [found, ...server.args], local: false };
  }
  return null;
}

export async function languageServerStatus(root, options = {}) {
  root = projectRoot(root);
  const trusted = (await runners(root, 'list', {}, options)).runners;
  return LANGUAGE_SERVERS.map(server => {
    const located = locateServer(root, server, options), runner = trusted.find(r => r.id === runnerId(server));
    return { id: server.id, runner: runnerId(server), extensions: Object.keys(server.extensions), detected: located ? { command: located.command.map(v => redact(v)), local: located.local } : null,
      configured: Boolean(runner), trusted: Boolean(runner?.trusted && runner.current), ...(runner ? { hash: runner.hash } : {}) };
  });
}

function trustAdvice(server, located) {
  const command = located ? JSON.stringify(located.command) : `[${JSON.stringify(server.binaries[0])}${server.args.map(a => `,${JSON.stringify(a)}`).join('')}]`;
  return `Configure and trust the ${server.id} language server first: runners configure {"id":"${runnerId(server)}","revision":<current>,"config":{"command":${command},"purpose":"${server.id} language server"}}, review it, then runners trust with its hash. ${located ? '' : `No ${server.binaries.join(' or ')} executable was found. `}A language server can run project code.`;
}



const toUri = path => pathToFileURL(path).href;
function location(root, value) {
  const uri = value.targetUri || value.uri, range = value.targetSelectionRange || value.range;
  if (typeof uri !== 'string' || !range?.start) return null;
  let path = uri;
  try { path = fileURLToPath(uri); } catch { /* keep the URI */ }
  const inside = isAbsolute(path) && !relative(root, path).startsWith('..') && !isAbsolute(relative(root, path));
  return { path: inside ? relative(root, path).replaceAll('\\', '/') : redact(path), external: !inside, line: range.start.line + 1, column: range.start.character + 1 };
}

function sourceFile(root, file) {
  const path = within(root, cleanText(file, 'file', 1000));
  if (privateName(basename(path))) throw Error('Private files are not sent to language servers.');
  const server = serverForFile(path);
  if (!server) throw Error(`No known language server handles ${extname(path) || 'this file type'}.`);
  return { path, rel: relative(root, path).replaceAll('\\', '/'), text: boundedText(root, path), server, language: server.extensions[extname(path).toLowerCase()] };
}

// Starts the trusted server once for the given files, opens them and runs query, always closing.
export async function withLanguageServer(root, files, query, { timeoutMs = 30000, ...options } = {}) {
  root = projectRoot(root);
  const sources = files.map(file => sourceFile(root, file)), server = sources[0].server;
  if (sources.some(s => s.server !== server)) throw Error('Query one language at a time.');
  const trusted = trustedCommand(root, runnerId(server), options);
  if (!trusted) return { status: 'unavailable', server: server.id, reason: trustAdvice(server, locateServer(root, server, options)) };
  const deadline = Date.now() + timeoutMs, remaining = () => Math.max(1, deadline - Date.now());
  const client = (options.openLanguageServer || openLanguageServer)(trusted.command, { cwd: root, requestTimeoutMs: Math.min(20000, timeoutMs) });
  try {
    const rootUri = toUri(root);
    const init = await client.request('initialize', { processId: process.pid, clientInfo: { name: 'just-vibe' }, rootUri, rootPath: root,
      workspaceFolders: [{ uri: rootUri, name: basename(root) }],
      capabilities: { textDocument: { synchronization: { dynamicRegistration: false }, definition: { linkSupport: true }, references: {}, publishDiagnostics: {}, diagnostic: { dynamicRegistration: false } },
        workspace: { configuration: true, workspaceFolders: true } } }, remaining());
    client.notify('initialized', {});
    for (const s of sources) client.notify('textDocument/didOpen', { textDocument: { uri: toUri(s.path), languageId: s.language, version: 1, text: s.text } });
    const result = await query({ client, sources, capabilities: init?.capabilities || {}, remaining, root });
    // A server that died mid-query may have published only its initial empty set.
    if (client.failure) throw client.failure;
    return { status: 'ok', server: server.id, runnerHash: trusted.hash, ...result, method: `language-server:${server.id}` };
  } catch (error) {
    return { status: 'failed', server: server.id, reason: redact(error.message).slice(0, 1000) };
  } finally { await client.close(); }
}

function position(payload) {
  object(payload, ['file', 'line', 'column', 'includeDeclaration', 'timeoutMs']);
  return { line: integer(payload.line, 'line', 1, 10_000_000) - 1, character: integer(payload.column ?? 1, 'column', 1, 100_000) - 1 };
}
const limitTime = payload => integer(payload.timeoutMs ?? 30000, 'timeoutMs', 1000, 120000);

export async function definition(root, payload, options = {}) {
  const at = position(payload);
  return withLanguageServer(root, [payload.file], async ({ client, sources, remaining, root: base }) => {
    const found = await client.request('textDocument/definition', { textDocument: { uri: toUri(sources[0].path) }, position: at }, remaining());
    return { locations: (Array.isArray(found) ? found : found ? [found] : []).map(l => location(base, l)).filter(Boolean).slice(0, 50) };
  }, { ...options, timeoutMs: limitTime(payload) });
}

export async function references(root, payload, options = {}) {
  const at = position(payload);
  return withLanguageServer(root, [payload.file], async ({ client, sources, remaining, root: base }) => {
    const found = await client.request('textDocument/references', { textDocument: { uri: toUri(sources[0].path) }, position: at, context: { includeDeclaration: payload.includeDeclaration !== false } }, remaining());
    const all = (found || []).map(l => location(base, l)).filter(Boolean);
    return { locations: all.slice(0, 200), truncated: all.length > 200 };
  }, { ...options, timeoutMs: limitTime(payload) });
}

// Pull diagnostics when the server offers them, otherwise wait for its published set.
export async function diagnostics(root, payload, options = {}) {
  object(payload, ['files', 'minimumSeverity', 'timeoutMs']);
  const files = boundedList(payload.files, 'files', 20);
  if (!files.length) throw Error('Name at least one file.');
  const floor = { error: 1, warning: 2, information: 3, hint: 4 }[payload.minimumSeverity ?? 'warning'];
  if (!floor) throw Error('minimumSeverity is error, warning, information or hint.');
  return withLanguageServer(root, files, async ({ client, sources, capabilities, remaining }) => {
    const items = [], incomplete = [];
    for (const s of sources) {
      const uri = toUri(s.path);
      let found = null;
      if (capabilities.diagnosticProvider) {
        const report = await client.request('textDocument/diagnostic', { textDocument: { uri } }, remaining());
        found = report?.kind === 'full' ? report.items : null;
      }
      found ??= await client.pushed(uri, { timeoutMs: remaining() });
      if (!found) { incomplete.push(s.rel); continue; }
      for (const d of found) if ((d.severity ?? 1) <= floor) items.push({ path: s.rel, line: (d.range?.start?.line ?? 0) + 1, column: (d.range?.start?.character ?? 0) + 1,
        severity: SEVERITY[d.severity ?? 1], message: redact(String(d.message || '')).slice(0, 500), ...(d.source ? { source: String(d.source).slice(0, 100) } : {}), ...(d.code !== undefined ? { code: String(d.code).slice(0, 100) } : {}) });
    }
    return { diagnostics: items.slice(0, 200), truncated: items.length > 200, incomplete, errors: items.filter(d => d.severity === 'error').length };
  }, { ...options, timeoutMs: limitTime(payload) });
}
