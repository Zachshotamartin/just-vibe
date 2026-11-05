import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { workers, workerCommand } from '../plugins/just-vibe/scripts/lib/workers.mjs';
import { specialist } from '../plugins/just-vibe/scripts/lib/specialists.mjs';
import { sandboxSettings, validateSandbox, hostSandboxArgs, workerEnvironment, appliedSandbox } from '../plugins/just-vibe/scripts/lib/worker-sandbox.mjs';
import { seatbeltProfile, bubblewrapArgs, osSandboxSupport, wrapCommand } from '../plugins/just-vibe/scripts/lib/os-sandbox.mjs';

const catalog = loadCatalog();
const settings = (state) => validateSandbox(sandboxSettings(state));

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'jv-sandbox-')), root = join(dir, 'project');
  mkdirSync(root);
  writeFileSync(join(root, 'app.js'), 'export const value = 1;\n');
  writeFileSync(join(root, '.gitignore'), '.just-vibe/\n');
  for (const args of [['init', '-q'], ['config', 'user.name', 'Fixture'], ['config', 'user.email', 'fixture@example.test'], ['add', '.'], ['commit', '-qm', 'feat: initial']])
    execFileSync('git', args, { cwd: root });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return { dir, root, options: { home: join(dir, 'home'), catalog } };
}

async function finished(f, id) {
  for (let n = 0; n < 200; n++) {
    const job = (await workers(f.root, 'status', {}, f.options)).jobs.find(j => j.id === id);
    if (['completed', 'failed', 'cancelled', 'expired'].includes(job.state)) return job;
    await new Promise(r => setTimeout(r, 50));
  }
  throw Error('Sandboxed worker fixture did not finish.');
}

test('worker sandbox settings validate levels, networks and env policies', () => {
  assert.deepEqual(sandboxSettings({}), { level: 'standard', network: 'default', env: 'inherit' });
  assert.equal(sandboxSettings({ sandbox: 'host' }).env, 'minimal');
  assert.deepEqual(settings({ sandbox: 'host', network: { allow: ['registry.npmjs.org', '*.github.com'] } }).network.allow.length, 2);
  for (const [state, message] of [
    [{ sandbox: 'container' }, /standard, host or os/],
    [{ sandbox: 'host', env: 'none' }, /inherit or minimal/],
    [{ sandbox: 'host', network: 'all' }, /none, default/],
    [{ sandbox: 'host', network: { allow: [] } }, /1-50 domain/],
    [{ sandbox: 'host', network: { allow: ['example.com/path'] } }, /domain/],
    [{ sandbox: 'host', network: { allow: ['example.com"},"x":{"'] } }, /domain/],
    [{ sandbox: 'host', network: { allow: ['ok.example'], deny: ['x.example'] } }, /domain/],
    [{ network: 'none' }, /set sandbox to host or os/],
  ]) assert.throws(() => settings(state), message, JSON.stringify(state));
});

test('host level adds each CLI sandbox flag and keeps the prompt marker last for Codex', () => {
  const apply = specialist('implementer'), inspect = specialist('reviewer');
  assert.deepEqual(hostSandboxArgs('codex', 'apply', settings({})), []);
  const codex = workerCommand('codex', apply, settings({ sandbox: 'host', network: 'none' }));
  assert.equal(codex.at(-1), '-');
  assert.equal(codex.at(-2), 'sandbox_workspace_write.network_access=false');
  assert.throws(() => workerCommand('codex', apply, settings({ sandbox: 'host', network: { allow: ['example.com'] } })), /Claude worker/);
  const claude = workerCommand('claude', apply, settings({ sandbox: 'host', network: { allow: ['registry.npmjs.org'] } }));
  const sandbox = JSON.parse(claude[claude.indexOf('--settings') + 1]).sandbox;
  assert.deepEqual(sandbox, { enabled: true, autoAllowBashIfSandboxed: true, allowUnsandboxedCommands: false, failIfUnavailable: true, network: { allowedDomains: ['registry.npmjs.org'] } });
  const none = workerCommand('claude', apply, settings({ sandbox: 'host', network: 'none' }));
  assert.deepEqual(JSON.parse(none[none.indexOf('--settings') + 1]).sandbox.network, { allowedDomains: [] });
  assert.ok(!workerCommand('claude', inspect, settings({ sandbox: 'host' })).includes('--settings'));
});

