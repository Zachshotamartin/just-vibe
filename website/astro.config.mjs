import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://just-vibe-tools.vercel.app',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
