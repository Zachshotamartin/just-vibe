import { createHash } from 'node:crypto';

export function verifyPreparedRelease({ pkg, record, archive, checksum, head, dirty, ci }) {
  if (dirty) throw Error('Release source has uncommitted changes.');
  if (record.schemaVersion !== 1 || record.name !== pkg.name || record.version !== pkg.version || record.sourceCommit !== head) throw Error('Prepared archive does not match this package and source commit. Run release:prepare again.');
  const actual = createHash('sha256').update(archive).digest('hex');
  if (actual !== record.sha256 || actual !== checksum) throw Error('Prepared archive checksum mismatch.');
  if (!ci.some(run => run.headSha === head && run.status === 'completed' && run.conclusion === 'success')) throw Error('No successful complete Toolkit checks run for this source commit.');
  return { sha256: actual, integrity: `sha512-${createHash('sha512').update(archive).digest('base64')}` };
}
