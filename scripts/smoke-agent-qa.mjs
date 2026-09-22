import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync, readFileSync, symlinkSync, existsSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { agentQa } from '../plugins/just-vibe/scripts/lib/agent-qa.mjs';
const root = resolve('.tmp/agent-qa-browser');
rmSync(root, { recursive: true, force: true }); mkdirSync(root, { recursive: true });
symlinkSync(resolve('website/node_modules'), join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
writeFileSync(join(root, 'package.json'), '{"private":true}');
const wav = Buffer.alloc(44 + 16000); wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(16000, 40);
writeFileSync(join(root, 'sample.wav'), wav); writeFileSync(join(root, 'unsupported.txt'), 'not audio');
const html = broken => `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QA upload fixture</title><style>body{font:18px system-ui;margin:24px}input,audio{display:block;max-width:100%;margin:20px 0}${broken ? 'main{width:1000px}' : ''}</style><main><h1>Upload recording</h1><label>Sample audio<input type="file"></label><p role="status">Choose a recording</p><audio controls></audio></main><script>document.querySelector('input').onchange=e=>{const f=e.target.files[0];if(!f.name.endsWith('.wav')){document.querySelector('[role=status]').textContent='Choose a WAV recording';return;}document.querySelector('[role=status]').textContent='Processing';${broken ? '' : "setTimeout(()=>{document.querySelector('audio').src='/sample.wav';document.querySelector('[role=status]').textContent='Complete';},100);"}};</script></html>`;
writeFileSync(join(root, 'index.html'), html(true));
const server = createServer((req, res) => { res.setHeader('Content-Type', req.url === '/sample.wav' ? 'audio/wav' : 'text/html'); res.end(readFileSync(join(root, req.url === '/sample.wav' ? 'sample.wav' : 'index.html'))); });
await new Promise(done => server.listen(0, '127.0.0.1', done));
const target = `http://127.0.0.1:${server.address().port}/`, request = 'Upload audio and play the result on mobile; reject unsupported files clearly.';
const common = { sourceQuote: request, kind: 'browser', path: '/', viewport: { width: 390, height: 844 } };
try {
  await agentQa(root, 'create', { id: 'audio', revision: 0, title: 'Audio upload acceptance', request, target, criteria: [
    { ...common, id: 'upload', text: 'Upload completes and the result plays', steps: [{ action: 'upload', selector: 'input', file: 'sample.wav' }, { action: 'text', selector: '[role=status]', contains: 'Complete' }, { action: 'media', selector: 'audio' }] },
    { ...common, id: 'invalid', text: 'Unsupported input gives a useful error', steps: [{ action: 'upload', selector: 'input', file: 'unsupported.txt' }, { action: 'text', selector: '[role=status]', contains: 'Choose a WAV recording' }] },
    { ...common, id: 'mobile', text: 'Mobile controls fit without overlap', steps: [{ action: 'layout', selectors: ['input', 'audio'] }] },
  ] });
  const failed = await agentQa(root, 'run', { id: 'audio', revision: 1, reason: 'Deliberately broken fixture', authorizeTarget: target, timeoutMs: 1000 });
  assert.deepEqual(failed.criteria.map(c => c.result), ['failed', 'passed', 'failed']);
  writeFileSync(join(root, 'index.html'), html(false));
  assert.equal((await agentQa(root, 'show', { id: 'audio' })).criteria[0].result, 'stale');
  const fixed = await agentQa(root, 'run', { id: 'audio', revision: failed.revision, reason: 'Repair processing and mobile width', authorizeTarget: target, timeoutMs: 3000 });
  assert.equal(fixed.verdict, 'passed', JSON.stringify(fixed.criteria));
  assert.equal(fixed.attempts.length, 2); assert.equal(fixed.attempts[0].results[0].result, 'failed');
  for (const r of fixed.attempts.flatMap(a => a.results)) assert.ok(existsSync(join(root, r.screenshot.path)));
  writeFileSync(join(root, '.just-vibe/browser-result.json'), JSON.stringify({ broken: failed.criteria.map(c => ({ id: c.id, result: c.result })), repaired: fixed.criteria.map(c => ({ id: c.id, result: c.result })), report: fixed.path }, null, 2));
  console.log(`Agent QA browser assertions passed; report: ${fixed.path}`);
} finally { await new Promise(done => server.close(done)); }
