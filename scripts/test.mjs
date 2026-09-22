import { readdirSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
if (process.platform === 'win32') for (const key of ['TMP', 'TEMP']) if (process.env[key]) process.env[key] = realpathSync.native(process.env[key]);
const root = fileURLToPath(new URL('../', import.meta.url));
const tests = readdirSync(new URL('../tests/', import.meta.url)).filter(name => name.endsWith('.test.mjs')).sort();
const result = spawnSync(process.execPath, ['--test', ...tests.map(name => `tests/${name}`)], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
