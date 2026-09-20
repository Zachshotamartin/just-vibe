import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npm } from './lib/npm.mjs';
import { stageBundle, validateBundle } from '../plugins/just-vibe/scripts/lib/bundle.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const temp = mkdtempSync(join(tmpdir(), 'just-vibe pm '));
try {
  const archive = process.argv[2] ? resolve(process.argv[2]) : join(temp, JSON.parse(npm(['pack', '--json', '--ignore-scripts', '--pack-destination', temp], { cwd: root, encoding: 'utf8' }))[0].filename);
  const bootstrap = join(temp, 'managers');
  mkdirSync(bootstrap);
  writeFileSync(join(bootstrap, 'package.json'), '{"private":true}\n');
  console.log('Preparing isolated pnpm 10.14.0, pnpm 12.5.1 and Yarn 4.18.0 executables.');
  npm(['install', '--prefix', bootstrap, '--ignore-scripts', '--no-audit', '--no-fund', 'pnpm@10.14.0', 'pnpm-current@npm:pnpm@12.5.1', '@yarnpkg/cli-dist@4.18.0'], { cwd: bootstrap, stdio: 'pipe', timeout: 180_000 });
  const managers = [
    ['npm', args => npm(['exec', '--yes', `--package=${archive}`, '--', 'just-vibe', ...args], options)],
    ['pnpm 10', args => execFileSync(process.execPath, [join(bootstrap, 'node_modules/pnpm/bin/pnpm.cjs'), `--package=${archive}`, 'dlx', '--', 'just-vibe', ...args], options)],
    ['pnpm 12', args => execFileSync(join(bootstrap, `node_modules/@pnpm/exe.${process.platform}-${process.arch}/pnpm${process.platform === 'win32' ? '.exe' : ''}`), [`--package=${archive}`, 'dlx', '--', 'just-vibe', ...args], options)],
    ['yarn', args => execFileSync(process.execPath, [join(bootstrap, 'node_modules/@yarnpkg/cli-dist/bin/yarn.js'), 'dlx', '--quiet', '--package', `just-vibe@file:${archive.replaceAll('\\', '/')}`, 'just-vibe', ...args], options)],
  ];
  let options;
  for (const [name, run] of managers) {
    const cwd = join(temp, name); mkdirSync(cwd);
    writeFileSync(join(cwd, 'package.json'), '{"private":true}\n');
    writeFileSync(join(cwd, 'yarn.lock'), '');
    options = { cwd, encoding: 'utf8', timeout: 180_000, maxBuffer: 4 * 1024 * 1024,
      env: { ...process.env, JUST_VIBE_HOME: join(cwd, 'managed'), npm_config_cache: join(cwd, 'npm-cache'), YARN_ENABLE_TELEMETRY: '0', YARN_ENABLE_IMMUTABLE_INSTALLS: 'false' } };
    assert.equal(run(['--version']).trim(), pkg.version, `${name}: wrong version`);
    const inventory = JSON.parse(run(['tools', '--all', '--json']));
    assert.equal(inventory.tools.length, 213);
    for (const target of ['codex', 'claude']) {
      const output = run(['setup', '--target', target, '--dry-run']);
      assert.ok(output.includes('Copy bundled plugin files'));
      assert.ok(!output.includes('Zachshotamartin/just-vibe'));
    }
    console.log(`${name}: archive execution, 213 skills and both bundled setup previews passed.`);
  }
  // Copy from the actual archive, then delete the extracted package as a dlx-cache eviction check.
  const extracted = join(temp, 'extracted'); mkdirSync(extracted);
  execFileSync('tar', ['-xzf', archive, '-C', extracted]);
  const retained = join(temp, 'persistent');
  stageBundle(retained, { root: join(extracted, 'package') });
  rmSync(extracted, { recursive: true, force: true });
  assert.equal(validateBundle(retained), pkg.version);
  const output = execFileSync(process.execPath, [join(retained, 'plugins/just-vibe/scripts/toolkit.mjs'), 'tools', '--all', '--root', temp, '--json'], { encoding: 'utf8' });
  assert.equal(JSON.parse(output).tools.length, 213);
  console.log('Persistent installed payload still runs after deleting the package cache.');
} finally { rmSync(temp, { recursive: true, force: true }); }
