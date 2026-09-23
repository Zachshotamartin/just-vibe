import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
  realpathSync,
  chmodSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { contextHealth, healthHook } from '../plugins/just-vibe/scripts/lib/context-health.mjs';
import {
  quality,
  qualityPreset,
  stagedQuality,
  commitQualityHook,
} from '../plugins/just-vibe/scripts/lib/quality.mjs';
import { manageHooks, handleHook } from '../plugins/just-vibe/scripts/lib/automation.mjs';
import { adapters } from '../plugins/just-vibe/scripts/lib/editor-adapters.mjs';
import { cursorEvent } from '../plugins/just-vibe/scripts/lib/editor-events.mjs';
import { createOpenCodePlugin } from '../plugins/just-vibe/scripts/lib/opencode-plugin.mjs';
import { policy } from '../plugins/just-vibe/scripts/lib/action-policy.mjs';
import { epic } from '../plugins/just-vibe/scripts/lib/github-coordination.mjs';
import { securityAudit } from '../plugins/just-vibe/scripts/lib/security-audit.mjs';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { main } from '../plugins/just-vibe/scripts/toolkit.mjs';
import { createMcpServer } from '../plugins/just-vibe/scripts/lib/mcp-server.mjs';
import { managedFragment } from '../plugins/just-vibe/scripts/lib/managed-fragment.mjs';
import { digest } from '../plugins/just-vibe/scripts/lib/storage.mjs';

