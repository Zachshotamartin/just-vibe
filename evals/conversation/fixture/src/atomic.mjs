import { writeFileSync, renameSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
export function atomicSave(path, text) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, text, { mode: 0o600 });
  renameSync(temporary, path);
}
