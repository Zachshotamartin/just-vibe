import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  realpathSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { adapters, adapterFiles } from '../plugins/just-vibe/scripts/lib/editor-adapters.mjs';
import { connectors } from '../plugins/just-vibe/scripts/lib/connectors.mjs';
import { updater } from '../plugins/just-vibe/scripts/lib/updater.mjs';
import { loadMethods, findMethods } from '../plugins/just-vibe/scripts/lib/method-library.mjs';
import { routeRequest } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { adaptiveStore } from '../plugins/just-vibe/scripts/lib/adaptive-store.mjs';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
import { portfolio } from '../plugins/just-vibe/scripts/lib/skill-portfolio.mjs';
import { mcpHealth } from '../plugins/just-vibe/scripts/lib/mcp-health.mjs';
import { behaviorRules } from '../plugins/just-vibe/scripts/lib/behavior-rules.mjs';
import { kiroEvent } from '../plugins/just-vibe/scripts/kiro-hooks.mjs';
import { contextGraph } from '../plugins/just-vibe/scripts/lib/context-graph.mjs';
import { council } from '../plugins/just-vibe/scripts/lib/council.mjs';
import { operator } from '../plugins/just-vibe/scripts/lib/operator.mjs';
import { telemetry } from '../plugins/just-vibe/scripts/lib/telemetry.mjs';
import { startOperatorServer } from '../plugins/just-vibe/scripts/lib/operator-http.mjs';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { boundedJobs } from '../plugins/just-vibe/scripts/lib/bounded-jobs.mjs';
import { gitHooks } from '../plugins/just-vibe/scripts/lib/git-hooks.mjs';
function fixture(t, git = false) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'jv-contract-'))),
    root = join(dir, 'project');
  mkdirSync(root);
  const options = { home: join(dir, 'home') };
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const command = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  if (git) {
    command('init', '-q');
    command('config', 'user.name', 'Fixture');
    command('config', 'user.email', 'fixture@example.test');
    writeFileSync(join(root, 'app.txt'), 'initial');
    command('add', '.');
    command('commit', '-qm', 'Initial');
  }
  return { root, options, command };
}
async function trusted(f) {
  let s = await runners(
    f.root,
    'configure',
    {
      id: 'check',
      revision: 0,
      config: {
        command: [process.execPath, '-e', 'console.log("fixture")'],
        purpose: 'Read-only fixture',
      },
    },
    f.options,
  );
  s = await runners(
    f.root,
    'trust',
    { id: 'check', revision: s.revision, hash: s.runners[0].hash },
    f.options,
  );
  return s.runners[0];
}
test('seven additional host adapters preserve foreign files and reject changed owned files', (t) => {
  for (const target of ['adal', 'codebuddy', 'joycode', 'kiro', 'openclaw', 'pi', 'trae']) {
    const f = fixture(t),
      data = adapterFiles(f.root, target, { profile: 'core' }, { hooks: target === 'kiro' });
    writeFileSync(join(f.root, 'foreign.txt'), 'preserved');
    const payload = { target, profile: 'core', hooks: target === 'kiro' };
    const preview = adapters(f.root, 'install', { ...payload, dryRun: true });
    assert.match(preview.planHash, /^[a-f0-9]{64}$/);
    adapters(f.root, 'install', payload);
    assert.equal(adapters(f.root, 'doctor', payload).conflicts.length, 0);
    const path = join(f.root, data.adapter.skills, 'just-vibe-goal/SKILL.md'),
      original = readFileSync(path, 'utf8');
    writeFileSync(path, 'user change');
    assert.throws(() => adapters(f.root, 'update', payload), /edited|belong/);
    writeFileSync(path, original);
    adapters(f.root, 'update', payload);
    adapters(f.root, 'uninstall', payload);
    assert.equal(existsSync(path), false);
    assert.equal(readFileSync(join(f.root, 'foreign.txt'), 'utf8'), 'preserved');
  }
});
test('connector ownership merges, detects edits and removes custom endpoints without redisclosure', (t) => {
  const f = fixture(t);
  writeFileSync(
    join(f.root, '.mcp.json'),
    JSON.stringify({ mcpServers: { foreign: { command: 'existing' } } }),
  );
  const p = { id: 'sentry', target: 'claude', url: 'https://fixture.example/mcp' };
  connectors(f.root, 'install', p);
  let data = JSON.parse(readFileSync(join(f.root, '.mcp.json')));
  assert.equal(data.mcpServers.foreign.command, 'existing');
  data.mcpServers['just-vibe-sentry'].url = 'https://changed.example/mcp';
  writeFileSync(join(f.root, '.mcp.json'), JSON.stringify(data));
  assert.throws(() => connectors(f.root, 'uninstall', { id: p.id, target: p.target }), /changed/);
  data.mcpServers['just-vibe-sentry'].url = p.url;
  writeFileSync(join(f.root, '.mcp.json'), JSON.stringify(data));
  connectors(f.root, 'uninstall', { id: p.id, target: p.target });
  assert.deepEqual(JSON.parse(readFileSync(join(f.root, '.mcp.json'))).mcpServers, {
    foreign: { command: 'existing' },
  });
  assert.throws(
    () => connectors(f.root, 'preview', { ...p, url: 'https://example.test/?token=secret' }),
    /credential/,
  );
});
test('updates pin integrity and selections, preserve edits, and offer reviewed rollback', async (t) => {
  const f = fixture(t);
  adapters(f.root, 'install', { target: 'pi', profile: 'core' });
  const archive = Buffer.from('inert package fixture'),
    integrity = 'sha512-' + createHash('sha512').update(archive).digest('base64');
  let invocations = 0,
    bad = false;
  const opts = {
    ...f.options,
    fetch: async (url) =>
      String(url).includes('/-/')
        ? new Response(bad ? 'tampered' : archive)
        : Response.json({
            name: 'just-vibe',
            version: String(url).split('/').at(-1),
            engines: { node: '>=22' },
            dist: {
              integrity,
              tarball: 'https://registry.npmjs.org/just-vibe/-/just-vibe-0.9.1.tgz',
            },
          }),
    runCommand: async (argv) => {
      invocations++;
      assert.ok(argv.includes('--ignore-scripts'));
      assert.ok(argv.includes('core'));
      return { status: 0 };
    },
  };
  let plan = await updater(
    f.root,
    'preview',
    { id: 'one', revision: 0, version: '0.9.1', targets: ['pi'] },
    opts,
  );
  bad = true;
  await assert.rejects(
    updater(f.root, 'apply', { id: 'one', revision: plan.revision, hash: plan.hash }, opts),
    /integrity mismatch/,
  );
  assert.equal(invocations, 0);
  bad = false;
  const path = join(f.root, '.pi/skills/just-vibe-goal/SKILL.md'),
    old = readFileSync(path);
  writeFileSync(path, 'edit');
  await assert.rejects(
    updater(f.root, 'apply', { id: 'one', revision: plan.revision, hash: plan.hash }, opts),
    /edited/,
  );
  assert.equal(invocations, 0);
  writeFileSync(path, old);
  plan = await updater(
    f.root,
    'apply',
    { id: 'one', revision: plan.revision, hash: plan.hash },
    opts,
  );
  assert.equal(plan.status, 'completed');
  assert.equal(invocations, 1);
  const rollback = await updater(
    f.root,
    'rollback-preview',
    { id: 'one', revision: plan.revision, hash: plan.hash, newId: 'rollback' },
    opts,
  );
  assert.equal(rollback.release.version, JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version);
  assert.equal(rollback.status, 'preview');
  await assert.rejects(
    updater(f.root, 'apply', { id: 'one', revision: plan.revision, hash: plan.hash }, opts),
    /fresh preview/,
  );
});
test('focused methods are complete, canonically generated and discoverable outside coding defaults', (t) => {
  const f = fixture(t),
    methods = loadMethods();
  assert.equal(new Set(methods.map((m) => m.id)).size, 43);
  for (const m of methods) {
    for (const field of ['inspect', 'procedure', 'failureCases', 'verification'])
      assert.ok(m[field].length >= 3, `${m.id}/${field}`);
    assert.ok(m.references.every((r) => new URL(r.url).protocol === 'https:'));
    assert.ok(m.example.length > 60);
  }
  assert.equal(findMethods('debug pytorch autograd on CPU')[0].id, 'pytorch-debug');
  assert.ok(
    findMethods('audit carrier billing invoice discrepancies').some(
      (m) => m.id === 'business-operations',
    ),
  );
  assert.equal(
    routeRequest(
      adaptiveStore(f.root, f.options),
      loadCatalog(),
      'reconcile carrier billing line items',
    ).kind,
    'task',
  );
});
test('Kiro tool events enforce declared rules and do not block Stop', async (t) => {
  const f = fixture(t);
  behaviorRules(
    f.root,
    'save',
    {
      revision: 0,
      rule: {
        id: 'no-danger',
        event: 'all',
        enabled: true,
        action: 'block',
        conditions: [{ field: 'tool', operator: 'equals', value: 'danger' }],
        message: 'blocked fixture',
      },
    },
    f.options,
  );
  const event = {
    hook_event_name: 'preToolUse',
    session_id: 'fixture',
    cwd: f.root,
    tool_name: 'danger',
    tool_input: {},
  };
  assert.equal((await kiroEvent(f.root, event, f.options)).exitCode, 2);
  assert.equal(
    (await kiroEvent(f.root, { ...event, hook_event_name: 'stop' }, f.options)).exitCode,
    0,
  );
});
test('user-scope portfolio and MCP observations remain behind user access', async (t) => {
  const f = fixture(t),
    store = runtimeStore(f.root, f.options);
  store.put(
    'skill-portfolio',
    {
      observations: [{ scope: 'user', path: '/private/hidden' }],
      reviews: [],
      amendments: [{ id: 'secret', scope: 'user' }],
    },
    0,
  );
  store.put(
    'mcp-health',
    { servers: [{ key: 'private', scope: 'user', at: new Date().toISOString() }] },
    0,
  );
  const opts = { ...f.options, allowUser: false };
  assert.equal(portfolio(f.root, 'status', {}, opts).observations.length, 0);
  assert.equal((await mcpHealth(f.root, 'status', {}, opts)).servers.length, 0);
  assert.throws(
    () =>
      portfolio(
        f.root,
        'resolve',
        { revision: 1, id: 'secret', status: 'accepted', evidence: 'no' },
        opts,
      ),
    /User-scope/,
  );
});
test('graph refresh retires removed sections and rejects duplicate IDs atomically', (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, 'memory.md'), '# A\none\n# B\ntwo');
  let g = contextGraph(
    f.root,
    'import',
    { revision: 0, path: 'memory.md', format: 'markdown' },
    f.options,
  );
  assert.equal(g.nodes.length, 2);
  writeFileSync(join(f.root, 'memory.md'), '# A\none');
  g = contextGraph(
    f.root,
    'import',
    { revision: g.revision, path: 'memory.md', format: 'markdown' },
    f.options,
  );
  assert.equal(g.nodes.length, 1);
  writeFileSync(
    join(f.root, 'data.jsonl'),
    '{"id":"x","label":"One","text":"one"}\n{"id":"x","label":"Two","text":"two"}',
  );
  assert.throws(
    () =>
      contextGraph(
        f.root,
        'import',
        { revision: g.revision, path: 'data.jsonl', format: 'jsonl' },
        f.options,
      ),
    /Duplicate/,
  );
  assert.equal(contextGraph(f.root, 'status', {}, f.options).revision, g.revision);
});
test('councils bind independent cross-host assignments to current source', async (t) => {
  const f = fixture(t, true);
  const c = await council(
    f.root,
    'create',
    {
      id: 'independent',
      revision: 0,
      objective: 'Review current source',
      reviewers: [
        { agent: 'reviewer', host: 'codex' },
        { agent: 'reviewer', host: 'claude' },
      ],
    },
    f.options,
  );
  let view = await council(f.root, 'show', { id: c.id }, f.options);
  assert.deepEqual(
    view.run.items.map((i) => i.host),
    ['codex', 'claude'],
  );
  assert.ok(view.run.items.every((i) => i.dependsOn.length === 0));
  writeFileSync(join(f.root, 'app.txt'), 'changed');
  view = await council(f.root, 'show', { id: c.id }, f.options);
  assert.equal(view.stale, true);
  await assert.rejects(
    council(
      f.root,
      'conclude',
      { id: c.id, revision: c.revision, verdicts: [], synthesis: 'fine' },
      f.options,
    ),
    /stale/,
  );
});
test('concurrent wakeups reserve once and cancellation wins over an in-flight result', async (t) => {
  const f = fixture(t),
    r = await trusted(f);
  let job = await boundedJobs(
    f.root,
    'create',
    {
      id: 'job',
      revision: 0,
      kind: 'schedule',
      objective: 'read-only check',
      runner: r.id,
      runnerHash: r.hash,
      deadline: new Date(Date.now() + 60000).toISOString(),
    },
    f.options,
  );
  job = await boundedJobs(
    f.root,
    'enable',
    { id: job.id, revision: job.revision, enabled: true, reason: 'fixture' },
    f.options,
  );
  let finish;
  const execution = new Promise((resolve) => {
    finish = resolve;
  });
  let count = 0;
  const pending = boundedJobs(
    f.root,
    'tick',
    { id: job.id, revision: job.revision },
    {
      ...f.options,
      runCommand: async () => {
        count++;
        return execution;
      },
    },
  );
  await new Promise((resolve) => setImmediate(resolve));
  await assert.rejects(
    boundedJobs(f.root, 'tick', { id: job.id, revision: job.revision }, f.options),
    /revision|running/,
  );
  const current = await boundedJobs(f.root, 'show', { id: job.id }, f.options);
  await boundedJobs(
    f.root,
    'cancel',
    { id: job.id, revision: current.revision, reason: 'cancel fixture' },
    f.options,
  );
  finish({ status: 0, stdout: 'ok' });
  assert.equal((await pending).status, 'cancelled');
  assert.equal(count, 1);
});
test('operator root claims conflict and telemetry omits prompt data', async (t) => {
  const f = fixture(t);
  let s = await operator(
    f.root,
    'claim',
    { revision: 0, id: 'root', owner: 'one', paths: ['.'] },
    f.options,
  );
  await operator(
    f.root,
    'claim',
    { revision: s.revision, id: 'child', owner: 'two', paths: ['src'] },
    f.options,
  );
  s = await operator(f.root, 'status', {}, f.options);
  assert.equal(s.conflicts.length, 1);
  assert.deepEqual(
    (await telemetry(f.root, 'otlp', {}, f.options)).resourceLogs[0].scopeLogs[0].logRecords,
    [],
  );
});
test('operator project installations require server opt-in and a single exact preview', async (t) => {
  const f = fixture(t),
    app = await startOperatorServer(f.root, { ...f.options, allowInstall: true });
  t.after(() => app.close());
  const token = app.url.split('#')[1];
  const post = async (path, data) =>
    fetch(app.origin + '/api/' + path, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: app.origin,
        'x-operator-token': token,
      },
      body: JSON.stringify(data),
    });
  let response = await post('install-preview', {
    target: 'pi',
    operation: 'install',
    profile: 'core',
  });
  assert.equal(response.status, 200);
  const preview = await response.json();
  response = await post('install-apply', { id: preview.id, hash: preview.hash });
  assert.equal(response.status, 200);
  response = await post('install-apply', { id: preview.id, hash: preview.hash });
  assert.equal(response.status, 400);
  assert.equal(existsSync(join(f.root, '.pi/skills/just-vibe-goal/SKILL.md')), true);
});
test('pre-push verifies only the pushed clean HEAD and honors revoked runner trust', async (t) => {
  const f = fixture(t, true),
    r = await trusted(f);
  let p = await gitHooks(
    f.root,
    'preview',
    { hook: 'pre-push', runner: r.id, runnerHash: r.hash },
    f.options,
  );
  await gitHooks(
    f.root,
    'install',
    { hook: 'pre-push', revision: p.revision, hash: p.hash, runner: r.id, runnerHash: r.hash },
    f.options,
  );
  const updates = `refs/heads/main ${f.command('rev-parse', 'HEAD').trim()} refs/heads/main ${'0'.repeat(40)}`;
  assert.equal(
    (await gitHooks(f.root, 'check', { hook: 'pre-push', updates }, f.options)).passed,
    true,
  );
  writeFileSync(join(f.root, 'app.txt'), 'dirty');
  await assert.rejects(
    gitHooks(f.root, 'check', { hook: 'pre-push', updates }, f.options),
    /clean checkout/,
  );
  f.command('restore', 'app.txt');
  const rs = await runners(f.root, 'list', {}, f.options);
  await runners(f.root, 'untrust', { id: r.id, hash: r.hash, revision: rs.revision }, f.options);
  await assert.rejects(
    gitHooks(f.root, 'check', { hook: 'pre-push', updates }, f.options),
    /trust/,
  );
});