test('on macOS the os level replaces the CLI sandbox, which cannot nest, and refuses network limits', () => {
  const os = settings({ sandbox: 'os' }), apply = specialist('implementer'), inspect = specialist('reviewer');
  const codex = workerCommand('codex', inspect, os, 'darwin');
  assert.equal(codex[codex.indexOf('--sandbox') + 1], 'danger-full-access');
  assert.ok(!codex.includes('sandbox_workspace_write.network_access=true'));
  assert.ok(!workerCommand('claude', apply, os, 'darwin').includes('--settings'));
  assert.equal(appliedSandbox('codex', 'apply', os, 'macos-seatbelt', 'darwin').host, 'replaced-by-os');
  const linux = workerCommand('codex', apply, validateSandbox(sandboxSettings({ sandbox: 'os', network: 'none' }), 'linux'), 'linux');
  assert.equal(linux[linux.indexOf('--sandbox') + 1], 'workspace-write');
  assert.ok(linux.includes('sandbox_workspace_write.network_access=false'));
  assert.ok(workerCommand('claude', apply, os, 'linux').includes('--settings'));
  assert.throws(() => validateSandbox(sandboxSettings({ sandbox: 'os', network: 'none' }), 'darwin'), /cannot limit network/);
  assert.doesNotThrow(() => validateSandbox(sandboxSettings({ sandbox: 'os', network: 'none' }), 'linux'));
  assert.ok(!workerCommand('codex', inspect).includes('danger-full-access'));
});

test('minimal worker env keeps runtime and the host CLI auth, and drops other credentials', () => {
  const env = { PATH: '/bin', HOME: '/home/u', LANG: 'C', LC_ALL: 'C', HTTPS_PROXY: 'http://proxy', ANTHROPIC_API_KEY: 'a', CLAUDE_CONFIG_DIR: '/c', OPENAI_API_KEY: 'o', AWS_SECRET_ACCESS_KEY: 's', GITHUB_TOKEN: 'g', NPM_TOKEN: 'n' };
  assert.deepEqual(Object.keys(workerEnvironment('claude', 'minimal', env)).sort(), ['ANTHROPIC_API_KEY', 'CLAUDE_CONFIG_DIR', 'HOME', 'HTTPS_PROXY', 'LANG', 'LC_ALL', 'PATH']);
  assert.deepEqual(Object.keys(workerEnvironment('codex', 'minimal', env)).sort(), ['HOME', 'HTTPS_PROXY', 'LANG', 'LC_ALL', 'OPENAI_API_KEY', 'PATH']);
  assert.deepEqual(workerEnvironment('codex', 'inherit', env), env);
});

test('seatbelt paths travel as parameters, so hostile path text never becomes profile syntax', () => {
  const hostile = '/tmp/x") (allow file-write* (subpath "/';
  const { profile, params } = seatbeltProfile({ writable: [hostile], prefixes: ['/h/.claude.json'], denyRead: ['/h/.ssh'] });
  assert.ok(!profile.includes(hostile));
  assert.ok(params.includes(`WRITE_0=${hostile}`));
  assert.match(profile, /\(prefix \(param "STATE_0"\)\)/);
  assert.match(profile, /\(deny file-read\* file-write\* \(subpath \(param "SECRET_0"\)\)\)/);
  assert.throws(() => seatbeltProfile({ writable: ['/tmp/a\nb'], denyRead: [] }), /control characters/);
});

test('bubblewrap arguments bind writable paths and hide existing credentials', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'jv-bwrap-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'work')); mkdirSync(join(dir, '.ssh')); writeFileSync(join(dir, '.netrc'), 'machine x');
  const args = bubblewrapArgs({ writable: [join(dir, 'work'), join(dir, 'missing')], denyRead: [join(dir, '.ssh'), join(dir, '.netrc'), join(dir, '.aws')] });
  assert.deepEqual(args.slice(0, 2), ['--ro-bind', '/']);
  assert.ok(args.join(' ').includes(`--bind ${join(dir, 'work')} ${join(dir, 'work')}`));
  assert.ok(!args.includes(join(dir, 'missing')));
  assert.ok(args.join(' ').includes(`--tmpfs ${join(dir, '.ssh')}`));
  assert.ok(args.join(' ').includes(`--ro-bind /dev/null ${join(dir, '.netrc')}`));
  assert.ok(!args.includes(join(dir, '.aws')));
  assert.equal(args.at(-1), '--');
  assert.ok(args.includes('--die-with-parent'));
});

