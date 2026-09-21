import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { codeAtlas } from '../plugins/just-vibe/scripts/lib/code-atlas.mjs';
import { contextGraph } from '../plugins/just-vibe/scripts/lib/context-graph.mjs';
import { usageLedger } from '../plugins/just-vibe/scripts/lib/usage-ledger.mjs';
import { boundedJobs } from '../plugins/just-vibe/scripts/lib/bounded-jobs.mjs';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { canary } from '../plugins/just-vibe/scripts/lib/canary.mjs';
import { evaluation } from '../plugins/just-vibe/scripts/lib/evaluation-capsule.mjs';
import { operator } from '../plugins/just-vibe/scripts/lib/operator.mjs';
import { startOperatorServer } from '../plugins/just-vibe/scripts/lib/operator-http.mjs';
import { services } from '../plugins/just-vibe/scripts/lib/dev-services.mjs';
import { dependencyIoc } from '../plugins/just-vibe/scripts/lib/dependency-ioc.mjs';
import { gitHooks } from '../plugins/just-vibe/scripts/lib/git-hooks.mjs';
import { workbenchCall } from '../plugins/just-vibe/scripts/lib/workbench-access.mjs';
function fixture(t, git = false) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'jv-extended-'))),
    root = join(dir, 'project'),
    options = { home: join(dir, 'home') };
  mkdirSync(root);
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const run = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  if (git) {
    run('init', '-q');
    run('config', 'user.name', 'Fixture');
    run('config', 'user.email', 'fixture@example.test');
    writeFileSync(join(root, 'app.mjs'), 'export const initial = true;');
    run('add', '.');
    run('commit', '-qm', 'Initial');
  }
  return { root, options, git: run };
}
async function trust(f, id, source = 'console.log("ok")') {
  writeFileSync(join(f.root, id + '.mjs'), source);
  const status = await runners(f.root, 'list', {}, f.options);
  let r = await runners(
    f.root,
    'configure',
    {
      id,
      revision: status.revision,
      config: { command: [process.execPath, id + '.mjs'], purpose: 'Isolated test fixture' },
    },
    f.options,
  );
  const hash = r.runners.find((r) => r.id === id).hash;
  await runners(f.root, 'trust', { id, hash, revision: r.revision }, f.options);
  return hash;
}
test('CodeTour validates source anchors and refuses hand-edited exports', (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, 'app.js'), 'export function start() {}\n');
  let r = codeAtlas(
    f.root,
    'create',
    {
      id: 'intro',
      revision: 0,
      title: 'Entry points',
      description: 'Follow startup',
      steps: [{ file: 'app.js', line: 1, description: 'The exported startup function.' }],
    },
    f.options,
  );
  assert.equal(codeAtlas(f.root, 'map', {}, f.options).files[0].symbols[0].name, 'start');
  codeAtlas(f.root, 'export', { id: r.id, revision: r.revision, path: 'intro.tour' }, f.options);
  writeFileSync(join(f.root, 'intro.tour'), 'user edit');
  assert.throws(
    () =>
      codeAtlas(
        f.root,
        'export',
        { id: r.id, revision: r.revision, path: 'intro.tour' },
        f.options,
      ),
    /Destination changed/,
  );
  writeFileSync(join(f.root, 'app.js'), '// changed\nexport function start(){}');
  assert.equal(codeAtlas(f.root, 'validate', { id: r.id }, f.options).stale, true);
});
test('graph imports are atomic, duplicate-aware, private-safe and preserve manual nodes', (t) => {
  const f = fixture(t);
  writeFileSync(
    join(f.root, 'memory.jsonl'),
    JSON.stringify({ id: 'startup', label: 'Startup', text: 'Read app.js to follow startup.' }),
  );
  let g = contextGraph(
    f.root,
    'import',
    { revision: 0, path: 'memory.jsonl', format: 'jsonl' },
    f.options,
  );
  assert.equal(
    contextGraph(
      f.root,
      'import',
      { revision: g.revision, path: 'memory.jsonl', format: 'jsonl' },
      f.options,
    ).duplicate,
    true,
  );
  assert.equal(contextGraph(f.root, 'recall', { query: 'startup' }, f.options).nodes.length, 1);
  assert.throws(
    () =>
      contextGraph(
        f.root,
        'import',
        { revision: g.revision, path: '.env', format: 'jsonl' },
        f.options,
      ),
    /credential/,
  );
  g = contextGraph(
    f.root,
    'save',
    { revision: g.revision, id: 'manual', label: 'Manually owned', observations: [] },
    f.options,
  );
  writeFileSync(
    join(f.root, 'memory.jsonl'),
    JSON.stringify({ id: 'manual', label: 'collision', text: 'overwrite' }),
  );
  assert.throws(
    () =>
      contextGraph(
        f.root,
        'import',
        { revision: g.revision, path: 'memory.jsonl', format: 'jsonl' },
        f.options,
      ),
    /collides/,
  );
});
test('usage snapshots deduplicate cumulative reports and keep unknown prices unknown', (t) => {
  const f = fixture(t),
    at = new Date().toISOString();
  let u = usageLedger(
    f.root,
    'observe',
    { revision: 0, session: 's1', model: 'fixture', at, input: 100, output: 20 },
    f.options,
  );
  assert.equal(
    usageLedger(
      f.root,
      'observe',
      { revision: u.revision, session: 's1', model: 'fixture', at, input: 100, output: 20 },
      f.options,
    ).duplicate,
    true,
  );
  assert.equal(usageLedger(f.root, 'report', {}, f.options).unpriced, 1);
  assert.throws(
    () =>
      usageLedger(
        f.root,
        'observe',
        { revision: u.revision, session: 's1', model: 'fixture', at, input: 99, output: 20 },
        f.options,
      ),
    /monotonic/,
  );
});
test('bounded jobs require separate authority, stop after verified success and refuse replay', async (t) => {
  const f = fixture(t),
    hash = await trust(f, 'work'),
    verify = await trust(f, 'verify');
  let j = await boundedJobs(
    f.root,
    'create',
    {
      id: 'repair',
      revision: 0,
      kind: 'loop',
      objective: 'Exercise bounded execution',
      runner: 'work',
      runnerHash: hash,
      verifier: 'verify',
      verifierHash: verify,
      deadline: new Date(Date.now() + 60000).toISOString(),
    },
    f.options,
  );
  await assert.rejects(
    boundedJobs(f.root, 'tick', { id: j.id, revision: j.revision }, f.options),
    /disabled/,
  );
  j = await boundedJobs(
    f.root,
    'enable',
    {
      id: j.id,
      revision: j.revision,
      enabled: true,
      reason: 'Run this local fixture until its verifier succeeds.',
    },
    f.options,
  );
  j = await boundedJobs(f.root, 'tick', { id: j.id, revision: j.revision }, f.options);
  assert.equal(j.status, 'succeeded');
  assert.equal(j.runs.length, 1);
  await assert.rejects(
    boundedJobs(f.root, 'tick', { id: j.id, revision: j.revision }, f.options),
    /terminal/,
  );
});
test('canary distinguishes status, content and SSE heartbeat without returning bodies', async (t) => {
  const f = fixture(t);
  let c = await canary(
    f.root,
    'configure',
    {
      id: 'deploy',
      revision: 0,
      targets: [
        { id: 'html', url: 'https://example.test/', contentType: 'text/html', contains: 'ready' },
        {
          id: 'events',
          url: 'https://example.test/events',
          contentType: 'text/event-stream',
          sse: true,
        },
      ],
    },
    f.options,
  );
  const options = {
    ...f.options,
    fetch: async (url) =>
      new Response(url.endsWith('events') ? 'data: ready\n\n' : '<h1>ready</h1>', {
        headers: { 'content-type': url.endsWith('events') ? 'text/event-stream' : 'text/html' },
      }),
  };
  c = await canary(f.root, 'sample', { id: c.id, revision: c.revision }, options);
  assert.equal(
    c.samples[0].results.every((r) => r.passed),
    true,
  );
  assert.doesNotMatch(JSON.stringify(c.samples), /<h1>/);
  c = await canary(
    f.root,
    'sample',
    { id: c.id, revision: c.revision },
    { ...options, fetch: async () => new Response('not ready', { status: 503 }) },
  );
  assert.equal(c.samples.at(-1).changed, true);
  assert.equal(c.samples.at(-1).results[0].passed, false);
});
test('evaluation binds artifacts, detects tampering and reports trusted check limits', async (t) => {
  const f = fixture(t, true),
    hash = await trust(f, 'check');
  f.git('add', '.');
  f.git('commit', '-qm', 'Fixture checker');
  let e = await evaluation(
    f.root,
    'create',
    {
      id: 'suite',
      revision: 0,
      objective: 'Verify fixture behavior',
      cases: [
        { id: 'unit', runner: 'check', hash, criterion: 'Fixture reports successful completion' },
      ],
      artifacts: ['app.mjs'],
    },
    f.options,
  );
  e = await evaluation(f.root, 'run', { id: e.id, revision: e.revision }, f.options);
  assert.equal(e.status, 'checks-passed');
  const receipt = await evaluation(f.root, 'export', { id: e.id }, f.options);
  assert.equal((await evaluation(f.root, 'verify-receipt', { receipt }, f.options)).intact, true);
  receipt.capsule.objective = 'tampered';
  assert.equal((await evaluation(f.root, 'verify-receipt', { receipt }, f.options)).intact, false);
  writeFileSync(join(f.root, 'app.mjs'), 'changed');
  assert.equal((await evaluation(f.root, 'show', { id: e.id }, f.options)).stale, true);
});
test('operator detects overlapping ownership and local HTTP rejects foreign origins and unauthenticated access', async (t) => {
  const f = fixture(t);
  let o = await operator(
    f.root,
    'claim',
    { id: 'one', revision: 0, owner: 'alice', paths: ['src'] },
    f.options,
  );
  o = await operator(
    f.root,
    'claim',
    { id: 'two', revision: o.revision, owner: 'bob', paths: ['src/app.js'] },
    f.options,
  );
  assert.equal((await operator(f.root, 'status', {}, f.options)).conflicts.length, 1);
  const app = await startOperatorServer(f.root, f.options);
  t.after(() => app.close());
  assert.equal((await fetch(app.origin + '/api/status')).status, 403);
  const token = new URL(app.url).hash.slice(1);
  assert.equal(
    (
      await fetch(app.origin + '/api/status', {
        headers: { 'x-operator-token': token, origin: 'https://foreign.test' },
      })
    ).status,
    403,
  );
  const catalog = await fetch(app.origin + '/api/catalog', {
    headers: { 'x-operator-token': token },
  });
  assert.equal((await catalog.json()).commands.length > 200, true);
});
test('owned service supervisor stops only its own bounded process and preserves logs', async (t) => {
  const f = fixture(t),
    hash = await trust(f, 'server', 'console.log("started"); setInterval(()=>{},100);');
  let s = await services(
    f.root,
    'configure',
    { id: 'dev', revision: 0, runner: 'server', hash, durationSeconds: 5 },
    f.options,
  );
  s = await services(f.root, 'start', { id: s.id, revision: s.revision }, f.options);
  let r;
  for (let i = 0; i < 50; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    r = await services(f.root, 'show', { id: s.id }, f.options);
    if (r.run.state === 'running') break;
  }
  assert.equal(r.run.state, 'running');
  await services(
    f.root,
    'stop',
    { id: s.id, revision: s.revision, reason: 'Test completed' },
    f.options,
  );
  for (let i = 0; i < 50; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    r = await services(f.root, 'show', { id: s.id }, f.options);
    if (r.run.state === 'stopped') break;
  }
  assert.equal(r.run.state, 'stopped');
  assert.match(r.run.output, /started/);
});
test('dependency indicators match exact versions, retain provenance and reject stale feeds', (t) => {
  const f = fixture(t);
  writeFileSync(
    join(f.root, 'package-lock.json'),
    JSON.stringify({ lockfileVersion: 3, packages: { 'node_modules/demo': { version: '1.2.3' } } }),
  );
  dependencyIoc(
    f.root,
    'import',
    {
      revision: 0,
      feed: {
        id: 'fixture',
        source: 'https://example.test/advisories',
        retrievedAt: new Date(Date.now() - 10000).toISOString(),
        expiresAt: new Date(Date.now() + 10000).toISOString(),
        advisories: [
          {
            id: 'TEST-1',
            ecosystem: 'npm',
            package: 'demo',
            versions: ['1.2.3'],
            reference: 'https://example.test/advisories/test-1',
            reason: 'Synthetic fixture only.',
          },
        ],
      },
    },
    f.options,
  );
  const r = dependencyIoc(f.root, 'scan', { paths: ['package-lock.json'] }, f.options);
  assert.equal(r.findings.length, 1);
  assert.equal(r.conclusion, 'indicators-found');
});
test('native Git hook preserves foreign hooks and blocks a staged credential outside agent tools', async (t) => {
  const f = fixture(t, true);
  let p = await gitHooks(f.root, 'preview', {}, f.options);
  await gitHooks(f.root, 'install', { revision: p.revision, hash: p.hash }, f.options);
  writeFileSync(join(f.root, 'secret.txt'), 'npm_' + 'A'.repeat(25));
  f.git('add', 'secret.txt');
  assert.throws(() => f.git('commit', '-qm', 'Blocked fixture'));
  p = await gitHooks(f.root, 'status', {}, f.options);
  await gitHooks(f.root, 'uninstall', { revision: p.revision, hash: p.hash }, f.options);
  writeFileSync(join(f.root, '.git/hooks/pre-commit'), '#!/bin/sh\necho foreign\n');
  p = await gitHooks(f.root, 'preview', {}, f.options);
  await assert.rejects(
    gitHooks(f.root, 'install', { revision: p.revision, hash: p.hash }, f.options),
    /foreign/,
  );
});
test('workbench read/manage cannot grant runner trust or authorize recurring execution', async (t) => {
  const f = fixture(t);
  await assert.rejects(
    workbenchCall(
      'manage',
      f.root,
      { family: 'runners', operation: 'trust', payload: {} },
      f.options,
    ),
    /unavailable/,
  );
  await assert.rejects(
    workbenchCall('read', f.root, { family: 'jobs', operation: 'enable', payload: {} }, f.options),
    /unavailable/,
  );
});
