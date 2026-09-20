import { accessSync, constants, existsSync, readFileSync, statSync } from 'node:fs';
import { delimiter, dirname, extname, isAbsolute, resolve } from 'node:path';

export function findExecutable(name, env = process.env) {
  const directories = isAbsolute(name) ? [''] : (env.PATH || env.Path || '').split(delimiter).filter(Boolean);
  const extensions = process.platform === 'win32' && !extname(name)
    ? ['', ...(env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';')] : [''];
  for (const dir of directories) for (const extension of extensions) {
    const path = resolve(dir, `${name}${extension}`);
    try { accessSync(path, constants.X_OK); if (statSync(path).isFile()) return path; } catch {}
  }
  return null;
}

export function commandInvocation(binary, args) {
  if (process.platform !== 'win32') return [binary, args];
  const executable = findExecutable(binary);
  if (!executable || !/\.(cmd|bat)$/i.test(executable)) return [executable || binary, args];
  // Resolve standard npm-generated Node shims without invoking cmd.exe or evaluating user input.
  const shim = readFileSync(executable, 'utf8');
  for (const match of shim.matchAll(/"%dp0%\\([^"\r\n]+\.(?:[cm]?js))"/gi)) {
    const script = resolve(dirname(executable), match[1]);
    if (existsSync(script)) return [process.execPath, [script, ...args]];
  }
  throw new Error(`Unsupported Windows command wrapper: ${executable}. Install the native executable or a standard npm CLI shim.`);
}
