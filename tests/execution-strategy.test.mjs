import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { discoverCapabilities, recommend } from '../plugins/just-vibe/scripts/lib/discovery.mjs';
import { executionStrategy } from '../plugins/just-vibe/scripts/lib/routing.mjs';

const catalog = loadCatalog();
const suggested = (request, candidates) => executionStrategy(request, candidates).suggested;

// Requests with remote, destructive, shared-load or continuation effects, keyed by review finding.
const TRACKED = [
  ['R1-07', 'Drop the legacy users table in prod'],
  ['R1-07', 'Delete the old S3 bucket'],
  ['R1-07', 'Rotate the production API keys'],
  ['R1-07', 'Fix the login bug, then open a PR'],
  ['B4-02', 'Ship the current main branch to staging and confirm the health check'],
  ['B4-02', 'we are deploying the new build tonight, watch it'],
  ['B4-02', 'make a PR'],
  ['B4-02', 'Open a draft PR for the auth refactor'],
  ['B4-02', 'gh pr create --draft --title "auth refactor"'],
  ['B4-02', 'file a bug for this'],
  ['B4-02', 'promote the preview deployment to production'],
  ['B4-02', 'roll out the new build to all regions'],
  ['B4-02', 'pushing the hotfix branch now, then open the PR'],
  ['B4-02', 'cut a release on GitHub'],
  ['B4-02', 'upload the missing assets to the existing GitHub releases'],
  ['B4-02', 'blue-green cutover of the API on Kubernetes with a 10% canary'],
  ['B4-02', 'Can you spin up a preview deployment of this branch so the designer can look at it?'],
  ['B2-05', 'Run load tests against the staging endpoints to find where latency degrades.'],
  ['B2-05', 'Plan a load test for the search endpoint on staging, capped at 200 requests per second, stopping if errors pass 1 percent.'],
  ['V-A3-04', 'Fix the login redirect bug, add a test, and open a PR'],
  ['V-A3-04', 'Create a GitHub issue for each failing check'],
  ['V-A3-04', 'Post a review comment on PR 42 with these findings'],
  ['B4-02', 'add a new required column to orders safely on a live database'],
  ['B4-02', 'I accidentally pushed our AWS access key to GitHub, help me clean it up'],
  ['B4-02', 'commit it and git push'],
  ['continuation', 'Resume the interrupted task'],
  ['continuation', 'Resume a release after one of three assets uploaded successfully.'],
  ['continuation', 'carry on from the checkpoint'],
  ['continuation', "Let's continue the checkout fix from where we stopped yesterday."],
  ['continuation', 'read the handoff Sam left and keep going on the API refactor'],
  ['continuation', 'Write a self-contained handoff for the partially implemented checkout fix.'],
  ['continuation', 'I need to stop for the day. Save where we are so I can continue tomorrow.'],
  ['stages', 'Implement it, then test it, then publish it'],
  ['baseline', 'Deploy the approved preview'],
  ['B4-02', 'It’s time to deploy the preview'],
];

// Local work, questions and nouns that only look like effects.
const QUICK = [
  ['B4-02', 'Put together release notes for the last sprint'],
  ['B4-02', 'draft the release notes for 3.0'],
  ['B4-02', 'which release introduced the regression?'],
  ['B4-02', 'explain what this git tag points to'],
  ['B4-02', 'add an email field to the signup form'],
  ['B4-02', 'send button is misaligned'],
  ['B4-02', 'the delete button does nothing'],
  ['B4-02', 'Make the job able to resume if it crashes'],
  ['B4-02', 'Build the settings page from the Figma dev-mode handoff'],
  ['R1-07', 'Resolve the merge conflict in cart.ts'],
  ['R1-07', 'Resolve the merge conflicts after rebasing'],
  ['R1-07', 'Add push notifications to the mobile app'],
  ['R1-07', 'Add a paid plan badge to the pricing page'],
  ['R1-07', 'Upgrade to Next.js 15 and fix the next/image warnings'],
  ['R1-07', 'Fix the button that says Next'],
  ['R1-07', 'is it safe to merge'],
  ['R1-07', 'Which Dependabot PRs are safe to merge?'],
  ['negation', 'Fix the label typo. Do not deploy.'],
  ['negation', "don't deploy, just fix the login bug"],
  ['negation', "Commit only the parser fix but don't push"],
  ['negation', "Prepare the GitHub release draft for v3.1 but don't create the tag or publish it"],
  ['local', 'Delete the unused helper function'],
  ['local', 'Drop the local test table and recreate it'],
  ['local', 'Remove the production console logs'],
  ['local', 'Create an issue template for bug reports'],
  ['local', 'Make the PR description clearer'],
  ['local', 'Our Vercel deploy keeps failing during the build step but npm run build works fine on my machine.'],
  ['local', 'Build a pipeline interrupted between writing data and publishing its manifest.'],
  ['local', 'Write a k6 load test script for the search endpoint'],
  ['local', 'Design a blue-green deployment strategy for the API'],
  ['local', 'Resume parsing fails on PDFs'],
  ['question', 'did we leak any passwords in the repo?'],
  ['question', 'Check whether we leaked any keys'],
  ['question', 'is this deploy good to go live?'],
  ['preparation', 'verify dpl_8xYz passes health checks before vercel promote'],
  ['rewrite', 'Rewrite this prompt: deploy the app to production'],
  ['question', 'Do we have the env vars set on Vercel?'],
];

test('external, destructive, shared-load and continuation requests suggest tracked work', () => {
  for (const [finding, request] of TRACKED) assert.equal(suggested(request), 'tracked', `${finding}: ${request}`);
});

test('local work, questions and effect-like nouns stay quick', () => {
  for (const [finding, request] of QUICK) assert.equal(suggested(request), 'quick', `${finding}: ${request}`);
});

test('only missing or disabled capabilities make the route itself a reason to track (R1-07)', () => {
  const unknown = ['github-pr', 'github-issue', 'vercel-env'].map(id => ({ id, status: 'unknown' }));
  assert.equal(suggested('Summarize the open work', unknown), 'quick');
  const blocked = ['git-status', 'git-diff', 'git-commit'].map(id => ({ id, status: 'blocked' }));
  const result = executionStrategy('Summarize the open work', blocked);
  assert.equal(result.suggested, 'tracked');
  assert.deepEqual(result.reasons, ['Selected route has missing or disabled capabilities']);
});

test('an explicitly selected remote workflow is tracked unless the brief asks for preparation (B4-02)', t => {
  // PR work happens inside a repository; outside one, github-pr is blocked and that alone suggests tracking.
  const root = mkdtempSync(join(tmpdir(), 'jv-strategy-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', root]);
  const found = discoverCapabilities(root);
  assert.equal(recommend(catalog, found, '/just-vibe:github-pr for my branch against main').strategy.suggested, 'tracked');
  assert.equal(recommend(catalog, found, '/just-vibe:deploy the approved preview').strategy.suggested, 'tracked');
  assert.equal(recommend(catalog, found, '/just-vibe:github-pr draft the description only').strategy.suggested, 'quick');
  // A lexical match alone is not evidence: symptoms also rank remote workflows first.
  assert.equal(recommend(catalog, found, 'env vars missing on vercel').strategy.suggested, 'quick');
  assert.equal(recommend(catalog, found, 'Finish the deployment goal, but production credentials are not available.').strategy.suggested, 'tracked');
});
