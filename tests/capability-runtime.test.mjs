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
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  inventory,
  parseConfiguration,
} from '../plugins/just-vibe/scripts/lib/config-inventory.mjs';
import { sessions, parseSession } from '../plugins/just-vibe/scripts/lib/native-sessions.mjs';
import { behaviorRules, behaviorHook } from '../plugins/just-vibe/scripts/lib/behavior-rules.mjs';
import { investigationHook } from '../plugins/just-vibe/scripts/lib/investigation.mjs';
import { mcpHealth } from '../plugins/just-vibe/scripts/lib/mcp-health.mjs';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { portfolio } from '../plugins/just-vibe/scripts/lib/skill-portfolio.mjs';
import { platformRuntime } from '../plugins/just-vibe/scripts/lib/platform-runtime.mjs';

function fixture(t) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'jv-capability-'))),
    root = join(dir, 'project'),
    home = join(dir, 'home');
  mkdirSync(root);
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return { dir, root, options: { home } };
}
test('inventory understands literal host configs, reports incomplete TOML and never exposes credentials', (t) => {
  const f = fixture(t);
  mkdirSync(join(f.root, '.codex'));
  writeFileSync(
    join(f.root, '.codex/config.toml'),
    '[mcp_servers.demo]\ncommand = "node"\nargs = ["server.js"]\n[mcp_servers.demo.env]\nSECRET = "hidden-secret"\n',
  );
  writeFileSync(
    join(f.root, '.mcp.json'),
    JSON.stringify({
      mcpServers: {
        demo: {
          url: 'https://example.test/mcp?token=hidden-query',
          headers: { Authorization: 'Bearer hidden-header' },
        },
      },
    }),
  );
  const r = inventory(f.root, 'scan', {}, f.options);
  assert.equal(r.servers.length, 2);
  assert.equal(r.serverConflicts.length, 1);
  assert.doesNotMatch(JSON.stringify(r), /hidden-secret|hidden-query|hidden-header/);
  assert.equal(r.servers[0].authenticated, 'unknown');
  assert.equal(parseConfiguration('[[hooks.Stop]]\na = 1', '.toml').partial, true);
  symlinkSync(join(f.root, '.mcp.json'), join(f.root, '.lsp.json'));
  assert.equal(inventory(f.root, 'scan', {}, f.options).partial, true);
});
test('configuration disable/restore rejects stale previews and intervening edits', (t) => {
  const f = fixture(t),
    path = join(f.root, '.mcp.json');
  writeFileSync(path, '{}');
  let p = inventory(
    f.root,
    'preview',
    { id: 'remove-demo', revision: 0, path: '.mcp.json', reason: 'Remove duplicate declarations' },
    f.options,
  );
  writeFileSync(path, '{ "new": true }');
  assert.throws(
    () => inventory(f.root, 'apply', { id: p.id, revision: p.revision, hash: p.hash }, f.options),
    /changed/,
  );
  writeFileSync(path, '{}');
  p = inventory(f.root, 'apply', { id: p.id, revision: p.revision, hash: p.hash }, f.options);
  assert.equal(existsSync(path), false);
  writeFileSync(path, '{}');
  assert.throws(
    () => inventory(f.root, 'restore', { id: p.id, revision: p.revision, hash: p.hash }, f.options),
    /overwrite/,
  );
  rmSync(path);
  p = inventory(f.root, 'restore', { id: p.id, revision: p.revision, hash: p.hash }, f.options);
  assert.equal(p.status, 'restored');
  assert.equal(readFileSync(path, 'utf8'), '{}');
});
test('session adapters exclude reasoning, handle corrupt lines and isolate projects', (t) => {
  const f = fixture(t);
  const source =
    [
      { type: 'session_meta', payload: { id: 's1', cwd: f.root } },
      { type: 'response_item', payload: { type: 'reasoning', content: 'private-thought' } },
      {
        type: 'response_item',
        payload: {
          type: 'message',
          role: 'assistant',
          content: [
            { type: 'output_text', text: 'Visible summary' },
            { type: 'thinking', text: 'hidden' },
          ],
        },
      },
    ]
      .map(JSON.stringify)
      .join('\n') + '\n{bad';
  const parsed = parseSession(source, 'codex');
  assert.equal(parsed.malformed, 1);
  assert.equal(parsed.messages.length, 1);
  assert.doesNotMatch(JSON.stringify(parsed), /private-thought|hidden/);
  writeFileSync(join(f.root, 'session.jsonl'), source);
  let r = sessions(
    f.root,
    'import',
    { id: 'native', revision: 0, host: 'codex', path: 'session.jsonl' },
    f.options,
  );
  assert.equal(r.sourceBound, true);
  sessions(f.root, 'alias', { alias: 'work', id: r.id, revision: 0 }, f.options);
  assert.equal(sessions(f.root, 'resume', { id: 'work' }, f.options).sourceFresh, true);
  writeFileSync(join(f.root, 'session.jsonl'), source.replace(f.root, f.dir));
  assert.throws(
    () =>
      sessions(
        f.root,
        'import',
        { id: 'foreign', revision: 0, host: 'codex', path: 'session.jsonl' },
        f.options,
      ),
    /different project/,
  );
  assert.equal(sessions(f.root, 'search', { query: 'visible' }, f.options).total, 1);
});
test('behavior rules combine conditions and prevent stop loops; strict requires fresh reads', (t) => {
  const f = fixture(t);
  let state = behaviorRules(
    f.root,
    'save',
    {
      revision: 0,
      rule: {
        id: 'no-force',
        event: 'command',
        action: 'block',
        enabled: true,
        conditions: [
          { field: 'command', operator: 'contains', value: 'push' },
          { field: 'command', operator: 'glob', value: '*--force*' },
        ],
        message: 'Review the remote branch first.',
      },
    },
    f.options,
  );
  const base = {
    cwd: f.root,
    session_id: 's1',
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git push --force' },
  };
  assert.equal(behaviorHook(base, f.options).hookSpecificOutput.permissionDecision, 'deny');
  assert.deepEqual(behaviorHook({ ...base, tool_input: { command: 'git push' } }, f.options), {});
  assert.throws(
    () => behaviorRules(f.root, 'save', { revision: 0, rule: state.rules[0] }, f.options),
    /revision/,
  );
  behaviorRules(f.root, 'preset', { revision: 0, profile: 'strict' }, f.options);
  writeFileSync(join(f.root, 'app.js'), 'old');
  const edit = { ...base, tool_name: 'Edit', tool_input: { file_path: 'app.js' } };
  assert.equal(investigationHook(edit, f.options).hookSpecificOutput.permissionDecision, 'deny');
  investigationHook({ ...edit, hook_event_name: 'PostToolUse', tool_name: 'Read' }, f.options);
  assert.deepEqual(investigationHook(edit, f.options), {});
  writeFileSync(join(f.root, 'app.js'), 'changed');
  assert.equal(investigationHook(edit, f.options).hookSpecificOutput.permissionDecision, 'deny');
});
test('MCP health classifies authentication, honors backoff and never forwards configured credentials', async (t) => {
  const f = fixture(t);
  writeFileSync(
    join(f.root, '.mcp.json'),
    JSON.stringify({
      mcpServers: {
        demo: { url: 'https://example.test/mcp', headers: { Authorization: 'Bearer private' } },
      },
    }),
  );
  const server = inventory(f.root, 'scan', {}, f.options).servers[0];
  let count = 0;
  const options = {
    ...f.options,
    fetch: async (url, init) => {
      count++;
      assert.equal(init.headers.Authorization, undefined);
      return new Response('', { status: 401 });
    },
  };
  const p = { key: server.key, configHash: server.configHash, revision: 0 };
  let r = await mcpHealth(f.root, 'probe', p, options);
  assert.equal(r.server.category, 'authentication');
  r = await mcpHealth(f.root, 'probe', { ...p, revision: r.revision }, options);
  assert.equal(r.attempted, false);
  assert.equal(count, 1);
  assert.doesNotMatch(JSON.stringify(r), /Bearer private/);
});
test('trusted runners bind executable and source hashes, reject stale trust and bound execution', async (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, 'run.mjs'), 'console.log("fixture passed")');
  let r = await runners(
    f.root,
    'configure',
    {
      id: 'fixture',
      revision: 0,
      config: { command: [process.execPath, 'run.mjs'], purpose: 'Run isolated fixture' },
    },
    f.options,
  );
  const hash = r.runners[0].hash;
  await assert.rejects(runners(f.root, 'run', { id: 'fixture', hash }, f.options), /trust/);
  r = await runners(f.root, 'trust', { id: 'fixture', hash, revision: r.revision }, f.options);
  assert.equal((await runners(f.root, 'run', { id: 'fixture', hash }, f.options)).passed, true);
  writeFileSync(join(f.root, 'run.mjs'), 'console.log("changed")');
  await assert.rejects(runners(f.root, 'run', { id: 'fixture', hash }, f.options), /identity/);
});
test('skill portfolio distinguishes unobserved use and source changes; families dispatch', async (t) => {
  const f = fixture(t);
  mkdirSync(join(f.root, '.agents/skills/demo'), { recursive: true });
  writeFileSync(
    join(f.root, '.agents/skills/demo/SKILL.md'),
    '---\nname: demo\ndescription: Review one thing\n---\n[Missing](missing.md)',
  );
  const scan = portfolio(f.root, 'scan', {}, f.options);
  assert.equal(scan.skills[0].observedUse, 'unknown');
  assert.ok(scan.skills[0].findings.includes('broken-local-reference'));
  portfolio(f.root, 'record', { revision: 0 }, f.options);
  writeFileSync(
    join(f.root, '.agents/skills/demo/SKILL.md'),
    '---\nname: demo\ndescription: Updated trigger\n---\nUpdated',
  );
  assert.equal(portfolio(f.root, 'scan', {}, f.options).skills[0].changed, true);
  assert.equal(
    (await platformRuntime('inventory', f.root, 'scan', {}, f.options)).skills.length,
    1,
  );
});
