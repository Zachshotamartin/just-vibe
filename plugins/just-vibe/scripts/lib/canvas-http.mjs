import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { runtimeStore } from './runtime-store.mjs';
import { inspectCanvas, submitCanvasFeedback } from './plan-canvas.mjs';
import { renderCanvas } from './canvas-ui.mjs';

export async function startCanvasServer(
  root,
  id,
  { home, token = randomBytes(32).toString('hex') } = {},
) {
  const store = runtimeStore(root, { home });
  inspectCanvas(store, id);
  let origin;
  const equal = (value) =>
    typeof value === 'string' &&
    Buffer.byteLength(value) === Buffer.byteLength(token) &&
    timingSafeEqual(Buffer.from(value), Buffer.from(token));
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      if (
        req.headers.host !== new URL(origin).host ||
        (req.headers.origin && req.headers.origin !== origin)
      ) {
        res.writeHead(403);
        res.end('Origin refused');
        return;
      }
      const url = new URL(req.url, origin);
      if (req.method === 'GET' && url.pathname === '/') {
        const nonce = randomBytes(16).toString('hex');
        res.setHeader(
          'Content-Security-Policy',
          `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src 'self'; frame-src 'self'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
        );
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(renderCanvas(nonce));
        return;
      }
      if (!equal(req.headers['x-canvas-token'])) {
        res.writeHead(403);
        res.end('Review token required');
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      if (req.method === 'GET' && url.pathname === '/api/review') {
        res.end(JSON.stringify(inspectCanvas(store, id)));
        return;
      }
      if (req.method === 'POST' && url.pathname === '/api/feedback') {
        if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json')
          throw Error('Same-origin JSON feedback required.');
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 16000) throw Error('Feedback too large.');
        }
        res.end(JSON.stringify(submitCanvasFeedback(store, id, JSON.parse(body))));
        return;
      }
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
      if (!res.headersSent) res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  await new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', ok);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
  return {
    server,
    token,
    origin,
    url: `${origin}/#${token}`,
    close: () =>
      new Promise((ok) => {
        server.close(ok);
        server.closeIdleConnections();
      }),
  };
}
