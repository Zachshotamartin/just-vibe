import { createServer, request } from 'node:http';
import { connect } from 'node:net';
import { randomBytes } from 'node:crypto';

// Enforce destinations at the browser's transport boundary. Playwright route
// callbacks alone do not intercept every hop of a browser-followed redirect.
export async function startQaNetworkGuard(origins) {
  const allowed = new Set(origins), blocked = [], sockets = new Set();
  let blockedCount = 0;
  const username = 'just-vibe', password = randomBytes(32).toString('hex');
  const credential = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  const note = (origin, reason) => { blockedCount++; if (blocked.length < 200) blocked.push({ origin, reason }); };
  const authorized = req => req.headers['proxy-authorization'] === credential;
  const server = createServer((req, res) => {
    if (!authorized(req)) { res.writeHead(407, { 'proxy-authenticate': 'Basic realm="just-vibe"' }); res.end(); return; }
    let url;
    try { url = new URL(req.url); } catch { res.writeHead(400); res.end(); return; }
    if (url.protocol !== 'http:' || url.username || url.password || !allowed.has(url.origin)) {
      note(url.origin, 'Origin is not authorized'); res.writeHead(403); res.end('QA origin not authorized'); return;
    }
    const headers = { ...req.headers, host: url.host };
    delete headers['proxy-authorization']; delete headers['proxy-connection'];
    const upstream = request(url, { method: req.method, headers, timeout: 15000 }, response => {
      response.on('error', () => res.destroy());
      res.writeHead(response.statusCode, response.headers); response.pipe(res);
    });
    upstream.on('timeout', () => upstream.destroy(Error('Upstream timeout')));
    upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    req.on('aborted', () => upstream.destroy()); res.on('close', () => upstream.destroy()); req.pipe(upstream);
  });
  server.on('connect', (req, socket, head) => {
    if (!authorized(req)) { socket.end('HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="just-vibe"\r\n\r\n'); return; }
    let url;
    try { url = new URL('https://' + req.url); } catch { socket.destroy(); return; }
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash || !allowed.has(url.origin)) {
      note(url.origin, 'Origin is not authorized'); socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return;
    }
    const upstream = connect({ host: url.hostname.replace(/^\[|\]$/g, ''), port: Number(url.port || 443) });
    sockets.add(upstream); upstream.once('close', () => sockets.delete(upstream));
    upstream.setTimeout(15000, () => { socket.destroy(); upstream.destroy(); });
    upstream.once('connect', () => { socket.write('HTTP/1.1 200 Connection Established\r\n\r\n'); if (head.length) upstream.write(head); socket.pipe(upstream); upstream.pipe(socket); });
    upstream.on('error', () => socket.destroy()); socket.on('error', () => upstream.destroy()); socket.on('close', () => upstream.destroy());
  });
  server.on('upgrade', (_req, socket) => { note('websocket', 'WebSockets are not supported'); socket.destroy(); });
  server.on('connection', socket => { sockets.add(socket); socket.once('close', () => sockets.delete(socket)); });
  await new Promise((done, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', done); });
  return {
    proxy: { server: `http://127.0.0.1:${server.address().port}`, username, password }, blocked,
    get blockedCount() { return blockedCount; },
    close: async () => { for (const socket of sockets) socket.destroy(); await new Promise(done => server.close(done)); },
  };
}
