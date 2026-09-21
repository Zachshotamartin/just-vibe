import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { startOperatorServer } from '../plugins/just-vibe/scripts/lib/operator-http.mjs';
import { operator } from '../plugins/just-vibe/scripts/lib/operator.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
const require = createRequire(new URL('../website/package.json', import.meta.url));
const { chromium } = require('playwright'),
  AxeBuilder = require('@axe-core/playwright').default;
const temp = mkdtempSync(join(tmpdir(), 'jv-browser-')),
  root = join(temp, 'project'),
  home = join(temp, 'home');
mkdirSync(root);
const directory = resolve('.tmp/operator-browser');
mkdirSync(directory, { recursive: true });
await operator(
  root,
  'message',
  {
    revision: 0,
    id: 'review',
    recipient: 'owner',
    message: 'Review the current implementation evidence.',
  },
  { home },
);
const app = await startOperatorServer(root, { home, allowInstall: true });
const store = runtimeStore(root, { home }),
  initial = store.get('operator');
store.put(
  'operator',
  {
    ...initial,
    dispatch: [
      {
        id: 'completed',
        requestId: 'completed-request',
        job: 'fixture',
        status: 'finished',
        outcome: 'completed',
        at: new Date().toISOString(),
      },
    ],
  },
  initial.revision,
);
let browser;
const checks = [],
  errors = [];
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(app.url.replace('/#', '/?viewport=' + name + '#'));
    await page.getByRole('button', { name: 'Acknowledge', exact: true }).count();
    await page.getByRole('button', { name: 'Tool catalog', exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector('#status').textContent === '262 records',
    );
    await page.locator('#search').fill('pytorch');
    await page.waitForFunction(() => document.querySelectorAll('#rows article').length === 1);
    await page.locator('#rows summary').focus();
    await page.keyboard.press('Enter');
    if (!(await page.locator('#rows pre').isVisible())) throw Error('Keyboard expansion failed');
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
    );
    await page.screenshot({ path: join(directory, `operator-${name}.png`), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw Error('Horizontal overflow');
    const axe = await new AxeBuilder({ page }).analyze();
    if (axe.violations.length)
      throw Error(
        JSON.stringify(
          axe.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({ html: n.html, summary: n.failureSummary })),
          })),
        ),
      );
    await page.locator('#search').fill('nothing-will-match-this');
    if (await page.locator('#rows article').count()) throw Error('Empty filter failed');
    checks.push({
      name,
      width,
      overflow,
      axeViolations: axe.violations.length,
      keyboard: true,
      methodSearch: true,
    });
  }
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#status').textContent === '2 records');
  await page.getByRole('button', { name: 'Tool catalog', exact: true }).click();
  await page.locator('#target').selectOption('pi');
  let releasePreview, previewArrived;
  const arrived = new Promise((resolve) => {
    previewArrived = resolve;
  });
  const held = new Promise((resolve) => {
    releasePreview = resolve;
  });
  await page.route('**/api/install-preview', async (route) => {
    const response = await route.fetch();
    previewArrived();
    await held;
    await route.fulfill({ response });
  });
  await page.locator('#preview').click();
  await arrived;
  await page.locator('#target').selectOption('gemini');
  const oldResponse = page.waitForResponse('**/api/install-preview');
  releasePreview();
  await (await oldResponse).finished();
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  if ((await page.locator('#apply').isVisible()) || (await page.locator('#plan').textContent()))
    throw Error('A stale install response replaced the current editor selection.');
  await page.unroute('**/api/install-preview');
  await page.locator('#target').selectOption('pi');
  await page.getByRole('button', { name: 'Preview changes', exact: true }).click();
  await page.getByRole('button', { name: 'Apply reviewed changes', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Apply reviewed changes', exact: true }).click();
  await page.waitForFunction(() =>
    document.querySelector('#plan').textContent.startsWith('Owned project files updated'),
  );
  await page.locator('#search').fill('pytorch');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (
    (await page.locator('#rows article').evaluate((e) => getComputedStyle(e).animationName)) !==
    'none'
  )
    throw Error('Reduced motion failed');
  await page.getByRole('button', { name: 'Workspace', exact: true }).click();
  await page.locator('#search').fill('');
  await page.getByRole('button', { name: 'Acknowledge', exact: true }).click();
  await page.waitForFunction(
    () =>
      !Array.from(document.querySelectorAll('button')).some((b) => b.textContent === 'Acknowledge'),
  );
  await page.getByRole('button', { name: 'Retire finished request', exact: true }).click();
  await page
    .getByRole('button', { name: 'Retire finished request', exact: true })
    .waitFor({ state: 'hidden' });
  if (store.get('operator').dispatch.length) throw Error('Dispatch retirement failed');
  if (errors.length) throw Error(errors.join('\n'));
  writeFileSync(
    join(directory, 'results.json'),
    JSON.stringify(
      {
        browser: await browser.version(),
        checks,
        installation: true,
        acknowledgement: true,
        dispatchRetirement: true,
        privateReload: true,
        staleInstallPreviewRejected: true,
        reducedMotion: true,
        errors,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    'Operator browser: desktop/mobile search, keyboard, reduced motion, zero accessibility violations, reviewed fixture installation and local coordination passed.',
  );
} finally {
  await browser?.close();
  await app.close();
  rmSync(temp, { recursive: true, force: true });
}
