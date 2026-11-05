import { existsSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { findExecutable } from './command.mjs';

// Credential locations a worker never needs to read. Missing entries are skipped.
export const SECRET_PATHS = ['.ssh', '.aws', '.gnupg', '.config/gcloud', '.docker/config.json', '.netrc', '.npmrc', '.pypirc', '.kube/config'];
// Directories and file prefixes each CLI writes for its own session state.
export const CLI_STATE = {
  claude: { directories: ['.claude', 'Library/Caches/claude-cli-nodejs', '.cache/claude-cli-nodejs', '.config/claude'], prefixes: ['.claude.json'], env: ['CLAUDE_CONFIG_DIR'] },
  codex: { directories: ['.codex'], prefixes: [], env: ['CODEX_HOME'] },
};
const SEATBELT = '/usr/bin/sandbox-exec';

// Control characters cannot appear in a path the sandbox is asked to trust.
function checked(path) {
  if (typeof path !== 'string' || !path || /[\0-\x1f\x7f]/.test(path)) throw Error('Sandbox paths must be non-empty and free of control characters.');
  return path;
}
// Seatbelt matches resolved paths (/var is /private/var on macOS). A missing
// leaf resolves through its nearest existing parent.
export function realPath(path) {
  checked(path);
  if (existsSync(path)) return realpathSync.native(path);
  const parent = dirname(path);
  return parent === path ? path : join(realPath(parent), basename(path));
}

export function stateLocations(host, home, env = process.env) {
  const state = CLI_STATE[host] || { directories: [], prefixes: [], env: [] };
  const custom = state.env.map(key => env[key]).filter(value => typeof value === 'string' && value.startsWith('/'));
  return {
    directories: [...new Set([...state.directories.map(d => join(home, d)), ...custom].map(realPath))],
    prefixes: state.prefixes.map(p => realPath(join(home, p))),
  };
}

export function seatbeltProfile({ writable, prefixes = [], denyRead }) {
  const params = [], rule = (kind, values, name) => values.map((value, index) => {
    params.push(`-D`, `${name}${index}=${checked(value)}`);
    return `(${kind} (param "${name}${index}"))`;
  }).join(' ');
  // Paths travel as -D parameters, so no path text is ever parsed as profile syntax.
  const profile = [
    '(version 1)',
    '(allow default)',
    '(deny file-write*)',
    `(allow file-write* (subpath "/dev") ${rule('subpath', writable, 'WRITE_')} ${rule('prefix', prefixes, 'STATE_')})`,
    denyRead.length ? `(deny file-read* file-write* ${rule('subpath', denyRead, 'SECRET_')})` : '',
  ].filter(Boolean).join('\n');
  return { profile, params };
}

export function bubblewrapArgs({ writable, denyRead }) {
  const args = ['--ro-bind', '/', '/', '--dev', '/dev', '--proc', '/proc', '--tmpfs', '/tmp'];
  for (const path of writable) if (existsSync(path)) args.push('--bind', checked(path), path);
  for (const path of denyRead) {
    if (!existsSync(path)) continue;
    // Hide credential directories behind an empty tmpfs and files behind /dev/null.
    args.push(...(statSync(path).isDirectory() ? ['--tmpfs', checked(path)] : ['--ro-bind', '/dev/null', checked(path)]));
  }
  return [...args, '--unshare-pid', '--unshare-ipc', '--unshare-uts', '--die-with-parent', '--new-session', '--'];
}

function probe(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'], shell: false });
  return result.status === 0 ? null : (result.stderr || result.error?.message || `exit ${result.status}`).trim().slice(0, 300);
}

export function osSandboxSupport(platform = process.platform, env = process.env) {
  if (platform === 'darwin') {
    if (!existsSync(SEATBELT)) return { available: false, mechanism: 'macos-seatbelt', reason: 'sandbox-exec is not present.' };
    const failure = probe(SEATBELT, ['-p', '(version 1)(allow default)', '/usr/bin/true']);
    return failure ? { available: false, mechanism: 'macos-seatbelt', reason: failure } : { available: true, mechanism: 'macos-seatbelt', command: SEATBELT };
  }
  if (platform === 'linux') {
    const bwrap = findExecutable('bwrap', env);
    if (!bwrap) return { available: false, mechanism: 'linux-bubblewrap', reason: 'Install bubblewrap (bwrap) to use the os sandbox.' };
    const failure = probe(bwrap, ['--ro-bind', '/', '/', '--dev', '/dev', '--', 'true']);
    return failure ? { available: false, mechanism: 'linux-bubblewrap', reason: `bubblewrap cannot create a namespace here: ${failure}` } : { available: true, mechanism: 'linux-bubblewrap', command: bwrap };
  }
  return { available: false, mechanism: null, reason: `No os-level worker sandbox exists for ${platform}; use sandbox host or standard.` };
}

// Wrap a worker command so only the worktree, its Git admin directory, the job
// temp directory and the CLI's own state are writable, and credentials are unreadable.
// Inspect workers (readOnly) may write only their temp directory and CLI state.
export function wrapCommand(command, { host, worktree, gitDir, temp, home, readOnly = false, env = process.env, support = osSandboxSupport() }) {
  if (!support.available) throw Error(`The os worker sandbox is unavailable: ${support.reason}`);
  const state = stateLocations(host, home, env);
  const writable = [...new Set((readOnly ? [temp] : [worktree, gitDir, temp]).map(realPath))];
  const denyRead = SECRET_PATHS.map(p => realPath(join(home, p)));
  if (support.mechanism === 'macos-seatbelt') {
    const { profile, params } = seatbeltProfile({ writable: [...writable, ...state.directories], prefixes: state.prefixes, denyRead });
    return { command: [support.command, ...params, '-p', profile, ...command], applied: support.mechanism, writable: [...writable, ...state.directories], denyRead };
  }
  const args = bubblewrapArgs({ writable: [...writable, ...state.directories, ...state.prefixes.filter(existsSync)], denyRead });
  return { command: [support.command, ...args, ...command], applied: support.mechanism, writable, denyRead };
}
