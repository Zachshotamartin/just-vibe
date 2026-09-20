import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { findExecutable, commandInvocation } from '../plugins/just-vibe/scripts/lib/command.mjs';
import { execute } from '../plugins/just-vibe/scripts/installer.mjs';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'just-vibe command '));
  t.after(() => rmSync(dir, { force: true, recursive: true }));
  return dir;
}

test('executable discovery finds explicit paths and does not treat directories as commands', t => {
  const root = fixture(t);
  mkdirSync(join(root, 'directory'));
  assert.equal(findExecutable('directory', { PATH: root }), null);
  assert.ok(findExecutable(process.execPath));
});

test('Windows PATHEXT discovery and npm shims preserve literal arguments without a shell', { skip: process.platform !== 'win32' }, t => {
  const root = fixture(t);
  const script = join(root, 'cli.cjs');
  writeFileSync(script, 'console.log(process.argv[2]);');
  const shim = join(root, 'fixture.cmd');
  writeFileSync(shim, '@ECHO OFF\r\nnode "%dp0%\\cli.cjs" %*\r\n');
  assert.equal(findExecutable('fixture', { PATH: root, PATHEXT: '.EXE;.CMD' }), shim);
  const value = '& echo unsafe | %PATH% $(touch nope) "quoted"';
  assert.deepEqual(commandInvocation(shim, [value]), [process.execPath, [script, value]]);
  assert.equal(execute(shim, [value]), value);
  writeFileSync(shim, '@ECHO OFF\r\necho arbitrary batch logic\r\n');
  assert.throws(() => commandInvocation(shim, []), /Unsupported Windows command wrapper/);
});
