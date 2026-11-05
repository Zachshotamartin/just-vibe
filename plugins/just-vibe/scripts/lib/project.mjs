import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
export { findExecutable } from './command.mjs';

const ignored = new Set(['.git', 'node_modules', '.venv', 'venv', 'dist', 'build', 'coverage', '.next', '.tmp', '.cache', '.codex', '.claude']);
const secretName = /(?:^\.env(?:\.|$)|\.(?:pem|key|p12|pfx)$|credentials|secrets?\.)/i;
const interesting = /^(?:AGENTS\.md|CLAUDE\.md|README(?:\.md)?|package\.json|pyproject\.toml|requirements[^/]*\.txt|Cargo\.toml|go\.mod|Dockerfile[^/]*|compose\.ya?ml|(?:vite|next|vitest|jest|playwright)\.config\.[a-z]+|vercel\.json|prisma\.schema|schema\.prisma|Gemfile|pom\.xml|Makefile)$/;

export function gitRead(root, args, { maxBuffer = 512 * 1024, timeout = 5000, trim = true } = {}) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')));
  const result = spawnSync('git', ['--no-optional-locks', '--no-pager', '--no-replace-objects', '-c', 'core.fsmonitor=false', '-C', root, ...args], {
    encoding: 'utf8', timeout, maxBuffer, shell: false, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...env, GIT_TERMINAL_PROMPT: '0' },
  });
  return result.status === 0 ? (trim ? result.stdout.trim() : result.stdout) : null;
}

// Hooks resolve the project root on every tool call. Git finds a work tree by walking up to the
// nearest .git entry, so the same walk answers without a ~10 ms subprocess. Anything unusual (a
// path inside .git or a bare repository, another owner's repository, a malformed or linked
// entry) still asks git. gitRead clears GIT_* variables, so neither answer follows GIT_DIR.
export function projectTopLevel(cwd, { git = gitRead } = {}) {
  const ask = () => git(cwd, ['rev-parse', '--show-toplevel']);
  let dir, device;
  try { dir = realpathSync.native(resolve(cwd)); device = statSync(dir).dev; } catch { return null; }
  if (dir.split(sep).includes('.git')) return ask();
  for (;;) {
    const entry = join(dir, '.git');
    let stat = null;
    try { stat = lstatSync(entry); } catch { /* not here; keep walking */ }
    if (stat) {
      const uid = process.getuid?.();
      let valid = false;
      try { valid = stat.isDirectory() ? existsSync(join(entry, 'HEAD')) : stat.isFile() && readFileSync(entry, 'utf8').startsWith('gitdir: '); } catch { /* ask git */ }
      if (!valid || (uid !== undefined && stat.uid !== uid)) return ask();
      // Git reports Windows paths with forward slashes; keep callers' strings identical.
      return process.platform === 'win32' ? dir.replaceAll('\\', '/') : dir;
    }
    if (existsSync(join(dir, 'HEAD'))) return ask();
    const parent = dirname(dir);
    if (parent === dir) return null;
    // Like git, stop at a mount point.
    try { if (statSync(parent).dev !== device) return null; } catch { return ask(); }
    dir = parent;
  }
}

export function inspectProject(path = process.cwd(), { maxEntries = 3000, maxDepth = 5, git = gitRead } = {}) {
  if (!Number.isInteger(maxEntries) || maxEntries < 1 || maxEntries > 10000) throw new Error('Invalid inspection entry budget.');
  if (!Number.isInteger(maxDepth) || maxDepth < 0 || maxDepth > 10) throw new Error('Invalid inspection depth.');
  const root = realpathSync(resolve(path));
  if (!statSync(root).isDirectory()) throw new Error('Project root must be a directory.');
  const manifests = [], packages = [], instructions = [], errors = [];
  let scanned = 0, truncated = false;
  const queue = [{ path: root, depth: 0 }];
  while (queue.length && scanned < maxEntries) {
    const current = queue.shift();
    let entries;
    try { entries = readdirSync(current.path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)); }
    catch { errors.push(`Cannot read directory: ${relative(root, current.path) || '.'}`); continue; }
    for (const entry of entries) {
      if (++scanned > maxEntries) { truncated = true; break; }
      if (entry.isSymbolicLink() || ignored.has(entry.name) || secretName.test(entry.name)) continue;
      const file = join(current.path, entry.name);
      if (entry.isDirectory()) {
        if (current.depth < maxDepth) queue.push({ path: file, depth: current.depth + 1 });
        else truncated = true;
        continue;
      }
      if (!entry.isFile() || !interesting.test(entry.name)) continue;
      const rel = relative(root, file);
      manifests.push(rel);
      if (['AGENTS.md', 'CLAUDE.md'].includes(entry.name)) instructions.push(rel);
      if (entry.name === 'package.json') {
        try {
          if (statSync(file).size > 256 * 1024) throw new Error('size');
          const pkg = JSON.parse(readFileSync(file, 'utf8'));
          packages.push({ path: rel, scripts: Object.keys(pkg.scripts || {}),
            dependencies: Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).sort() });
        } catch { errors.push(`Cannot parse bounded manifest: ${rel}`); }
      }
    }
  }
  if (queue.length) truncated = true;
  const gitRoot = git(root, ['rev-parse', '--show-toplevel']);
  return { root, manifests, packages, instructions, errors, truncated, scanned: Math.min(scanned, maxEntries),
    git: gitRoot ? { root: gitRoot, head: git(root, ['rev-parse', '--verify', 'HEAD']), branch: git(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']) } : null,
    note: 'Read-only inventory. Script names are discovered, not executed. No environment values, config code, hooks, or package scripts are evaluated. Ancestor instructions must also be read by the host.' };
}