function fixture(t, git = false) {
  const dir = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-depth-'))),
    root = join(dir, 'project'),
    home = join(dir, 'home');
  mkdirSync(root);
  const options = { home };
  const runGit = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  if (git) {
    runGit('init', '-q');
    runGit('config', 'user.name', 'Fixture');
    runGit('config', 'user.email', 'fixture@example.test');
    writeFileSync(join(root, '.gitignore'), '.just-vibe/\n');
    writeFileSync(join(root, 'app.js'), 'export const value = 1;\n');
    runGit('add', '.');
    runGit('commit', '-qm', 'Initial');
  }
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return { root, home, dir, options, git: runGit };
}
test('context monitoring isolates sessions, redacts arguments by hashing, debounces and resets turns', (t) => {
  const f = fixture(t);
  let now = Date.now();
  const options = { ...f.options, now: () => now };
  const base = { host: 'claude', sessionId: 'session-a' };
  contextHealth(
    f.root,
    'observe',
    { ...base, remainingPercent: 12, observedAt: new Date(now).toISOString() },
    options,
  );
  let result;
  for (let i = 0; i < 5; i++)
    result = contextHealth(
      f.root,
      'observe',
      { ...base, tool: 'Read', arguments: { token: 'never-store-this' } },
      options,
    );
  assert.ok(result.warnings.some((w) => w.type === 'repeat'));
  result = contextHealth(
    f.root,
    'observe',
    { ...base, tool: 'Read', arguments: { token: 'never-store-this' } },
    options,
  );
  assert.equal(result.warnings.length, 0);
  assert.doesNotMatch(
    JSON.stringify(contextHealth(f.root, 'status', {}, options)),
    /never-store-this/,
  );
  assert.equal(
    contextHealth(f.root, 'observe', { ...base, sessionId: 'session-b', tool: 'Read' }, options)
      .remainingPercent,
    null,
  );
  now += 121000;
  assert.equal(
    contextHealth(f.root, 'observe', { ...base, tool: 'Other' }, options).remainingPercent,
    null,
  );
  assert.throws(
    () =>
      contextHealth(
        f.root,
        'observe',
        { ...base, remainingPercent: 10, observedAt: new Date(now - 121000).toISOString() },
        options,
      ),
    /two minutes/,
  );
  healthHook(
    { cwd: f.root, session_id: 'session-a', hook_event_name: 'UserPromptSubmit' },
    options,
  );
  assert.equal(
    contextHealth(f.root, 'observe', { ...base, tool: 'Read' }, options).warnings.length,
    0,
  );
});
test('quality discovery is inert, preserves manager ambiguity, and never grants trust', async (t) => {
  const f = fixture(t);
  writeFileSync(
    join(f.root, 'package.json'),
    JSON.stringify({
      scripts: { typecheck: 'node check.js', lint: 'eslint .' },
      devDependencies: { prettier: '3.0.0' },
    }),
  );
  writeFileSync(join(f.root, 'pnpm-lock.yaml'), '');
  writeFileSync(join(f.root, 'yarn.lock'), '');
  assert.equal(qualityPreset(f.root).configuration.checks.length, 0);
  assert.ok(!existsSync(f.home));
  assert.ok(!existsSync(join(f.root, '.just-vibe')));
  const preview = qualityPreset(f.root, { packageManager: 'pnpm', commit: true });
  assert.equal(preview.configuration.formatters[0].name, 'prettier');
  await quality(
    f.root,
    'configure',
    { revision: 0, packageManager: 'pnpm', commit: true },
    f.options,
  );
  assert.equal(manageHooks(f.root, 'status', {}, f.options).trusted, false);
});
test('batch formatting runs one invocation and preserves the index and staged paths', async (t) => {
  const f = fixture(t, true);
  const config = {
    schemaVersion: 1,
    revision: 0,
    enabled: true,
    saveSummary: false,
    batch: true,
    checks: [],
    formatters: [{ name: 'fmt', command: ['fmt', '{file}'], extensions: ['.js'], timeoutMs: 1000 }],
  };
  manageHooks(f.root, 'configure', config, f.options);
  manageHooks(f.root, 'trust', {}, f.options);
  for (const file of ['a.js', 'b.js', 'staged.js']) writeFileSync(join(f.root, file), 'const a=1;');
  f.git('add', 'staged.js');
  const index = f.git('ls-files', '--stage');
  const calls = [],
    options = {
      ...f.options,
      run: async (argv) => {
        calls.push(argv);
        return { status: 0, stdout: '', stderr: '' };
      },
    };
  for (const file of ['a.js', 'b.js', 'staged.js'])
    await handleHook(
      {
        cwd: f.root,
        hook_event_name: 'PostToolUse',
        tool_name: 'Edit',
        tool_input: { file_path: join(f.root, file) },
      },
      options,
    );
  assert.equal(calls.length, 0);
  await handleHook({ cwd: f.root, hook_event_name: 'Stop' }, options);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].length, 3);
  assert.ok(!calls[0].includes(join(f.root, 'staged.js')));
  assert.equal(f.git('ls-files', '--stage'), index);
});
test('commit gate reads staged blobs and rejects partial staging and changes during checks', async (t) => {
  const f = fixture(t, true);
  const configuration = {
    schemaVersion: 1,
    revision: 0,
    enabled: true,
    saveSummary: false,
    commit: true,
    checks: [{ name: 'check', command: ['check'], timeoutMs: 1000, extensions: [] }],
    formatters: [],
  };
  manageHooks(f.root, 'configure', configuration, f.options);
  manageHooks(f.root, 'trust', {}, f.options);
  writeFileSync(join(f.root, 'app.js'), `const credential = 'ghp_${'a'.repeat(30)}';\n`);
  f.git('add', 'app.js');
  writeFileSync(join(f.root, 'app.js'), 'safe working tree');
  assert.equal(stagedQuality(f.root).findings[0].rule, 'staged-credential');
  let calls = 0;
  const options = {
    ...f.options,
    run: async () => {
      calls++;
      return { status: 0, stdout: '', stderr: '' };
    },
  };
  assert.equal((await quality(f.root, 'check-commit', {}, options)).passed, false);
  assert.equal(calls, 0);
  f.git('add', 'app.js');
  writeFileSync(join(f.root, 'app.js'), 'unstaged');
  assert.match((await quality(f.root, 'check-commit', {}, options)).reason, /partially staged/);
  f.git('add', 'app.js');
  assert.equal((await quality(f.root, 'check-commit', {}, options)).passed, true);
  const changed = await quality(
    f.root,
    'check-commit',
    {},
    {
      ...options,
      run: async () => {
        writeFileSync(join(f.root, 'app.js'), 'raced');
        return { status: 0, stdout: '', stderr: '' };
      },
    },
  );
  assert.equal(changed.passed, false);
  assert.equal(
    (
      await commitQualityHook(
        {
          cwd: f.root,
          hook_event_name: 'PreToolUse',
          tool_name: 'Bash',
          tool_input: { command: 'git commit -m test' },
        },
        options,
      )
    ).hookSpecificOutput.permissionDecision,
    'deny',
  );
});
test('Cursor native event bridge delivers routing and enforces enabled policies', async (t) => {
  const f = fixture(t, true);
  await cursorEvent(
    f.root,
    {
      hook_event_name: 'beforeSubmitPrompt',
      conversation_id: 'c1',
      generation_id: 'g1',
      prompt: 'Fix the failing app test',
    },
    f.options,
  );
  const response = await cursorEvent(
    f.root,
    {
      hook_event_name: 'postToolUse',
      conversation_id: 'c1',
      generation_id: 'g1',
      tool_name: 'Read',
      tool_input: { file_path: join(f.root, 'app.js') },
    },
    f.options,
  );
  assert.match(response.additional_context, /Task ID:/);
  policy(
    f.root,
    'configure',
    { revision: 0, settings: { enabled: true, rules: ['git-discard'] } },
    f.options,
  );
  const blocked = await cursorEvent(
    f.root,
    {
      hook_event_name: 'preToolUse',
      conversation_id: 'c1',
      tool_name: 'Shell',
      tool_input: { command: 'git reset --hard' },
    },
    f.options,
  );
  assert.equal(blocked.permission, 'deny');
  await assert.rejects(
    () =>
      cursorEvent(
        f.root,
        { hook_event_name: 'preToolUse', conversation_id: 'c1', cwd: f.dir, tool_name: 'Shell' },
        f.options,
      ),
    /escapes/,
  );
});
test('Cursor installation merges foreign hooks, updates idempotently and removes only owned entries', (t) => {
  const f = fixture(t);
  mkdirSync(join(f.root, '.cursor'));
  const foreign = { command: 'node custom.js', timeout: 3 };
  writeFileSync(
    join(f.root, '.cursor/hooks.json'),
    JSON.stringify({ version: 1, customSetting: true, hooks: { preToolUse: [foreign] } }),
  );
  const payload = { target: 'cursor', profile: 'core', hooks: true };
  adapters(f.root, 'install', { ...payload, dryRun: true });
  assert.equal(
    JSON.parse(readFileSync(join(f.root, '.cursor/hooks.json'))).hooks.preToolUse.length,
    1,
  );
  adapters(f.root, 'install', payload);
  adapters(f.root, 'update', { target: 'cursor' });
  assert.equal(
    JSON.parse(readFileSync(join(f.root, '.cursor/hooks.json'))).hooks.preToolUse.length,
    2,
  );
  const entry = join(f.root, '.just-vibe/adapters/cursor/plugin/scripts/cursor-hooks.mjs');
  const run = spawnSync(process.execPath, [entry], {
    cwd: f.root,
    env: { ...process.env, JUST_VIBE_HOME: f.home },
    input: JSON.stringify({
      hook_event_name: 'beforeSubmitPrompt',
      conversation_id: 'native',
      prompt: 'Fix app.js',
    }),
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(JSON.parse(run.stdout).continue, true);
  adapters(f.root, 'uninstall', { target: 'cursor' });
  const after = JSON.parse(readFileSync(join(f.root, '.cursor/hooks.json')));
  assert.deepEqual(after.hooks, { preToolUse: [foreign] });
  assert.equal(after.customSetting, true);
  adapters(f.root, 'uninstall', { target: 'cursor' });
});
test('edited owned hooks stop the entire update before payload changes', (t) => {
  const f = fixture(t);
  adapters(f.root, 'install', { target: 'cursor', profile: 'core', hooks: true });
  const path = join(f.root, '.cursor/hooks.json'),
    data = JSON.parse(readFileSync(path));
  data.hooks.preToolUse[0].timeout = 999;
  writeFileSync(path, JSON.stringify(data));
  const selection = readFileSync(join(f.root, '.just-vibe/adapters/cursor/selection.json'), 'utf8');
  assert.throws(() => adapters(f.root, 'update', { target: 'cursor', profile: 'full' }), /edited/);
  assert.equal(
    readFileSync(join(f.root, '.just-vibe/adapters/cursor/selection.json'), 'utf8'),
    selection,
  );
});
test('OpenCode plugin lifecycle exposes tools, routes messages and blocks before execution', async (t) => {
  const f = fixture(t, true);
  adapters(f.root, 'install', { target: 'opencode', profile: 'core', hooks: true });
  assert.ok(existsSync(join(f.root, '.opencode/plugins/just-vibe.js')));
  assert.ok(!existsSync(join(f.root, '.opencode/plugins/just-vibe.mjs')));
  const tool = (spec) => spec;
  tool.schema = { string: () => ({ type: 'string' }) };
  const plugin = await createOpenCodePlugin(
    tool,
    f.options,
  )({ directory: f.root, worktree: f.root });
  await plugin['chat.message'](
    { sessionID: 's' },
    { message: { id: 'm' }, parts: [{ type: 'text', text: 'Fix the app bug' }] },
  );
  const output = { system: ['existing'] };
  await plugin['experimental.chat.system.transform']({ sessionID: 's' }, output);
  assert.equal(output.system[0], 'existing');
  assert.match(output.system[1], /Task ID/);
  assert.ok(JSON.parse(await plugin.tool.just_vibe_workflows.execute({ query: 'fix' })).length);
  assert.match(
    JSON.parse(await plugin.tool.just_vibe_workflow.execute({ workflow: 'fix' })).instructions,
    /fix/,
  );
  policy(
    f.root,
    'configure',
    { revision: 0, settings: { enabled: true, rules: ['git-discard'] } },
    f.options,
  );
  await assert.rejects(
    () =>
      plugin['tool.execute.before'](
        { tool: 'bash', sessionID: 's', callID: 'x' },
        { args: { command: 'git reset --hard' } },
      ),
    /just-vibe/,
  );
  await plugin.event({ event: { type: 'session.idle', properties: { sessionID: 's' } } });
});
test('Zed and Hermes payloads preserve other skills through lifecycle', (t) => {
  for (const target of ['zed', 'hermes']) {
    const f = fixture(t),
      folder = target === 'zed' ? '.agents/skills' : 'skills';
    mkdirSync(join(f.root, folder, 'mine'), { recursive: true });
    writeFileSync(join(f.root, folder, 'mine/SKILL.md'), 'user');
    adapters(f.root, 'install', { target, profile: 'core' });
    adapters(f.root, 'update', { target });
    assert.equal(adapters(f.root, 'doctor', { target }).conflicts.length, 0);
    adapters(f.root, 'uninstall', { target });
    assert.equal(readFileSync(join(f.root, folder, 'mine/SKILL.md'), 'utf8'), 'user');
  }
});
function githubFixture() {
  const issue = {
      number: 7,
      title: 'Build feature',
      body: 'User body stays unchanged',
      updated_at: '2026-01-01',
      state: 'open',
      html_url: 'https://github.com/example/project/issues/7',
    },
    comments = [],
    writes = [];
  let failAfterWrite = false;
  const api = async (method, path, body) => {
    if (path === 'user') return { login: 'owner' };
    if (path.endsWith('/permission')) return { permission: 'admin' };
    if (method === 'POST') {
      writes.push(body);
      comments.push({
        id: comments.length + 1,
        body: body.body,
        user: { login: 'owner' },
        author_association: 'OWNER',
        updated_at: String(comments.length),
      });
      if (failAfterWrite) throw Error('Network outcome unknown');
      return comments.at(-1);
    }
    if (path.includes('/comments?')) return structuredClone(comments);
    return structuredClone(issue);
  };
  return {
    api,
    issue,
    comments,
    writes,
    fail: () => {
      failAfterWrite = true;
    },
  };
}
test('epic preview is read-only, stale remote changes stop publication, recovery deduplicates uncertain writes', async (t) => {
  const f = fixture(t),
    remote = githubFixture(),
    options = { ...f.options, api: remote.api },
    id = 'feature';
  let state = await epic(
    f.root,
    'sync',
    { id, repo: 'example/project', issue: 7, revision: 0 },
    options,
  );
  state = await epic(
    f.root,
    'plan',
    { id, revision: state.revision, action: 'claim', summary: 'I am working on this feature.' },
    options,
  );
  assert.equal(remote.writes.length, 0);
  const original = remote.issue.body,
    hash = state.epics[id].plan.planHash;
  remote.issue.title = 'Changed title';
  await assert.rejects(
    () => epic(f.root, 'publish', { id, revision: state.revision, planHash: hash }, options),
    /changed after preview/,
  );
  state = await epic(
    f.root,
    'plan',
    { id, revision: state.revision, action: 'claim', summary: 'I am working on this feature.' },
    options,
  );
  remote.fail();
  await assert.rejects(
    () =>
      epic(
        f.root,
        'publish',
        { id, revision: state.revision, planHash: state.epics[id].plan.planHash },
        options,
      ),
    /unknown/,
  );
  state = await epic(f.root, 'list', {}, options);
  state = await epic(
    f.root,
    'recover',
    { id, revision: state.revision, planHash: state.epics[id].plan.planHash },
    options,
  );
  assert.equal(state.epics[id].plan.status, 'published');
  assert.equal(remote.writes.length, 1);
  assert.equal(remote.issue.body, original);
});
test('epic dependencies reject cycles and unfinished prerequisites', async (t) => {
  const f = fixture(t),
    remote = githubFixture(),
    options = { ...f.options, api: remote.api },
    id = 'work';
  let state = await epic(
    f.root,
    'sync',
    { id, repo: 'example/project', issue: 7, revision: 0 },
    options,
  );
  await assert.rejects(
    () =>
      epic(
        f.root,
        'plan',
        {
          id,
          revision: state.revision,
          action: 'decompose',
          summary: 'Tasks',
          tasks: [{ id: 'a', title: 'A', dependsOn: ['a'] }],
        },
        options,
      ),
    /cycle/,
  );
  state = await epic(
    f.root,
    'plan',
    {
      id,
      revision: state.revision,
      action: 'decompose',
      summary: 'Tasks',
      tasks: [
        { id: 'a', title: 'A', dependsOn: [] },
        { id: 'b', title: 'B', dependsOn: ['a'] },
      ],
    },
    options,
  );
  state = await epic(
    f.root,
    'publish',
    { id, revision: state.revision, planHash: state.epics[id].plan.planHash },
    options,
  );
  await assert.rejects(
    () =>
      epic(
        f.root,
        'plan',
        {
          id,
          revision: state.revision,
          action: 'progress',
          summary: 'Start B',
          task: 'b',
          status: 'active',
        },
        options,
      ),
    /prerequisites/,
  );
});
test('security reports redact secrets and provide real SARIF/CI failure controls', async (t) => {
  const f = fixture(t);
  const secret = `sk-${'a'.repeat(30)}`;
  writeFileSync(
    join(f.root, '.mcp.json'),
    JSON.stringify({
      mcpServers: {
        test: {
          command: 'node',
          args: ['server.js'],
          env: { API_KEY: secret, NODE_TLS_REJECT_UNAUTHORIZED: '0' },
        },
      },
    }),
  );
  const report = await securityAudit(
    f.root,
    'report',
    { format: 'sarif', failOn: 'high' },
    f.options,
  );
  assert.equal(report.exitCode, 2);
  assert.equal(report.report.version, '2.1.0');
  assert.doesNotMatch(JSON.stringify(report), new RegExp(secret));
  assert.ok(report.report.runs[0].results.some((f) => f.ruleId === 'tls-verification-disabled'));
  let output = '';
  const code = await main(['audit', 'report', '--root', f.root, '--stdin'], {
    input: async () => JSON.stringify({ format: 'markdown' }),
    log: (text) => (output = text),
  });
  assert.equal(code, 2);
  assert.match(output, /^# Agent configuration audit/);
});
test('external scanner identity must be explicitly trusted and changes revoke execution', async (t) => {
  const f = fixture(t),
    binary = join(f.dir, 'agentshield');
  writeFileSync(binary, 'reviewed bytes');
  const sha256 = createHash('sha256').update('reviewed bytes').digest('hex');
  let calls = 0;
  const options = {
    ...f.options,
    run: async (argv) => {
      calls++;
      return {
        status: 0,
        stdout: argv.includes('--version') ? '1.2.3' : JSON.stringify({ findings: [] }),
        stderr: '',
      };
    },
  };
  let state = await securityAudit(
    f.root,
    'configure',
    { revision: 0, binary, sha256, version: '1.2.3', source: 'https://example.test/release/1.2.3' },
    options,
  );
  await assert.rejects(() => securityAudit(f.root, 'run', {}, options), /trusted/);
  assert.equal(calls, 0);
  state = await securityAudit(f.root, 'trust', { revision: state.revision, sha256 }, options);
  assert.equal((await securityAudit(f.root, 'run', {}, options)).failed, false);
  assert.equal(calls, 2);
  writeFileSync(binary, 'different');
  await assert.rejects(() => securityAudit(f.root, 'run', {}, options), /changed/);
  assert.equal(calls, 2);
});
test('framework methods are reachable from applicable workflows without adding duplicate skills', () => {
  const catalog = loadCatalog();
  for (const id of ['build', 'fix', 'review', 'test']) {
    const guides = catalog.commands.find((c) => c.id === id).guides;
    for (const framework of ['django', 'fastapi', 'spring-boot', 'flutter', 'react-native'])
      assert.ok(guides.some((g) => g.path === `references/frameworks/${framework}.md`));
  }
});

test('statusline metrics reach the next tool warning, and patch paths count once across spellings', (t) => {
  const f = fixture(t, true);
  const statusline = spawnSync(
    process.execPath,
    ['plugins/just-vibe/scripts/context-statusline.mjs'],
    {
      env: { ...process.env, JUST_VIBE_HOME: f.home },
      encoding: 'utf8',
      input: JSON.stringify({
        cwd: f.root,
        session_id: 'line',
        context_window: { remaining_percentage: 8 },
      }),
    },
  );
  assert.equal(statusline.status, 0, statusline.stderr);
  assert.match(statusline.stdout, /remaining 8%/);
  contextHealth(
    f.root,
    'configure',
    {
      revision: contextHealth(f.root, 'status', {}, f.options).revision,
      settings: { changedFiles: 2 },
    },
    f.options,
  );
  const result = healthHook(
    {
      cwd: f.root,
      session_id: 'line',
      hook_event_name: 'PostToolUse',
      tool_name: 'apply_patch',
      tool_input: `*** Update File: app.js\n*** Update File: ${f.root}/app.js\n*** Add File: other.js\n`,
    },
    { ...f.options, host: 'claude' },
  );
  assert.equal(result.observedFiles, 2);
  assert.deepEqual(
    result.warnings.map((w) => w.type),
    ['context', 'scope'],
  );
  assert.doesNotMatch(JSON.stringify(contextHealth(f.root, 'status', {}, f.options)), /other\.js/);
});

test('commit checks resolve subdirectories and reject a different tool working directory', async (t) => {
  const f = fixture(t, true);
  mkdirSync(join(f.root, 'src'));
  manageHooks(
    f.root,
    'configure',
    {
      schemaVersion: 1,
      revision: 0,
      enabled: true,
      saveSummary: false,
      commit: true,
      checks: [],
      formatters: [],
    },
    f.options,
  );
  manageHooks(f.root, 'trust', {}, f.options);
  writeFileSync(join(f.root, 'app.js'), '<<<<<<< unresolved\n');
  f.git('add', 'app.js');
  const event = {
    cwd: join(f.root, 'src'),
    hook_event_name: 'PreToolUse',
    tool_name: 'exec_command',
    tool_input: { cmd: 'git commit -m change' },
  };
  assert.equal(
    (await commitQualityHook(event, f.options)).hookSpecificOutput.permissionDecision,
    'deny',
  );
  assert.equal(
    (
      await commitQualityHook(
        { ...event, tool_input: { ...event.tool_input, workdir: f.dir } },
        { ...f.options, projectRoot: f.root },
      )
    ).hookSpecificOutput.permissionDecision,
    'deny',
  );
  writeFileSync(join(f.root, 'app.js'), 'const safe = true;\n');
  f.git('add', 'app.js');
  assert.deepEqual(await commitQualityHook(event, f.options), {});
  for (const command of [
    'git commit -am change',
    'git commit --all -m change',
    'git commit -m change -- app.js',
    'git add app.js && git commit -m change',
  ])
    assert.equal(
      (await commitQualityHook({ ...event, tool_input: { cmd: command } }, f.options))
        .hookSpecificOutput.permissionDecision,
      'deny',
    );
});

test('Cursor delivers routing once and formats subdirectory paths; OpenCode idle runs trusted batches', async (t) => {
  const f = fixture(t, true);
  mkdirSync(join(f.root, 'src'));
  writeFileSync(join(f.root, 'src/view.js'), 'let a=1;');
  manageHooks(
    f.root,
    'configure',
    {
      schemaVersion: 1,
      revision: 0,
      enabled: true,
      saveSummary: false,
      batch: true,
      checks: [],
      formatters: [
        { name: 'fmt', command: ['fmt', '{file}'], extensions: ['.js'], timeoutMs: 1000 },
      ],
    },
    f.options,
  );
  manageHooks(f.root, 'trust', {}, f.options);
  const calls = [],
    options = {
      ...f.options,
      run: async (argv) => {
        calls.push(argv);
        return { status: 0, stdout: '', stderr: '' };
      },
    };
  const base = { conversation_id: 'cursor', cwd: join(f.root, 'src') };
  await cursorEvent(
    f.root,
    { ...base, hook_event_name: 'beforeSubmitPrompt', prompt: 'Fix the failing test in view.js' },
    options,
  );
  const event = {
    ...base,
    hook_event_name: 'postToolUse',
    tool_name: 'StrReplace',
    tool_input: { file_path: 'view.js' },
  };
  assert.match((await cursorEvent(f.root, event, options)).additional_context, /Task ID:/);
  assert.doesNotMatch((await cursorEvent(f.root, event, options)).additional_context, /Task ID:/);
  await cursorEvent(f.root, { ...base, hook_event_name: 'stop', status: 'completed' }, options);
  assert.deepEqual(calls[0], ['fmt', join(f.root, 'src/view.js')]);
  const tool = (spec) => spec;
  tool.schema = { string: () => ({ type: 'string' }) };
  const plugin = await createOpenCodePlugin(tool, options)({ directory: f.root, worktree: f.root });
  await plugin['tool.execute.after'](
    {
      tool: 'edit',
      sessionID: 'opencode',
      callID: 'call',
      args: { filePath: join(f.root, 'src/view.js') },
    },
    { output: 'edited' },
  );
  await plugin.event({ event: { type: 'session.idle', properties: { sessionID: 'opencode' } } });
  assert.equal(calls.length, 2);
});

test('fragment recovery preserves unrelated settings and detects concurrent manual changes', (t) => {
  const f = fixture(t),
    path = '.cursor/hooks.json',
    desired = { stop: [{ command: 'node mine.js' }] };
  managedFragment(f.root, 'cursor-hooks', path, 'json', desired, 'install');
  const full = join(f.root, path),
    before = readFileSync(full, 'utf8');
  const data = JSON.parse(before);
  data.foreign = true;
  const after = JSON.stringify(data, null, 2) + '\n';
  const journal = join(f.root, '.just-vibe/installations/cursor-hooks-fragment-pending.json');
  writeFileSync(
    journal,
    JSON.stringify({
      revision: 1,
      path,
      beforeHash: digest(before),
      afterHash: digest(after),
      after,
      next: { fragment: desired, created: true },
    }),
  );
  assert.equal(
    managedFragment(f.root, 'cursor-hooks', path, 'json', desired, 'doctor').interrupted,
    true,
  );
  managedFragment(f.root, 'cursor-hooks', path, 'json', desired, 'update');
  assert.equal(JSON.parse(readFileSync(full)).foreign, true);
  writeFileSync(
    journal,
    JSON.stringify({
      revision: 1,
      path,
      beforeHash: digest(before),
      afterHash: digest(after),
      after,
      next: { fragment: desired, created: true },
    }),
  );
  writeFileSync(full, JSON.stringify({ ...data, newManualField: 'preserve' }));
  assert.throws(
    () => managedFragment(f.root, 'cursor-hooks', path, 'json', desired, 'update'),
    /recovery/,
  );
  assert.equal(JSON.parse(readFileSync(full)).newManualField, 'preserve');
});

test('epic conflicts, orphan records and changed accounts cannot publish; absent uncertain writes require explicit resolution', async (t) => {
  const f = fixture(t),
    remote = githubFixture(),
    options = { ...f.options, api: remote.api },
    id = 'coord';
  let state = await epic(
    f.root,
    'sync',
    { id, repo: 'example/project', issue: 7, revision: 0 },
    options,
  );
  state = await epic(
    f.root,
    'plan',
    { id, revision: state.revision, action: 'claim', summary: 'Own the task' },
    options,
  );
  const input = { id, revision: state.revision, planHash: state.epics[id].plan.planHash };
  await assert.rejects(
    () =>
      epic(f.root, 'publish', input, {
        ...options,
        api: (method, path, body) =>
          path === 'user' ? { login: 'different' } : remote.api(method, path, body),
      }),
    /account changed/,
  );
  await assert.rejects(
    () =>
      epic(f.root, 'publish', input, {
        ...options,
        api: (method, path, body) => {
          if (method === 'POST') throw Error('No response');
          return remote.api(method, path, body);
        },
      }),
    /No response/,
  );
  state = await epic(f.root, 'list', {}, options);
  await assert.rejects(
    () =>
      epic(
        f.root,
        'plan',
        { id, revision: state.revision, action: 'claim', summary: 'Retry' },
        options,
      ),
    /uncertain/,
  );
  state = await epic(
    f.root,
    'reconcile',
    {
      ...input,
      revision: state.revision,
      resolution: 'not-published',
      reason: 'User inspected the request outcome and confirmed that no comment was posted.',
    },
    options,
  );
  assert.equal(state.epics[id].plan, undefined);
  assert.equal(remote.writes.length, 0);
  state = await epic(
    f.root,
    'plan',
    { id, revision: state.revision, action: 'claim', summary: 'Own the task' },
    options,
  );
  const original = state.epics[id].plan.body;
  await remote.api('POST', 'comments', { body: original });
  const record = JSON.parse(original.split('\n')[1]);
  record.operationId = 'f'.repeat(64);
  await remote.api('POST', 'comments', {
    body: `<!-- just-vibe-epic-v1\n${JSON.stringify(record)}\n-->\nConflict\n`,
  });
  state = await epic(f.root, 'sync', { id, revision: state.revision }, options);
  assert.equal(state.epics[id].snapshot.conflicts.length, 1);
  await assert.rejects(
    () =>
      epic(
        f.root,
        'plan',
        { id, revision: state.revision, action: 'release', summary: 'Release' },
        options,
      ),
    /conflicts/,
  );
  remote.comments.splice(0);
  record.parent = 'a'.repeat(64);
  await remote.api('POST', 'comments', {
    body: `<!-- just-vibe-epic-v1\n${JSON.stringify(record)}\n-->\nOrphan\n`,
  });
  state = await epic(f.root, 'sync', { id, revision: state.revision }, options);
  assert.equal(state.epics[id].snapshot.owner, null);
  assert.ok(state.epics[id].snapshot.invalid.length);
});

test('malformed configuration fails the audit gate and new MCP tools preserve read-only boundaries', async (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, '.mcp.json'), '{ malformed');
  assert.equal((await securityAudit(f.root, 'report', {}, f.options)).exitCode, 2);
  await assert.rejects(
    () => securityAudit(f.root, 'report', { failOn: 'toString' }, f.options),
    /controls/,
  );
  const server = createMcpServer(f.root, { ...f.options, allowWrite: false });
  await server({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'fixture', version: '1' },
    },
  });
  await server({ jsonrpc: '2.0', method: 'notifications/initialized' });
  const list = await server({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  const names = list.result.tools.map((tool) => tool.name);
  for (const name of ['context_health', 'quality_preview', 'security_report', 'epic_read'])
    assert.ok(names.includes(name));
  for (const name of ['quality_commit_check', 'epic_prepare']) assert.ok(!names.includes(name));
  const invalid = await server({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'quality_preview', arguments: { batch: 'yes' } },
  });
  assert.equal(invalid.result.isError, true);
});

