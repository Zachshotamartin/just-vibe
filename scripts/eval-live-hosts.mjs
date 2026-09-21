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
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { integration } from '../plugins/just-vibe/scripts/lib/integration.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
import { lessons } from '../plugins/just-vibe/scripts/lib/adaptive-learning.mjs';
import { redact } from '../plugins/just-vibe/scripts/lib/process.mjs';
import { stageBundle } from '../plugins/just-vibe/scripts/lib/bundle.mjs';
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
const repo = resolve(new URL('../', import.meta.url).pathname),
  output = join(repo, '.tmp/live-hosts');
mkdirSync(output, { recursive: true, mode: 0o700 });
const temp = mkdtempSync(join(tmpdir(), 'just-vibe-live-')),
  reports = [];
function command(binary, args, cwd, env, prompt, seconds = 180) {
  return new Promise((resolve) => {
    const child = spawn(binary, args, {
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
      config = join(base, 'config');
    mkdirSync(root, { recursive: true });
    mkdirSync(config);
    const payload = join(base, 'payload');
    if (host === 'claude') stageBundle(payload, { target: host, selection: { profile: 'core' } });
    const plugin = join(payload, 'plugins/just-vibe');
    const env = { ...process.env, JUST_VIBE_HOME: home, NO_COLOR: '1' };
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
      execFileSync('git', args, { cwd: root });
    writeFileSync(join(root, 'package.json'), '{"type":"module"}\n');
    writeFileSync(
      join(root, 'app.mjs'),
      'export function sumEven(values) { return values.filter(n => n > 0 && n % 2 === 0).reduce((a, b) => a + b, 0); }\n',
    );
    writeFileSync(
      join(root, 'test.mjs'),
      'import test from "node:test"; import assert from "node:assert/strict"; import {sumEven} from "./app.mjs"; test("positive even numbers",()=>assert.equal(sumEven([1,2,4]),6));\n',
    );
    writeFileSync(join(root, '.gitignore'), '.just-vibe/\n');
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['commit', '-qm', 'fixture'], { cwd: root });
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
    const version = execFileSync(host, ['--version'], { encoding: 'utf8' }).trim();
    const prompts = [
      'Fix sumEven in app.mjs: it incorrectly excludes negative even integers. Preserve the export and add a regression test for negative values, zero and an empty input. Run node --test test.mjs. Keep the change scoped to this fixture; no dependency installs, network actions, commits or subagents.',
      'Correction to how you handle fixes: from now on, avoid adding dependencies and use the Node built-in test runner. Remember this as a project preference for the fix workflow, so it changes the instructions loaded next time. No further source changes.',
      'Continue our previous task. Explain what was fixed and actually verified, and apply the saved project preference. Do not edit source or start subagents.',
    ];
    let session,
      turns = [];
    for (let i = 0; i < prompts.length; i++) {
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
          '16',
          '--output-format',
          'stream-json',
          '--verbose',
          '--include-hook-events',
          ...(session ? ['--resume', session] : []),
        ];
      console.log(`${host}: ${['ordinary request', 'explicit correction', 'resume'][i]} trial`);
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
          'import {sumEven} from "./app.mjs"; if(sumEven([-4,-1,0,2])!==-2 || sumEven([])!==0)process.exit(1)',
        ],
        { cwd: root, stdio: 'pipe' },
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
      sourceChanged: execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean),
    };
    report.status = turns.some((t) => t.blocker)
      ? 'blocked'
      : turns.length === 3 &&
          turns.every((t) => t.code === 0 && !t.reportedError && !t.timedOut) &&
          regression &&
          report.ordinaryWorkflowLoaded &&
          report.selectedTasks > 0 &&
          guidance.length > 0
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
console.log(JSON.stringify(reports, null, 2));
if (reports.some((r) => r.status !== 'passed')) process.exitCode = 1;
