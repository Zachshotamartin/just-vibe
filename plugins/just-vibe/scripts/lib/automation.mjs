import { existsSync, mkdirSync, openSync, closeSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, relative, extname, resolve, isAbsolute } from 'node:path';
import { homedir } from 'node:os';
import { atomicJson, digest, within, readJson, projectRoot, fingerprint, privateName } from './storage.mjs';
import { gitRead } from './project.mjs';
import { runCommand, redact } from './process.mjs';

const configPath = '.just-vibe/automation.json';
function validate(config) {
  if (!config || config.schemaVersion !== 1 || typeof config.enabled !== 'boolean' || typeof config.saveSummary !== 'boolean'
      || !Array.isArray(config.checks) || !Array.isArray(config.formatters) || config.checks.length + config.formatters.length > 4
      || Object.keys(config).some(k => !['schemaVersion', 'revision', 'enabled', 'saveSummary', 'checks', 'formatters'].includes(k))) throw Error('Invalid automation configuration.');
  const names = new Set();
  for (const [kind, list] of [['check', config.checks], ['formatter', config.formatters]]) for (const item of list) {
    if (!item || typeof item.name !== 'string' || !/^[a-z0-9-]{1,64}$/.test(item.name) || names.has(item.name)
        || !Array.isArray(item.command) || !item.command.length || item.command.length > 40 || item.command.some(v => typeof v !== 'string' || !v || v.includes('\0') || v.length > 2000)
        || !Number.isInteger(item.timeoutMs) || item.timeoutMs < 100 || item.timeoutMs > 15000
        || !Array.isArray(item.extensions) || item.extensions.some(v => !/^\.[a-z0-9]+$/.test(v))
        || Object.keys(item).some(k => !['name', 'command', 'timeoutMs', 'extensions'].includes(k))) throw Error('Automation entries require unique names, argv commands, extensions and a 100–15000 ms timeout.');
    if (kind === 'formatter' && item.command.filter(v => v === '{file}').length !== 1) throw Error('A formatter must include exactly one {file} argument.');
    if (kind === 'check' && item.command.some(v => v.includes('{file}'))) throw Error('Stop checks cannot use a file placeholder.');
    names.add(item.name);
  }
  return config;
}
function config(root) {
  const path = within(root, configPath);
  return existsSync(path) ? validate(readJson(path)) : null;
}
function trustDirectory(home) {
  const root = home || process.env.JUST_VIBE_HOME || join(homedir(), '.just-vibe');
  mkdirSync(root, { recursive: true });
  return projectRoot(root);
}
function trustPath(root) { return `automation-trust/${digest(projectRoot(root))}.json`; }
function trustRecord(root, home) {
  const base = home || process.env.JUST_VIBE_HOME || join(homedir(), '.just-vibe');
  if (!existsSync(base)) return null;
  const path = within(base, trustPath(root));
  return existsSync(path) ? readJson(path) : null;
}
const configHash = c => digest(JSON.stringify(c));

export function manageHooks(root, operation, payload = {}, { home } = {}) {
  root = projectRoot(root);
  const current = config(root);
  if (operation === 'configure') {
    validate(payload);
    if (!Number.isInteger(payload.revision) || payload.revision < 0) throw Error('Supply current revision, or 0 for a new configuration.');
    return atomicJson(root, configPath, payload, payload.revision);
  }
  if (operation === 'status') return { configuration: current, trusted: Boolean(current && trustRecord(root, home)?.configHash === configHash(current)), note: 'Host hook support and native trust are separate. Configuration alone never enables command execution.' };
  if (operation === 'trust') {
    if (!current) throw Error('Configure this project before trusting its commands.');
    const base = trustDirectory(home), previous = trustRecord(root, base);
    return atomicJson(base, trustPath(root), { schemaVersion: 1, root, configHash: configHash(current), trustedAt: new Date().toISOString() }, previous?.revision || 0);
  }
  if (operation === 'untrust') {
    const previous = trustRecord(root, home);
    if (previous) unlinkSync(within(trustDirectory(home), trustPath(root)));
    return { trusted: false };
  }
  if (operation === 'disable') {
    if (!current) return { enabled: false };
    return atomicJson(root, configPath, { ...current, enabled: false }, current.revision);
  }
  if (operation === 'recover') {
    const lock = within(root, '.just-vibe/automation/active.lock');
    if (!existsSync(lock)) return { recovered: false };
    const owner = readJson(lock);
    if (!Number.isInteger(owner.pid) || owner.pid < 1) throw Error('Invalid lock owner; inspect the lock manually.');
    try { process.kill(owner.pid, 0); throw Error('Automation owner is still running.'); }
    catch (error) { if (error.code !== 'ESRCH') throw error; }
    unlinkSync(lock);
    return { recovered: true };
  }
  throw Error(`Unknown hooks operation: ${operation}`);
}

function touchedFiles(event) {
  const direct = event.tool_input?.file_path || event.tool_input?.path;
  if (typeof direct === 'string') return [direct];
  if (event.tool_name === 'apply_patch') return [...String(event.tool_input?.command || '').matchAll(/^\*\*\* (?:Add|Update) File: (.+)$/gm)].map(m => m[1]);
  return [];
}

