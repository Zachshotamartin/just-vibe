# Project identity

- Use Zachary Martin's personal accounts associated with `zachsm@alumni.stanford.edu` for this repository, GitHub, npm, and Vercel.
- Do not use `zachary@reframeapp.com` or the Reframe/work account for this project.
- Git commits use the name `Zachary Martin` and email `zachsm@alumni.stanford.edu`. Keep this repository's Git configuration local; do not change identities for unrelated repositories.
- Verified service identities: GitHub `Zachshotamartin`, npm `zachsm`, and Vercel `zachsm-9644` in scope `zach-2267`. Confirm the account before authenticating or publishing if a session changes.
- All changes belong to the user. Do not add agent self-attribution to commits, pull requests, release notes, or messages.
- Keep npm releases manual through the CLI. GitHub Actions may validate and prepare an archive, but must not publish releases automatically or require trusted-publisher setup.
- Review the final changes before any npm publication or production deployment. Resolve confirmed defects, add regression coverage for their reproductions, rerun the relevant checks, and review the completed fixes before making them live. Passing older CI runs does not clear newly discovered defects. The open release blockers are tracked in `docs/agent-qa-and-learning-plan.md`.

# Website

- Do not use emojis unless the user explicitly requests them. Do not substitute Unicode text arrows, checkmarks or other glyphs for interface icons. Use SVG icons from the shared Lucide-based `Icon.astro` component or purpose-built SVG artwork. Keep user-facing responses free of emojis unless requested too.
- The website lives in `website/` and deploys from the repository root using `vercel.json`.
- Production URL: https://just-vibe-tools.vercel.app/
- The GitHub repository, npm package, and generated website are public.
- Keep the website catalogs generated from the canonical plugin data. See `website/README.md` for build, verification, and deployment commands.
