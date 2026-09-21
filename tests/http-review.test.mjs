import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { planCanvas } from '../plugins/just-vibe/scripts/lib/plan-canvas.mjs';
import { startCanvasServer } from '../plugins/just-vibe/scripts/lib/canvas-http.mjs';
import { startOperatorServer } from '../plugins/just-vibe/scripts/lib/operator-http.mjs';
import { operator } from '../plugins/just-vibe/scripts/lib/operator.mjs';

function postChunks(origin, path, headers, bytes, split) {
  return new Promise((resolve, reject) => {
    const req = request(
      origin + path,
      {
        method: 'POST',
        headers: { origin, 'content-type': 'application/json', ...headers },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            body: JSON.parse(Buffer.concat(chunks).toString('utf8')),
          }),
        );
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    req.write(bytes.subarray(0, split));
    const timer = setTimeout(() => req.end(bytes.subarray(split)), 30);
    req.on('close', () => clearTimeout(timer));
  });
}

test('canvas and operator JSON preserve Unicode across network chunks and enforce byte limits', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jv-http-review-'));
  const options = { home: join(root, 'home') };
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, 'plan.md'), 'Review this plan.');
  const canvas = await planCanvas(
    root,
    'create',
    { id: 'review', revision: 0, title: 'Review', path: 'plan.md' },
    options,
  );
  const server = await startCanvasServer(root, 'review', options);
  const board = await startOperatorServer(root, options);
  t.after(async () => {
    await server.close();
    await board.close();
  });
  const owner = 'café 漢字';
  const claim = await operator(
    root,
    'claim',
    { id: 'review', revision: 0, owner, paths: ['plan.md'] },
    options,
  );
  for (const [origin, path, headers, payload, limit] of [
    [
      server.origin,
      '/api/feedback',
      { 'x-canvas-token': server.token },
      {
        revision: canvas.revision,
        artifactHash: canvas.artifact.hash,
        kind: 'comment',
        text: owner,
      },
      16000,
    ],
    [
      board.origin,
      '/api/action',
      { 'x-operator-token': new URL(board.url).hash.slice(1) },
      { operation: 'release', payload: { revision: claim.revision, id: 'review', owner } },
      12000,
    ],
  ]) {
    const bytes = Buffer.from(JSON.stringify(payload));
    const response = await postChunks(
      origin,
      path,
      headers,
      bytes,
      bytes.indexOf(Buffer.from('é')) + 1,
    );
    assert.equal(response.status, 200, JSON.stringify(response.body));
    if (path === '/api/feedback') assert.equal(response.body.feedback.at(-1).text, owner);
    else assert.deepEqual(response.body.claims, []);
    // Whitespace is valid JSON padding, but its bytes still count toward the bound.
    const oversized = Buffer.from(' '.repeat(limit) + JSON.stringify(payload));
    const rejected = await postChunks(origin, path, headers, oversized, 10);
    assert.notEqual(rejected.status, 200);
    assert.match(rejected.body.error, /too large/);
  }
});
