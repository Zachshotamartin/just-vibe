import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { goals } from '../plugins/just-vibe/scripts/lib/goals.mjs';
import { scanConfiguration } from '../plugins/just-vibe/scripts/lib/config-scan.mjs';
import { patternLearning } from '../plugins/just-vibe/scripts/lib/pattern-learning.mjs';
import { assistantRuntime } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { assistantHook } from '../plugins/just-vibe/scripts/lib/assistant-hooks.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
import { createMcpServer } from '../plugins/just-vibe/scripts/lib/mcp-server.mjs';
import { portableContext } from '../plugins/just-vibe/scripts/lib/portable-context.mjs';
import { vault } from '../plugins/just-vibe/scripts/lib/vault.mjs';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { nativeAgentInstructions } from '../plugins/just-vibe/scripts/lib/agent-instructions.mjs';
import { specialist } from '../plugins/just-vibe/scripts/lib/specialists.mjs';
import { integration } from '../plugins/just-vibe/scripts/lib/integration.mjs';
import { guidedSetup } from '../plugins/just-vibe/scripts/lib/guided-setup.mjs';
import { workers } from '../plugins/just-vibe/scripts/lib/workers.mjs';
import { orchestrate } from '../plugins/just-vibe/scripts/lib/orchestration.mjs';
import { planCanvas, submitCanvasFeedback } from '../plugins/just-vibe/scripts/lib/plan-canvas.mjs';
import { startCanvasServer } from '../plugins/just-vibe/scripts/lib/canvas-http.mjs';
import { adapters } from '../plugins/just-vibe/scripts/lib/editor-adapters.mjs';
import { digest } from '../plugins/just-vibe/scripts/lib/storage.mjs';
import { stableJson } from '../plugins/just-vibe/scripts/lib/workbench.mjs';
import { stageBundle } from '../plugins/just-vibe/scripts/lib/bundle.mjs';

