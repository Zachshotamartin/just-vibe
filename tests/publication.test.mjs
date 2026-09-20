import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { verifyPreparedRelease, verifyRegistryExecution } from '../scripts/lib/publication.mjs';

test('registry execution cannot resolve this source checkout and cleans up on success or failure', () => {
  const pkg = { name: 'just-vibe', version: '0.8.0' };
  for (const outcome of ['0.8.0', '0.7.0', new Error('registry unavailable')]) {
    let directory;
    const run = (args, options) => {
      directory = options.cwd;
      assert.notEqual(directory, process.cwd());
      assert.equal(existsSync(join(directory, 'package.json')), false);
      assert.ok(args.includes('--package=just-vibe@0.8.0'));
      assert.equal(options.env.npm_config_cache, join(directory, 'cache'));
      if (outcome instanceof Error) throw outcome;
      return `${outcome}\n`;
    };
    if (outcome === pkg.version) assert.equal(verifyRegistryExecution(pkg, { run }), pkg.version);
    else assert.throws(() => verifyRegistryExecution(pkg, { run }));
    assert.equal(existsSync(directory), false);
  }
});

test('publication binds archive bytes, package identity, clean source and completed CI', () => {
  const archive = Buffer.from('prepared archive'), checksum = createHash('sha256').update(archive).digest('hex');
  const valid = { pkg: { name: 'just-vibe', version: '0.7.0' }, record: { schemaVersion: 1, name: 'just-vibe', version: '0.7.0', sha256: checksum, sourceCommit: 'abc' }, head: 'abc', archive, checksum, dirty: '', ci: [{ headSha: 'abc', status: 'completed', conclusion: 'success' }] };
  assert.match(verifyPreparedRelease(valid).integrity, /^sha512-/);
  for (const change of [{ archive: Buffer.from('changed') }, { checksum: 'changed' }, { head: 'def' }, { dirty: 'M file' }, { ci: [] }, { ci: [{ headSha: 'def', status: 'completed', conclusion: 'success' }] }, { ci: [{ headSha: 'abc', status: 'in_progress', conclusion: '' }] }]) assert.throws(() => verifyPreparedRelease({ ...valid, ...change }));
});
