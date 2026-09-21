import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.WEBSITE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const settled = () =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
const scroll = async (y) => {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
  await settled();
};
const hidden = () => page.locator('.site-header').getAttribute('data-hidden');
try {
  for (const width of [320, 390, 601, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/commands/', '/profiles/']) {
      await page.goto(base + route);
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page.evaluate(() => {
        const width = document.documentElement.clientWidth;
        return {
          edges: ['.site-header', '.site-footer', '.footer-divider'].map((selector) => {
            const element = document.querySelector(selector),
              rect = element.getBoundingClientRect();
            return { selector, left: rect.left, right: rect.right, width };
          }),
          insets: [...document.querySelectorAll('.catalog-item')].map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              left: element.firstElementChild.getBoundingClientRect().left - rect.left,
              right: rect.right - element.lastElementChild.getBoundingClientRect().right,
            };
          }),
          selected: [...document.querySelectorAll('.site-header nav a[aria-current="page"]')].map(
            (a) => ({
              href: a.getAttribute('href'),
              background: getComputedStyle(a).backgroundColor,
            }),
          ),
        };
      });
      assert.ok(
        geometry.edges.every((r) => Math.abs(r.left) < 1 && Math.abs(r.right - r.width) < 1),
        JSON.stringify(geometry.edges),
      );
      assert.ok(
        geometry.insets.every((r) => r.left >= 19 && r.right >= 19),
        `${width}px ${route}: card insets`,
      );
      assert.equal(
        geometry.selected.length,
        2,
        'Desktop and mobile both expose the current section',
      );
      assert.ok(
        geometry.selected.every((a) => a.href === route && a.background === 'rgb(32, 34, 30)'),
      );
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + '/commands/');
  await settled();
  await scroll(600);
  assert.equal(await hidden(), 'true');
  await scroll(595);
  assert.equal(await hidden(), 'true', 'Minor scroll jitter does not toggle the header');
  await scroll(588);
  assert.equal(await hidden(), 'false', '12px upward travel reveals navigation');
  await scroll(700);
  assert.equal(await hidden(), 'true');
  await page.keyboard.press('Tab');
  await page.locator('.site-header .wordmark').focus();
  assert.equal(await hidden(), 'false', 'Keyboard focus reveals navigation');
  await page.locator('.desktop-nav a[href="/profiles/"]').click();
  await page.waitForURL('**/profiles/');
  assert.equal(await hidden(), 'false', 'Page changes reset header visibility');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.mobile-menu summary').click();
  await scroll(600);
  assert.equal(await hidden(), 'false', 'An open mobile menu stays visible');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.mobile-menu').open);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(
    await page.locator('.site-header').evaluate((el) => getComputedStyle(el).transitionDuration),
    '0s',
  );
  console.log(
    'Header/footer checks passed: full-width surfaces, active sections, card insets, scroll direction and jitter, keyboard focus, navigation reset, mobile menu and reduced motion.',
  );
} finally {
  await browser.close();
}
