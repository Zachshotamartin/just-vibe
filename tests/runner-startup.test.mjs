import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';

function fixture(t) {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-startup-input-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, options: { home: join(root, 'home') } };
}
const forms = [
  path => [`--import=${path}`], path => ['--import', path],
  path => [`--require=${path}`], path => ['--require', path],
  path => ['-r', path],
];
test('Node startup option forms bind executed files and invalidate changed or legacy inputs', async t => {
  const { root, options } = fixture(t);
  writeFileSync(join(root, 'loader.cjs'), 'console.log("reviewed startup")');
  let revision = 0;
  for (const [index, form] of forms.entries()) {
    const id = `form-${index}`;
    let state = await runners(root, 'configure', { id, revision, config: {
      command: [process.execPath, ...form('./loader.cjs'), '-e', 'void 0'], purpose: 'Inert startup fixture',
    } }, options);
    const runner = state.runners.find(r => r.id === id);
    assert.ok(runner.inputs.some(input => input.path === join(root, 'loader.cjs')));
    state = await runners(root, 'trust', { id, revision: state.revision, hash: runner.hash }, options);
    assert.equal((await runners(root, 'run', { id, hash: runner.hash }, options)).stdout, 'reviewed startup\n');
    writeFileSync(join(root, 'loader.cjs'), 'console.log("changed startup")');
    assert.equal((await runners(root, 'show', { id }, options)).runner.current, false);
    await assert.rejects(runners(root, 'run', { id, hash: runner.hash }, options), /trust/);
    writeFileSync(join(root, 'loader.cjs'), 'console.log("reviewed startup")');
    const store = runtimeStore(root, options), saved = store.get('trusted-runners');
    store.put('trusted-runners', { runners: saved.runners.map(r => r.id === id ? {
      ...r, inputs: r.inputs.filter(input => input.path !== join(root, 'loader.cjs')),
    } : r) }, saved.revision);
    assert.equal((await runners(root, 'show', { id }, options)).runner.current, false);
    await assert.rejects(runners(root, 'run', { id, hash: runner.hash }, options), /trust/);
    revision = state.revision + 1;
  }
});
test('Node startup files reject symlinks and support file URLs and extension resolution', async t => {
  const { root, options } = fixture(t);
  writeFileSync(join(root, 'loader.cjs'), 'void 0');
  try { symlinkSync(join(root, 'loader.cjs'), join(root, 'linked.cjs')); }
  catch (error) { if (process.platform === 'win32' && error.code === 'EPERM') return t.skip('Account cannot create symlinks.'); throw error; }
  for (const form of forms)
    await assert.rejects(runners(root, 'configure', { id: 'linked', revision: 0, config: {
      command: [process.execPath, ...form('./linked.cjs'), '-e', 'void 0'], purpose: 'Symlink fixture',
    } }, options), /Symlink/);
  mkdirSync(join(root, 'module-directory'));
  symlinkSync(join(root, 'loader.cjs'), join(root, 'module-directory/index.js'));
  await assert.rejects(runners(root, 'configure', { id: 'directory', revision: 0, config: {
    command: [process.execPath, '-r', './module-directory', '-e', 'void 0'], purpose: 'Directory module fixture',
  } }, options), /explicit files/);
  let revision = 0;
  for (const [index, startup] of [[`--import=${pathToFileURL(join(root, 'loader.cjs')).href}`], ['-r', './loader.cjs']].entries()) {
    const state = await runners(root, 'configure', { id: `supported-${index}`, revision, config: {
      command: [process.execPath, ...startup, '-e', 'void 0'], purpose: 'Explicit startup',
    } }, options);
    revision = state.revision;
    assert.ok(state.runners.at(-1).inputs.some(input => input.path === join(root, 'loader.cjs')));
  }
  writeFileSync(join(root, 'extension.js'), 'void 0');
  const state = await runners(root, 'configure', { id: 'extension', revision, config: {
    command: [process.execPath, '-r', './extension', '-e', 'void 0'], purpose: 'Extension resolution',
  } }, options);
  assert.ok(state.runners.at(-1).inputs.some(input => input.path === join(root, 'extension.js')));
});
test('literal runner argv remains exact and Node script arguments or inline code are not preload paths', async t => {
  const { root, options } = fixture(t);
  writeFileSync(join(root, 'echo.cjs'), 'console.log(JSON.stringify(process.argv.slice(2)))');
  const literal = ['  user value  ', '', '   ', '--import=./not-a-startup-file.mjs'];
  let state = await runners(root, 'configure', { id: 'literal', revision: 0, config: {
    command: [process.execPath, 'echo.cjs', ...literal], purpose: 'Exact arguments',
  } }, options);
  const runner = state.runners[0];
  assert.deepEqual(runner.command.slice(2), literal);
  state = await runners(root, 'trust', { id: runner.id, hash: runner.hash, revision: state.revision }, options);
  const result = await runners(root, 'run', { id: runner.id, hash: runner.hash }, options);
  assert.deepEqual(JSON.parse(result.stdout), literal);
  await runners(root, 'configure', { id: 'inline', revision: state.revision, config: {
    command: [process.execPath, '--title=./not-an-input', '-e', 'console.log("--import=./not-an-input")'], purpose: 'Inline code',
  } }, options);
});
