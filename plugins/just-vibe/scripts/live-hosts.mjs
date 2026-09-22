// Opt-in behavioral trial. Uses the signed-in host account; no model override or release side effects.
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  cpSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { commandInvocation } from './lib/command.mjs';
import { diagnosis } from './lib/diagnosis.mjs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { integration } from './lib/integration.mjs';
import { runtimeStore } from './lib/runtime-store.mjs';
import { lessons } from './lib/adaptive-learning.mjs';
import { redact } from './lib/process.mjs';
import { stageBundle } from './lib/bundle.mjs';
const releaseEnvironment = (env = process.env) => Object.fromEntries(Object.entries(env).filter(([k]) => !k.toUpperCase().startsWith('GIT_')));
const fixtureGit = (root, hooks, args) => execFileSync('git', ['--no-pager', '--no-replace-objects', '-c', 'core.hooksPath=' + hooks, '-c', 'commit.gpgSign=false', '-c', 'core.fsmonitor=false', ...args], { cwd: root, env: releaseEnvironment(), encoding: 'utf8', timeout: 10000 });
const argv = process.argv.slice(2);
if (
  !argv.includes('--run') ||
  argv.some((a) => !['--run', '--host=codex', '--host=claude'].includes(a))
)
  throw Error(
    'Usage: npm run eval:hosts -- --run [--host=codex|--host=claude]. Runs bounded real model turns on the existing account.',
  );
const hosts = argv.find((a) => a.startsWith('--host='))
  ? [argv.find((a) => a.startsWith('--host=')).split('=')[1]]
  : ['codex', 'claude'];
const repo = fileURLToPath(new URL('../../../', import.meta.url)),
  output = resolve(process.env.JUST_VIBE_DIAGNOSIS_OUTPUT || '.tmp/live-hosts');
mkdirSync(output, { recursive: true, mode: 0o700 });
const temp = mkdtempSync(join(tmpdir(), 'just-vibe-live-')),
  reports = [];
