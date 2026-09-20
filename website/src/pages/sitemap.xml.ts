import type { APIRoute } from 'astro';
import { commands, profiles } from '../lib/catalog.mjs';
import { docs } from '../lib/docs.mjs';
export const GET: APIRoute = ({ site }) => {
  const routes = [
    '/',
    '/commands/',
    '/profiles/',
    '/docs/',
    '/brand/',
    ...commands.map((c) => `/commands/${c.id}/`),
    ...profiles.map((p) => `/profiles/${p.id}/`),
    ...docs.map((d) => `/docs/${d.slug}/`),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((path) => `<url><loc>${new URL(path, site)}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