test('os sandbox refuses unsupported platforms before a worker slot is reserved', async (t) => {
  assert.equal(osSandboxSupport('win32').available, false);
  assert.throws(() => wrapCommand(['x'], { support: { available: false, reason: 'none here' } }), /unavailable: none here/);
  const f = fixture(t);
  await workers(f.root, 'configure', { revision: 0, enabled: true, sandbox: 'os' }, f.options);
  await assert.rejects(workers(f.root, 'start', { revision: 1, host: 'codex', agent: 'reviewer', brief: 'Inspect' },
    { ...f.options, command: [process.execPath, '-e', ''], osSandbox: osSandboxSupport('win32') }), /No os-level worker sandbox exists for win32/);
  assert.equal((await workers(f.root, 'status', {}, f.options)).jobs.length, 0);
});

test('macOS os sandbox confines a real worker to its worktree and hides credentials', { skip: process.platform !== 'darwin' || !osSandboxSupport().available }, async (t) => {
  const f = fixture(t), userHome = join(f.dir, 'user');
  mkdirSync(join(userHome, '.ssh'), { recursive: true });
  writeFileSync(join(userHome, '.ssh/id_fixture'), 'fixture key material');
  const outside = join(f.dir, 'outside.txt'), probe = join(f.dir, 'probe.mjs');
  writeFileSync(probe, `import { writeFileSync, readFileSync } from 'node:fs';
const attempt = (fn) => { try { fn(); return 'ok'; } catch (error) { return error.code; } };
console.log(JSON.stringify({
  inside: attempt(() => writeFileSync('inside.txt', 'worker')),
  temp: attempt(() => writeFileSync(process.env.TMPDIR + '/scratch.txt', 'worker')),
  outside: attempt(() => writeFileSync(${JSON.stringify(outside)}, 'escaped')),
  credential: attempt(() => readFileSync(${JSON.stringify(join(userHome, '.ssh/id_fixture'))}, 'utf8')),
  secretEnv: process.env.JV_SANDBOX_FIXTURE_SECRET ?? null,
}));`);
  process.env.JV_SANDBOX_FIXTURE_SECRET = 'must-not-reach-worker';
  t.after(() => delete process.env.JV_SANDBOX_FIXTURE_SECRET);
  await workers(f.root, 'configure', { revision: 0, enabled: true, sandbox: 'os' }, f.options);
  const job = await workers(f.root, 'start', { revision: 1, host: 'codex', agent: 'implementer', brief: 'Probe the sandbox' },
    { ...f.options, command: [process.execPath, probe], userHome });
  const done = await finished(f, job.id);
  assert.equal(done.state, 'completed', done.output);
  assert.deepEqual(done.sandbox, { level: 'os', network: 'default', env: 'minimal', host: 'replaced-by-os', os: 'macos-seatbelt' });
  const observed = JSON.parse(done.output.trim().split('\n').at(-1));
  assert.deepEqual(observed, { inside: 'ok', temp: 'ok', outside: 'EPERM', credential: 'EPERM', secretEnv: null });
  assert.equal(readFileSync(join(f.root, job.path, 'inside.txt'), 'utf8'), 'worker');
  const result = await workers(f.root, 'result', { id: job.id }, f.options);
  assert.equal(result.sandbox.os, 'macos-seatbelt');
  assert.deepEqual(result.paths, ['inside.txt']);
  // An inspect worker loses its CLI's read-only sandbox here, so the outer profile keeps the worktree read-only.
  const status = await workers(f.root, 'status', {}, f.options);
  const reviewer = await workers(f.root, 'start', { revision: status.revision, host: 'codex', agent: 'reviewer', brief: 'Probe read-only' },
    { ...f.options, command: [process.execPath, probe], userHome });
  const inspected = await finished(f, reviewer.id);
  assert.deepEqual(JSON.parse(inspected.output.trim().split('\n').at(-1)), { inside: 'EPERM', temp: 'ok', outside: 'EPERM', credential: 'EPERM', secretEnv: null });
});
