import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import module from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitRead, projectTopLevel } from '../plugins/just-vibe/scripts/lib/project.mjs';

const lib = fileURLToPath(new URL('../plugins/just-vibe/scripts/lib/', import.meta.url));
function fixture(t) {
  const dir = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-hook-cost-')));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { stdio: 'ignore' });
  return { dir, git };
}

test('the subprocess-free project lookup agrees with git in every layout hooks see', t => {
  const { dir, git } = fixture(t);
  const repo = join(dir, 'repo'), nested = join(repo, 'packages', 'nested'), deep = join(repo, 'src', 'a', 'b');
  mkdirSync(deep, { recursive: true }); mkdirSync(nested, { recursive: true });
  git(dir, 'init', '-q', repo); git(dir, 'init', '-q', nested);
  writeFileSync(join(repo, 'f.txt'), 'x');
  git(repo, 'add', 'f.txt');
  git(repo, '-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-qm', 'init');
  const worktree = join(dir, 'wt');
  git(repo, 'worktree', 'add', '-q', '--detach', worktree);
  const outside = join(dir, 'plain'); mkdirSync(outside);
  for (const cwd of [repo, deep, nested, worktree, outside, join(repo, '.git'), join(repo, '.git', 'refs')]) {
    assert.equal(projectTopLevel(cwd), gitRead(cwd, ['rev-parse', '--show-toplevel']), cwd);
  }
  // A malformed .git entry is left to git rather than trusted.
  const broken = join(dir, 'broken'); mkdirSync(join(broken, '.git'), { recursive: true });
  let asked = 0;
  assert.equal(projectTopLevel(broken, { git: () => (asked++, 'from-git') }), 'from-git');
  assert.equal(asked, 1);
  assert.equal(projectTopLevel(join(dir, 'missing')), null);
  // Inside a bare repository (even one within a work tree), git decides.
  const bare = join(repo, 'vendor.git'); git(dir, 'init', '-q', '--bare', bare);
  for (const cwd of [bare, join(bare, 'refs')]) assert.equal(projectTopLevel(cwd), gitRead(cwd, ['rev-parse', '--show-toplevel']), cwd);
  // Hooks may inherit GIT_DIR from a host shell; gitRead clears it, and the walk agrees.
  const saved = process.env.GIT_DIR;
  process.env.GIT_DIR = join(nested, '.git');
  try { assert.equal(projectTopLevel(deep), gitRead(deep, ['rev-parse', '--show-toplevel'])); assert.equal(projectTopLevel(deep), repo); }
  finally { if (saved === undefined) delete process.env.GIT_DIR; else process.env.GIT_DIR = saved; }
});

test('a tool observation never loads the router or the catalog', { skip: !module.registerHooks && 'needs module.registerHooks' }, t => {
  const { dir, git } = fixture(t);
  const project = join(dir, 'project'), home = join(dir, 'home');
  mkdirSync(project); mkdirSync(home); git(dir, 'init', '-q', project);
  const script = `
    import module from 'node:module';
    const loaded = [];
    module.registerHooks({ load(url, context, next) { loaded.push(url); return next(url, context); } });
    const { lifecycle } = await import(${JSON.stringify(new URL('lifecycle.mjs', `file://${lib}/`).href)});
    await lifecycle({ hook_event_name: 'PostToolUse', session_id: 's', cwd: ${JSON.stringify(project)}, tool_name: 'Read', tool_input: {}, tool_response: {} }, { home: ${JSON.stringify(home)} });
    console.log(JSON.stringify(loaded.filter(u => u.includes('/scripts/lib/')).map(u => u.split('/').pop())));`;
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const loaded = JSON.parse(run.stdout.trim().split('\n').pop());
  assert.ok(loaded.includes('task-observations.mjs'), loaded.join(', '));
  for (const heavy of ['catalog.mjs', 'assistant-runtime.mjs', 'discovery.mjs', 'intents.mjs', 'routing.mjs']) assert.ok(!loaded.includes(heavy), `${heavy} loaded for a tool observation`);
});