export async function handleHook(event, { home, run = runCommand } = {}) {
  if (!event || !['Stop', 'PostToolUse'].includes(event.hook_event_name) || typeof event.cwd !== 'string') return { skipped: 'unsupported-event' };
  // Use the exact configured project, or its Git root when launched in a subdirectory.
  let root = projectRoot(event.cwd);
  if (!existsSync(within(root, configPath))) root = gitRead(root, ['rev-parse', '--show-toplevel']) || root;
  const selected = config(root);
  if (!selected?.enabled) return { skipped: 'disabled' };
  if (trustRecord(root, home)?.configHash !== configHash(selected)) return { skipped: 'untrusted', message: 'just-vibe automation configuration changed or is untrusted. Review it with hooks status, then use hooks trust if intended.' };
  if (event.stop_hook_active) return { skipped: 'stop-loop' };
  const directory = within(root, '.just-vibe/automation'); mkdirSync(directory, { recursive: true });
  const lock = join(directory, 'active.lock'); let handle;
  try { handle = openSync(lock, 'wx', 0o600); writeFileSync(handle, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })); } catch { return { skipped: 'busy' }; }
  try {
    const snapshot = fingerprint(root), key = event.hook_event_name === 'Stop' ? 'stop' : 'edit';
    const statePath = `.just-vibe/automation/${key}.json`, path = within(root, statePath);
    const previous = existsSync(path) ? readJson(path) : null;
    const candidates = key === 'edit' ? touchedFiles(event).map(file => within(root, resolve(projectRoot(event.cwd), isAbsolute(file) ? relative(resolve(event.cwd), file) : file))) : [];
    const inputHash = digest(JSON.stringify({ snapshot, config: configHash(selected), candidates }));
    const results = [];
    if (snapshot.partial || previous?.inputHash !== inputHash) {
      const deadline = Date.now() + 20000;
      if (key === 'stop') {
        for (const check of selected.checks) {
          const time = Math.min(check.timeoutMs, deadline - Date.now());
          if (time <= 0) { results.push({ name: check.name, result: 'skipped', reason: 'Total hook time budget exhausted' }); continue; }
          const result = await run(check.command, { cwd: root, timeoutMs: time, maxBytes: 64000 });
          results.push({ name: check.name, result: result.status === 0 && !result.error && !result.timedOut && !result.truncated ? 'passed' : 'failed', exitCode: result.status, timedOut: result.timedOut, truncated: result.truncated, output: redact(result.error || result.stderr || result.stdout).slice(-2000) });
        }
      } else {
        const staged = gitRead(root, ['diff', '--cached', '--name-only', '-z']);
        for (const file of candidates.slice(0, 10)) {
          if (!existsSync(file) || privateName(file.split(/[\\/]/).pop())) continue;
          const rel = relative(root, file).replaceAll('\\', '/');
          for (const formatter of selected.formatters.filter(f => !f.extensions.length || f.extensions.includes(extname(file)))) {
            if (staged === null || staged.split('\0').includes(rel)) { results.push({ name: formatter.name, file: rel, result: 'skipped', reason: 'Cannot safely format a staged file or a file without Git index evidence' }); continue; }
            const time = Math.min(formatter.timeoutMs, deadline - Date.now());
            if (time <= 0) { results.push({ name: formatter.name, result: 'skipped', reason: 'Total hook time budget exhausted' }); continue; }
            const result = await run(formatter.command.map(arg => arg === '{file}' ? file : arg), { cwd: root, timeoutMs: time, maxBytes: 64000 });
            results.push({ name: formatter.name, file: rel, result: result.status === 0 && !result.error && !result.timedOut && !result.truncated ? 'passed' : 'failed', output: redact(result.error || result.stderr || result.stdout).slice(-2000) });
          }
        }
      }
      // A formatter intentionally changes its input. A check must not certify a later tree.
      const finalSnapshot = fingerprint(root);
      const changedDuringChecks = key === 'stop' && JSON.stringify(snapshot) !== JSON.stringify(finalSnapshot);
      if (changedDuringChecks) for (const result of results) if (result.result === 'passed') { result.result = 'stale'; result.reason = 'Project changed while checks ran; verify the current tree.'; }
      atomicJson(root, statePath, { schemaVersion: 1, inputHash: key === 'edit' ? digest(JSON.stringify({ snapshot: finalSnapshot, config: configHash(selected), candidates })) : inputHash, observedAt: new Date().toISOString(), changedDuringChecks, results }, previous?.revision || 0);
    }
    if (key === 'stop' && selected.saveSummary) {
      const file = '.just-vibe/automation/continuation.json', previousSummary = existsSync(within(root, file)) ? readJson(within(root, file)) : null;
      const summary = redact(event.last_assistant_message || '').slice(0, 6000);
      if (previousSummary?.summary !== summary || previousSummary?.snapshot?.content !== snapshot.content || previousSummary?.snapshot?.head !== snapshot.head) atomicJson(root, file, { schemaVersion: 1, kind: 'automatic-continuation', observedAt: new Date().toISOString(), snapshot: fingerprint(root), summary, note: 'Last response and filesystem identity only; verify task state and checks before continuing.' }, previousSummary?.revision || 0);
    }
    return { results, ...(results.some(r => ['failed', 'stale'].includes(r.result)) ? { message: `just-vibe checks need attention: ${results.filter(r => ['failed', 'stale'].includes(r.result)).map(r => `${r.name} (${r.result})`).join(', ')}. See .just-vibe/automation/${key}.json.` } : {}) };
  } finally { closeSync(handle); unlinkSync(lock); }
}
