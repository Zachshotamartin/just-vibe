import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { commands, profiles, counts } from '../src/lib/catalog.mjs';
import { docs } from '../src/lib/docs.mjs';
import { loadCatalog } from '../../plugins/just-vibe/scripts/lib/catalog.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const read = (path) => readFileSync(join(dist, path), 'utf8');
const files = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });

test('site uses the same effective command contracts as the CLI, including aliases', () => {
  assert.deepEqual(commands, loadCatalog().commands);
  assert.equal(counts.commands, commands.length);
  for (const p of profiles)
    for (const id of p.workflows)
      assert.ok(
        commands.some((c) => c.id === id),
        `${p.id}: ${id}`,
      );
});

test('every command, profile and documented guide is statically published', () => {
  for (const c of commands) {
    const html = read(`commands/${c.id}/index.html`);
    assert.ok(html.includes(`/just-vibe:${c.id}`));
    assert.ok(html.includes('Technical guidance'));
    assert.ok(html.includes('When to stop or clarify'));
  }
  for (const p of profiles)
    assert.ok(read(`profiles/${p.id}/index.html`).includes('Scope boundary'));
  for (const doc of docs) assert.ok(existsSync(join(dist, `docs/${doc.slug}/index.html`)));
});

test('all internal page, fragment and asset links resolve in the production build', () => {
  const failures = new Set();
  for (const file of files(dist).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    const current = new URL(
      file.slice(dist.length).replace(/index\.html$/, ''),
      'https://site.test/',
    );
    for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(raw.replaceAll('&amp;', '&'), current);
      if (url.origin !== current.origin || !['https:', 'http:'].includes(url.protocol)) continue;
      const pathname = decodeURIComponent(url.pathname);
      const target = resolve(dist, '.' + pathname);
      const path =
        existsSync(target) && statSync(target).isDirectory() ? join(target, 'index.html') : target;
      if (!existsSync(path)) {
        failures.add(`${pathname} linked by ${file.slice(dist.length)}`);
        continue;
      }
      if (url.hash && path.endsWith('.html')) {
        const targetHtml = readFileSync(path, 'utf8');
        if (!targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))
          failures.add(`${url.pathname}${url.hash}`);
      }
    }
  }
  assert.deepEqual([...failures], []);
});

test('search-friendly metadata and sitemap cover the public library', () => {
  const sitemap = read('sitemap.xml');
  for (const c of commands) assert.ok(sitemap.includes(`/commands/${c.id}/`));
  for (const p of profiles) assert.ok(sitemap.includes(`/profiles/${p.id}/`));
  const home = read('index.html');
  assert.match(home, /rel="canonical"/);
  assert.match(home, /property="og:image"/);
  assert.match(read('404.html'), /name="robots" content="noindex"/);
  assert.ok(!files(dist).some((f) => f.endsWith('PLAN.md') || f.includes('/.just-vibe/')));
});
