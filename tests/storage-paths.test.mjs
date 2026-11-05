import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { within } from '../plugins/just-vibe/scripts/lib/storage.mjs';

function temporary(t) {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-storage-paths-')));
  t.after(() => rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));
  return root;
}

// Regression: a startup lock released by another process between two checks of
// the same path made within() throw ENOENT (seen on Windows CI in service stop).
test('within tolerates a lock file another process creates and removes during the check', async t => {
  const root = temporary(t), lock = join(root, 'runtime', 'service.startup.lock'), ready = join(root, 'ready');
  mkdirSync(join(root, 'runtime'));
  const flicker = spawn(process.execPath, ['-e', `
    const fs = require('fs'), [lock, ready] = process.argv.slice(1), end = Date.now() + 1500;
    fs.writeFileSync(ready, '1');
    while (Date.now() < end) { try { fs.writeFileSync(lock, 'x'); fs.rmSync(lock, { force: true }); } catch {} }
  `, lock, ready], { stdio: 'ignore' });
  const exited = new Promise(resolve => flicker.on('exit', resolve));
  t.after(() => flicker.kill());
  const start = Date.now();
  while (!existsSync(ready) && Date.now() - start < 10000) await new Promise(resolve => setTimeout(resolve, 10));
  assert.ok(existsSync(ready), 'the flicker process started');
  const failures = new Map();
  let calls = 0;
  const end = Date.now() + 1000;
  while (Date.now() < end) {
    for (const path of ['runtime/service.startup.lock', lock]) {
      calls++;
      try { within(root, path); } catch (error) { failures.set(error.code || error.message, (failures.get(error.code || error.message) || 0) + 1); }
    }
  }
  await exited;
  assert.ok(calls > 1000, `enough checks overlapped the flicker (${calls})`);
  assert.deepEqual(Object.fromEntries(failures), {});
});

test('within still rejects symlinks and paths outside the root', { skip: process.platform === 'win32' }, t => {
  const root = temporary(t), outside = temporary(t);
  symlinkSync(outside, join(root, 'linked'));
  assert.throws(() => within(root, 'linked/state.json'), /Symlink paths are not supported/);
  symlinkSync(join(root, 'missing-target'), join(root, 'dangling'));
  assert.throws(() => within(root, 'dangling'), /Symlink paths are not supported/);
  assert.throws(() => within(root, '../escape.json'), /escapes the selected project/);
  writeFileSync(join(root, 'plain.json'), '{}');
  assert.equal(within(root, 'plain.json'), join(root, 'plain.json'));
  assert.equal(within(root, 'not-yet/created.json'), join(root, 'not-yet/created.json'));
});
