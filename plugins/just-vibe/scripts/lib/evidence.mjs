import { readFileSync, readdirSync, lstatSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runCommand, requireResult, redact, redactValue } from './process.mjs';
import { within, readJson, projectRoot, digest } from './storage.mjs';

const observed = (kind, target, data) => ({ schemaVersion: 1, kind, target, observedAt: new Date().toISOString(), ...data });
const parse = source => { try { return JSON.parse(source); } catch { throw Error('Provider returned invalid JSON; update or inspect the installed CLI.'); } };
const clean = redactValue;

export async function githubChecks({ root, repo, pr }, run = runCommand) {
  if (typeof repo !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(repo) || !/^[1-9]\d*$/.test(String(pr))) throw Error('Specify --repo owner/name and --pr NUMBER.');
  const view = async () => {
    const value = parse(requireResult(await run(['gh', 'pr', 'view', String(pr), '--repo', repo, '--json', 'number,url,headRefOid,baseRefName,state,isDraft'], { cwd: root })));
    if (value.number !== Number(pr) || !/^[a-f0-9]{40,64}$/.test(value.headRefOid || '')) throw Error('Unexpected PR identity.');
    return value;
  };
  const before = await view();
  const result = await run(['gh', 'pr', 'checks', String(pr), '--repo', repo, '--json', 'name,state,bucket,link,workflow'], { cwd: root });
  const checks = parse(requireResult(result, [0, 1, 8]));
  if (!Array.isArray(checks) || checks.some(c => !c || typeof c.name !== 'string' || !['pass', 'fail', 'pending', 'skipping', 'cancel'].includes(c.bucket))) throw Error('Unexpected GitHub check schema.');
  const after = await view();
  const stale = before.headRefOid !== after.headRefOid || before.baseRefName !== after.baseRefName;
  const counts = Object.fromEntries(['pass', 'fail', 'pending', 'skipping', 'cancel'].map(k => [k, checks.filter(c => c.bucket === k).length]));
  return observed('github-checks', { repo, pr: Number(pr), head: before.headRefOid }, clean({ stale, currentHead: after.headRefOid, state: after.state, draft: after.isDraft, checks, counts,
    result: stale ? 'stale' : !checks.length ? 'unknown' : counts.fail || counts.cancel ? 'failed' : counts.pending ? 'pending' : 'completed',
    limitation: 'Check observation only. Does not establish branch-protection satisfaction, approvals, mergeability or deployment health. Re-read before a dependent action.' }));
}

export async function vercelDiagnosis({ root, deployment, scope }, run = runCommand) {
  if (typeof deployment !== 'string' || !/^(?:dpl_[A-Za-z0-9]+|(?:https:\/\/)?[a-z0-9][a-z0-9.-]*\.vercel\.app)$/i.test(deployment)) throw Error('Specify a dpl_ID or vercel.app deployment URL without query parameters.');
  if (scope && !/^[a-zA-Z0-9_-]+$/.test(scope)) throw Error('Invalid Vercel scope.');
  const suffix = scope ? ['--scope', scope] : [];
  const info = await run(['vercel', 'inspect', deployment, ...suffix], { cwd: root, timeoutMs: 20000 });
  requireResult(info);
  const detail = info.stdout + '\n' + info.stderr;
  const logs = await run(['vercel', 'inspect', deployment, '--logs', ...suffix], { cwd: root, timeoutMs: 20000 });
  const lines = redact(logs.stdout + '\n' + logs.stderr).split(/\r?\n/).filter(Boolean);
  const errors = lines.filter(line => /\b(?:error|failed|cannot find|not found|ELIFECYCLE)\b/i.test(line)).slice(0, 12);
  return observed('vercel-build', { deployment, scope: scope || null }, { details: redact(detail), logs: { status: logs.status, timedOut: logs.timedOut, truncated: logs.truncated, ...(logs.error ? { error: logs.error } : {}) },
    result: logs.status !== 0 || logs.error || logs.timedOut || logs.truncated ? 'incomplete' : 'observed', errorCandidates: errors,
    limitation: 'Build-log candidates, not a proven root cause or a runtime-health check. CLI output is unstructured; verify deployment identity in details. Empty logs are not evidence of a successful build.' });
}