function fixture(t, git = false) {
  const dir = mkdtempSync(join(tmpdir(), 'jv-gaps-')),
    root = join(dir, 'project'),
    home = join(dir, 'home');
  mkdirSync(root);
  writeFileSync(join(root, 'app.js'), 'export const value = 1;\n');
  if (git) {
    for (const args of [
      ['init', '-q'],
      ['config', 'user.name', 'Fixture'],
      ['config', 'user.email', 'fixture@example.test'],
    ])
      execFileSync('git', args, { cwd: root });
    writeFileSync(join(root, '.gitignore'), '.just-vibe/\n');
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['commit', '-qm', 'initial'], { cwd: root });
  }
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return { root, home, dir, options: { home } };
}
test('goal reports expire with source, branch and index changes, including legacy evidence', (t) => {
  const f = fixture(t, true),
    run = (op, p) => goals(f.root, op, p, f.options);
  run('create', { id: 'fix', revision: 0, objective: 'Fix behavior', criteria: ['Test passes'] });
  const evidence = (revision) =>
    run('evidence', {
      id: 'fix',
      revision,
      criterion: 'c1',
      status: 'satisfied',
      evidence: { kind: 'host-report', summary: 'Ran the relevant test' },
    });
  evidence(1);
  writeFileSync(join(f.root, 'app.js'), 'export const value = 2;');
  assert.throws(() => run('complete', { id: 'fix', revision: 2 }), /Completion/);
  evidence(2);
  execFileSync('git', ['add', 'app.js'], { cwd: f.root });
  assert.throws(() => run('complete', { id: 'fix', revision: 3 }), /Completion/);
  evidence(3);
  execFileSync('git', ['checkout', '-qb', 'new-scope'], { cwd: f.root });
  assert.throws(() => run('complete', { id: 'fix', revision: 4 }), /Completion/);
  evidence(4);
  assert.equal(run('complete', { id: 'fix', revision: 5 }).goals[0].status, 'complete');
});
test('rejected observations remain rejected through pruning and require explicit reconsideration', (t) => {
  const f = fixture(t),
    run = (op, p) => patternLearning(f.root, op, p, f.options);
  let s = run('configure', { revision: 0, enabled: true });
  for (let i = 0; i < 3; i++)
    s = run('record', {
      revision: s.revision,
      session: `session-${i}`,
      workflow: 'review',
      tools: ['Read'],
      outcome: 'unknown',
    });
  s = run('analyze', { revision: s.revision });
  const id = s.candidates[0].id;
  s = run('reject', { revision: s.revision, id, reason: 'Not useful for this project' });
  s = run('prune', { revision: s.revision });
  s = run('analyze', { revision: s.revision });
  assert.equal(s.candidates.length, 0);
  assert.equal(s.decisions[0].status, 'rejected');
  s = run('reconsider', {
    revision: s.revision,
    id,
    reason: 'User explicitly requested another review',
  });
  s = run('analyze', { revision: s.revision });
  assert.equal(s.candidates[0].status, 'pending');
});
test('scanner parses MCP arrays and JSONC, distinguishes real loopback and includes supported host directories', (t) => {
  const f = fixture(t);
  writeFileSync(
    join(f.root, '.mcp.json'),
    JSON.stringify(
      {
        mcpServers: {
          unpinned: { command: 'npx', args: ['-y', 'sample@latest'] },
          remote: { url: 'http://localhost.example.com/mcp' },
          safe: { command: 'npx', args: ['-y', 'sample@1.2.3'], url: 'http://127.0.0.1:9000' },
        },
      },
      null,
      2,
    ),
  );
  mkdirSync(join(f.root, '.gemini'));
  writeFileSync(
    join(f.root, '.gemini', 'settings.json'),
    '{"mcpServers":{"runner":{"command":"pnpm","args":["dlx","sample"]}}}',
  );
  writeFileSync(
    join(f.root, 'opencode.jsonc'),
    '{ // comment\n "mcp":{"runner":{"command":"npx","args":["sample@latest",],},},}',
  );
  const result = scanConfiguration(f.root);
  assert.ok(result.files.includes('.gemini/settings.json'));
  assert.ok(result.files.every((p) => !p.startsWith('..')));
  assert.ok(result.findings.some((f) => f.rule === 'unpinned-runner' && f.file === '.mcp.json'));
  assert.equal(result.findings.filter((f) => f.rule === 'insecure-mcp-url').length, 1);
  assert.ok(
    result.findings.some((f) => f.rule === 'unpinned-runner' && f.file === 'opencode.jsonc'),
  );
  assert.ok(!result.findings.some((f) => f.rule.startsWith('invalid')));
});
test('native specialist invocations receive canonical methods, chosen rules and current approved preferences', (t) => {
  const f = fixture(t);
  runtimeStore(f.root, f.options).put('integration', { rules: ['react'] }, 0);
  const task = assistantRuntime(
    f.root,
    'start',
    { sessionId: 'agent-test', brief: 'Always review accessibility before changing a component.' },
    f.options,
  );
  assistantRuntime(
    f.root,
    'feedback',
    {
      taskId: task.id,
      revision: 0,
      scope: 'project',
      kind: 'correction',
      workflow: 'review',
      excerpt: task.userMessage,
      instruction: 'Review accessibility before changing components.',
    },
    f.options,
  );
  const loaded = assistantRuntime(f.root, 'load', { workflow: 'review' }, f.options);
  assert.deepEqual(loaded.rules, ['react']);
  assert.match(loaded.instructions, /Review accessibility before/);
  const hook = assistantHook(
    {
      hook_event_name: 'SubagentStart',
      cwd: f.root,
      agent_type: 'just-vibe:reviewer',
      agent_id: 'child',
    },
    f.options,
  );
  assert.ok(hook.hookSpecificOutput.additionalContext.includes(loaded.instructions));
  const native = nativeAgentInstructions(specialist('reviewer'), loadCatalog());
  assert.match(native, /Technical method/);
  assert.match(native, /\.\.\/references\//);
  const failure = JSON.parse(readFileSync('plugins/just-vibe/hooks/claude.json'));
  assert.ok(failure.hooks.PostToolUseFailure);
  const common = JSON.parse(readFileSync('plugins/just-vibe/hooks/hooks.json'));
  assert.ok(!common.hooks.PostToolUseFailure);
});
test('native task tools complete selection, loading, verification and reporting without a shell', async (t) => {
  const f = fixture(t),
    server = createMcpServer(f.root, f.options);
  let id = 0;
  await server({ jsonrpc: '2.0', id: ++id, method: 'initialize' });
  await server({ jsonrpc: '2.0', method: 'notifications/initialized' });
  const call = async (name, args) => {
    const r = await server({
      jsonrpc: '2.0',
      id: ++id,
      method: 'tools/call',
      params: { name, arguments: args },
    });
    assert.equal(r.result?.isError, false, JSON.stringify(r));
    return JSON.parse(r.result.content[0].text);
  };
  const task = await call('task_start', {
    host: 'external',
    sessionId: 'example',
    brief: 'Explain the app.js function.',
  });
  const selected = await call('task_select', {
    taskId: task.id,
    workflows: ['explain'],
    mode: 'inspect',
    reason: 'Requested explanation',
  });
  await call('workflow_load', { taskId: task.id, workflow: 'explain' });
  for (const requirement of selected.requirements.filter((r) => !r.id.endsWith(':instructions')))
    await call('task_evidence', {
      taskId: task.id,
      requirement: requirement.id,
      kind: 'host-report',
      summary: 'Read the function and checked the described behavior against its source.',
    });
  assert.equal((await call('task_report', { taskId: task.id })).missing.length, 0);
});
test('grounded preference proposals support exceptions and explicit resolution of related guidance', (t) => {
  const f = fixture(t),
    task = assistantRuntime(
      f.root,
      'start',
      {
        sessionId: 'learning',
        brief: 'Remember to prefer simple functions in review, except when a class owns resources.',
      },
      f.options,
    );
  const first = assistantRuntime(
    f.root,
    'feedback',
    {
      taskId: task.id,
      revision: 0,
      scope: 'project',
      kind: 'correction',
      workflow: 'review',
      excerpt: task.userMessage,
      instruction: 'Prefer simple functions.',
    },
    f.options,
  );
  const run = (op, payload) => patternLearning(f.root, op, payload, f.options);
  assert.throws(
    () =>
      run('propose', {
        revision: 0,
        taskId: task.id,
        excerpt: 'invented quote',
        reason: 'test',
        change: { workflow: 'review', instruction: 'Use classes.' },
      }),
    /quote|feedback/i,
  );
  const s = run('propose', {
    revision: 0,
    taskId: task.id,
    excerpt: task.userMessage,
    reason: 'Preserve the explicit exception',
    change: {
      workflow: 'review',
      instruction: 'Prefer simple functions.',
      exceptions: ['A class owns resources'],
    },
  });
  assert.throws(
    () => run('approve', { revision: s.revision, id: s.candidates[0].id, reason: 'User approved' }),
    /Resolve each/,
  );
  run('approve', {
    revision: s.revision,
    id: s.candidates[0].id,
    reason: 'User approved the more precise replacement',
    resolutions: [{ id: first.id, revision: first.revision, action: 'retire' }],
  });
  const method = assistantRuntime(f.root, 'load', { workflow: 'review' }, f.options);
  assert.equal(method.lessons.length, 1);
  assert.match(method.instructions, /A class owns resources/);
});
test('portable context previews collisions, preserves existing data and imports goals without stale completion', (t) => {
  const f = fixture(t),
    destination = join(f.dir, 'destination');
  mkdirSync(destination);
  vault(
    f.root,
    'save',
    {
      id: 'decision',
      revision: 0,
      title: 'Decision',
      body: 'Use bounded requests.',
      source: 'User',
    },
    f.options,
  );
  goals(
    f.root,
    'create',
    { id: 'goal', revision: 0, objective: 'Fix requests', criteria: ['Requests bounded'] },
    f.options,
  );
  const bundle = portableContext(f.root, 'export', {}, f.options);
  assert.ok(!JSON.stringify(bundle).includes(f.root));
  const preview = portableContext(destination, 'preview', { bundle }, f.options);
  assert.equal(preview.counts.goals, 1);
  const result = portableContext(destination, 'import', { bundle, revision: 0 }, f.options);
  assert.equal(result.status, 'complete');
  assert.equal(
    goals(destination, 'show', { id: 'goal' }, f.options).goal.criteria[0].status,
    'pending',
  );
  assert.equal(
    vault(destination, 'read', { id: 'decision' }, f.options).entry.body,
    'Use bounded requests.',
  );
  assert.equal(portableContext(destination, 'preview', { bundle }, f.options).collisions.length, 2);
  assert.throws(
    () =>
      portableContext(
        destination,
        'import',
        { bundle: { ...bundle, permissions: ['all'] }, revision: result.revision },
        f.options,
      ),
    /Expected/,
  );
});

// Recovery, host integration and orchestration checks exercise real filesystem boundaries.
test('guided dry-run is inert and configured MCP permissions require a new connection', async (t) => {
  const f = fixture(t),
    installations = [],
    replies = ['kimi,qwen', 'core', 'react', 'yes', 'yes', 'yes', 'no', 'no', 'no'];
  const result = await guidedSetup(['setup', '--guided', '--dry-run', '--root', f.root], {
    ...f.options,
    question: async () => replies.shift(),
    log: () => {},
    runInstall: (p) => installations.push(p),
  });
  assert.equal(result.dryRun, true);
  assert.equal(installations.length, 2);
  assert.ok(installations.every((p) => p.dryRun && p.root === realpathSync(f.root)));
  assert.equal((await integration(f.root, 'status', {}, f.options)).revision, 0);
  const before = createMcpServer(f.root, f.options);
  await integration(
    f.root,
    'configure',
    {
      revision: 0,
      rules: ['react'],
      mcp: { allowWrite: true },
      automatic: true,
      observation: true,
    },
    f.options,
  );
  const configuredStore = runtimeStore(f.root, f.options);
  assert.equal(
    configuredStore.read(`${configuredStore.project}/config.json`).settings.enabled,
    true,
  );
  const names = async (server) => {
    await server({ jsonrpc: '2.0', id: 1, method: 'initialize' });
    await server({ jsonrpc: '2.0', method: 'notifications/initialized' });
    return (await server({ jsonrpc: '2.0', id: 2, method: 'tools/list' })).result.tools.map(
      (t) => t.name,
    );
  };
  assert.ok(!(await names(before)).includes('memory_save'));
  const after = await names(createMcpServer(f.root, f.options));
  assert.ok(after.includes('memory_save'));
  assert.ok(after.includes('canvas_manage'));
  assert.ok(!after.includes('workers_apply'));
  assert.ok(!after.includes('integration_configure'));
});
test('configuration recovery refuses newer conflicting settings', async (t) => {
  const f = fixture(t),
    store = runtimeStore(f.root, f.options);
  store.put(
    'integration',
    {
      rules: [],
      mcp: {},
      pending: { rules: [], mcp: {}, choices: { observation: true }, expected: { observation: 0 } },
    },
    0,
  );
  patternLearning(f.root, 'configure', { revision: 0, enabled: false }, f.options);
  await assert.rejects(integration(f.root, 'recover', {}, f.options), /changed during/);
  assert.equal(patternLearning(f.root, 'status', {}, f.options).enabled, false);
});
test('portable recovery accepts already applied bytes and refuses concurrent changes', (t) => {
  const f = fixture(t),
    store = runtimeStore(f.root, f.options),
    file = `${store.prefix}/memory.json`;
  const value = { schemaVersion: 1, root: store.root, revision: 1, entries: [] },
    hash = (v) => digest(stableJson(v));
  const journal = {
    status: 'applying',
    bundleHash: 'test',
    counts: {},
    collisions: [],
    changes: [{ file, expected: 0, beforeHash: hash(null), afterHash: hash(value), value }],
  };
  store.put('transfer', journal, 0);
  store.write(file, value, 0);
  assert.equal(portableContext(f.root, 'recover', {}, f.options).status, 'complete');
  store.put('transfer', journal, 2);
  store.write(file, { ...value, entries: [{ id: 'newer' }] }, 1);
  assert.throws(() => portableContext(f.root, 'recover', {}, f.options), /Destination changed/);
  assert.equal(store.read(file).entries[0].id, 'newer');
});
test('new editor adapters support selected payloads and owned install/update/uninstall', (t) => {
  const f = fixture(t);
  for (const [target, directory] of [
    ['kimi', '.kimi-code'],
    ['qwen', '.qwen'],
    ['windsurf', '.windsurf'],
    ['antigravity', '.agent'],
  ]) {
    mkdirSync(join(f.root, directory), { recursive: true });
    writeFileSync(join(f.root, directory, 'personal.txt'), 'mine');
    adapters(f.root, 'install', { target, profile: 'core', rules: ['react'] });
    assert.match(
      readFileSync(join(f.root, directory, 'skills/just-vibe-plan-review/SKILL.md'), 'utf8'),
      /plan-review/,
    );
    adapters(f.root, 'update', { target, profile: 'frontend', rules: ['typescript'] });
    const status = adapters(f.root, 'doctor', { target });
    assert.equal(status.conflicts.length, 0);
    assert.equal(status.missing.length, 0);
    adapters(f.root, 'uninstall', { target });
    assert.equal(readFileSync(join(f.root, directory, 'personal.txt'), 'utf8'), 'mine');
  }
});
async function finishWorker(f, id) {
  for (let i = 0; i < 150; i++) {
    const job = (await workers(f.root, 'status', {}, f.options)).jobs.find((j) => j.id === id);
    if (['completed', 'failed', 'expired', 'cancelled'].includes(job.state)) return job;
    await new Promise((ok) => setTimeout(ok, 50));
  }
  throw Error('Worker did not finish');
}
test('reviewed worker application requires fresh checks, preserves the index and rejects later edits', async (t) => {
  const f = fixture(t, true);
  await workers(f.root, 'configure', { revision: 0, enabled: true }, f.options);
  const index = execFileSync('git', ['ls-files', '--stage'], { cwd: f.root, encoding: 'utf8' });
  const job = await workers(
    f.root,
    'start',
    {
      revision: 1,
      host: 'codex',
      agent: 'implementer',
      brief: 'Change value to 2',
      source: 'working-tree',
    },
    {
      ...f.options,
      command: [
        process.execPath,
        '-e',
        'process.stdin.resume(); process.stdin.on("end",()=>require("fs").writeFileSync("app.js","export const value = 2;\\n"))',
      ],
    },
  );
  assert.equal((await finishWorker(f, job.id)).state, 'completed');
  const result = await workers(f.root, 'result', { id: job.id }, f.options);
  assert.deepEqual(result.paths, ['app.js']);
  const apply = () =>
    workers(
      f.root,
      'apply',
      {
        id: job.id,
        revision: job.revision,
        resultHash: result.resultHash,
        reason: 'Inspected the intended one-line change',
      },
      f.options,
    );
  await assert.rejects(apply(), /fresh passing/);
  await workers(
    f.root,
    'verify',
    {
      id: job.id,
      checks: [
        {
          id: 'value',
          command: [
            process.execPath,
            '-e',
            'if(!require("fs").readFileSync("app.js","utf8").includes("value = 2"))process.exit(1)',
          ],
        },
      ],
    },
    f.options,
  );
  const applied = await apply();
  assert.match(applied.undoTask, /^worker-/);
  assert.equal(
    execFileSync('git', ['ls-files', '--stage'], { cwd: f.root, encoding: 'utf8' }),
    index,
  );
  assert.match(readFileSync(join(f.root, 'app.js'), 'utf8'), /value = 2/);
  writeFileSync(join(f.root, 'app.js'), 'export const value = 3;');
  await assert.rejects(
    workers(
      f.root,
      'apply',
      { id: job.id, revision: applied.revision, resultHash: result.resultHash, reason: 'Retry' },
      f.options,
    ),
    /files changed/,
  );
});
test('orchestration validates DAGs, requires acceptance and detects changed prerequisites', async (t) => {
  const f = fixture(t, true),
    options = {
      ...f.options,
      command: [
        process.execPath,
        '-e',
        'process.stdin.resume();process.stdin.on("end",()=>console.log("reviewed"))',
      ],
    };
  await workers(f.root, 'configure', { revision: 0, enabled: true }, f.options);
  const run = (op, payload) => orchestrate(f.root, op, payload, options);
  const items = [
    { id: 'review', agent: 'reviewer', brief: 'Review app.js' },
    { id: 'second', agent: 'reviewer', brief: 'Follow up', dependsOn: ['review'] },
  ];
  await assert.rejects(
    run('create', {
      id: 'cycle',
      revision: 0,
      objective: 'Test',
      host: 'codex',
      items: [{ ...items[0], dependsOn: ['second'] }, items[1]],
    }),
    /cycle/,
  );
  let s = await run('create', {
    id: 'flow',
    revision: 0,
    objective: 'Review twice',
    host: 'codex',
    items,
  });
  s = await run('dispatch', { id: 'flow', revision: s.revision });
  assert.equal(s.runs[0].items[1].state, 'queued');
  const id = s.runs[0].items[0].attempts[0].worker;
  await finishWorker(f, id);
  s = await run('collect', { id: 'flow', revision: s.revision });
  assert.equal(s.runs[0].items[0].state, 'review');
  s = await run('dispatch', { id: 'flow', revision: s.revision });
  assert.equal(s.runs[0].items[1].state, 'queued');
  const result = await workers(f.root, 'result', { id }, f.options);
  s = await run('accept', {
    id: 'flow',
    revision: s.revision,
    item: 'review',
    resultHash: result.resultHash,
    reason: 'Reviewed findings against the current source',
  });
  writeFileSync(join(f.root, 'app.js'), 'changed');
  await assert.rejects(
    run('dispatch', { id: 'flow', revision: s.revision }),
    /Prerequisite review changed/,
  );
});
test('orchestration retries carry corrections and respect the attempt limit', async (t) => {
  const f = fixture(t, true),
    options = {
      ...f.options,
      command: [
        process.execPath,
        '-e',
        'process.stdin.resume();process.stdin.on("end",()=>process.exit(1))',
      ],
    };
  await workers(f.root, 'configure', { revision: 0, enabled: true }, f.options);
  const run = (op, payload) => orchestrate(f.root, op, payload, options);
  let s = await run('create', {
    id: 'flow',
    revision: 0,
    objective: 'Bound failures',
    host: 'codex',
    maxAttempts: 1,
    items: [{ id: 'failure', agent: 'reviewer', brief: 'Fail boundedly' }],
  });
  s = await run('dispatch', { id: 'flow', revision: s.revision });
  await finishWorker(f, s.runs[0].items[0].attempts[0].worker);
  s = await run('collect', { id: 'flow', revision: s.revision });
  await assert.rejects(
    run('retry', { id: 'flow', revision: s.revision, item: 'failure', reason: 'Try again' }),
    /attempt limit/,
  );
});
test('canvas protects feedback with origin, token, revision and artifact identity', async (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, 'plan.md'), '# Plan\n\nReview the API.\n');
  let review = await planCanvas(
    f.root,
    'create',
    { id: 'plan', revision: 0, title: 'API plan', path: 'plan.md' },
    f.options,
  );
  const server = await startCanvasServer(f.root, 'plan', f.options);
  t.after(server.close);
  assert.equal((await fetch(server.origin + '/api/review')).status, 403);
  assert.equal(
    (
      await fetch(server.origin + '/api/review', {
        headers: { 'x-canvas-token': server.token, origin: 'https://example.com' },
      })
    ).status,
    403,
  );
  const headers = {
    'x-canvas-token': server.token,
    origin: server.origin,
    'content-type': 'application/json',
  };
  const response = await fetch(server.origin + '/api/feedback', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      revision: review.revision,
      artifactHash: review.artifact.hash,
      kind: 'annotation',
      text: 'Check cancellation',
      anchor: 3,
    }),
  });
  assert.equal(response.status, 200);
  review = await response.json();
  assert.throws(
    () =>
      submitCanvasFeedback(runtimeStore(f.root, f.options), 'plan', {
        revision: 1,
        artifactHash: review.artifact.hash,
        kind: 'approve',
        text: 'Old revision',
      }),
    /revision|changed/i,
  );
  review = submitCanvasFeedback(runtimeStore(f.root, f.options), 'plan', {
    revision: review.revision,
    artifactHash: review.artifact.hash,
    kind: 'approve',
    text: 'This version is ready',
  });
  assert.equal(
    (await planCanvas(f.root, 'show', { id: 'plan' }, f.options)).effectiveVerdict.kind,
    'approve',
  );
  writeFileSync(join(f.root, 'plan.md'), 'A different plan');
  assert.equal(
    (await planCanvas(f.root, 'show', { id: 'plan' }, f.options)).effectiveVerdict,
    null,
  );
  assert.throws(
    () =>
      submitCanvasFeedback(runtimeStore(f.root, f.options), 'plan', {
        revision: review.revision,
        artifactHash: review.artifact.hash,
        kind: 'comment',
        text: 'Stale',
      }),
    /Artifact changed/,
  );
  review = await planCanvas(
    f.root,
    'refresh',
    { id: 'plan', revision: review.revision },
    f.options,
  );
  assert.equal(review.verdict, null);
  assert.equal(review.history.length, 1);
});
test('installed Codex MCP declaration launches from a different project and honors personal runtime settings', async (t) => {
  const f = fixture(t),
    destination = join(f.dir, 'managed');
  stageBundle(destination);
  const config = JSON.parse(readFileSync(join(destination, 'plugins/just-vibe/.mcp.json')))
    .mcpServers['just-vibe'];
  assert.equal(config.cwd, undefined);
  assert.ok(config.args[0].startsWith(destination));
  await integration(f.root, 'configure', { revision: 0, mcp: { allowWrite: true } }, f.options);
  const requests = [
    { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25' } },
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    { jsonrpc: '2.0', id: 2, method: 'tools/list' },
  ];
  const raw = execFileSync(config.command, config.args, {
    cwd: f.root,
    env: { ...process.env, JUST_VIBE_HOME: f.home },
    input: requests.map((r) => JSON.stringify(r)).join('\n') + '\n',
    encoding: 'utf8',
  });
  const responses = raw
    .trim()
    .split('\n')
    .map((r) => JSON.parse(r));
  assert.ok(responses[0].result.instructions.includes(realpathSync(f.root)));
  assert.ok(responses[1].result.tools.some((t) => t.name === 'memory_save'));
});
test('legacy goal reports and reviewed pattern decisions are migrated conservatively', (t) => {
  const f = fixture(t),
    store = runtimeStore(f.root, f.options);
  goals(
    f.root,
    'create',
    { id: 'old', revision: 0, objective: 'Legacy goal', criteria: ['A check passed'] },
    f.options,
  );
  let s = goals(
    f.root,
    'evidence',
    {
      id: 'old',
      revision: 1,
      criterion: 'c1',
      status: 'satisfied',
      evidence: { kind: 'host-report', summary: 'Old check' },
    },
    f.options,
  );
  delete s.goals[0].criteria[0].evidence[0].snapshot;
  store.put('goals', s, s.revision);
  assert.throws(
    () => goals(f.root, 'complete', { id: 'old', revision: s.revision + 1 }, f.options),
    /Completion/,
  );
  store.put(
    'patterns',
    {
      enabled: false,
      observations: [],
      candidates: [
        {
          id: 'legacy-rejected',
          status: 'rejected',
          reason: 'Not useful',
          reviewedAt: new Date().toISOString(),
        },
      ],
    },
    0,
  );
  const pruned = patternLearning(f.root, 'prune', { revision: 1 }, f.options);
  assert.equal(pruned.decisions[0].id, 'legacy-rejected');
  assert.equal(pruned.candidates.length, 0);
});
