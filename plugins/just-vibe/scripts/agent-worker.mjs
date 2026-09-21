import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { readJson } from './lib/storage.mjs';
import { commandInvocation } from './lib/command.mjs';
import { redact } from './lib/process.mjs';

const config = readJson(process.argv[2]),
  directory = dirname(process.argv[2]);
let child,
  state = 'starting',
  output = '',
  exitCode = null,
  stopping = false,
  truncated = false,
  finished = false;
function persist() {
  const path = join(directory, 'status.tmp');
  writeFileSync(
    path,
    JSON.stringify({
      token: config.token,
      supervisorPid: process.pid,
      childPid: child?.pid || null,
      state,
      exitCode,
      output: redact(output),
      truncated,
      updatedAt: new Date().toISOString(),
    }),
    { mode: 0o600 },
  );
  renameSync(path, join(directory, 'status.json'));
}
function stop(reason = 'cancelled') {
  if (finished || stopping) return;
  stopping = reason;
  state = 'stopping';
  persist();
  if (!child?.pid) return finish();
  // Kill only the child process group created by this live supervisor.
  try {
    if (process.platform === 'win32') {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
      killer.on('error', () => child.kill());
    } else process.kill(-child.pid, 'SIGKILL');
  } catch {
    child.kill('SIGKILL');
  }
}
function finish() {
  if (finished) return;
  finished = true;
  state = stopping || (exitCode === 0 ? 'completed' : 'failed');
  clearInterval(timer);
  clearTimeout(expiry);
  persist();
}
const timer = setInterval(() => {
  if (
    existsSync(join(directory, 'stop')) &&
    readFileSync(join(directory, 'stop'), 'utf8') === config.token
  )
    stop();
  else persist();
}, 500);
const expiry = setTimeout(() => stop('expired'), config.timeoutSeconds * 1000);
process.on('SIGTERM', () => stop());
process.on('SIGINT', () => stop());
try {
  persist();
  const [binary, args] = commandInvocation(config.command[0], config.command.slice(1));
  child = spawn(binary, args, {
    cwd: config.cwd,
    shell: false,
    detached: process.platform !== 'win32',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, JUST_VIBE_WORKER: '1', NO_COLOR: '1' },
  });
  child.on('spawn', () => {
    state = 'running';
    persist();
    child.stdin.end(config.prompt);
  });
  child.stdin.on('error', () => {});
  for (const pipe of [child.stdout, child.stderr])
    pipe.on('data', (chunk) => {
      output += chunk.toString();
      if (output.length > 65536) {
        output = output.slice(-65536);
        truncated = true;
      }
    });
  child.on('error', (error) => {
    output = redact(error.message);
    exitCode = 1;
  });
  child.on('close', (code) => {
    exitCode = code;
    finish();
  });
} catch (error) {
  output = redact(error.message);
  exitCode = 1;
  finish();
}
