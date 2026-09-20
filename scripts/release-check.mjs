import assert from 'node:assert/strict';
import { readFileSync, lstatSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npm, packResult } from './lib/npm.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
assert.equal(pkg.private, undefined, 'Remove the private publication block deliberately.');
assert.equal(pkg.license, 'MIT');
assert.equal(pkg.publishConfig.registry, 'https://registry.npmjs.org/');
assert.match(pkg.version, /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/);
const license = readFileSync(resolve(root, 'LICENSE'), 'utf8');
assert.match(license, /Copyright \(c\) 2026 Zachary Martin/);
assert.equal(license, readFileSync(resolve(root, 'plugins/just-vibe/LICENSE'), 'utf8'));
assert.ok(readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8').includes(`## ${pkg.version}`), 'Add release notes for this version.');
const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));
assert.equal(lock.version, pkg.version);
assert.equal(lock.packages[''].version, pkg.version);
const archive = packResult(npm(['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' }));
const paths = new Set(archive.files.map(file => file.path));
for (const required of ['LICENSE', 'README.md', 'CHANGELOG.md', 'docs/releases.md', 'docs/compatibility.md', 'plugins/just-vibe/LICENSE']) assert.ok(paths.has(required), `Missing: ${required}`);
for (const path of paths) {
  assert.match(path, /^(?:bin\/|plugins\/just-vibe\/|\.agents\/plugins\/marketplace\.json$|\.claude-plugin\/marketplace\.json$|docs\/|evals\/|package\.json$|README\.md$|LICENSE$|CHANGELOG\.md$)/, `Unexpected archive file: ${path}`);
  assert.doesNotMatch(path, /(?:^|\/)(?:PLAN\.md|NAMING\.md|\.env(?:\..*)?|\.npmrc|\.git|node_modules|\.tmp|credentials[^/]*)(?:\/|$)/i, `Private/development file: ${path}`);
  const absolute = resolve(root, path);
  assert.ok(lstatSync(absolute).isFile(), `Archive must contain regular files: ${path}`);
  const content = readFileSync(absolute, 'utf8');
  const secretPatterns = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|npm_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16})\b/];
  assert.ok(!secretPatterns.some(pattern => pattern.test(content)), `Possible credential in archive: ${path}`);
  if (path.endsWith('.md')) for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
    const link = match[1].split('#')[0];
    if (!link || /^[a-z]+:/i.test(link) || link.startsWith('/')) continue;
    const target = resolve(absolute, '..', link);
    assert.ok(existsSync(target), `Broken relative link in ${path}: ${link}`);
    const relative = target.slice(root.length).replaceAll('\\', '/');
    assert.ok(paths.has(relative) || [...paths].some(file => file.startsWith(`${relative.replace(/\/$/, '')}/`)), `Link target not shipped: ${path} -> ${link}`);
  }
}
assert.equal(readFileSync(resolve(root, pkg.bin['just-vibe']), 'utf8').split('\n')[0], '#!/usr/bin/env node');
console.log(`Release metadata, MIT notices, ${paths.size} archive files, links, and credential-pattern checks passed (v${pkg.version}).`);
