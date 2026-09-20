import { writeFileSync, renameSync, statSync, chmodSync, rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
export function atomicSave(path, text) {
  let mode = 0o600;
  try { mode = statSync(path).mode & 0o777; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temp = `${path}.${randomUUID()}.tmp`;
  try { writeFileSync(temp, text, { flag: 'wx', mode: 0o600 }); chmodSync(temp, mode); renameSync(temp, path); }
  finally { rmSync(temp, { force: true }); }
}
