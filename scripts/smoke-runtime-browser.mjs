import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderActivity } from '../plugins/just-vibe/scripts/lib/activity.mjs';
const require = createRequire(new URL('../website/package.json', import.meta.url));
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const report = JSON.parse(
  readFileSync(new URL('../tests/fixtures/runtime/activity.json', import.meta.url)),
);
const html = renderActivity(report),
  directory = resolve('.tmp/runtime-browser');
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/index.html`, html);
const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(html);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
let browser;
const checks = [],
  errors = [];
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  const settled = () =>
    page.evaluate(() =>
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
    );
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await settled();
    await page.screenshot({ path: `${directory}/activity-${name}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw Error(`${name} horizontal overflow`);
    await page.locator('#category').selectOption('goal');
    if ((await page.locator('article:visible').count()) !== 1)
      throw Error('Category filter failed');
    await page.locator('#search').fill('unmatched-value');
    if (!(await page.locator('#empty').isVisible())) throw Error('Empty state missing');
    await page.locator('#search').fill('');
    await page.locator('#category').selectOption('task');
    await page.locator('summary').click();
    if (!(await page.locator('pre').isVisible())) throw Error('Details expansion failed');
    await page.locator('pre').focus();
    await page.keyboard.press('ArrowDown');
    if (!(await page.locator('pre').evaluate((el) => el === document.activeElement)))
      throw Error('Evidence region not keyboard accessible');
    await page.locator('#category').selectOption('all');
    await settled();
    const axe = await new AxeBuilder({ page }).analyze();
    checks.push({
      name,
      overflow,
      axe: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
    });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (
    (await page
      .locator('article')
      .first()
      .evaluate((e) => getComputedStyle(e).animationName)) !== 'none'
  )
    throw Error('Reduced motion was not honored');
  writeFileSync(
    `${directory}/results.json`,
    JSON.stringify({ checks, errors, reducedMotion: true }, null, 2),
  );
  console.log(JSON.stringify({ checks, errors, reducedMotion: true }, null, 2));
  if (errors.length || checks.some((c) => c.axe.length)) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise((ok) => server.close(ok));
}