test(
  'external audit executes a reviewed local protocol fixture and redacts its report',
  {
    skip:
      process.platform === 'win32'
        ? 'POSIX executable fixture; Windows process shims are covered separately'
        : false,
  },
  async (t) => {
    const f = fixture(t),
      binary = join(f.dir, 'scanner'),
      secret = `sk-${'z'.repeat(30)}`;
    const source = `#!${process.execPath}\nif (process.argv.includes('--version')) console.log('1.2.3'); else { console.log(JSON.stringify({findings:[{ruleId:'credential',severity:'high',file:'../outside',message:${JSON.stringify(`Possible ${secret}`)},remediation:'Use environment configuration'}]})); process.exitCode=2; }\n`;
    writeFileSync(binary, source);
    chmodSync(binary, 0o700);
    const sha256 = digest(source);
    const state = await securityAudit(
      f.root,
      'configure',
      {
        revision: 0,
        binary,
        sha256,
        version: '1.2.3',
        source: 'https://example.test/fixture/1.2.3',
      },
      f.options,
    );
    await securityAudit(f.root, 'trust', { revision: state.revision, sha256 }, f.options);
    const result = await securityAudit(f.root, 'run', {}, f.options);
    assert.equal(result.exitCode, 2);
    assert.equal(result.report.findings[0].file, 'external-report');
    assert.doesNotMatch(JSON.stringify(result), new RegExp(secret));
    assert.match(result.report.findings[0].message, /REDACTED/);
  },
);

