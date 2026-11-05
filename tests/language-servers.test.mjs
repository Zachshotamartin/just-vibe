import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { definition, references, diagnostics, languageServerStatus } from '../plugins/just-vibe/scripts/lib/language-servers.mjs';
import { frame, messageReader } from '../plugins/just-vibe/scripts/lib/lsp-client.mjs';

const fake = fileURLToPath(new URL('./fixtures/fake-lsp.mjs', import.meta.url));
function project(t, mode = 'push') {
  const directory = realpathSync.native(mkdtempSync(join(tmpdir(), 'jv-lsp-')));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = join(directory, 'project'), options = { home: join(directory, 'home') };
  mkdirSync(join(root, 'src'), { recursive: true });
  writeFileSync(join(root, '.fake-lsp-mode'), mode);
  writeFileSync(join(root, 'src/math.ts'), 'function add(a: number, b: number) { return a + b; }\nconst total: string = add(1, 2); // ERROR\nconst unused = 1; // WARN\nexport { add };\n');
  return { root, options, mode: next => writeFileSync(join(root, '.fake-lsp-mode'), next) };
}
async function trust(root, options) {
  const configured = await runners(root, 'configure', { id: 'lsp-typescript', revision: 0, config: { command: [process.execPath, fake], purpose: 'test language server' } }, options);
  const runner = configured.runners.find(r => r.id === 'lsp-typescript');
  await runners(root, 'trust', { id: runner.id, revision: configured.revision, hash: runner.hash }, options);
}

test('LSP framing survives split chunks, multi-byte text and rejects oversized messages', () => {
  const seen = [], read = messageReader(m => seen.push(m), { maxBytes: 1024 });
  const bytes = Buffer.concat([frame({ id: 1, result: 'café — ok' }), frame({ method: 'n', params: { x: 'ü' } })]);
  for (const byte of bytes) read(Buffer.from([byte]));
  assert.deepEqual(seen, [{ id: 1, result: 'café — ok' }, { method: 'n', params: { x: 'ü' } }]);
  assert.throws(() => messageReader(() => {}, { maxBytes: 10 })(Buffer.from('Content-Length: 11\r\n\r\n')), /exceeds 10 bytes/);
  assert.throws(() => messageReader(() => {})(Buffer.from('X'.repeat(5000))), /oversized or malformed header/);
  assert.throws(() => messageReader(() => {})(Buffer.from('Content-Type: x\r\n\r\n{}')), /lacks Content-Length/);
});

test('an untrusted language server never starts; the result says how to trust it', async t => {
  const { root, options } = project(t);
  const result = await definition(root, { file: 'src/math.ts', line: 2, column: 23 }, options);
  assert.equal(result.status, 'unavailable');
  assert.match(result.reason, /runners configure \{"id":"lsp-typescript"/);
  assert.match(result.reason, /can run project code/);
  const status = await languageServerStatus(root, options);
  assert.deepEqual(status.find(s => s.id === 'typescript').trusted, false);
  // A changed binary or script invalidates trust.
  await trust(root, options);
  assert.equal((await languageServerStatus(root, options)).find(s => s.id === 'typescript').trusted, true);
});

test('definition, references and push diagnostics come from the trusted server', async t => {
  const { root, options } = project(t);
  await trust(root, options);
  const found = await definition(root, { file: 'src/math.ts', line: 2, column: 23 }, options);
  assert.equal(found.status, 'ok', found.reason);
  assert.deepEqual(found.locations, [{ path: 'src/math.ts', external: false, line: 1, column: 10 }]);
  assert.equal(found.method, 'language-server:typescript');
  const refs = await references(root, { file: 'src/math.ts', line: 1, column: 10 }, options);
  assert.deepEqual(refs.locations.map(l => l.line), [1, 2, 4]);
  const checked = await diagnostics(root, { files: ['src/math.ts'] }, options);
  assert.equal(checked.status, 'ok', checked.reason);
  assert.deepEqual(checked.diagnostics.map(d => [d.line, d.severity]), [[2, 'error'], [3, 'warning']]);
  assert.equal(checked.diagnostics[0].message, 'Type error — not assignable');
  assert.equal(checked.errors, 1);
  const errorsOnly = await diagnostics(root, { files: ['src/math.ts'], minimumSeverity: 'error' }, options);
  assert.equal(errorsOnly.diagnostics.length, 1);
});

test('pull diagnostics, split frames and server requests are handled', async t => {
  const { root, options, mode } = project(t, 'pull');
  await trust(root, options);
  assert.equal((await diagnostics(root, { files: ['src/math.ts'] }, options)).errors, 1);
  mode('split');
  assert.equal((await diagnostics(root, { files: ['src/math.ts'] }, options)).errors, 1);
  mode('server-request');
  const answered = await definition(root, { file: 'src/math.ts', line: 2, column: 23 }, options);
  assert.equal(answered.status, 'ok', answered.reason);
});

test('crashing, hanging and oversized servers fail closed within the deadline', async t => {
  const { root, options, mode } = project(t, 'crash');
  await trust(root, options);
  const crashed = await diagnostics(root, { files: ['src/math.ts'], timeoutMs: 5000 }, options);
  // The crash follows an empty published set; that must not read as a clean file.
  assert.equal(crashed.status, 'failed');
  assert.match(crashed.reason, /exited/);
  mode('hang');
  const started = Date.now();
  const hung = await definition(root, { file: 'src/math.ts', line: 1, column: 1, timeoutMs: 1500 }, options);
  assert.equal(hung.status, 'failed');
  assert.match(hung.reason, /timed out/);
  assert.ok(Date.now() - started < 6000, 'bounded by the deadline plus shutdown');
  mode('oversize');
  const huge = await definition(root, { file: 'src/math.ts', line: 1, column: 1, timeoutMs: 5000 }, options);
  assert.equal(huge.status, 'failed');
  assert.match(huge.reason, /exceeds/);
});

test('private files, unknown languages and mixed languages are refused before any server starts', async t => {
  const { root, options } = project(t);
  writeFileSync(join(root, '.env.ts'), 'x');
  writeFileSync(join(root, 'notes.txt'), 'x');
  writeFileSync(join(root, 'a.py'), 'x');
  await assert.rejects(definition(root, { file: '.env.ts', line: 1 }, options), /Private files/);
  await assert.rejects(definition(root, { file: 'notes.txt', line: 1 }, options), /No known language server/);
  await assert.rejects(diagnostics(root, { files: ['src/math.ts', 'a.py'] }, options), /one language at a time/);
  await assert.rejects(definition(root, { file: '../outside.ts', line: 1 }, options));
});
