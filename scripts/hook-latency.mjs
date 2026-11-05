#!/usr/bin/env node
// Reports the wall-clock cost of one hook process per event, the way a host pays it: a fresh
// node process reading the event on stdin. Uses a throwaway HOME and Git project, so personal
// state is never read or written. A report, not a gate: timings vary by machine and load.
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const plugin = fileURLToPath(new URL('../plugins/just-vibe/', import.meta.url));
const runs = Number(process.argv.find((a) => a.startsWith('--runs='))?.slice(7) || 9);
const json = process.argv.includes('--json');
const dir = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-hook-latency-')));
const project = join(dir, 'project'), home = join(dir, 'home');
mkdirSync(project); mkdirSync(home);
execFileSync('git', ['init', '-q', project]);

const base = { session_id: 'latency', cwd: project };
const events = {
  'PreToolUse(Read)': { ...base, hook_event_name: 'PreToolUse', tool_name: 'Read', tool_input: { file_path: join(project, 'a.js') } },
  'PreToolUse(Bash)': { ...base, hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'ls' } },
  'PostToolUse(Read)': { ...base, hook_event_name: 'PostToolUse', tool_name: 'Read', tool_input: { file_path: join(project, 'a.js') }, tool_response: {} },
  UserPromptSubmit: { ...base, hook_event_name: 'UserPromptSubmit', prompt: 'Fix the mobile menu so it closes on navigation' },
};

const results = {};
try {
  for (const [name, event] of Object.entries(events)) {
    const times = [];
    let bytes = 0;
    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      const run = spawnSync(process.execPath, [join(plugin, 'scripts/hooks.mjs')], {
        input: JSON.stringify(event), encoding: 'utf8',
        env: { ...process.env, HOME: home, USERPROFILE: home, JUST_VIBE_HOME: join(home, '.just-vibe'), CLAUDE_PLUGIN_ROOT: plugin },
      });
      times.push(performance.now() - start);
      if (run.status !== 0) throw Error(`${name} exited ${run.status}: ${run.stderr}`);
      bytes = run.stdout.length;
    }
    times.sort((a, b) => a - b);
    results[name] = { medianMs: Math.round(times[Math.floor(runs / 2)]), minMs: Math.round(times[0]), outputChars: bytes };
  }
  // Node startup alone, for scale.
  const node = [];
  for (let i = 0; i < runs; i++) { const s = performance.now(); spawnSync(process.execPath, ['-e', '']); node.push(performance.now() - s); }
  node.sort((a, b) => a - b);
  results['node -e ""'] = { medianMs: Math.round(node[Math.floor(runs / 2)]), minMs: Math.round(node[0]), outputChars: 0 };
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (json) console.log(JSON.stringify(results, null, 2));
else for (const [name, r] of Object.entries(results)) console.log(`${name.padEnd(20)} median ${String(r.medianMs).padStart(4)} ms  min ${String(r.minMs).padStart(4)} ms  output ${r.outputChars} chars`);
