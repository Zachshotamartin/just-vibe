import { spawn } from 'node:child_process';
import { StringDecoder } from 'node:string_decoder';
import { commandInvocation } from './command.mjs';

const sensitiveName = '(?:password|passwd|token|(?:access|refresh|auth)[_-]?token|secret|(?:client|api)[_-]?secret|api[_-]?key|authorization)';
const sensitiveKey = new RegExp(`^${sensitiveName}$`, 'i');
const assignment = new RegExp(String.raw`(\b${sensitiveName}|["']${sensitiveName}["'])(\s*[=:]\s*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s,;}\]]+)`, 'gi');

export function redact(value) {
  const source = String(value);
  // Logs may themselves contain JSON. Inspect sensitive keys before falling
  // back to text patterns; never run these patterns on a record's JSON envelope.
  if (/^\s*[\[{]/.test(source)) {
    try { return JSON.stringify(redactValue(JSON.parse(source))); } catch { /* Mixed or incomplete log text. */ }
  }
  return source.replace(/\b(?:gh[pousr]_[\w]{20,}|github_pat_[\w]{20,}|npm_[\w]{20,})\b/g, '[REDACTED]')
    .replace(/\b(Bearer\s+)[A-Za-z0-9._~+\/-]+/gi, '$1[REDACTED]')
    .replace(assignment, (_, key, separator, secret) => {
      const quote = /^["']/.test(secret) ? secret[0] : '';
      return `${key}${separator}${quote}[REDACTED]${quote}`;
    })
    .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/g, '$1[REDACTED]@');
}

export function redactValue(value) {
  if (typeof value === 'string') return redact(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .map(([key, entry]) => [key, sensitiveKey.test(key) ? '[REDACTED]' : redactValue(entry)]));
  return value;
}

export function redactCommand(command) {
  return command.map((arg, index) => index > 0 && /^--?/.test(command[index - 1])
    && sensitiveKey.test(command[index - 1].replace(/^--?/, '')) ? '[REDACTED]' : redact(arg));
}

// The live caller created this process group. On POSIX, terminate remaining
// members even after its leader exits (including descendants holding pipes).
// Windows taskkill is best-effort after leader exit; it is not a Job Object.
export function terminateOwnedGroup(child) {
  if (!child?.pid) return Promise.resolve();
  if (process.platform !== 'win32') {
    try { process.kill(-child.pid, 'SIGKILL'); }
    catch (error) { if (error.code !== 'ESRCH') child.kill('SIGKILL'); }
    // Allow the kernel to finish exit/reaping before publishing completion.
    // Orphan zombies can retain the group ID until their new parent reaps them;
    // they cannot execute, so do not wait forever or send a later PID-based kill.
    return new Promise(resolve => {
      const deadline = Date.now() + 1000;
      const inspect = () => {
        try { process.kill(-child.pid, 0); }
        catch (error) { if (error.code === 'ESRCH') { resolve(); return; } }
        if (Date.now() >= deadline) { resolve(); return; }
        setTimeout(inspect, 10);
      };
      inspect();
    });
  }
  return new Promise(resolve => {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', shell: false });
    const timer = setTimeout(() => { killer.kill(); child.kill(); }, 3000);
    const finish = (failed) => { clearTimeout(timer); if (failed) child.kill(); resolve(); };
    killer.once('error', () => finish(true));
    killer.once('close', code => finish(code !== 0));
  });
}

export async function runCommand(command, { cwd, timeoutMs = 15000, maxBytes = 512 * 1024, env = process.env, signal } = {}) {
  if (!Array.isArray(command) || !command.length || command.some(s => typeof s !== 'string' || s.includes('\0'))) throw Error('Command must be an argv array.');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw Error('Invalid command timeout.');
  if (signal?.aborted) return { status: null, stdout: '', stderr: '', cancelled: true, timedOut: false, truncated: false };
  let child;
  try {
    const [binary, args] = commandInvocation(command[0], command.slice(1));
    child = spawn(binary, args, { cwd, env: { ...env, CI: '1', NO_COLOR: '1', GH_PROMPT_DISABLED: '1', GIT_TERMINAL_PROMPT: '0' }, shell: false, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) { return { status: null, error: redact(error.message), stdout: '', stderr: '', timedOut: false, truncated: false }; }
  return new Promise(resolve => {
    let stdout = '', stderr = '', bytes = 0, timedOut = false, truncated = false, error, cancelled = false;
    const decoders = { stdout: new StringDecoder('utf8'), stderr: new StringDecoder('utf8') };
    let cleanup;
    const stop = () => cleanup ||= terminateOwnedGroup(child);
    const timer = setTimeout(() => { timedOut = true; stop(); }, timeoutMs);
    const abort = () => { cancelled = true; stop(); };
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    const collect = key => data => {
      const remaining = Math.max(0, maxBytes - bytes); bytes += data.length;
      const text = decoders[key].write(data.subarray(0, remaining));
      if (key === 'stdout') stdout += text; else stderr += text;
      if (bytes > maxBytes && !truncated) { truncated = true; stop(); }
    };
    child.stdout.on('data', collect('stdout')); child.stderr.on('data', collect('stderr'));
    child.on('error', e => { error = redact(e.message); });
    child.once('exit', () => { clearTimeout(timer); stop(); });
    child.on('close', async (status, exitSignal) => { clearTimeout(timer); signal?.removeEventListener('abort', abort); await stop(); stdout += decoders.stdout.end(); stderr += decoders.stderr.end(); resolve({ status, signal: exitSignal, stdout, stderr, timedOut, truncated, cancelled, ...(error ? { error } : {}) }); });
  });
}

export function requireResult(result, accepted = [0]) {
  if (result.error || result.cancelled || result.timedOut || result.truncated || !accepted.includes(result.status)) throw Error(result.error || (result.cancelled ? 'Command cancelled; evidence is incomplete.' : result.timedOut ? 'Command timed out; evidence is incomplete.' : result.truncated ? 'Command exceeded output limit; evidence is incomplete.' : redact(result.stderr.trim()).slice(0, 1000) || `Command exited ${result.status}.`));
  return result.stdout;
}
