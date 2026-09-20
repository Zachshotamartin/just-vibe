import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyPreparedRelease } from '../scripts/lib/publication.mjs';

test('publication binds archive bytes, package identity, clean source and completed CI', () => {
  const archive = Buffer.from('prepared archive'), checksum = createHash('sha256').update(archive).digest('hex');
  const valid = { pkg: { name: 'just-vibe', version: '0.7.0' }, record: { schemaVersion: 1, name: 'just-vibe', version: '0.7.0', sha256: checksum, sourceCommit: 'abc' }, head: 'abc', archive, checksum, dirty: '', ci: [{ headSha: 'abc', status: 'completed', conclusion: 'success' }] };
  assert.match(verifyPreparedRelease(valid).integrity, /^sha512-/);
  for (const change of [{ archive: Buffer.from('changed') }, { checksum: 'changed' }, { head: 'def' }, { dirty: 'M file' }, { ci: [] }, { ci: [{ headSha: 'def', status: 'completed', conclusion: 'success' }] }, { ci: [{ headSha: 'abc', status: 'in_progress', conclusion: '' }] }]) assert.throws(() => verifyPreparedRelease({ ...valid, ...change }));
});
