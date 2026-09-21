import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { npm } from './lib/npm.mjs';
import { verifyPreparedRelease, verifyRegistryExecution } from './lib/publication.mjs';
import { releaseEnvironment, releaseGit } from './lib/git.mjs';

const args = process.argv.slice(2);
if (args.length > 1 || (args.length && !['--check', '--publish'].includes(args[0]))) throw Error('Use --check (default) or --publish.');
const root = fileURLToPath(new URL('../', import.meta.url));
const options = { cwd: root, env: releaseEnvironment(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] };
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'))), path = resolve(root, `dist/${pkg.name}-${pkg.version}.tgz`);
const head = releaseGit(root, ['rev-parse', 'HEAD']);
const ci = JSON.parse(execFileSync('gh', ['run', 'list', '--repo', 'Zachshotamartin/just-vibe', '--workflow', 'ci.yml', '--commit', head, '--limit', '20', '--json', 'headSha,status,conclusion'], options));
const verified = verifyPreparedRelease({ pkg, record: JSON.parse(readFileSync(`${path}.release.json`)), archive: readFileSync(path), checksum: readFileSync(`${path}.sha256`, 'utf8').split(' ')[0], head, dirty: releaseGit(root, ['status', '--porcelain']), ci });
const registry = ['--registry=https://registry.npmjs.org/'];
let account;
try { account = npm(['whoami', ...registry], options).trim(); } catch { throw Error('npm login is required on this machine. Run npm login --registry=https://registry.npmjs.org/ and complete authentication outside chat.'); }
function publishedIntegrity() {
  try { return JSON.parse(npm(['view', `${pkg.name}@${pkg.version}`, 'dist.integrity', '--json', ...registry], options)); }
  catch (error) { if (/E404/.test(String(error.stderr))) return null; throw Error('Could not inspect registry state. Nothing was published or retried.'); }
}
const existing = publishedIntegrity();
if (existing && existing !== verified.integrity) throw Error('This version already exists with different bytes. Choose a new version; never overwrite or blindly retry.');
console.log(`Verified ${pkg.name}@${pkg.version}, commit ${head}, archive ${verified.sha256}, npm account ${account}.`);
if (args[0] !== '--publish') console.log(existing ? 'The exact archive is already published.' : 'Ready. Run npm run release:publish -- --publish to publish this exact archive.');
else {
  if (!existing) {
    try { npm(['publish', path, '--access', 'public', '--ignore-scripts', ...registry], { cwd: root, env: options.env, stdio: 'inherit' }); }
    catch { if (publishedIntegrity() !== verified.integrity) throw Error('Publication did not verify. Inspect npm authentication and registry state before retrying; no automatic retry was made.'); }
  }
  if (publishedIntegrity() !== verified.integrity) throw Error('Registry has not confirmed this exact archive. Do not republish blindly.');
  const version = verifyRegistryExecution(pkg);
  console.log(`Published and verified registry execution: ${pkg.name}@${version}`);
}
