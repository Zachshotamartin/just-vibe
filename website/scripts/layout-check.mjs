import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { commands, profiles } from '../src/lib/catalog.mjs';
import { docs } from '../src/lib/docs.mjs';

const base = process.env.WEBSITE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: 'reduce' });

async function checkLayout(label) {
  const findings = await page.evaluate(() => {
    const problems = [];
    if (document.documentElement.scrollWidth > innerWidth + 1) problems.push('Page overflows');
    const visible = (el) => el.getClientRects().length && !el.closest('[hidden], .sr-only');
    for (const el of document.querySelectorAll('h1,h2,h3,p,dt,dd,.demo-command,.code-block code')) {
      if (!visible(el) || getComputedStyle(el).display === 'inline') continue;
      if (el.scrollWidth > el.clientWidth + 2)
        problems.push(`Text overflows: ${el.textContent.trim().slice(0, 70)}`);
    }
    const groups =
      '.hero,.section-heading,.facts-strip,.pack-grid,.profile-feature,.intent-inner,.start-section,.catalog-results,.catalog-filters,.install-controls,.install-command,.demo-editor-top,.demo-editor-bottom,.footer-top,.footer-bottom,.brand-assets,.docs-grid,.code-block,.contract';
    for (const parent of document.querySelectorAll(groups)) {
      const children = [...parent.children].filter(visible);
      for (let i = 0; i < children.length; i++) {
        for (let j = i + 1; j < children.length; j++) {
          const a = children[i].getBoundingClientRect();
          const b = children[j].getBoundingClientRect();
          if (
            Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
          ) {
            problems.push(
              `Overlap in .${parent.className}: ${children[i].tagName} / ${children[j].tagName}`,
            );
          }
        }
      }
    }
    return [...new Set(problems)];
  });
  assert.deepEqual(findings, [], label);
}

const templates = [
  '/',
  '/commands/?pack=react',
  '/profiles/?family=ml',
  '/docs/',
  '/docs/installation/',
  '/docs/memory/',
  '/brand/',
  '/404.html',
  '/commands/architecture-fitness/',
  '/profiles/application-security-engineer/',
];
// Use an actual longest identifier from the catalog, not a guessed route.
templates[8] = `/commands/${[...commands].sort((a, b) => b.id.length - a.id.length)[0].id}/`;
try {
  for (const width of [
    320, 390, 600, 601, 700, 701, 768, 800, 801, 960, 961, 1100, 1280, 1440, 1920,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of templates) {
      const response = await page.goto(base + route);
      assert.ok([200, 404].includes(response.status()), route);
      await page.evaluate(() => document.fonts.ready);
      await checkLayout(`${width}px ${route}`);
    }
  }
  console.log(
    'Passed: all layout templates at 15 viewport widths, including breakpoint boundaries.',
  );

  const routes = [
    ...commands.map((c) => `/commands/${c.id}/`),
    ...profiles.map((p) => `/profiles/${p.id}/`),
    ...docs.map((d) => `/docs/${d.slug}/`),
  ];
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, route);
      await page.evaluate(() => document.fonts.ready);
      await checkLayout(`${width}px ${route}`);
    }
    console.log(`Passed: ${routes.length} command, profile and guide pages at ${width}px.`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of templates) {
    await page.goto(base + route);
    await page.addStyleTag({
      content:
        '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }',
    });
    await page.evaluate(() => document.fonts.ready);
    await checkLayout(`Expanded text spacing: ${route}`);
  }
  console.log('Passed: expanded text-spacing layouts on every template.');
} finally {
  await browser.close();
}
