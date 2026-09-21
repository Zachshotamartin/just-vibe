import {
  lstatSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  linkSync,
  unlinkSync,
  renameSync,
  existsSync,
  chmodSync,
} from 'node:fs';
import { dirname } from 'node:path';
import { hostname } from 'node:os';
import { randomUUID } from 'node:crypto';

const busy = () =>
  Object.assign(Error('State is being updated; retry after the current writer finishes.'), {
    code: 'STATE_LOCKED',
  });
export function processAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid < 1)
    throw Error('Invalid lock owner; inspect it manually.');
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === 'ESRCH') return false;
    return true;
  }
}
function owner(path) {
  try {
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096)
      throw Error('Unknown or legacy lock ownership; inspect the lock before removing it.');
    const value = JSON.parse(readFileSync(path, 'utf8'));
    if (value.host && value.host !== hostname()) throw Error('Lock belongs to another host.');
    processAlive(value.pid); // Validate before any recovery decision.
    return value;
  } catch (error) {
    // The current writer may finish between a failed acquisition and this read.
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// Explicit maintenance must use the same gate as automatic dead-owner recovery.
export function recoverFileLock(path) {
  return withFileLock(`${path}.recovery`, () => {
    const current = owner(path);
    if (!current) return 'missing';
    if (processAlive(current.pid)) return 'active';
    unlinkSync(path);
    return 'recovered';
  });
}

// Publish fully written owner metadata atomically. A reaper mutex serializes
// dead-owner recovery so another reaper cannot unlink a newly acquired lease.
// This lock is local to one machine; PID reuse is conservatively treated as live.
export function withFileLock(path, operation, depth = 0) {
  if (depth > 4) throw Error('Repeatedly interrupted lock recovery; inspect lock ownership.');
  mkdirSync(dirname(path), { recursive: true });
  const token = randomUUID(),
    temporary = `${path}.${token}.owner`;
  writeFileSync(
    temporary,
    JSON.stringify({
      pid: process.pid,
      host: hostname(),
      token,
      createdAt: new Date().toISOString(),
    }),
    { flag: 'wx', mode: 0o600 },
  );
  try {
    try {
      linkSync(temporary, path);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const current = owner(path);
      if (!current || processAlive(current.pid)) throw busy();
      withFileLock(
        `${path}.recovery`,
        () => {
          const current = owner(path);
          if (!current) return;
          if (processAlive(current.pid)) throw busy();
          unlinkSync(path);
        },
        depth + 1,
      );
      try {
        linkSync(temporary, path);
      } catch (error) {
        if (error.code === 'EEXIST') throw busy();
        throw error;
      }
    }
  } finally {
    unlinkSync(temporary);
  }
  try {
    const result = operation();
    if (result?.then) throw Error('File-lock callbacks must finish synchronously.');
    return result;
  } finally {
    if (owner(path)?.token === token) unlinkSync(path);
  }
}

export function atomicFile(path, contents, mode = 0o600) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, contents, { flag: 'wx', mode });
    // Creation is filtered by umask. Apply the requested existing-file mode
    // explicitly so an atomic replacement does not remove its permissions.
    chmodSync(temporary, mode);
    renameSync(temporary, path);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}