function command(binary, args, cwd, env, prompt, seconds = 180) {
  return new Promise((resolve) => {
    const [executable, commandArgs] = commandInvocation(binary, args);
    const child = spawn(executable, commandArgs, {
      cwd,
      env,
      detached: process.platform !== 'win32',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '',
      stderr = '',
      timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        process.platform === 'win32' ? child.kill() : process.kill(-child.pid, 'SIGKILL');
      } catch {}
    }, seconds * 1000);
    child.stdout.on('data', (b) => {
      stdout = (stdout + b).slice(-4 * 1024 * 1024);
    });
    child.stderr.on('data', (b) => {
      stderr = (stderr + b).slice(-1024 * 1024);
    });
    child.on('error', (error) => {
      stderr += error.message;
    });
    child.stdin.on('error', () => {});
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, timedOut, stdout: redact(stdout), stderr: redact(stderr) });
    });
    child.stdin.end(prompt);
  });
}
try {
  for (const host of hosts) {
    const base = join(temp, host),
      root = join(base, 'project'),
      home = join(base, 'data'),
      config = join(base, 'config'),
      emptyHooks = join(base, 'empty-hooks');
    mkdirSync(root, { recursive: true });
    mkdirSync(config);
    mkdirSync(emptyHooks);
    const git = (args) => fixtureGit(root, emptyHooks, args);
    const payload = join(base, 'payload');
    if (host === 'claude') stageBundle(payload, { target: host, selection: { profile: 'core' } });
    const plugin = join(payload, 'plugins/just-vibe');
    const env = { ...releaseEnvironment(), JUST_VIBE_HOME: home, NO_COLOR: '1' };
    // Test credentials never enter fixtures or reports and the temporary copy is deleted in finally.
    if (host === 'codex') {
      const auth = join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'auth.json');
      if (!existsSync(auth)) {
        reports.push({
          host,
          status: 'blocked',
          reason:
            'No file-based Codex login available for the isolated host configuration; authenticate there explicitly.',
        });
        continue;
      }
      cpSync(auth, join(config, 'auth.json'), { mode: 1 });
      env.CODEX_HOME = config;
    }
    for (const args of [
      ['init', '-q'],
      ['config', 'user.name', 'Fixture'],
      ['config', 'user.email', 'fixture@example.test'],
    ])
      git(args);
    writeFileSync(join(root, 'package.json'), '{"type":"module"}\n');
    writeFileSync(
      join(root, 'app.mjs'),
      'export function sumEven(values) { return values.filter(n => n > 0 && n % 2 === 0).reduce((a, b) => a + b, 0); }\nexport function sumOdd(values) { return values.filter(n => n > 0 && n % 2 !== 0).reduce((a,b)=>a+b,0); }\n',
    );
    writeFileSync(
      join(root, 'test.mjs'),
      'import test from "node:test"; import assert from "node:assert/strict"; import {sumEven, sumOdd} from "./app.mjs"; test("positive even numbers",()=>assert.equal(sumEven([1,2,4]),6));\n',
    );
    writeFileSync(join(root, '.gitignore'), '.just-vibe/\n');
    git(['add', '.']);
    git(['commit', '-qm', 'fixture']);
    await integration(
      root,
      'configure',
      { revision: 0, automatic: true, observation: true, rules: [], mcp: { allowWrite: true } },
      { home },
    );
    if (host === 'codex') {
      const installed = await command(
        process.execPath,
        [join(repo, 'bin/just-vibe.mjs'), 'setup', '--target', 'codex', '--profile', 'core'],
        root,
        env,
        '',
        120,
      );
      if (installed.code !== 0) {
        reports.push({ host, status: 'blocked', reason: installed.stderr || installed.stdout });
        continue;
      }
    }
    const version = execFileSync(...commandInvocation(host, ['--version']), { env, encoding: 'utf8' }).trim();
    const prompts = [
      'Fix sumEven in app.mjs: it incorrectly excludes negative even integers. Preserve the export and add a regression test for negative values, zero and an empty input. Run node --test test.mjs. Keep the change scoped to this fixture; no dependency installs, network actions, commits or subagents.',
      'Correction to how you handle fixes: from now on, avoid adding dependencies and use the Node built-in test runner. Remember this as a project preference for the fix workflow, so it changes the instructions loaded next time. No further source changes.',
      'Fix sumOdd in app.mjs: it excludes negative odd integers. Add regression coverage and verify it. Keep changes scoped to this fixture; no network actions, commits or subagents. Use Read/Glob for file inspection and run node --test test.mjs directly, without pipes or shell compound commands.',
      'Continue our previous task. Explain what was fixed and actually verified, and apply the saved project preference. Do not edit source or start subagents.',
    ];
    let session,
      turns = [];
    for (let i = 0; i < prompts.length; i++) {
      if (i === 2) session = undefined; // A new host context must retrieve the saved preference.
      let args;
      if (host === 'codex')
        args = [
          'exec',
          ...(session ? ['resume', session] : ['--sandbox', 'workspace-write', '--add-dir', home]),
          '--dangerously-bypass-hook-trust',
          '-c',
          'approval_policy="never"',
          '--json',
          '-',
        ];
      else
        args = [
          '-p',
          '--setting-sources',
          '',
          '--plugin-dir',
          plugin,
          '--permission-mode',
          'acceptEdits',
          '--strict-mcp-config',
          '--mcp-config',
          JSON.stringify({ mcpServers: { 'just-vibe': { command: process.execPath, args: [join(plugin, 'scripts/mcp.mjs'), '--root', root], env: { JUST_VIBE_HOME: home } } } }),
          '--allowedTools',
          'Read,Glob,Grep,Edit,Write,Bash(node --test*),mcp__just-vibe__*,mcp__plugin_just-vibe_just-vibe__*',
          '--max-turns',
          '24',
          '--output-format',
          'stream-json',
          '--verbose',
          '--include-hook-events',
          ...(session ? ['--resume', session] : []),
        ];
      console.log(`${host}: ${['ordinary request', 'explicit correction', 'fresh session', 'follow-up'][i]} trial`);
      const result = await command(host, args, root, env, prompts[i]);
      writeFileSync(join(output, `${host}-${i + 1}.jsonl`), result.stdout, { mode: 0o600 });
      writeFileSync(join(output, `${host}-${i + 1}.stderr`), result.stderr, { mode: 0o600 });
      const events = result.stdout.split('\n').flatMap((line) => {
        try {
          return [JSON.parse(line)];
        } catch {
          return [];
        }
      });
      session ||=
        events.find((e) => e.thread_id || e.session_id)?.thread_id ||
        events.find((e) => e.session_id)?.session_id;
      turns.push({
        phase: i + 1,
        sessionHash: session ? (await import('node:crypto')).createHash('sha256').update(session).digest('hex') : null,
        code: result.code,
        timedOut: result.timedOut,
        events: events.length,
        nativeMcpCalls: events.filter(
          (e) => e.type === 'item.completed' && e.item?.type === 'mcp_tool_call',
        ).length + events.filter(e => e.type === 'assistant').flatMap(e => e.message?.content || []).filter(c => c.type === 'tool_use' && c.name?.startsWith('mcp__')).length,
        reportedError: events.some(
          (e) => e.is_error || e.type === 'error' || e.type === 'turn.failed',
        ),
        ...(events.some((e) =>
          e.message?.content?.some((c) => c.text?.includes('OAuth session expired')),
        )
          ? { blocker: 'Host OAuth session expired and could not be refreshed' }
          : {}),
      });
      if (!session || result.code !== 0 || result.timedOut || turns.at(-1).reportedError) break;
    }
    const store = runtimeStore(root, { home });
    const tasks = store
      .list(`${store.project}/tasks`)
      .map((n) => store.read(`${store.project}/tasks/${n}`))
      .filter(Boolean);
    const guidance = lessons(store).filter((l) => l.scope === 'project');
    let regression = false;
    try {
      execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          'import {sumEven, sumOdd} from "./app.mjs"; if(sumEven([-4,-1,0,2])!==-2 || sumEven([])!==0 || sumOdd([-3,1,2])!==-2)process.exit(1)',
        ],
        { cwd: root, env, stdio: 'pipe' },
      );
      regression = true;
    } catch {}
    const report = {
      host,
      version,
      turns,
      regression,
      automaticTasks: tasks.length,
      selectedTasks: tasks.filter((t) => t.selected?.length).length,
      ordinaryWorkflowLoaded: tasks.some(t => t.userMessage === prompts[0] && t.requirements?.some(r => r.evidence?.kind === 'runtime-load')),
      observedTools: [...new Set(tasks.flatMap((t) => t.observations?.map((o) => o.tool) || []))],
      savedProjectLessons: guidance.length,
      freshSessionPreferenceLoaded: tasks.some(t => t.userMessage === prompts[2] && t.loaded?.some(l => l.lessons?.some(saved => guidance.some(g => g.id === saved.id)))),
      freshSessionUsed: Boolean(turns[2]?.sessionHash && turns[2].sessionHash !== turns[0]?.sessionHash),
      noDependenciesAdded: readFileSync(join(root, 'package.json'), 'utf8').trim() === '{"type":"module"}',
      diagnosis: diagnosis(root, 'status', { host }, { home }),
      sourceChanged: git(['diff', '--name-only'])
        .trim()
        .split('\n')
        .filter(Boolean),
    };
    report.status = turns.some((t) => t.blocker)
      ? 'blocked'
      : turns.length === 4 &&
          turns.every((t) => t.code === 0 && !t.reportedError && !t.timedOut) &&
          regression &&
          report.ordinaryWorkflowLoaded &&
          report.selectedTasks > 0 &&
          guidance.length > 0 && report.freshSessionPreferenceLoaded && report.freshSessionUsed && report.noDependenciesAdded
        ? 'passed'
        : 'incomplete';
    reports.push(report);
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
  writeFileSync(
    join(output, 'results.json'),
    JSON.stringify({ at: new Date().toISOString(), reports }, null, 2),
  );
}
for (const report of reports) writeFileSync(join(output, `results-${report.host}.json`), JSON.stringify(report, null, 2), { mode: 0o600 });
console.log(JSON.stringify(reports, null, 2));
if (reports.some((r) => r.status !== 'passed')) process.exitCode = 1;
