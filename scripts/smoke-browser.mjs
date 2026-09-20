import { createServer } from 'node:http';
import { mkdtempSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const project = process.argv[2];
if (!project) throw Error('Usage: node scripts/smoke-browser.mjs PROJECT_WITH_PLAYWRIGHT_AND_CHROMIUM');
const root = realpathSync(project), directory = mkdtempSync(join(root, '.jv-browser-smoke-'));
const cli = fileURLToPath(new URL('../bin/just-vibe.mjs', import.meta.url));
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<!doctype html><title>Dialog fixture</title><button id="open">Open</button><dialog id="dialog"><label>Name <input id="name"></label><button id="done">Done</button></dialog><output id="result"></output><script>const d=document.querySelector("dialog"),o=document.querySelector("#open");o.onclick=()=>{d.showModal();document.querySelector("#name").focus()};document.querySelector("#done").onclick=()=>{document.querySelector("#result").textContent=document.querySelector("#name").value;d.close();o.focus()};</script>');
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const url = `http://127.0.0.1:${server.address().port}`;
const steps = [{ action: 'click', selector: '#open' }, { action: 'visible', selector: '#dialog' }, { action: 'focused', selector: '#name' }, { action: 'fill', selector: '#name', value: 'A readable result' }, { action: 'click', selector: '#done' }, { action: 'hidden', selector: '#dialog' }, { action: 'focused', selector: '#open' }, { action: 'text', selector: '#result', value: 'A readable result' }];
async function run(plan) {
  const file = join(directory, 'steps.json'); writeFileSync(file, JSON.stringify({ steps: plan }));
  const child = spawn(process.execPath, [cli, 'evidence', 'browser', '--root', root, '--url', url, '--steps', relative(root, file)], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = ''; child.stdout.on('data', d => { stdout += d; }); child.stderr.on('data', d => { stderr += d; });
  const status = await new Promise((done, fail) => { child.on('close', done); child.on('error', fail); });
  assert.ok(stdout, stderr); return { status, report: JSON.parse(stdout) };
}
try {
  const positive = await run(steps); assert.equal(positive.status, 0); assert.equal(positive.report.result, 'passed'); assert.equal(positive.report.steps.length, 8);
  const negative = await run([{ action: 'title', value: 'Wrong title' }]); assert.equal(negative.status, 2); assert.equal(negative.report.result, 'failed');
  console.log('Real Chromium: dialog open/close, input, visible/hidden, focus return and text assertions passed. Deliberately wrong title failed with exit 2.');
} finally { await new Promise(done => server.close(done)); rmSync(directory, { recursive: true, force: true }); }
