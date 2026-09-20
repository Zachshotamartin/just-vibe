import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { npm } from './npm.mjs';

export function verifyRegistryExecution(pkg, { run = npm } = {}) {
  // Inside this package's checkout npm exec may select the local package without
  // installing its bin. Verify registry bytes from an unrelated cwd and cache.
  const directory = mkdtempSync(join(tmpdir(), 'just-vibe-registry-'));
  try {
    const version = run(['exec', '--yes', `--package=${pkg.name}@${pkg.version}`, '--registry=https://registry.npmjs.org/', '--', pkg.name, '--version'], {
      cwd: directory, env: { ...process.env, npm_config_cache: join(directory, 'cache') },
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    if (version !== pkg.version) throw Error('Registry execution returned an unexpected version.');
    return version;
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

export function verifyPreparedRelease({ pkg, record, archive, checksum, head, dirty, ci }) {
  if (dirty) throw Error('Release source has uncommitted changes.');
  if (record.schemaVersion !== 1 || record.name !== pkg.name || record.version !== pkg.version || record.sourceCommit !== head) throw Error('Prepared archive does not match this package and source commit. Run release:prepare again.');
  const actual = createHash('sha256').update(archive).digest('hex');
  if (actual !== record.sha256 || actual !== checksum) throw Error('Prepared archive checksum mismatch.');
  if (!ci.some(run => run.headSha === head && run.status === 'completed' && run.conclusion === 'success')) throw Error('No successful complete Toolkit checks run for this source commit.');
  return { sha256: actual, integrity: `sha512-${createHash('sha512').update(archive).digest('base64')}` };
}
