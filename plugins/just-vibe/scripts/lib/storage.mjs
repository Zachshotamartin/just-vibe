import { existsSync, lstatSync, realpathSync, readFileSync, readlinkSync, mkdirSync, openSync, closeSync, writeFileSync, renameSync, unlinkSync, readdirSync } from 'node:fs';
import { resolve, join, relative, sep, dirname, isAbsolute } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { gitRead } from './project.mjs';
import { withFileLock, atomicFile } from './file-lock.mjs';

export const digest = value => createHash('sha256').update(value).digest('hex');
export const projectRoot = root => realpathSync.native(resolve(root));
export const privateName = name => /(?:^\.env(?:\.|$)|\.(?:pem|key|p12|pfx)$|credentials|secrets?\.)/i.test(name);

export function within(root, path) {
  const base = projectRoot(root);
  let full = resolve(base, path);
  // Expand Windows short names before containment checks, without following
  // symlinks/junctions supplied below the selected root.
  if (process.platform === 'win32' && isAbsolute(path)) {
    let cursor = full, tail = [];
    while (!existsSync(cursor)) { const parent = dirname(cursor); if (parent === cursor) break; tail.unshift(cursor.slice(parent.length).replace(/^[\\/]+/, '')); cursor = parent; }
    let inspect = cursor;
    while (inspect !== dirname(inspect)) {
      if (lstatSync(inspect).isSymbolicLink()) throw Error('Symlink paths are not supported for managed state or evidence.');
      inspect = dirname(inspect);
    }
    if (existsSync(cursor)) full = resolve(realpathSync.native(cursor), ...tail);
  }
  const rel = relative(base, full);
  if (isAbsolute(rel) || rel === '..' || rel.startsWith(`..${sep}`)) throw Error('Path escapes the selected project.');
  let cursor = base;
  for (const part of rel.split(sep).filter(Boolean)) {
    cursor = join(cursor, part);
    if (existsSync(cursor) || (() => { try { return lstatSync(cursor).isSymbolicLink(); } catch { return false; } })()) {
      if (lstatSync(cursor).isSymbolicLink()) throw Error('Symlink paths are not supported for managed state or evidence.');
    }
  }
  return full;
}

export function readJson(path, limit = 512 * 1024) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > limit) throw Error('Expected a bounded regular JSON file.');
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function atomicJson(root, relativePath, value, expectedRevision, maxBytes = 512 * 1024) {
  const path = within(root, relativePath);
  within(root, dirname(path));
  mkdirSync(dirname(path), { recursive: true });
  return withFileLock(`${path}.lock`, () => {
    const previous = existsSync(path) ? readJson(path, maxBytes) : null;
    if ((previous?.revision ?? 0) !== expectedRevision) throw Error('State revision changed. Read it again before updating.');
    const record = { ...value, revision: expectedRevision + 1 };
    const text = JSON.stringify(record, null, 2) + '\n';
    if (Buffer.byteLength(text) > maxBytes) throw Error(`State exceeds ${maxBytes} bytes.`);
    atomicFile(path, text);
    return record;
  });
}

// perFile keeps a short identity per path so a later comparison can name changed files; records
// that only need staleness (evidence, goals, QA attempts) keep the single digest.
export function fingerprint(root, { perFile = false } = {}) {
  const base = projectRoot(root);
  const head = gitRead(base, ['rev-parse', '--verify', 'HEAD']);
  const branch = gitRead(base, ['symbolic-ref', '--quiet', '--short', 'HEAD']);
  const repo = gitRead(base, ['rev-parse', '--show-toplevel']);
  const entries = []; let bytes = 0, visited = 0, partial = false;
  function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (++visited > 10000) { partial = true; return; }
      if (['.git', '.just-vibe', 'node_modules', '.venv', 'venv', 'dist', 'build', 'coverage', '.next', '.tmp', '.cache', 'PLAN.md', 'NAMING.md'].includes(entry.name) || privateName(entry.name)) continue;
      const file = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        // Link identity is observed, but its target contents are not covered.
        partial = true;
        entries.push([relative(base, file), 'symlink', readlinkSync(file)]);
        continue;
      }
      if (entry.isDirectory()) collect(file);
      else if (entry.isFile()) {
        const stat = lstatSync(file);
        if (stat.size > 8 * 1024 * 1024 || bytes + stat.size > 32 * 1024 * 1024) { partial = true; entries.push([relative(base, file), stat.mode, stat.size, stat.mtimeMs, 'metadata-only']); }
        else { bytes += stat.size; entries.push([relative(base, file), stat.mode, digest(readFileSync(file))]); }
      }
    }
  }
  collect(base);
  // Save hashes, never the patch or file contents. Index changes matter even when worktree bytes do not change.
  const index = repo ? gitRead(base, ['diff', '--cached', '--no-ext-diff', '--no-textconv', '--binary', '--', '.', ':(exclude).just-vibe']) : '';
  if (repo && index === null) partial = true;
  const snapshot = { root: base, repository: repo, head, branch, files: entries.length, content: digest(JSON.stringify(entries)), index: digest(index || ''), partial };
  // Reported paths use '/' on every platform, so a record reads the same wherever it is resumed.
  if (perFile) snapshot.entries = Object.fromEntries(entries.map(([path, ...identity]) => [path.split(sep).join('/'), digest(JSON.stringify(identity)).slice(0, 12)]));
  return snapshot;
}

const LISTED_CHANGES = 200;
export function compareSnapshot(saved, current) {
  const differences = ['root', 'repository', 'head', 'branch', 'content', 'index'].filter(key => saved?.[key] !== current[key]);
  if (saved?.partial || current.partial) differences.push('incomplete-snapshot-coverage');
  const { entries, ...shown } = current;
  const result = { stale: differences.length > 0, differences, current: shown };
  if (!entries) return result;
  // Snapshots saved without per-file identities can report drift but not which files changed.
  if (!saved?.entries) return { ...result, changedFiles: null };
  const before = saved.entries, after = entries;
  const added = Object.keys(after).filter(path => !Object.hasOwn(before, path)).sort();
  const removed = Object.keys(before).filter(path => !Object.hasOwn(after, path)).sort();
  const modified = Object.keys(after).filter(path => Object.hasOwn(before, path) && before[path] !== after[path]).sort();
  const truncated = [added, removed, modified].some(list => list.length > LISTED_CHANGES);
  return { ...result, changedFiles: { added: added.slice(0, LISTED_CHANGES), removed: removed.slice(0, LISTED_CHANGES), modified: modified.slice(0, LISTED_CHANGES), truncated } };
}
