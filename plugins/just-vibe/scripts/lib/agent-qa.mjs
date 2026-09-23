import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, lstatSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { object, text, name, strings, safePath, readRecord, saveRecord, listRecords, expectRevision, locked, now, reportPage, escapeHtml, digest, within } from './workbench.mjs';
import { fingerprint, compareSnapshot } from './storage.mjs';
import { redact } from './process.mjs';

import { executeQaStep } from './qa-browser.mjs';
export { executeQaStep } from './qa-browser.mjs';
import { startQaNetworkGuard } from './qa-network.mjs';
import { exportQaTest } from './qa-export.mjs';
import { validateCoverage, coverageStatus, allowedOrigins, authState } from './qa-plan.mjs';

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
  object(c, ['id', 'text', 'sourceQuote', 'kind', 'path', 'viewport', 'steps', 'maskSelectors']);
  if (c.maskSelectors !== undefined) { strings(c.maskSelectors, 'mask selectors', 20, true); c.maskSelectors.forEach(value => clean(value, 'mask selector', 500)); }
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
  const assertionVerdict = criteria.every(c => c.result === 'passed') ? 'passed' : criteria.some(c => c.result === 'failed') ? 'failed' : 'incomplete';
  const coverage = coverageStatus(record);
  return { ...record, criteria, coverageStatus: coverage, assertionVerdict, verdict: assertionVerdict === 'passed' && !coverage.complete ? 'incomplete' : assertionVerdict,
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
    return `<h3>${escapeHtml(r.criterion)}: ${escapeHtml(r.result)}</h3><p>${escapeHtml(r.detail)}</p>${r.networkRestrictionsObserved ? `<p>Network restrictions were observed independently of this assertion result.</p><pre>${escapeHtml(JSON.stringify(r.networkRestrictions || [], null, 2))}</pre>` : ''}<pre>${escapeHtml(JSON.stringify(record.criteria.find(c => c.id === r.criterion), null, 2))}</pre>${picture}`;
  }).join('')}</section>`;
  const path = within(root, `.just-vibe/reports/agent-qa-${record.id}.html`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, reportPage(`Agent QA: ${record.title}`, `<p>${escapeHtml(result.verdict)}</p><p>${escapeHtml(result.limitation)}</p><h2>Request coverage</h2><p>${escapeHtml(result.coverageStatus.note)}</p><pre>${escapeHtml(JSON.stringify(record.coverage || { reviewed: false }, null, 2))}</pre><p>Current criteria: ${escapeHtml(result.criteria.map(c => `${c.id}: ${c.result}`).join(', '))}</p>${record.attempts.map(render).join('')}`), { mode: 0o600 });
  return { ...result, path };
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
      object(input, ['id', 'revision', 'title', 'request', 'target', 'criteria', 'maxAttempts', 'coverage', 'allowedOrigins']);
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
      const origins = allowedOrigins(input.target, input.allowedOrigins);
      const coverage = validateCoverage(input.coverage, input.request, input.criteria);
      return saveRecord(root, 'agent-qa', input.id, { allowedOrigins: origins, coverage, title: input.title, request: input.request, target: target(input.target), criteria: input.criteria, maxAttempts, attempts: [] }, 0);
    }
    if (operation === 'coverage' && prior) {
      object(input, ['id', 'revision', 'coverage']);
      return saveRecord(root, 'agent-qa', prior.id, { ...prior, coverage: validateCoverage(input.coverage, prior.request, prior.criteria) }, prior.revision);
    }
    if (operation === 'export-test' && prior) {
      object(input, ['id', 'revision', 'directory']);
      return exportQaTest(root, status(root, prior), input.directory);
    }
    if (operation !== 'run' || !prior) throw Error('Create a QA plan before running it.');
    object(input, ['id', 'revision', 'reason', 'authorizeTarget', 'timeoutMs', 'authorizeOrigins', 'storageState', 'authorizeAuth']);
    clean(input.reason, 'Run or retest reason');
    if (input.authorizeTarget !== prior.target) throw Error('Authorize the exact target URL before interacting with the app.');
    if (prior.attempts.length >= prior.maxAttempts) throw Error('Attempt budget exhausted. Review failures before creating a new plan.');
    const timeoutMs = input.timeoutMs ?? 5000;
    if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 15000) throw Error('Step timeout must be 500–15000 ms.');
    prior.criteria.forEach(c => validateCriterion(root, c));
    const origins = allowedOrigins(prior.target, prior.allowedOrigins);
    if (input.authorizeOrigins !== undefined && !Array.isArray(input.authorizeOrigins)) throw Error('authorizeOrigins must be an array of exact origins');
    const extra = origins.filter(origin => origin !== new URL(prior.target).origin);
    if (extra.length && JSON.stringify([...(input.authorizeOrigins || [])].sort()) !== JSON.stringify(extra.sort())) throw Error('Authorize every additional origin exactly for this run.');
    const session = authState(root, input, origins);
    const attempt = { number: prior.attempts.length + 1, at: now(), reason: input.reason, target: prior.target, snapshot: fingerprint(root), verifier: 'bounded-playwright-runner', timeoutMs, authenticated: Boolean(session), results: prior.criteria.filter(c => c.kind === 'human').map(c => ({ criterion: c.id, result: 'needs-human', detail: 'Subjective acceptance needs your judgment.' })) };
    const reservation = saveRecord(root, 'agent-qa', prior.id, { ...prior, attempts: [...prior.attempts, { ...attempt, results: prior.criteria.map(c => c.kind === 'human' ? { criterion: c.id, result: 'needs-human', detail: 'Subjective acceptance needs your judgment.' } : { criterion: c.id, result: 'running', detail: 'Verification started; no completed result yet.' }) }] }, prior.revision);
    let browser, guard, budgetTimer;
    const deadline = Date.now() + 120000;
    try {
      if (!prior.criteria.some(c => c.kind === 'browser')) return qaReport(root, saveRecord(root, 'agent-qa', prior.id, { ...prior, attempts: [...prior.attempts, attempt] }, reservation.revision));
      const require = createRequire(resolve(root, 'package.json'));
      let chromium;
      try { chromium = require('playwright').chromium; }
      catch { throw Error('Install Playwright in the target project and its Chromium browser, or use the host-browser verification workflow with a proof record. No browser results have been claimed.'); }
      guard = await startQaNetworkGuard(origins);
      browser = await chromium.launch({ headless: true, timeout: 15000, proxy: guard.proxy, args: ['--proxy-bypass-list=<-loopback>', '--disable-quic', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'] });
      budgetTimer = setTimeout(() => { browser.close().catch(() => {}); }, Math.max(1, deadline - Date.now()));
      for (const c of prior.criteria) {
        if (Date.now() >= deadline) throw Error('Two-minute run budget exhausted.');
        if (c.kind === 'human') continue;
        const context = await browser.newContext({ viewport: c.viewport, serviceWorkers: 'block', acceptDownloads: false, ...(session ? { storageState: session } : {}) });
        const blockedBefore = guard.blocked.length;
        const blockedCountBefore = guard.blockedCount;
        let blockedOrigin = false;
        await context.route('**/*', route => { if (origins.includes(new URL(route.request().url()).origin)) return route.continue(); blockedOrigin = true; return route.abort(); });
        if (!context.routeWebSocket) { await context.close(); throw Error('Playwright 1.48 or newer is required to enforce WebSocket restrictions.'); }
        await context.routeWebSocket('**/*', socket => { blockedOrigin = true; socket.close(); });
        const page = await context.newPage(); page.setDefaultTimeout(timeoutMs); page.setDefaultNavigationTimeout(timeoutMs);
        const result = { criterion: c.id, result: 'passed', detail: 'All declared browser assertions passed.', completedSteps: 0 };
        let targetLoaded = false;
        try {
          const response = await page.goto(new URL(c.path, prior.target).href, { waitUntil: 'domcontentloaded' });
          if ((response?.status() || 0) >= 400) throw Error(`Target navigation failed (HTTP ${response.status()}); check authorization and network restrictions.`);
          targetLoaded = true;
          for (const step of c.steps) { await executeQaStep(page, step, root, timeoutMs); result.completedSteps++; }
        } catch (error) { result.result = error.qaNeedsHuman ? 'needs-human' : targetLoaded ? 'failed' : 'blocked'; result.detail = redact(String(error.message)).slice(0, 2000); }
        try {
          const path = `.just-vibe/qa-artifacts/${prior.id}/${attempt.number}-${c.id}-${randomUUID()}.png`;
          const full = within(root, path); mkdirSync(dirname(full), { recursive: true });
          const bytes = await page.screenshot({ fullPage: false, timeout: timeoutMs, mask: [...new Set(['input[type=password]', ...c.steps.filter(s => s.action === 'fill').map(s => s.selector), ...(c.maskSelectors || [])])].map(selector => page.locator(selector)) });
          if (bytes.length > 2 * 1024 * 1024) throw Error('Screenshot exceeds report bound');
          writeFileSync(full, bytes, { mode: 0o600, flag: 'wx' });
          result.screenshot = { path, sha256: digest(bytes) };
        } catch { result.screenshotUnavailable = true; if (result.result === 'passed') { result.result = 'blocked'; result.detail = 'Browser assertions passed, but required screenshot evidence could not be captured.'; } }
        result.networkRestrictionsObserved = blockedOrigin || guard.blockedCount > blockedCountBefore;
        result.networkRestrictions = guard.blocked.slice(blockedBefore);
        if (guard.blockedCount - blockedCountBefore > result.networkRestrictions.length) result.networkRestrictions.push({ reason: 'Additional requests were blocked; the run reached its 200-entry network detail limit.' });
        attempt.results.push(result); await context.close();
      }
    } catch (error) {
      for (const c of prior.criteria) if (!attempt.results.some(r => r.criterion === c.id)) attempt.results.push({ criterion: c.id, result: 'blocked', detail: redact(String(error.message)).slice(0, 2000) });
    } finally { clearTimeout(budgetTimer); if (browser) await browser.close().catch(() => {}); if (guard) await guard.close(); }
    const during = compareSnapshot(attempt.snapshot, fingerprint(root));
    if (during.stale) for (const result of attempt.results) { result.result = 'stale'; result.detail = 'Source changed during verification or snapshot coverage was incomplete.'; }
    return qaReport(root, saveRecord(root, 'agent-qa', prior.id, { ...prior, attempts: [...prior.attempts, attempt] }, reservation.revision));
  });
}