test('method routing does not mistake substrings for specialist domains', () => {
  const results = findMethods('Fix the graphical failure in this grammar parser');
  assert.ok(
    !results.some((m) =>
      ['healthcare-software', 'video-3d-production', 'blockchain-protocols'].includes(m.id),
    ),
  );
  assert.equal(findMethods('Inspect C++ memory ownership')[0].id, 'systems-languages');
});

test('session alias mutations cannot reveal or remove user-scope aliases', async (t) => {
  const { sessions } = await import('../plugins/just-vibe/scripts/lib/native-sessions.mjs');
  const f = fixture(t),
    store = runtimeStore(f.root, f.options);
  store.put(
    'native-session-personal',
    { id: 'personal', status: 'imported', source: { scope: 'user' } },
    0,
  );
  store.put(
    'native-session-local',
    { id: 'local', status: 'checkpoint', source: { scope: 'project' } },
    0,
  );
  store.put('session-aliases', { aliases: { private: 'personal' } }, 0);
  const opts = { ...f.options, allowUser: false };
  const result = sessions(f.root, 'alias', { revision: 1, id: 'local', alias: 'project' }, opts);
  assert.deepEqual(result.aliases, { project: 'local' });
  assert.throws(
    () =>
      sessions(
        f.root,
        'alias',
        { revision: result.revision, alias: 'private', remove: true },
        opts,
      ),
    /User session/,
  );
});

test('documented recovery, rollback, watch and promotion are wired through public CLI dispatch', async (t) => {
  const { platformRuntime } = await import('../plugins/just-vibe/scripts/lib/platform-runtime.mjs');
  const f = fixture(t);
  for (const [family, operation] of [
    ['services', 'recover'],
    ['updater', 'rollback-preview'],
    ['council', 'recover'],
    ['evaluation', 'promote'],
  ])
    await assert.rejects(
      platformRuntime(family, f.root, operation, { id: 'absent', revision: 0 }, f.options),
      (error) => !/Unknown .*operation|Unsupported/.test(error.message),
    );
  const signal = AbortSignal.abort();
  assert.equal(
    (await platformRuntime('jobs', f.root, 'watch', { seconds: 1 }, { ...f.options, signal }))
      .stopped,
    'cancelled',
  );
});
