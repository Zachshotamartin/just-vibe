import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function isDirectRun(moduleUrl, argument = process.argv[1]) {
  if (!argument) return false;
  try {
    return realpathSync(argument) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    // Imports from stdin/eval have no filesystem entry point.
    return false;
  }
}
