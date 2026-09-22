import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, lstatSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { object, text, name, strings, safePath, readRecord, saveRecord, listRecords, expectRevision, locked, now, reportPage, escapeHtml, digest, within } from './workbench.mjs';
import { fingerprint, compareSnapshot } from './storage.mjs';
import { redact } from './process.mjs';

const actions = {
  click: ['action', 'selector'], fill: ['action', 'selector', 'value'],
  upload: ['action', 'selector', 'file'], visible: ['action', 'selector'],
  text: ['action', 'selector', 'contains'], media: ['action', 'selector'],
  layout: ['action', 'selectors'],
};
const assertions = new Set(['visible', 'text', 'media', 'layout']);
function clean(value, label, max = 2000) {
  text(value, label, max);
  if (redact(value) !== value) throw Error(`${label} must not contain secrets.`);
  return value;
}
function target(value) {
  const url = new URL(text(value, 'target URL', 2000));
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash || url.search)
    throw Error('Target must be an HTTP(S) URL without credentials, query or fragment.');
  return url.href;
}
function validateCriterion(root, c) {
  object(c, ['id', 'text', 'sourceQuote', 'kind', 'path', 'viewport', 'steps']);
  name(c.id); clean(c.text, 'Criterion'); clean(c.sourceQuote, 'Request quote');
  if (!['browser', 'human'].includes(c.kind)) throw Error('Criterion kind must be browser or human.');
  if (typeof c.path !== 'string' || !c.path.startsWith('/') || c.path.startsWith('//') || /[\\?#]/.test(c.path)) throw Error('Use a same-origin path without a query or fragment.');
  object(c.viewport, ['width', 'height']);
  for (const v of [c.viewport.width, c.viewport.height]) if (!Number.isInteger(v) || v < 240 || v > 2560) throw Error('Viewport width and height must both be 240–2560.');
  if (!Array.isArray(c.steps) || c.steps.length > 30 || (c.kind === 'browser' && !c.steps.some(s => assertions.has(s.action)))) throw Error('Browser criteria require at least one assertion, with at most 30 steps.');
  for (const step of c.steps) {
    if (!actions[step.action]) throw Error('Unsupported browser step.');
    object(step, actions[step.action]);
    if (step.action !== 'layout') clean(step.selector, 'selector', 500);
    if (step.action === 'fill') clean(step.value, 'fixture value', 2000);
    if (step.action === 'text') clean(step.contains, 'expected text', 2000);
    if (step.action === 'layout') strings(step.selectors, 'layout selectors', 20);
    if (step.action === 'upload') {
      const stat = lstatSync(safePath(root, step.file));
      if (!stat.isFile() || stat.size > 8 * 1024 * 1024) throw Error('Upload fixtures must be regular project files up to 8 MiB.');
    }
  }
}
function status(root, record) {
  const snapshot = fingerprint(root);
  const criteria = record.criteria.map(c => {
    const attempt = record.attempts.at(-1), result = attempt?.results.find(r => r.criterion === c.id);
    if (!result) return { ...c, result: 'missing' };
    const changes = compareSnapshot(attempt.snapshot, snapshot);
    let artifactChanged = false;
    if (result.screenshot) {
      try {
        const file = safePath(root, result.screenshot.path, { managed: true });
        const stat = lstatSync(file);
        artifactChanged = !stat.isFile() || stat.size > 2 * 1024 * 1024 || digest(readFileSync(file)) !== result.screenshot.sha256;
      }
      catch { artifactChanged = true; }
    }
    return { ...c, ...result, result: changes.stale || artifactChanged ? 'stale' : result.result, staleReasons: [...changes.differences, ...(artifactChanged ? ['screenshot changed'] : [])] };
  });
  return { ...record, criteria, verdict: criteria.every(c => c.result === 'passed') ? 'passed' : criteria.some(c => c.result === 'failed') ? 'failed' : 'incomplete',
    limitation: 'Assertions cover declared interactions at the recorded URL and time. Source snapshots do not attest which build a remote server serves. Human design judgments remain unverified. A separate browser runner is independent of implementation assertions, not an independent human reviewer.' };
}
export function qaReport(root, record) {
  const result = status(root, record);
  let embeddedBytes = 0;
  const render = attempt => `<section><h2>Attempt ${attempt.number} · ${escapeHtml(attempt.at)}</h2><p>${escapeHtml(attempt.reason)}</p>${attempt.results.map(r => {
    let picture = '';
    if (r.screenshot) try {
      const file = safePath(root, r.screenshot.path, { managed: true });
      if (lstatSync(file).size > 2 * 1024 * 1024 || embeddedBytes + lstatSync(file).size > 16 * 1024 * 1024) throw Error('Report image budget');
      const bytes = readFileSync(file); embeddedBytes += bytes.length;
      if (digest(bytes) === r.screenshot.sha256) picture = `<img alt="${escapeHtml(r.criterion)} screenshot" src="data:image/png;base64,${bytes.toString('base64')}">`;
    } catch {}
    return `<h3>${escapeHtml(r.criterion)}: ${escapeHtml(r.result)}</h3><p>${escapeHtml(r.detail)}</p><pre>${escapeHtml(JSON.stringify(record.criteria.find(c => c.id === r.criterion), null, 2))}</pre>${picture}`;
  }).join('')}</section>`;
  const path = within(root, `.just-vibe/reports/agent-qa-${record.id}.html`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, reportPage(`Agent QA: ${record.title}`, `<p>${escapeHtml(result.verdict)}</p><p>${escapeHtml(result.limitation)}</p><p>Current criteria: ${escapeHtml(result.criteria.map(c => `${c.id}: ${c.result}`).join(', '))}</p>${record.attempts.map(render).join('')}`), { mode: 0o600 });
  return { ...result, path };
}
// Bounded executable checks, not arbitrary JavaScript supplied by an agent.
export async function executeQaStep(page, step, root, timeoutMs) {
  const locator = step.selector ? page.locator(step.selector) : null;
  if (step.action === 'click') await locator.click();
  if (step.action === 'fill') await locator.fill(step.value);
  if (step.action === 'upload') await locator.setInputFiles(safePath(root, step.file));
  if (step.action === 'visible') await locator.waitFor({ state: 'visible' });
  if (step.action === 'text') {
    await locator.waitFor({ state: 'visible' });
    const deadline = Date.now() + timeoutMs;
    while (!(await locator.innerText()).includes(step.contains)) {
      if (Date.now() >= deadline) throw Error(`Expected visible text: ${step.contains}`);
      await new Promise(done => setTimeout(done, 100));
    }
  }
  if (step.action === 'media') {
    await locator.waitFor({ state: 'visible' });
    await locator.evaluate(async (element, timeout) => {
      if (!(element instanceof HTMLMediaElement)) throw Error('Expected audio or video');
      let timer;
      try {
        await Promise.race([element.play(), new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Playback did not start')), timeout); })]);
        const initial = element.currentTime;
        const deadline = Date.now() + timeout;
        while (element.currentTime <= initial && !element.error && Date.now() < deadline) await new Promise(done => setTimeout(done, 100));
        if (element.error || element.readyState < 2 || !(element.currentTime > initial)) throw Error('Media did not advance during playback');
      } finally { clearTimeout(timer); element.pause(); }
    }, timeoutMs);
  }
  if (step.action === 'layout') {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (overflow) throw Error('Page has horizontal overflow');
    const boxes = [];
    for (const selector of step.selectors) {
      const l = page.locator(selector); await l.waitFor({ state: 'visible' });
      const box = await l.boundingBox(), viewport = page.viewportSize();
      if (!box || box.width <= 0 || box.height <= 0 || box.x < -1 || box.x + box.width > viewport.width + 1) throw Error(`Clipped control: ${selector}`);
      const clipped = await l.evaluate(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1);
      if (clipped) throw Error(`Control content exceeds its box: ${selector}`);
      for (const prior of boxes) if (box.x < prior.x + prior.width - 1 && box.x + box.width > prior.x + 1 && box.y < prior.y + prior.height - 1 && box.y + box.height > prior.y + 1) throw Error(`Overlapping controls: ${selector}`);
      boxes.push(box);
    }
  }
}
export async function agentQa(root, operation, input = {}, options = {}) {
  if (operation === 'list') { object(input, []); return { plans: listRecords(root, 'agent-qa').map(id => status(root, readRecord(root, 'agent-qa', id))) }; }
  if (['show', 'report'].includes(operation)) {
    object(input, ['id']); name(input.id); const record = readRecord(root, 'agent-qa', input.id);
    return operation === 'report' ? qaReport(root, record) : status(root, record);
  }
  return locked(root, async () => {
    name(input.id);
    const prior = readRecord(root, 'agent-qa', input.id, true);
    expectRevision(prior, input.revision);
    if (operation === 'create') {
      object(input, ['id', 'revision', 'title', 'request', 'target', 'criteria', 'maxAttempts']);
      if (prior) throw Error('Choose a new QA plan ID.');
      clean(input.title, 'title', 200); clean(input.request, 'request', 12000);
      if (!Array.isArray(input.criteria) || !input.criteria.length || input.criteria.length > 12) throw Error('Provide 1–12 criteria.');
      const ids = new Set();
      for (const c of input.criteria) {
        validateCriterion(root, c);
        if (ids.has(c.id) || !input.request.includes(c.sourceQuote)) throw Error('Criteria need unique IDs and literal quotes from the request.');
        ids.add(c.id);
      }
      const maxAttempts = input.maxAttempts ?? 3;
      if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) throw Error('Choose 1–5 attempts.');
      return saveRecord(root, 'agent-qa', input.id, { title: input.title, request: input.request, target: target(input.target), criteria: input.criteria, maxAttempts, attempts: [] }, 0);
    }
    if (operation !== 'run' || !prior) throw Error('Create a QA plan before running it.');
    object(input, ['id', 'revision', 'reason', 'authorizeTarget', 'timeoutMs']);
    clean(input.reason, 'Run or retest reason');
    if (input.authorizeTarget !== prior.target) throw Error('Authorize the exact target URL before interacting with the app.');
    if (prior.attempts.length >= prior.maxAttempts) throw Error('Attempt budget exhausted. Review failures before creating a new plan.');
    const timeoutMs = input.timeoutMs ?? 5000;
    if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 15000) throw Error('Step timeout must be 500–15000 ms.');
    prior.criteria.forEach(c => validateCriterion(root, c));
    const attempt = { number: prior.attempts.length + 1, at: now(), reason: input.reason, target: prior.target, snapshot: fingerprint(root), verifier: 'bounded-playwright-runner', results: [] };
    const reservation = saveRecord(root, 'agent-qa', prior.id, { ...prior, attempts: [...prior.attempts, { ...attempt, results: prior.criteria.map(c => ({ criterion: c.id, result: 'running', detail: 'Verification started; no completed result yet.' })) }] }, prior.revision);
    let browser, budgetTimer;
    const deadline = Date.now() + 120000;
    try {
      const require = createRequire(resolve(root, 'package.json'));
      let chromium;
      try { chromium = require('playwright').chromium; }
      catch { throw Error('Install Playwright in the target project and its Chromium browser, or use the host-browser verification workflow with a proof record. No browser results have been claimed.'); }
      browser = await chromium.launch({ headless: true, timeout: 15000 });
      budgetTimer = setTimeout(() => { browser.close().catch(() => {}); }, Math.max(1, deadline - Date.now()));
      for (const c of prior.criteria) {
        if (Date.now() >= deadline) throw Error('Two-minute run budget exhausted.');
        if (c.kind === 'human') { attempt.results.push({ criterion: c.id, result: 'needs-human', detail: 'Subjective acceptance needs your judgment.' }); continue; }
        const context = await browser.newContext({ viewport: c.viewport, serviceWorkers: 'block', acceptDownloads: false });
        const allowedOrigin = new URL(prior.target).origin;
        let blockedOrigin = false;
        await context.route('**/*', route => { if (new URL(route.request().url()).origin === allowedOrigin) return route.continue(); blockedOrigin = true; return route.abort(); });
        if (context.routeWebSocket) await context.routeWebSocket('**/*', socket => { blockedOrigin = true; socket.close(); });
        const page = await context.newPage(); page.setDefaultTimeout(timeoutMs); page.setDefaultNavigationTimeout(timeoutMs);
        const result = { criterion: c.id, result: 'passed', detail: 'All declared browser assertions passed.', completedSteps: 0 };
        let targetLoaded = false;
        try {
          const response = await page.goto(new URL(c.path, prior.target).href, { waitUntil: 'domcontentloaded' });
          if ([401, 403].includes(response?.status())) throw Error('Target requires an authorized test session.');
          targetLoaded = true;
          for (const step of c.steps) { await executeQaStep(page, step, root, timeoutMs); result.completedSteps++; }
        } catch (error) { result.result = targetLoaded ? 'failed' : 'blocked'; result.detail = redact(String(error.message)).slice(0, 2000); }
        try {
          const path = `.just-vibe/qa-artifacts/${prior.id}/${attempt.number}-${c.id}-${randomUUID()}.png`;
          const full = within(root, path); mkdirSync(dirname(full), { recursive: true });
          const bytes = await page.screenshot({ path: full, fullPage: false, timeout: timeoutMs });
          if (bytes.length > 2 * 1024 * 1024) throw Error('Screenshot exceeds report bound');
          result.screenshot = { path, sha256: digest(bytes) };
        } catch { result.screenshotUnavailable = true; if (result.result === 'passed') { result.result = 'blocked'; result.detail = 'Browser assertions passed, but required screenshot evidence could not be captured.'; } }
        result.networkRestrictionsObserved = blockedOrigin;
        if (blockedOrigin && result.result === 'failed') { result.result = 'blocked'; result.detail = 'A cross-origin request or WebSocket was blocked by the bounded runner. Verify the required dependency using authorized host browser tools. ' + result.detail; }
        attempt.results.push(result); await context.close();
      }
    } catch (error) {
      for (const c of prior.criteria) if (!attempt.results.some(r => r.criterion === c.id)) attempt.results.push({ criterion: c.id, result: 'blocked', detail: redact(String(error.message)).slice(0, 2000) });
    } finally { clearTimeout(budgetTimer); if (browser) await browser.close().catch(() => {}); }
    const during = compareSnapshot(attempt.snapshot, fingerprint(root));
    if (during.stale) for (const result of attempt.results) { result.result = 'stale'; result.detail = 'Source changed during verification or snapshot coverage was incomplete.'; }
    return qaReport(root, saveRecord(root, 'agent-qa', prior.id, { ...prior, attempts: [...prior.attempts, attempt] }, reservation.revision));
  });
}
