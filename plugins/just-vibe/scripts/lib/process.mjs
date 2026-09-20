import { spawn } from 'node:child_process';
import { commandInvocation } from './command.mjs';

export function redact(value) {
  return String(value).replace(/\b(?:gh[pousr]_[\w]{20,}|github_pat_[\w]{20,}|npm_[\w]{20,})\b/g, '[REDACTED]')
    .replace(/\b(Bearer\s+)[A-Za-z0-9._~+\/-]+/gi, '$1[REDACTED]')
    .replace(/((?:password|token|secret|api[_-]?key|authorization)\s*[=:]\s*)[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/g, '$1[REDACTED]@');
}

export async function runCommand(command, { cwd, timeoutMs = 15000, maxBytes = 512 * 1024, env = process.env } = {}) {
  if (!Array.isArray(command) || !command.length || command.some(s => typeof s !== 'string' || s.includes('\0'))) throw Error('Command must be an argv array.');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw Error('Invalid command timeout.');
  let child;
  try {
    const [binary, args] = commandInvocation(command[0], command.slice(1));
    child = spawn(binary, args, { cwd, env: { ...env, CI: '1', NO_COLOR: '1', GH_PROMPT_DISABLED: '1', GIT_TERMINAL_PROMPT: '0' }, shell: false, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) { return { status: null, error: redact(error.message), stdout: '', stderr: '', timedOut: false, truncated: false }; }
  return new Promise(resolve => {
    let stdout = '', stderr = '', bytes = 0, timedOut = false, truncated = false, error;
    const stop = () => {
      try {
        if (process.platform === 'win32') {
          const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', shell: false });
          killer.on('error', () => child.kill());
        } else process.kill(-child.pid, 'SIGKILL');
      } catch { child.kill('SIGKILL'); }
    };
    const timer = setTimeout(() => { timedOut = true; stop(); }, timeoutMs);
    const collect = key => data => {
      const remaining = Math.max(0, maxBytes - bytes); bytes += data.length;
      if (key === 'stdout') stdout += data.subarray(0, remaining).toString(); else stderr += data.subarray(0, remaining).toString();
      if (bytes > maxBytes && !truncated) { truncated = true; stop(); }
    };
    child.stdout.on('data', collect('stdout')); child.stderr.on('data', collect('stderr'));
    child.on('error', e => { error = redact(e.message); });
    child.on('close', (status, signal) => { clearTimeout(timer); resolve({ status, signal, stdout, stderr, timedOut, truncated, ...(error ? { error } : {}) }); });
  });
}

export function requireResult(result, accepted = [0]) {
  if (result.error || result.timedOut || result.truncated || !accepted.includes(result.status)) throw Error(result.error || (result.timedOut ? 'Command timed out; evidence is incomplete.' : result.truncated ? 'Command exceeded output limit; evidence is incomplete.' : redact(result.stderr.trim()).slice(0, 1000) || `Command exited ${result.status}.`));
  return result.stdout;
}
