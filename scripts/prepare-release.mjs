import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { npm, packResult } from './lib/npm.mjs';
import { releaseEnvironment, releaseGit } from './lib/git.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const destination = resolve(root, 'dist');
const env = releaseEnvironment();
const git = args => releaseGit(root, args);
const sourceCommit = git(['rev-parse', 'HEAD']);
function assertSourceUnchanged() {
  if (git(['status', '--porcelain']) || git(['rev-parse', 'HEAD']) !== sourceCommit)
    throw new Error('Release source changed or is uncommitted. Prepare again from a clean, unchanged commit.');
}
assertSourceUnchanged();
npm(['run', 'release:check'], { cwd: root, env, stdio: 'inherit' });
assertSourceUnchanged();
mkdirSync(destination, { recursive: true });
const packed = packResult(npm(['pack', '--json', '--ignore-scripts', '--pack-destination', destination], { cwd: root, env, encoding: 'utf8' }));
const archive = resolve(destination, packed.filename);
const archiveHash = () => createHash('sha256').update(readFileSync(archive)).digest('hex');
const digest = archiveHash();
function assertArchiveUnchanged() {
  if (archiveHash() !== digest) throw new Error('Release archive changed during verification. Prepare again.');
}
execFileSync(process.execPath, [resolve(root, 'scripts/smoke-package-managers.mjs'), archive], { cwd: root, env, stdio: 'inherit' });
assertArchiveUnchanged();
// An absolute path avoids npm interpreting a bare dir/file argument as GitHub shorthand.
npm(['publish', archive, '--dry-run', '--ignore-scripts', '--json'], { cwd: root, env, stdio: 'pipe' });
assertSourceUnchanged();
assertArchiveUnchanged();
console.log('npm publication dry run accepted the verified local archive.');
writeFileSync(resolve(destination, `${packed.filename}.sha256`), `${digest}  ${packed.filename}\n`);
writeFileSync(resolve(destination, `${packed.filename}.release.json`), JSON.stringify({ schemaVersion: 1, name: JSON.parse(readFileSync(resolve(root, 'package.json'))).name, version: JSON.parse(readFileSync(resolve(root, 'package.json'))).version, sha256: digest, sourceCommit, preparedAt: new Date().toISOString() }, null, 2) + '\n');
console.log(`Verified release artifact: ${archive}\nSHA-256: ${digest}`);
