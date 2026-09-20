# just-vibe website

Live at [just-vibe-tools.vercel.app](https://just-vibe-tools.vercel.app/).

The public marketing site and documentation for just-vibe. It uses Astro to generate static HTML from the canonical command and profile catalogs. Small browser scripts provide search, deep-link filters, a prompt builder, copy buttons, and installation selectors. No backend, login, database, analytics, or model API is needed.

## Local development

From the repository root, using Node 22.12+ (Node 24 recommended for deployment parity):

```sh
npm --prefix website ci
npm --prefix website run dev
```

The development server binds to loopback. Open the URL it prints.

## Build and check

```sh
npm --prefix website run build
npm --prefix website test
npm --prefix website run preview
```

With the preview server running on port 4321, run in another terminal:

```sh
cd website
npx playwright install chromium
npm run test:browser
```

The browser check exercises six package-manager/host installation combinations, clipboard copying, the editable prompt builder, search/filter URLs, empty and reset states, mobile navigation, keyboard focus, no-JavaScript content, 404 behavior, responsive overflow, and automated WCAG checks. Screenshots go to the ignored `.tmp/website-qa/` directory. It does not claim a full assistive-technology audit or production agent-host verification.

Set `WEBSITE_URL` to run browser checks against a deployment instead. Tests do not submit any external forms or run commands from the website.

## Content model

- `src/lib/catalog.mjs` imports the package's three canonical JSON catalogs at build time, resolves inherited input policies and aliases using the same library as the CLI, then validates them.
- Command and profile detail pages are statically generated for every catalog entry. Adding an entry updates the website on the next build.
- `src/pages/docs/` contains authored usage guides. Keep them aligned with the root README and plugin references.
- `src/lib/docs.mjs` owns documentation navigation and sitemap entries.
- `src/assets/` contains original image-generated artwork. Astro produces optimized responsive WebP variants and small icons; original PNGs remain downloadable from the brand page.
- `brand/PROMPTS.md` records the identity direction and exact image-generation prompts. These are maintainer records, not included in deployment uploads.
- Geist is self-hosted with its OFL license at `/licenses/geist-OFL.txt`.

The website has its own package and lockfile. Its dependencies, images, and output are excluded from the root npm package's publish allowlist.

## Deploy to Vercel

Run Vercel from the **repository root**, not the website folder. The site needs the parent package catalogs during its build. Root `vercel.json` installs the website dependencies and publishes only `website/dist`.

```sh
npm exec --yes --package=vercel@59.23.2 -- vercel link --project just-vibe --scope zach-2267
npm exec --yes --package=vercel@59.23.2 -- vercel --prod --yes --scope zach-2267
```

Use your own project/scope if deploying a fork. `SITE_URL` overrides the default canonical origin in `astro.config.mjs`; set it to the actual production URL when assigning a different domain. Keep `.vercel`, generated environment files, local plans, and caches ignored. Do not commit credentials.

The Vercel project is connected to the GitHub repository. Production deployments from the CLI do not depend on GitHub Actions minutes. A website-only deployment does not require republishing the CLI to npm.

At launch, Vercel blocked automatic Git deployments with `TEAM_ACCESS_REQUIRED`: the commit author's linked account did not have deployment permission in the Vercel team. The authenticated CLI production deployment succeeds. Until the account/team mapping is corrected in Vercel, use the CLI command above for releases; pushing alone will not update the live site. No team seats were purchased, collaborators invited, or commit authorship changed to work around this restriction.

## Formatting

```sh
npm --prefix website run format
npm --prefix website run format:check
```

## Brand files

The primary logo, brand overview, sculptural hero, and social image were generated with the built-in image generation tool, directed by the brandkit workflow. The board contains illustrative identity applications, not screenshots of a shipped dashboard. The interface itself is real HTML/CSS and functional controls.
