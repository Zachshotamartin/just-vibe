import { StringDecoder } from 'node:string_decoder';

const MESSAGE_LIMIT = 1024 * 1024;
export const MAX_IN_FLIGHT = 4;
export const CLIENT_REQUEST_TIMEOUT_MS = 10 * 60 * 1000;

const isResponse = message => !!message && typeof message === 'object' && !Array.isArray(message) &&
  !Object.hasOwn(message, 'method') && Object.hasOwn(message, 'id') &&
  (Object.hasOwn(message, 'result') || Object.hasOwn(message, 'error'));
const isNotification = message => !!message && typeof message === 'object' && !Array.isArray(message) && !Object.hasOwn(message, 'id');

// Newline-delimited JSON-RPC over stdio. Up to maxInFlight requests run at once,
// so a tool waiting on the client (elicitation) does not block the client's answer.
// Messages start in arrival order; responses may finish out of order.
export async function serveMcp(input, output, handler, { maxInFlight = MAX_IN_FLIGHT, clientTimeoutMs = CLIENT_REQUEST_TIMEOUT_MS } = {}) {
  let buffer = '', nextId = 0, active = 0, ended = false, closed = false;
  const decoder = new StringDecoder('utf8'), pending = new Map(), waiting = [], running = new Set();
  const send = value => { if (value && !closed) output.write(JSON.stringify(value) + '\n'); };
  const peer = {
    request(method, params, { timeoutMs = clientTimeoutMs } = {}) {
      if (ended) return Promise.reject(Object.assign(Error('The MCP client disconnected.'), { code: 'MCP_CLOSED' }));
      const id = `just-vibe-${++nextId}`;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(Object.assign(Error(`The MCP client did not answer ${method} in time.`), { code: 'MCP_TIMEOUT' }));
        }, timeoutMs);
        pending.set(id, { resolve, reject, timer });
        send({ jsonrpc: '2.0', id, method, ...(params === undefined ? {} : { params }) });
      });
    },
  };
  function route(message) {
    const entry = pending.get(message.id);
    // A late or unknown response has nobody waiting for it.
    if (!entry) return;
    pending.delete(message.id);
    clearTimeout(entry.timer);
    if (message.error) entry.reject(Object.assign(Error(String(message.error.message || 'MCP client error')), { code: message.error.code }));
    else entry.resolve(message.result);
  }
  // A handler that throws synchronously still yields a rejected promise.
  const invoke = message => new Promise(resolve => resolve(handler(message, peer)));
  function start(message) {
    active++;
    // Calling the handler synchronously keeps its state changes (initialize,
    // notifications/initialized) in arrival order even though requests overlap.
    const task = invoke(message)
      .then(send, () => send({ jsonrpc: '2.0', id: message?.id ?? null, error: { code: -32603, message: 'Internal error' } }))
      .finally(() => { active--; running.delete(task); drain(); });
    running.add(task);
  }
  function drain() {
    while (waiting.length) {
      if (isNotification(waiting[0])) {
        const message = waiting.shift();
        invoke(message).then(send, () => {});
      } else if (active < maxInFlight) start(waiting.shift());
      else break;
    }
  }
  function receive(line) {
    let message;
    try { message = JSON.parse(line); }
    catch { return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
    if (isResponse(message)) return route(message);
    waiting.push(message);
    drain();
  }
  try {
    for await (const chunk of input) {
      buffer += typeof chunk === 'string' ? chunk : decoder.write(chunk);
      let newline;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (Buffer.byteLength(line) > MESSAGE_LIMIT) throw Error('MCP message exceeds 1 MiB.');
        if (line.trim()) receive(line);
      }
      if (Buffer.byteLength(buffer) > MESSAGE_LIMIT) throw Error('MCP message exceeds 1 MiB.');
    }
    buffer += decoder.end();
    if (buffer.trim()) send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Unterminated message' } });
  } finally {
    ended = true;
    // Input ended: nothing can answer outstanding client requests, so fail them
    // and let every accepted request finish before returning.
    for (const [id, entry] of pending) {
      clearTimeout(entry.timer);
      entry.reject(Object.assign(Error('The MCP client disconnected.'), { code: 'MCP_CLOSED' }));
      pending.delete(id);
    }
    while (running.size || waiting.length) {
      drain();
      await Promise.allSettled([...running]);
    }
    closed = true;
  }
}
