import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { counts } from '../src/lib/catalog.mjs';

const base = process.env.WEBSITE_URL || 'http://127.0.0.1:4321';
const screenshots = new URL('../../.tmp/website-qa/', import.meta.url).pathname;
mkdirSync(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (
    response.status() >= 400 &&
    response.url().startsWith(base) &&
    !response.url().includes('missing-page')
  )
    errors.push(`${response.status()} ${response.url()}`);
});
const visit = async (path) => {
  const response = await page.goto(base + path);
  assert.equal(response.status(), 200, path);
  await page.evaluate(() => document.fonts.ready);
};
try {
  await visit('/');
  await page.screenshot({ path: screenshots + 'home-desktop.png', fullPage: true });
  for (const manager of ['pnpm', 'npm', 'yarn']) {
    await page.locator(`[data-install] input[value="${manager}"]`).check();
    for (const host of ['codex', 'claude']) {
      await page.locator('[data-install] select').selectOption(host);
      const expected = `${manager === 'npm' ? 'npx' : manager + ' dlx'} just-vibe@latest setup${host === 'claude' ? ' --target claude' : ''}`;
      assert.equal(await page.locator('[data-install-code]').textContent(), expected);
      await page.locator('[data-install] .copy-button').click();
      await page.waitForFunction(
        async (value) => (await navigator.clipboard.readText()) === value,
        expected,
      );
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
    }
  }
  await page.locator('[data-command="teach"]').click();
  await page.locator('#demo-brief').fill('Teach linked lists using a small example.');
  await page.locator('#demo-copy').click();
  await page.waitForFunction(async () =>
    (await navigator.clipboard.readText()).startsWith('/just-vibe:teach '),
  );
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    '/just-vibe:teach Teach linked lists using a small example.',
  );
  await page.locator('#demo-host').selectOption('codex');
  await page.locator('#demo-copy').click();
  await page.waitForFunction(
    async () =>
      (await navigator.clipboard.readText()) === 'Teach linked lists using a small example.',
  );
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    'Teach linked lists using a small example.',
  );
  assert.ok(await page.locator('#demo-instruction').isVisible());
  await page.waitForFunction(
    () => document.querySelector('#demo-copy')?.textContent?.trim() === 'Copy prompt',
  );
  assert.equal(await page.locator('#demo-copy svg').count(), 1, 'Copy feedback restores its SVG');
  await page.locator('#demo-copy svg').click();
  await page.waitForFunction(() => document.querySelector('#demo-copy')?.textContent === 'Copied');
  await page.waitForFunction(
    () => document.querySelector('#demo-copy')?.textContent?.trim() === 'Copy prompt',
  );
  assert.equal(
    await page.locator('#demo-copy svg').count(),
    1,
    'Repeated SVG clicks preserve the control',
  );
  await visit('/commands/?pack=react');
  assert.equal(await page.locator('#catalog-group').inputValue(), 'react');
  assert.ok((await page.locator('.catalog-item:visible').count()) > 0);
  await page.locator('#catalog-search').fill('no-matching-command-xyz');
  assert.ok(await page.locator('.empty-state').isVisible());
  await page.locator('[data-reset]').click();
  assert.equal(await page.locator('.catalog-item:visible').count(), counts.commands);
  await page.locator('#catalog-search').fill('/just-vibe:teach-test');
  assert.ok(await page.locator('a.catalog-item[href="/commands/teach-test/"]').isVisible());
  await page.reload();
  assert.equal(await page.locator('#catalog-search').inputValue(), '/just-vibe:teach-test');
  await visit('/profiles/?family=ml');
  assert.ok(
    await page.locator('a.catalog-item[href="/profiles/machine-learning-engineer/"]').isVisible(),
  );
  for (const route of [
    '/',
    '/commands/',
    '/commands/teach/',
    '/profiles/',
    '/profiles/principal-engineer/',
    '/docs/installation/',
    '/brand/',
  ]) {
    await visit(route);
    const a11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    assert.deepEqual(
      a11y.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      [],
      `Accessibility: ${route}`,
    );
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Horizontal overflow: ${route}, ${width}`,
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await visit('/commands/');
  await page.keyboard.press('/');
  assert.equal(
    await page.locator('#catalog-search').evaluate((el) => el === document.activeElement),
    true,
  );
  await page.screenshot({ path: screenshots + 'commands-desktop.png', fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await visit('/');
  await page.screenshot({ path: screenshots + 'home-mobile.png', fullPage: true });
  await page.locator('.mobile-menu summary').click();
  await page.locator('.mobile-menu nav a[href="/docs/"]').click();
  assert.equal(new URL(page.url()).pathname, '/docs/');
  const missing = await page.goto(base + '/missing-page-for-test/');
  assert.equal(missing.status(), 404);
  assert.ok(await page.getByRole('heading', { name: 'Let’s find your way.' }).isVisible());
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await nojs.newPage();
  await staticPage.goto(base + '/commands/');
  assert.equal(await staticPage.locator('.catalog-item').count(), counts.commands);
  await nojs.close();
  assert.deepEqual(errors, []);
  console.log(
    'Passed: six install variants, clipboard, prompt builder, search, deep links, filters, mobile menu, keyboard, 404, no-JS catalog, responsive overflow and automated accessibility checks.',
  );
  console.log(`Screenshots: ${screenshots}`);
} finally {
  await browser.close();
}
