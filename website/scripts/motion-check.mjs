import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.WEBSITE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const settled = async () =>
  page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})));
  });
const navigate = async (selector, path) => {
  await page.locator(selector).click();
  await page.waitForURL(base + path);
  await settled();
};
try {
  await page.goto(base);
  await settled();
  await page.evaluate(() => {
    window.navigationProbe = 'same-document-session';
  });
  await navigate('.desktop-nav a[href="/commands/"]', '/commands/');
  assert.equal(await page.evaluate(() => window.navigationProbe), 'same-document-session');
  await page.locator('#catalog-group').selectOption('react');
  await settled();
  assert.equal(await page.locator('.catalog-item:visible').count(), 8);
  await navigate('a.catalog-item[href="/commands/react-effects/"]', '/commands/react-effects/');
  await page.goBack();
  await page.waitForURL('**/commands/?pack=react');
  await settled();
  assert.equal(await page.locator('#catalog-group').inputValue(), 'react');
  assert.equal(await page.locator('.catalog-item:visible').count(), 8);

  // Native keyboard selection and popup close remain usable with custom picker animation.
  await page.locator('#catalog-group').focus();
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.querySelector('#catalog-group').matches(':open'));
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#catalog-group').inputValue(), '');
  await page.waitForFunction(() => !document.querySelector('#catalog-group').matches(':open'));
  await navigate('.desktop-nav a[href="/profiles/"]', '/profiles/');
  await page.locator('#catalog-search').fill('principal');
  assert.ok(await page.locator('a[href="/profiles/principal-engineer/"]').isVisible());
  await navigate('.desktop-nav a[href="/docs/"]', '/docs/');
  await navigate('.docs-card[href="/docs/installation/"]', '/docs/installation/');
  await page.locator('[data-install] select').selectOption('claude');
  assert.match(await page.locator('[data-install-code]').textContent(), /--target claude$/);
  // A long document's offscreen origin must not tween up through the next document.
  await page.evaluate(() => {
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
      const transition = start(...args);
      window.routePositions = transition.ready.then(
        () =>
          new Promise((resolve) => {
            const positions = [];
            const sample = () => {
              positions.push(document.querySelector('h1').getBoundingClientRect().top);
              if (positions.length < 60) requestAnimationFrame(sample);
              else resolve(positions);
            };
            sample();
          }),
      );
      window.routeMotion = transition.ready.then(() => ({
        scroll: window.scrollY,
        oldOpacity: getComputedStyle(document.documentElement, '::view-transition-old(page)')
          .opacity,
        incoming: document
          .getAnimations()
          .filter((animation) => animation.effect?.pseudoElement === '::view-transition-new(page)')
          .flatMap((animation) => animation.effect.getKeyframes()),
        geometry: document
          .getAnimations()
          .filter(
            (animation) => animation.effect?.pseudoElement === '::view-transition-group(page)',
          )
          .flatMap((animation) => animation.effect.getKeyframes()),
      }));
      return transition;
    };
  });
  for (const destination of ['usage', 'releases', 'installation']) {
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
    assert.ok(await page.evaluate(() => scrollY > 500), 'Start at the bottom of a real document');
    // Focus preserves scroll position, including when the sidebar is above the footer.
    await page
      .locator(`.detail-sidebar a[href="/docs/${destination}/"]`)
      .evaluate((link) => link.focus({ preventScroll: true }));
    await page.keyboard.press('Enter');
    await page.waitForURL(base + `/docs/${destination}/`);
    const motion = await page.evaluate(() => window.routeMotion);
    const positions = await page.evaluate(() => window.routePositions);
    assert.ok(
      Math.max(...positions) - Math.min(...positions) < 1,
      'The new heading stays at one position through and after navigation',
    );
    assert.equal(
      motion.scroll,
      0,
      'The new document starts at the top before its first animated frame',
    );
    assert.equal(motion.oldOpacity, '0', 'Old document text cannot overlap the incoming text');
    assert.ok(
      motion.geometry.length === 0,
      'The document bounds must not animate between scroll positions',
    );
    assert.ok(motion.incoming.length > 0, 'The incoming page keeps a short entrance');
    assert.ok(
      motion.incoming.every((frame) => !frame.transform || frame.transform === 'none'),
      'Page text never moves vertically during navigation',
    );
    assert.ok(
      motion.incoming.every((frame) => Number(frame.opacity ?? 1) >= 0.95),
      'Page navigation never fades readable content to a blank frame',
    );
    await page.waitForFunction(
      () => !document.documentElement.hasAttribute('data-astro-transition'),
    );
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    assert.ok(
      await page
        .locator('.detail-body header')
        .evaluate(
          (element) =>
            Number(getComputedStyle(element).opacity) >= 0.95 &&
            element.getAnimations().length === 0,
        ),
      'The heading must not replay its section reveal after route navigation',
    );
    await settled();
    assert.equal(await page.evaluate(() => scrollY), 0);
  }
  await navigate('.site-header .wordmark', '/');
  await page.locator('[data-command="remember"]').click();
  assert.equal((await page.locator('#demo-command').textContent()).trim(), '/just-vibe:remember');
  await page.locator('#demo-host').selectOption('codex');
  assert.ok(await page.locator('#demo-instruction').isVisible());
  await page.locator('#demo-copy').click();
  await page.waitForFunction(
    () => document.querySelector('#demo-copy').dataset.copyState === 'success',
  );

  // Mobile menu: animation, interruption, Escape, outside click, resize and route change.
  await page.setViewportSize({ width: 390, height: 844 });
  const toggle = page.locator('.mobile-menu summary');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.mobile-menu').open);
  assert.equal(await toggle.evaluate((el) => el === document.activeElement), true);
  await toggle.click();
  await page.locator('.hero-art').click();
  await page.waitForFunction(() => !document.querySelector('.mobile-menu').open);
  await toggle.click();
  await toggle.click();
  await toggle.click();
  await settled();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForFunction(() => !document.querySelector('.mobile-menu').open);
  await page.setViewportSize({ width: 390, height: 844 });
  await toggle.click();
  await navigate('.mobile-menu nav a[href="/docs/"]', '/docs/');
  assert.equal(await page.locator('.mobile-menu').evaluate((el) => el.open), false);

  // Reduced motion applies to page transitions, menu, pickers and selection feedback.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.mobile-menu summary').click();
  await navigate('.mobile-menu nav a[href="/commands/"]', '/commands/');
  await page.locator('#catalog-group').selectOption('ui');
  await settled();
  assert.equal(
    await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running').length,
    ),
    0,
  );
  assert.equal(await page.locator('.catalog-item:visible').count(), 8);

  // Failure and reset cannot strand the copy control or push the page sideways.
  const failureContext = await browser.newContext({ viewport: { width: 320, height: 844 } });
  await failureContext.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Denied for test')) },
    });
  });
  const failurePage = await failureContext.newPage();
  await failurePage.goto(base + '/docs/installation/');
  const copy = failurePage.locator('[data-install] .copy-button');
  await copy.click();
  await failurePage.waitForFunction(
    () => document.querySelector('[data-install] .copy-button').dataset.copyState === 'error',
  );
  assert.ok(await failurePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await failurePage.waitForFunction(
    () => document.querySelector('[data-install] .copy-button').textContent.trim() === 'Copy',
  );
  await failureContext.close();
  const staticContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(base);
  assert.ok(await staticPage.locator('.hero h1').isVisible());
  assert.equal(
    await staticPage.locator('.hero-copy').evaluate((el) => getComputedStyle(el).opacity),
    '1',
  );
  await staticPage.locator('.mobile-menu summary').click();
  await staticPage.locator('.mobile-menu nav a[href="/docs/"]').click();
  await staticPage.waitForURL('**/docs/');
  assert.ok(await staticPage.locator('h1').isVisible());
  await staticContext.close();
  assert.deepEqual(errors, []);
  console.log(
    'Passed: page transitions, history and filter restoration, navigation reinitialization, keyboard dropdowns, menu interruption/Escape/outside click/resize, copy states and reduced motion.',
  );
} finally {
  await browser.close();
}