test('deep scanner protocol separates JSON artifacts from terminal analysis and never converts an Opus failure into a pass', async (t) => {
  const f = fixture(t),
    binary = join(f.dir, 'reviewed-scanner');
  writeFileSync(binary, 'reviewed fixture');
  const sha256 = digest('reviewed fixture');
  const state = await securityAudit(
    f.root,
    'configure',
    { revision: 0, binary, sha256, version: '1.6.0', source: 'https://example.test/scanner/1.6.0' },
    f.options,
  );
  await securityAudit(f.root, 'trust', { revision: state.revision, sha256 }, f.options);
  let failed = false,
    outputPath;
  const options = {
    ...f.options,
    run: async (argv) => {
      if (argv.includes('--version')) return { status: 0, stdout: '1.6.0', stderr: '' };
      assert.ok(argv.includes('--opus'));
      assert.ok(!argv.includes('--deep'));
      assert.ok(!argv.includes('--fix'));
      outputPath = argv[argv.indexOf('--output') + 1];
      writeFileSync(outputPath, JSON.stringify({ findings: [] }));
      writeFileSync(
        argv[argv.indexOf('--log') + 1],
        JSON.stringify([
          {
            phase: 'opus',
            level: failed ? 'error' : 'info',
            message: failed ? 'Opus failed: unavailable' : 'Opus analysis complete',
          },
        ]),
      );
      return {
        status: 0,
        stdout: 'External analysis text',
        stderr: failed ? 'Opus analysis failed' : '',
      };
    },
  };
  let result = await securityAudit(f.root, 'run', { deep: true }, options);
  assert.equal(result.report.deepAnalysis.status, 'completed');
  assert.equal(result.exitCode, 0);
  assert.ok(!existsSync(outputPath));
  failed = true;
  result = await securityAudit(f.root, 'run', { deep: true, format: 'sarif' }, options);
  assert.equal(result.exitCode, 2);
  assert.equal(result.report.runs[0].invocations[0].executionSuccessful, false);
});
