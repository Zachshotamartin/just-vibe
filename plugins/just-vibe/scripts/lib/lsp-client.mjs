import { spawn } from 'node:child_process';
import { commandInvocation } from './command.mjs';
import { terminateOwnedGroup, redact } from './process.mjs';

// A minimal Language Server Protocol client over stdio: Content-Length framing, request/response
// correlation, default replies to server requests and push diagnostics. One client serves one
// bounded session; callers always close it, which shuts the server down and then ends its group.
export const MAX_MESSAGE_BYTES = 8 * 1024 * 1024;
const HEADER_LIMIT = 4096;

export function frame(message) {
  const body = Buffer.from(JSON.stringify(message), 'utf8');
  return Buffer.concat([Buffer.from(`Content-Length: ${body.length}\r\n\r\n`, 'ascii'), body]);
}

// Splits a byte stream into JSON messages. Chunks may end anywhere, including inside a multi-byte
// character, so bodies are measured and decoded as bytes.
export function messageReader(onMessage, { maxBytes = MAX_MESSAGE_BYTES } = {}) {
  let buffer = Buffer.alloc(0);
  return chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    for (;;) {
      const end = buffer.indexOf('\r\n\r\n');
      if (end < 0) {
        if (buffer.length > HEADER_LIMIT) throw Error('Language server sent an oversized or malformed header.');
        return;
      }
      const length = Number(/(?:^|\r\n)content-length:\s*(\d+)/i.exec(buffer.subarray(0, end).toString('ascii'))?.[1]);
      if (!Number.isSafeInteger(length)) throw Error('Language server message lacks Content-Length.');
      if (length > maxBytes) throw Error(`Language server message exceeds ${maxBytes} bytes.`);
      if (buffer.length < end + 4 + length) return;
      const body = buffer.subarray(end + 4, end + 4 + length).toString('utf8');
      buffer = buffer.subarray(end + 4 + length);
      let message;
      try { message = JSON.parse(body); } catch { throw Error('Language server sent invalid JSON.'); }
      onMessage(message);
    }
  };
}

// Requests a server may send during a session; every one gets a neutral answer so none blocks.
function defaultReply(message) {
  if (message.method === 'workspace/configuration') return (message.params?.items || []).map(() => null);
  if (message.method === 'workspace/workspaceFolders') return null;
  return null;
}

export function openLanguageServer(command, { cwd, env = process.env, requestTimeoutMs = 15000, maxBytes = MAX_MESSAGE_BYTES } = {}) {
  const [binary, args] = commandInvocation(command[0], command.slice(1));
  const child = spawn(binary, args, { cwd, env, shell: false, detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'] });
  const pending = new Map(), diagnostics = new Map(), waiters = new Set();
  let nextId = 1, failure = null, stderr = '';
  const fail = error => {
    if (failure) return;
    failure = error;
    for (const { reject, timer } of pending.values()) { clearTimeout(timer); reject(error); }
    pending.clear();
    for (const wake of waiters) wake();
  };
  const send = message => { if (!failure && child.stdin.writable) child.stdin.write(frame(message)); };
  const read = messageReader(message => {
    if (message.id !== undefined && message.method === undefined) {
      const entry = pending.get(message.id);
      if (!entry) return;
      pending.delete(message.id); clearTimeout(entry.timer);
      if (message.error) entry.reject(Error(`${entry.method}: ${redact(String(message.error.message || 'language server error')).slice(0, 500)}`));
      else entry.resolve(message.result ?? null);
    } else if (message.id !== undefined) send({ jsonrpc: '2.0', id: message.id, result: defaultReply(message) });
    else if (message.method === 'textDocument/publishDiagnostics' && typeof message.params?.uri === 'string') {
      diagnostics.set(message.params.uri, Array.isArray(message.params.diagnostics) ? message.params.diagnostics : []);
      for (const wake of waiters) wake();
    }
  }, { maxBytes });
  child.stdout.on('data', chunk => { try { read(chunk); } catch (error) { fail(error); stop(); } });
  child.stderr.on('data', chunk => { if (stderr.length < 4000) stderr += chunk.toString('utf8'); });
  child.stdin.on('error', () => {});
  child.on('error', error => fail(Error(`Language server failed to start: ${redact(error.message)}`)));
  const exited = new Promise(resolve => child.once('close', () => { fail(Error(`Language server exited${stderr ? `: ${redact(stderr.trim()).slice(-500)}` : ''}.`)); resolve(); }));
  let stopping;
  const stop = () => (stopping ||= terminateOwnedGroup(child));

  const request = (method, params, timeoutMs = requestTimeoutMs) => {
    if (failure) return Promise.reject(failure);
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(Error(`${method} timed out after ${timeoutMs} ms.`)); }, timeoutMs);
      pending.set(id, { resolve, reject, timer, method });
      send({ jsonrpc: '2.0', id, method, params });
    });
  };
  const notify = (method, params) => send({ jsonrpc: '2.0', method, params });
  // Waits for a published diagnostic set for uri, then for the server to go quiet, since servers
  // often publish an empty set before the analysed one.
  const pushed = (uri, { timeoutMs = requestTimeoutMs, quietMs = 400 } = {}) => new Promise(resolve => {
    const deadline = Date.now() + timeoutMs;
    let quiet;
    const finish = () => { waiters.delete(wake); clearTimeout(quiet); clearTimeout(limit); resolve(diagnostics.has(uri) ? diagnostics.get(uri) : null); };
    const wake = () => {
      if (failure) return finish();
      if (!diagnostics.has(uri)) return;
      clearTimeout(quiet);
      quiet = setTimeout(finish, Math.max(0, Math.min(quietMs, deadline - Date.now())));
    };
    const limit = setTimeout(finish, timeoutMs);
    waiters.add(wake);
    wake();
  });
  const close = async () => {
    if (!failure) {
      try { await request('shutdown', null, 2000); notify('exit', null); } catch { /* terminate below */ }
      await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 1000))]);
    }
    await stop();
    await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 1000))]);
  };
  return { request, notify, pushed, close, diagnostics, get failure() { return failure; } };
}
