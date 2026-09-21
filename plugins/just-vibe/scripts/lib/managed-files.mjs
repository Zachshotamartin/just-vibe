import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  lstatSync,
} from 'node:fs';
import { dirname } from 'node:path';
import { within, readJson, digest, atomicJson } from './storage.mjs';
import { requireId } from './runtime-store.mjs';
import { withFileLock, atomicFile } from './file-lock.mjs';

// An interrupted update is resumed from a hash journal. Only old/new owned bytes
// may be replaced; a user edit stops the whole preflight before any mutation.
export function managedFiles(root, id, files, operation, { dryRun = false, allowed } = {}) {
  requireId(id);
  if (operation === 'doctor' || dryRun)
    return manage(root, id, files, operation, { dryRun, allowed });
  return withFileLock(within(root, `.just-vibe/installations/${id}.lock`),
    () => manage(root, id, files, operation, { dryRun, allowed }));
}
function manage(root, id, files, operation, { dryRun, allowed }) {
  const recordPath = `.just-vibe/installations/${id}.json`,
    journalPath = `.just-vibe/installations/${id}-pending.json`;
  const read = (path) =>
    existsSync(within(root, path)) ? readJson(within(root, path), 1024 * 1024) : null;
  const state = read(recordPath) || { revision: 0, files: {} },
    pending = read(journalPath);
  const previous = state.files;
  if (!previous || typeof previous !== 'object') throw Error('Invalid installation record.');
  const next =
    operation === 'uninstall'
      ? {}
      : Object.fromEntries([...files].map(([p, content]) => [p, digest(content)]));
  const paths = new Set([
    ...Object.keys(previous),
    ...Object.keys(next),
    ...Object.keys(pending?.files || {}),
  ]);
  const conflicts = [],
    observed = {};
  for (const path of paths) {
    if (
      !allowed(path) ||
      path.includes('\\') ||
      path.startsWith('/') ||
      path.split('/').some((p) => ['.', '..', ''].includes(p))
    )
      throw Error('Installation ownership path is outside its namespace.');
    const full = within(root, path);
    let current = null;
    if (existsSync(full)) {
      const stat = lstatSync(full);
      if (!stat.isFile() || stat.size > 2 * 1024 * 1024)
        throw Error('Managed output must be a bounded regular file.');
      current = digest(readFileSync(full));
    }
    observed[path] = current;
    if (current !== null && current !== previous[path] && current !== pending?.files?.[path]?.next)
      conflicts.push(path);
  }
  if (operation === 'doctor')
    return {
      installed: state.revision > 0 && Object.keys(previous).length > 0,
      revision: state.revision,
      conflicts,
      missing: Object.keys(previous).filter((p) => observed[p] === null),
      outdated: [...paths].filter((p) => previous[p] !== next[p]),
      interrupted: !!pending,
    };
  if (conflicts.length)
    throw Error(
      `Managed files were edited or belong to someone else; preserve them before retrying: ${conflicts.slice(0, 10).join(', ')}`,
    );
  if (dryRun)
    return {
      operation,
      writes: Object.keys(next).length,
      removes: [...paths].filter((p) => !(p in next)),
      dryRun: true,
      planHash: digest(JSON.stringify({ revision: state.revision, observed, next })),
    };
  // Revalidate under the lock before publishing the journal or changing files.
  if ((read(recordPath)?.revision || 0) !== state.revision)
    throw Error('Installation revision changed.');
  for (const path of paths) {
    const full = within(root, path),
      hash = existsSync(full) ? digest(readFileSync(full)) : null;
    if (hash !== observed[path]) throw Error('A managed file changed during preflight.');
  }
  atomicJson(
    root,
    journalPath,
    {
      files: Object.fromEntries(
        [...paths].map((p) => [p, { old: observed[p], next: next[p] || null }]),
      ),
    },
    pending?.revision || 0,
    1024 * 1024,
  );
  for (const path of paths) {
    const full = within(root, path);
    if (next[path]) {
      mkdirSync(dirname(full), { recursive: true });
      atomicFile(full, files.get(path), existsSync(full) ? lstatSync(full).mode & 0o777 : 0o600);
    } else if (existsSync(full)) unlinkSync(full);
  }
  const result = atomicJson(root, recordPath, { files: next }, state.revision, 1024 * 1024);
  unlinkSync(within(root, journalPath));
  return { operation, revision: result.revision, files: Object.keys(next).length };
}
