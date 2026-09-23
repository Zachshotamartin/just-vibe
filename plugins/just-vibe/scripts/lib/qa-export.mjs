import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { safePath, digest } from './workbench.mjs';

export function exportQaTest(root, record, directory) {
  if (record.verdict !== 'passed') throw Error('Export requires fresh passing assertions and reviewed request coverage.');
  const destination = safePath(root, directory);
  // A new directory prevents existing project tests from being overwritten.
  mkdirSync(destination);
  for (const file of ['qa-browser.mjs', 'qa-network.mjs']) writeFileSync(join(destination, file), readFileSync(new URL(file, import.meta.url)), { flag: 'wx' });
  const plan = { timeoutMs: record.attempts.at(-1).timeoutMs ?? 5000, target: record.target, allowedOrigins: record.allowedOrigins, criteria: record.criteria.map(({ id, text, sourceQuote, kind, path, viewport, steps, maskSelectors }) => ({ id, text, sourceQuote, kind, path, viewport, steps, ...(maskSelectors ? { maskSelectors } : {}) })), coverage: record.coverage, sourceAttempt: record.attempts.at(-1).number };
  writeFileSync(join(destination, 'plan.json'), JSON.stringify(plan, null, 2) + '\n', { flag: 'wx' });
  const source = `import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { executeQaStep } from './qa-browser.mjs';
import { startQaNetworkGuard } from './qa-network.mjs';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, ${JSON.stringify(relative(destination, root))});
const { chromium } = createRequire(resolve(root, 'package.json'))('playwright');
const plan = JSON.parse(readFileSync(new URL('./plan.json', import.meta.url), 'utf8'));
test('Reviewed acceptance: ${record.id}', { timeout: 120000 }, async t => {
  const guard = await startQaNetworkGuard(plan.allowedOrigins || [new URL(plan.target).origin]);
  t.after(() => guard.close());
  const browser = await chromium.launch({ proxy: guard.proxy, args: ['--proxy-bypass-list=<-loopback>', '--disable-quic', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'] });
  t.after(() => browser.close());
  for (const criterion of plan.criteria) await t.test(criterion.text, async () => {
    const context = await browser.newContext({ viewport: criterion.viewport, serviceWorkers: 'block', acceptDownloads: false });
    try {
      if (!context.routeWebSocket) throw Error('Playwright 1.48 or newer is required');
      await context.routeWebSocket('**/*', socket => socket.close());
      const page = await context.newPage(); page.setDefaultTimeout(plan.timeoutMs); page.setDefaultNavigationTimeout(plan.timeoutMs);
      const response = await page.goto(new URL(criterion.path, plan.target).href, { waitUntil: 'domcontentloaded' });
      if ((response?.status() || 0) >= 400) throw Error('Target navigation failed: ' + response.status());
      for (const step of criterion.steps) await executeQaStep(page, step, root, plan.timeoutMs);
    } finally { await context.close(); }
  });
});
`;
  if (record.attempts.at(-1).authenticated) {
    // Session material is never embedded; importing auth state is explicit at test execution.
    const withAuth = source.replace("acceptDownloads: false });", "acceptDownloads: false, ...(process.env.JUST_VIBE_QA_AUTH_STATE ? { storageState: process.env.JUST_VIBE_QA_AUTH_STATE } : {}) });");
    writeFileSync(join(destination, 'acceptance.test.mjs'), withAuth.replace("const guard = await", "if (!process.env.JUST_VIBE_QA_AUTH_STATE) throw Error('Set JUST_VIBE_QA_AUTH_STATE to a private test-account storage state file; credentials are not exported');\n  const guard = await"), { flag: 'wx' });
  } else writeFileSync(join(destination, 'acceptance.test.mjs'), source, { flag: 'wx' });
  writeFileSync(join(destination, 'README.md'), `# Exported acceptance checks\n\nRun from the project with Playwright 1.48+ and Chromium installed:\n\n\`node --test ${directory}/acceptance.test.mjs\`\n\nStart the app at ${record.target} first. Review plan.json before running: tests interact with its authorized origins. Fixtures remain in the project. No session credentials, screenshots or user history are exported. Authenticated plans require JUST_VIBE_QA_AUTH_STATE pointing to a private test-account storage-state file. These tests cover the declared assertions only; the original report and its source snapshot remain the historical evidence.\n`, { flag: 'wx' });
  return { directory, files: ['acceptance.test.mjs', 'plan.json', 'qa-browser.mjs', 'qa-network.mjs', 'README.md'], planHash: digest(JSON.stringify(plan)), note: 'Standalone Node tests using the project’s Playwright installation. Review and run against the authorized app.' };
}