function sqlCode(source) {
  // Remove comments and string bodies while retaining statement boundaries and identifier tokens.
  return source.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)?\$[\s\S]*?\$\1\$/g, ' ')
    .replace(/'(?:''|[^'])*'/g, ' ').replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, ' ');
}
export function migrationEvidence({ root, directory, applied }) {
  root = projectRoot(root);
  if (!directory) throw Error('Specify --directory with the SQL migration directory.');
  const folder = within(root, directory);
  const files = [];
  function collect(path, depth = 0) {
    if (depth > 5) throw Error('Migration directory nesting exceeds five levels.');
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = within(root, join(path, entry.name));
      if (entry.isDirectory()) collect(file, depth + 1);
      else if (entry.isFile() && entry.name.endsWith('.sql')) {
        if (files.length >= 1000 || lstatSync(file).size > 1024 * 1024) throw Error('Migration inspection budget exceeded.');
        const source = readFileSync(file, 'utf8'), code = sqlCode(source);
        const findings = [];
        for (const [pattern, finding] of [[/\bDROP\s+(?:TABLE|COLUMN|SCHEMA|TYPE|INDEX)\b/i, 'drop-object'], [/\bTRUNCATE\b/i, 'truncate'], [/\bDELETE\s+FROM\b[^;]*;/i, 'delete-data'], [/\bALTER\s+TABLE\b/i, 'alter-table-lock-review'], [/\bCREATE\s+(?:UNIQUE\s+)?INDEX\b(?!\s+CONCURRENTLY)/i, 'index-lock-review'], [/\bSET\s+NOT\s+NULL\b/i, 'not-null-backfill-review']]) if (pattern.test(code)) findings.push(finding);
        files.push({ path: relative(folder, file).replaceAll('\\', '/'), sha256: digest(source), findings });
      }
    }
  }
  collect(folder);
  let history = null;
  if (applied) {
    history = readJson(within(root, applied));
    if (history.schemaVersion !== 1 || typeof history.target !== 'string' || !history.target.trim() || !Number.isFinite(Date.parse(history.observedAt)) || !Array.isArray(history.migrations) || history.migrations.some(m => typeof m.path !== 'string' || !/^[a-f0-9]{64}$/.test(m.sha256 || ''))) throw Error('Applied history requires schemaVersion:1, target, observedAt and migrations [{path,sha256}].');
    if (new Set(history.migrations.map(m => m.path)).size !== history.migrations.length) throw Error('Duplicate applied migration identities.');
  }
  const drift = history?.migrations.filter(m => !files.some(f => f.path === m.path && f.sha256 === m.sha256)) || [];
  return observed('migrations', { directory, database: history?.target || null }, { files, appliedObservedAt: history?.observedAt || null, drift, pending: history ? files.filter(f => !history.migrations.some(m => m.path === f.path)).map(f => f.path) : null,
    result: !files.length ? 'unknown' : drift.length ? 'drift' : history ? 'compared' : 'local-only',
    limitation: 'Static SQL review signals and supplied history only. Does not connect to a database, parse every SQL dialect, establish lock duration or prove safe execution. ORM-generated migrations must first be rendered to SQL.' });
}

