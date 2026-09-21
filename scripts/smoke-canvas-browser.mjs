import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { planCanvas } from '../plugins/just-vibe/scripts/lib/plan-canvas.mjs';
import { startCanvasServer } from '../plugins/just-vibe/scripts/lib/canvas-http.mjs';
const require = createRequire(new URL('../website/package.json', import.meta.url));
const { chromium } = require('playwright'),
  AxeBuilder = require('@axe-core/playwright').default;
const directory = resolve('.tmp/canvas-browser'),
  temp = mkdtempSync(join(tmpdir(), 'jv-canvas-browser-')),
  root = join(temp, 'project'),
  options = { home: join(temp, 'home') };
mkdirSync(directory, { recursive: true });
mkdirSync(root);
const artifact =
  '# Checkout recovery plan\n\n1. Preserve the payment API contract.\n2. Persist an idempotency key before the request.\n3. Show loading, success and retryable errors.\n4. Test cancellation and duplicate submissions.\n\nReview question: does a retry reuse the original key?';
writeFileSync(join(root, 'plan.md'), artifact);
await planCanvas(
  root,
  'create',
  { id: 'plan', revision: 0, title: 'Checkout recovery', path: 'plan.md' },
  options,
);
const server = await startCanvasServer(root, 'plan', options);
let browser;
const checks = [],
  errors = [];
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(server.url);
    await page.getByRole('heading', { name: 'Checkout recovery' }).waitFor();
    await page.getByRole('button', { name: 'Annotate line 4', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.equal(
      await page.locator('#message').evaluate((e) => e === document.activeElement),
      true,
    );
    await page.getByLabel('Feedback or review reason').fill('Reuse the original key on retry.');
    await page.getByRole('button', { name: 'Add annotation' }).click();
    await page.locator('#feedback p').first().waitFor();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    const axe = await new AxeBuilder({ page }).analyze();
    checks.push({ name, violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact })) });
    await page.screenshot({ path: join(directory, `${name}.png`), fullPage: true });
  }
  await page.getByLabel('Feedback or review reason').fill('Ready with the retry key requirement.');
  await page.getByRole('button', { name: 'Approve version' }).click();
  await page.getByText('This version is approved.', { exact: true }).waitFor();
  writeFileSync(join(root, 'plan.md'), artifact + '\nA changed requirement.');
  await page.getByText('The artifact changed.', { exact: false }).waitFor({ timeout: 6000 });
  assert.equal(await page.getByRole('button', { name: 'Approve version' }).isDisabled(), true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(
    await page.locator('#approve').evaluate((e) => getComputedStyle(e).transitionDuration),
    '0s',
  );
  // Untrusted HTML cannot execute script or load remote resources in the preview.
  writeFileSync(
    join(root, 'unsafe.html'),
    '<h1>Sandbox test</h1><script>parent.postMessage("unsafe-executed","*")</script><img src="https://example.com/leak">',
  );
  await planCanvas(
    root,
    'create',
    { id: 'html', revision: 0, title: 'HTML review', path: 'unsafe.html' },
    options,
  );
  const htmlServer = await startCanvasServer(root, 'html', options);
  try {
    const remote = [];
    await page.route('https://**', (route) => {
      remote.push(route.request().url());
      return route.abort();
    });
    await page.goto(htmlServer.url);
    await page.getByRole('heading', { name: 'HTML review' }).waitFor();
    await page.evaluate(() => {
      window.executed = false;
      addEventListener('message', (e) => {
        if (e.data === 'unsafe-executed') window.executed = true;
      });
    });
    await page.getByRole('button', { name: 'Preview HTML' }).click();
    await page.frameLocator('#preview').getByRole('heading', { name: 'Sandbox test' }).waitFor();
    assert.equal(await page.evaluate(() => window.executed), false);
    assert.equal(remote.length, 0);
  } finally {
    await htmlServer.close();
  }
  assert.equal(errors.length, 0);
  assert.ok(
    checks.every((c) => c.violations.length === 0),
    JSON.stringify(checks),
  );
  const result = {
    checks,
    errors,
    annotations: true,
    staleApproval: true,
    reducedMotion: true,
    sandboxedHtml: true,
  };
  writeFileSync(join(directory, 'results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (browser) await browser.close();
  await server.close();
  rmSync(temp, { recursive: true, force: true });
}
