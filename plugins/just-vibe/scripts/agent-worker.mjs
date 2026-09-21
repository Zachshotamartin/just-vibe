import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { readJson } from './lib/storage.mjs';
import { commandInvocation } from './lib/command.mjs';
import { redact, terminateOwnedGroup } from './lib/process.mjs';

const config = readJson(process.argv[2]),
  directory = dirname(process.argv[2]);
let child,
  state = 'starting',
  output = '',
  exitCode = null,
  stopping = false,
  truncated = false,
  finished = false,
  cleanup;
const endGroup = () => cleanup ||= terminateOwnedGroup(child);
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
  endGroup();
}
function stopRequested() {
  return existsSync(join(directory, 'stop')) &&
    readFileSync(join(directory, 'stop'), 'utf8') === config.token;
}
async function finish() {
  if (finished) return;
  finished = true;
  clearInterval(timer);
  clearTimeout(expiry);
  await endGroup();
  state = stopping || (exitCode === 0 ? 'completed' : 'failed');
  persist();
}
const timer = setInterval(() => {
  if (stopRequested()) stop();
  else persist();
}, 500);
const expiry = setTimeout(() => stop('expired'), config.timeoutSeconds * 1000);
process.on('SIGTERM', () => stop());
process.on('SIGINT', () => stop());
try {
  persist();
  // The parent can publish a stop request before this supervisor starts.
  // Honor it before launching the command or sending the model its prompt.
  if (stopRequested()) stop();
  else {
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
    for (const pipe of [child.stdout, child.stderr]) {
      pipe.setEncoding('utf8');
      pipe.on('data', (chunk) => {
        output += chunk;
        if (output.length > 65536) {
          output = output.slice(-65536);
          truncated = true;
        }
      });
    }
    child.on('error', (error) => {
      output = redact(error.message);
      exitCode = 1;
    });
    child.once('exit', () => { clearTimeout(expiry); endGroup(); });
    child.on('close', (code) => {
      exitCode = code;
      finish();
    });
  }
} catch (error) {
  output = redact(error.message);
  exitCode = 1;
  finish();
}