async function waitForAssertion(check, message) {
  const deadline = performance.now() + 5000;
  while (performance.now() < deadline) {
    const remaining = Math.max(1, Math.ceil(deadline - performance.now()));
    try { if (await check(remaining)) return; } catch { /* Retry detached or not-yet-present elements within the same deadline. */ }
    const delay = Math.min(100, deadline - performance.now());
    if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw Error(`${message} (not satisfied within 5000 ms).`);
}

export async function browserEvidence({ root, url, steps, artifactDirectory }, launch) {
  const target = new URL(url);
  if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password || target.search || target.hash) throw Error('Use an HTTP(S) URL without credentials, query parameters or fragment.');
  const plan = steps ? readJson(within(root, steps)) : { steps: [{ action: 'title' }] };
  if (!Array.isArray(plan.steps) || !plan.steps.length || plan.steps.length > 30) throw Error('Provide 1–30 browser steps.');
  const allowed = new Set(['click', 'fill', 'press', 'visible', 'hidden', 'focused', 'text', 'url', 'title']);
  for (const step of plan.steps) {
    if (!allowed.has(step.action) || Object.keys(step).some(k => !['action', 'selector', 'value'].includes(k))) throw Error('Unknown browser step.');
    if (!['url', 'title'].includes(step.action) && (typeof step.selector !== 'string' || !step.selector || step.selector.length > 500)) throw Error('Browser step requires a bounded selector.');
    if (['fill', 'press', 'text', 'url'].includes(step.action) && (typeof step.value !== 'string' || step.value.length > 4000)) throw Error('Browser step requires a bounded value.');
    if (step.action === 'title' && step.value !== undefined && (typeof step.value !== 'string' || step.value.length > 4000)) throw Error('Title assertion requires a bounded value.');
  }
  if (!launch) {
    const require = createRequire(join(projectRoot(root), 'package.json'));
    let module;
    try { module = await import(pathToFileURL(require.resolve('playwright')).href); }
    catch { try { module = await import(pathToFileURL(require.resolve('@playwright/test')).href); } catch { throw Error('Install Playwright and its Chromium browser in the selected project, or use the host browser tools. No dependency was installed.'); } }
    const chromium = module.chromium || module.default?.chromium;
    if (!chromium?.launch) throw Error('The installed Playwright package does not expose Chromium.');
    launch = () => chromium.launch({ headless: true, timeout: 15000 });
  }
  if (artifactDirectory && !/^\.just-vibe\/proofs\/[a-z0-9-]+\/artifacts\/[a-f0-9-]+$/.test(artifactDirectory)) throw Error('Browser artifacts require an owned proof artifact directory.');
  if (artifactDirectory) mkdirSync(within(root, artifactDirectory), { recursive: true });
  const browser = await launch();
  const results = [], issues = [], artifacts = [];
  try {
    const context = await browser.newContext();
    const page = await context.newPage(); page.setDefaultTimeout(5000);
    page.on('pageerror', e => issues.push(redact(e.message).slice(0, 1000)));
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    for (const [index, step] of plan.steps.entries()) {
      try {
        const locator = step.selector ? page.locator(step.selector) : null;
        if (step.action === 'click') await locator.click();
        else if (step.action === 'fill') await locator.fill(step.value);
        else if (step.action === 'press') await locator.press(step.value);
        else if (step.action === 'visible') await locator.waitFor({ state: 'visible' });
        else if (step.action === 'hidden') await locator.waitFor({ state: 'hidden' });
        else if (step.action === 'focused') await waitForAssertion(timeout => locator.evaluate(element => element.getRootNode().activeElement === element, undefined, { timeout }), 'Expected element did not own focus');
        else if (step.action === 'text') await waitForAssertion(async timeout => (await locator.isVisible()) && (await locator.innerText({ timeout })).includes(step.value), 'Expected text was not present');
        else if (step.action === 'url') await waitForAssertion(() => page.url() === new URL(step.value, url).href, 'URL assertion did not match');
        else if (step.action === 'title') {
          if (step.value === undefined) await page.title();
          else await waitForAssertion(async () => (await page.title()) === step.value, 'Title assertion did not match');
        }
        if (artifactDirectory && artifacts.length < 10) { const path = `${artifactDirectory}/step-${index}.png`; await page.screenshot({ path: within(root, path), fullPage: false, timeout: 5000 }); artifacts.push(path); }
        results.push({ index, action: step.action, pass: true });
      } catch (error) { results.push({ index, action: step.action, pass: false, error: redact(error.message).slice(0, 1000) }); break; }
    }
    const status = response?.status() ?? null;
    return observed('browser', { url }, { status, steps: results, pageErrors: issues.slice(0, 20), artifacts, result: results.length === plan.steps.length && results.every(s => s.pass) && status !== null && status < 400 && !issues.length ? 'passed' : 'failed', limitation: 'Fresh headless Chromium session and only the listed interactions. Optional screenshots capture visible content, at most ten frames. No automatic login, full accessibility audit, visual approval or other-browser coverage.' });
  } finally { await browser.close(); }
}

export async function collectEvidence(kind, options, dependencies = {}) {
  if (kind === 'github') return githubChecks(options, dependencies.run);
  if (kind === 'vercel') return vercelDiagnosis(options, dependencies.run);
  if (kind === 'migrations') return migrationEvidence(options);
  if (kind === 'browser') return browserEvidence(options, dependencies.launch);
  throw Error(`Unknown evidence collector: ${kind}`);
}
