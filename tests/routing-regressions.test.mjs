import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog, searchCommands } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { discoverCapabilities, recommend } from '../plugins/just-vibe/scripts/lib/discovery.mjs';
import { routeContext, splitNegations } from '../plugins/just-vibe/scripts/lib/routing.mjs';
import { intents } from '../plugins/just-vibe/scripts/lib/intents.mjs';

// Each case reproduces a misroute confirmed in the September 2026 review (finding IDs in comments).
const catalog = loadCatalog();
function project(t, files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'jv-routing-regressions-'));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(root, name), content);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { discovery: discoverCapabilities(root), context: routeContext(root) };
}
const ids = (env, request) => recommend(catalog, env.discovery, request, { limit: 10, context: env.context }).recommendations.map(r => r.id);

const FIRST = [
  ['A1-02', 'Quiz me on ml-split leakage concepts', ['teach-test']],
  ['A1-06', 'Make this prompt better: summarize the incident for executives', ['reprompt']],
  ['A2-01', 'improve the spacing on the billing page', ['polish']],
  ['A2-02', 'our Jenkins build is failing on the main branch', ['ci']],
  ['A2-02', 'the GitHub Actions run failed on my PR', ['github-fix-ci']],
  ['A2-03', 'upgrade the frontend from Vue 2 to Vue 3', ['migrate']],
  ['A3-01', 'bump axios to the latest version', ['deps']],
  ['A4-01', 'find which commit broke the login test', ['git-bisect']],
  ['A6-01', 'check the checkout form against WCAG 2.2 AA', ['ui-accessibility']],
  ['A7-01', 'users can open other people\'s reports by changing the id in the URL', ['security-authz', 'backend-permissions']],
  ['A7-01', 'add a non-null column to the orders table without downtime', ['db-migrate']],
  ['A8-01', 'Write a model card for the churn model', ['ml-report']],
  ['A8-02', 'Evaluate my model on the held-out test set', ['ml-evaluate']],
  ['A8-07', 'Our training job got interrupted, make it resume where it stopped', ['ml-train']],
  ['A10-01', 'check the repo for leaked API keys', ['security-secrets']],
  ['A10-01', 'the site is down and users see 500s', ['ops-incident']],
  ['A10-01', 'Dependabot alert on lodash, what do we do', ['security-dependencies']],
  ['V-A10-01', 'patch the XSS in the comment renderer', ['security-fix']],
  ['V-A10-03', 'the image builds locally but crashes in Kubernetes', ['ops-container']],
  ['V-A2-01', 'review my changes before I commit', ['review']],
  ['V-A2-01', 'write tests for the password reset flow', ['test', 'test-unit', 'test-integration', 'test-e2e']],
  ['V-A2-03', 'the header overlaps the content on tablets', ['ui-responsive']],
  ['V-A4-01', 'which of these choices would be hard to undo later', ['decision-reversible']],
  ['V-A4-02', 'what changed on this branch compared to main', ['git-diff']],
  ['V-A4-02', 'I want to work on two branches at the same time', ['git-worktree']],
  ['V-A5-01', 'write the pull request description for this branch', ['pr']],
  ['V-A5-02', 'fix the things the reviewer asked for on my PR', ['github-address-review']],
  ['V-A5-02', 'look over my teammate\'s PR and tell me what is wrong with it', ['github-review']],
  ['V-A6-01', 'make the pricing page responsive', ['ui-responsive']],
  ['V-A9-01', 'Roll out the new model to 5% of traffic first and roll back if error rates rise', ['ml-rollout']],
  ['V-A3-01', 'deploy the app to staging', ['deploy']],
  ['V-A3-02', 'pick up where we left off yesterday', ['resume']],
  ['B1-01', 'what\'s the folder layout of this repo?', ['orient']],
  ['B2-01', 'upgrade our app from Next.js 14 to 15', ['migrate']],
  ['B8-01', 'restore the database to a point-in-time before the bad migration', ['ops-restore']],
  ['B11-01', 'which just-vibe command should I use for flaky tests?', ['help', 'tools']],
  ['V-A8-02', 'my model is not learning, loss stays flat', ['ml-debug-training']],
  ['B6-05', 'race condition when two requests update the same order row', ['backend-concurrency']],
  ['V-A1-02', 'Explain how session refresh works, including expired credentials.', ['explain']],
  ['V-A1-03', 'help me learn Rust ownership and borrowing', ['teach']],
  ['V-A3-03', 'Create a reusable skill for reviewing database migrations', ['skill']],
  ['A5-06', 'label and close the duplicate issues in our repo', ['github-triage']],
  ['B6-04', 'is our CORS setup too permissive?', ['security-config']],
  ['B9-06', 'the model is overconfident', ['ml-calibrate']],
  ['B4-05', 'gh release create v1.2.0 --generate-notes and attach the tarballs', ['github-release']],
  ['B4-05', 'gh pr create --draft --base develop and link it to issue 88', ['github-pr']],
  ['V-A2-05', 'is our app vulnerable to anything obvious?', ['security']],
  ['V-A7-01', 'give me a quick profile of this parquet file: nulls, types, outliers', ['data-profile']],
  ['V-A7-01', 'add a circuit breaker around the inventory API', ['backend-resilience']],
  ['B9-03', 'is this a classification or regression problem?', ['ml-frame']],
  ['B9-03', 'fit a linear regression baseline on these features', ['ml-baseline']],
  ['A9-02', 'add a regression test for the refund bug', ['test-regression']],
  ['B8-05', 'design the interface between the search service and the indexer', ['arch-contracts']],
  ['B8-05', 'add OpenTelemetry spans and propagate trace context', ['ops-observability']],
  ['B8-05', 'multi-stage Dockerfile: COPY --from=builder fails', ['ops-container']],
  ['B8-05', 'design a new landing page', ['design']],
  ['B8-05', 'improve the copy on the pricing page', ['copy']],
  ['B8-05', 'trace this request through the system', ['trace']],
  // Tasks that previously had no owning workflow.
  ['B6-03', 'I accidentally pushed our AWS access key to GitHub, help me clean it up', ['security-secrets']],
  ['B6-03', 'rotate the leaked Stripe key and scrub it from the git history', ['security-secrets']],
  ['A10-04', 'upgrade lodash to fix the security advisory', ['security-fix']],
  ['A2-06', 'bump the version to 2.1.0 and update CHANGELOG.md', ['release']],
  ['A2-06', 'write the release notes into CHANGELOG.md for 2.1.0', ['release']],
  ['A3-12', 'Undo my last commit but keep my changes.', ['git-commit']],
  ['A10-02', 'Errors are from the 14:05 deploy. You have my go-ahead to roll back checkout-api and restart the payment worker.', ['ops-incident']],
  ['A6-06', 'We need to send webhooks to our customers when an order ships', ['api-webhooks']],
  ['V-A7-03', 'add checks so we notice when the daily feed arrives empty', ['data-quality', 'data-pipeline']],
  ['B8-06', 'add a Prometheus alert rule for queue age to monitoring/alerts.yml, but leave notifications disabled', ['ops-alerts']],
  // Neighbors that previously took each other's requests.
  ['A2-09', 'review PR 42 before I merge it', ['github-review']],
  ['A2-10', 'compare my implementation to this design screenshot and fix the differences', ['match']],
  ['A2-10', 'compare the page against the design and close the gaps', ['match']],
  ['A6-04', 'the chat subscription is never cleaned up when I switch rooms', ['react-effects']],
  ['A6-04', 'Fix stale account data caused by effect request races.', ['react-async']],
  ['V-A9-04', 'Our summarization prompt keeps leaving out key numbers; improve the prompt', ['llm-prompt']],
  ['V-A7-02', 'the migration is stuck waiting on a lock', ['db-locks']],
  ['A4-02', 'Revisit our job queue decision now that we process 140 jobs per minute', ['decision-revisit']],
  ['A4-02', 'Save this decision so we get reminded if traffic passes 100 jobs a minute', ['decide']],
  ['A4-02', 'Our requirements changed; which of our past architecture decisions should we reconsider?', ['decision-revisit']],
  ['B1-03', 'Show the imports between our packages and flag any circular dependencies.', ['map']],
  ['B1-03', "Map the internal package dependencies but don't install anything or run the build.", ['map']],
  ['B1-03', 'map how our services talk to the database and Stripe', ['arch-map']],
  ['B2-04', 'Hook up Stripe so users can pay for their subscription with a card.', ['integrate']],
  ['B4-01', 'plan the rollout of the new checkout service with a rollback path', ['deploy']],
  ['B4-01', 'canary the new API build to 5% of traffic before full rollout', ['deploy']],
  ['B4-01', 'gradual rollout of the v2 backend behind a feature flag', ['deploy']],
  ['B4-01', 'Prepare a canary rollout and rollback plan for the new ranking model; do not change production traffic.', ['ml-rollout']],
  ['B5-07', 'switch from webpack to vite', ['vite-setup']],
  ['B5-07', 'move our create react app project to vite', ['vite-setup']],
  ['B5-07', 'upgrade to vite 6 and check the plugins still work', ['vite-upgrade']],
  ['V-A5-04', 'are we leaking secrets into the frontend bundle', ['security-secrets', 'vite-env']],
  ['V-A6-04', 'generate a TypeScript client from our OpenAPI spec', ['api-client']],
  ['V-A6-04', 'generate an SDK from the openapi file', ['api-client']],
  ['V-A6-04', 'our OpenAPI spec is out of date with the routes', ['api-openapi']],
  ['B7-03', 'where does the revenue number on the finance dashboard come from', ['data-lineage']],
  ['B7-03', 'trace this field back to the source', ['data-lineage']],
  ['V-A2-06', 'remove the old /v1/users endpoint nobody calls anymore', ['api-breaking', 'cleanup']],
  ['A8-04', 'compare these mlflow runs from last week', ['ml-experiments']],
  ['A3-15', 'is just-vibe installed correctly?', ['doctor']],
  ['A3-15', 'update just-vibe to the latest version', ['doctor']],
  ['A3-15', 'install just-vibe for claude code', ['doctor']],
  ['B9-09', 'which features matter most for this model', ['ml-explain']],
  ['B9-09', 'how much does the price feature contribute to accuracy if we drop it', ['ml-ablation']],
];
const TOP3 = [
  ['V-A9-03', 'Roll out the new model to 5% of traffic first and roll back if error rates rise', ['ml-rollout']],
  ['V-A9-03', 'Can we use a cheaper model for simple questions without losing answer quality?', ['llm-cost']],
  ['V-A9-03', 'Bundle our trained model with its preprocessing and dependencies so it loads the same way anywhere', ['ml-package']],
  ['V-A9-03', 'Our input data looks different this month; detect if the feature distributions shifted', ['ml-drift']],
  ['V-A9-03', 'Create a test set to measure how well our support chatbot answers questions', ['llm-evals']],
  ['V-A9-03', 'Design the functions our AI agent can call to issue refunds safely', ['llm-tools']],
  ['V-A9-03', 'Check if our email-reading agent can be hijacked by instructions hidden in an email', ['llm-injection']],
  ['V-A9-03', 'Write browser tests for the signup and checkout flow', ['test-e2e']],
  ['V-A9-03', 'Score all 20 million customers every night and resume if the job dies halfway', ['ml-batch']],
  ['V-A9-03', 'Build a chatbot that answers questions from our internal docs with citations', ['llm-rag']],
  ['V-A9-03', 'Write tests for the discount calculation function covering edge cases', ['test-unit', 'test']],
  ['V-A9-03', 'Add Playwright tests that go through the whole purchase journey', ['test-e2e']],
  ['V-A9-03', 'The model sometimes returns broken JSON and our parser crashes; make the output reliable', ['llm-structured']],
  ['V-A9-03', 'Several tests fail randomly depending on run order; make them deterministic.', ['test-flaky']],
  ['V-A9-03', 'feature values computed at inference time differ from the ones in the training set', ['ml-parity']],
  ['A1-01', 'which file handles password reset?', ['explain', 'trace', 'orient', 'map']],
  ['A1-03', 'the app crashes with a stack trace when I save', ['debug', 'fix']],
  ['A1-03', 'restructure this module into smaller files', ['refactor']],
  ['A2-04', 'reproduce the login crash locally', ['repro']],
  ['A2-04', 'the API is slow under load', ['perf', 'test-load']],
  ['A5-03', 'Explain why nested API routes receive the SPA page instead of JSON.', ['vercel-routing']],
  ['A5-03', 'code splitting: lazy load the admin pages', ['vite-chunks']],
  ['A6-01', 'the form loses my input when the server rejects it', ['react-forms']],
  ['V-A10-03', 'document the steps to recover when the worker queue gets stuck', ['ops-runbook']],
  ['V-A2-02', 'hook up Stripe payments to the checkout', ['integrate']],
  ['V-A5-01', 'environment variables are missing in the preview deployment', ['vercel-env']],
  ['B2-01', 'split this 2000-line service file into smaller modules', ['refactor']],
  ['B2-01', 'check that the signup flow still works after my change', ['verify', 'agent-qa', 'test-e2e']],
  ['B4-01', 'roll out the new payments service to production with a canary', ['deploy']],
  ['B7-01', 'the SQL query behind the product filter is slow', ['db-query', 'db-explain', 'db-index', 'perf']],
  ['V-A8-02', 'the validation accuracy is suspiciously high, is something leaking?', ['ml-leakage']],
  ['B7-02', 'refresh the materialized view every night', ['db-query', 'data-pipeline', 'data-incremental', 'automate', 'backend-jobs']],
  ['B7-02', 'our incremental refresh drops rows that arrive late', ['data-incremental']],
  ['A9-05', 'Compare training and serving transformations on these exact versioned inputs.', ['ml-parity']],
  ['A9-05', 'Implement schema validation and bounded recovery for invalid or truncated output.', ['llm-structured']],
  ['V-A1-02', 'Make an implementation plan for adding SSO login', ['plan']],
  ['B3-03', 'animations feel janky', ['ui-motion']],
  ['B3-03', 'create the modal and tooltip components with keyboard support', ['react-component']],
  ['B3-03', 'the same cart count lives in two components and they disagree', ['react-state']],
  ['B3-03', 'check whether my custom hooks follow the rules of hooks', ['react-audit']],
  ['B6-04', 'Access-Control-Allow-Origin is * with credentials true in prod, how bad is it', ['security-config']],
  ['B8-07', 'Our billing code imports things from the users module and the users module imports billing back. Is our module structure messed up?', ['arch-boundaries']],
  ['V-A7-01', 'if the email provider is down, signup should still work', ['backend-resilience']],
];
const NOT_FIRST = [
  ['A1-01', 'which file handles password reset?', 'decide'],
  ['A2-03', 'upgrade the frontend from Vue 2 to Vue 3', 'db-migrate'],
  ['A9-02', 'write a failing test, then check it passes', 'github-fix-ci'],
  ['V-A4-01', 'our reverse proxy changes broke the auth headers', 'undo'],
  ['B2-01', 'upgrade Django from 4.2 to 5.1', 'vite-upgrade'],
  ['B2-01', 'split this 2000-line service file into smaller modules', 'git-split'],
  ['B5-01', 'the kubernetes preview deployment build fails', 'vercel-build-fix'],
  ['B6-01', 'review the onboarding flow copy', 'plan-review'],
  ['B9-02', 'the payment component keeps timing out', 'react-component'],
  ['V-A2-04', 'make the header sticky on scroll', 'remember'],
  ['R1-03', 'Refactor the cart module; skip the migration for now', 'db-migrate'],
  ['B7-02', 'refresh the materialized view every night', 'backend-auth'],
  ['A9-05', 'Compare training and serving transformations on these exact versioned inputs.', 'decide'],
];
const NOT_TOP3 = [
  ['B1-02', 'it just crashes when I click save', 'teach'],
  ['B3-01', 'the checkout page shows the wrong total', 'git-worktree'],
  ['B7-01', 'the SQL query behind the product filter is slow', 'react-rerenders'],
  ['B8-01', 'restore the database to a point-in-time before the bad migration', 'ml-leakage'],
  ['B9-01', 'our PR-AUC dropped after retraining', 'pr'],
  ['V-A9-02', 'reduce the number of actions the agent\'s tools can take', 'github-fix-ci'],
];

test('confirmed misroutes now reach the right workflow first', t => {
  const env = project(t);
  const failures = FIRST.filter(([, request, expected]) => !expected.includes(ids(env, request)[0])).map(([id, request]) => `${id}: "${request}" -> ${ids(env, request).slice(0, 3).join(', ')}`);
  assert.deepEqual(failures, []);
});

test('confirmed buried workflows now reach the top three', t => {
  const env = project(t);
  const failures = TOP3.filter(([, request, expected]) => !ids(env, request).slice(0, 3).some(x => expected.includes(x))).map(([id, request]) => `${id}: "${request}" -> ${ids(env, request).slice(0, 3).join(', ')}`);
  assert.deepEqual(failures, []);
});

test('confirmed hijacking workflows no longer take the request', t => {
  const env = project(t);
  const failures = [
    ...NOT_FIRST.filter(([, request, wrong]) => ids(env, request)[0] === wrong),
    ...NOT_TOP3.filter(([, request, wrong]) => ids(env, request).slice(0, 3).includes(wrong)),
  ].map(([id, request]) => `${id}: "${request}" -> ${ids(env, request).slice(0, 3).join(', ')}`);
  assert.deepEqual(failures, []);
});

test('one-word tools searches list the specialists, not only the exact id (A2-11, A5-06, B4-04, B5-05)', () => {
  const found = query => searchCommands(catalog, query).map(x => x.command.id);
  for (const [query, expected] of [['changelog', 'release'], ['tests', 'test'], ['cron', 'automate'], ['environment variables', 'vercel-env'],
    ['review', 'github-review'], ['release', 'github-release'], ['security', 'security-secrets'], ['build', 'vercel-build-fix'], ['migrate', 'db-migrate']]) {
    assert.ok(found(query).slice(0, 12).includes(expected), `tools ${query} -> ${found(query).slice(0, 5).join(', ')}`);
  }
  assert.equal(found('review')[0], 'review', 'the exact id still comes first');
  assert.deepEqual(found('ml-leakage'), ['ml-leakage'], 'a hyphenated id stays a precise lookup');
});

test('detected framework context breaks ties instead of outranking the request (R1-01, B5-02, B9-08)', t => {
  const next = project(t, { 'package.json': JSON.stringify({ dependencies: { next: '16.0.0', react: '19.2.0', prisma: '6.0.0' } }) });
  assert.ok(ids(next, 'review the diff before I commit').slice(0, 3).includes('review'));
  assert.ok(ids(next, 'write a README for this project').slice(0, 3).includes('docs'));
  assert.ok(!next.context.packs.includes('vercel'), 'Next.js alone is not a Vercel signal');
  const vercel = project(t, { 'package.json': JSON.stringify({ dependencies: { next: '16.0.0' } }), 'vercel.json': '{}' });
  assert.ok(vercel.context.packs.includes('vercel'));
  const torch = project(t, { 'requirements.txt': 'torch==2.4\n' });
  assert.deepEqual([...torch.context.packs].sort(), ['ml-data', 'ml-deployment', 'ml-evaluation', 'ml-experiments']);
  assert.ok(ids(torch, 'evaluate the model on the holdout set').slice(0, 2).includes('ml-evaluate'));
});

test('negated clauses keep the positive task and ignore typographic apostrophes (R1-03)', t => {
  const env = project(t);
  for (const request of ['don\'t deploy, just fix the login bug', 'Don’t deploy, just fix the login bug']) {
    const route = recommend(catalog, env.discovery, request, { limit: 10, context: env.context });
    assert.ok(route.recommendations.length > 0, request);
    assert.ok(!route.recommendations.some(r => r.id === 'deploy'), request);
    assert.equal(route.strategy.suggested, 'quick', request);
  }
  assert.equal(splitNegations('the page reloads without saving').excluded.length, 0);
  assert.deepEqual(splitNegations('Fix the bug without new dependencies.').excluded, ['without new dependencies']);
  assert.deepEqual(splitNegations('use pnpm instead of npm to install').excluded, ['instead of npm to install']);
});

// The first-run examples the docs promise, asserted where they are written (B11-02).
const DOCUMENTED = [
  ['README.md', 'Fix the mobile menu', ['react-component', 'ui-responsive']],
  ['README.md', 'Investigate unstable training', ['ml-debug-training']],
  ['README.md', "Address this PR's feedback", ['github-address-review']],
  ['website/src/pages/docs/usage.md', 'Fix the mobile menu', ['react-component', 'ui-responsive']],
  ['website/src/pages/docs/usage.md', 'Why is training unstable?', ['ml-debug-training']],
  ['website/src/pages/docs/automatic.md', 'Fix the mobile menu', ['react-component', 'ui-responsive']],
  ['website/src/pages/docs/automatic.md', 'Why is training unstable?', ['ml-debug-training']],
  ['website/src/pages/docs/automatic.md', 'Address this PR’s feedback', ['github-address-review']],
  ['plugins/just-vibe/references/adaptive.md', 'Fix the mobile menu', ['react-component', 'ui-responsive']],
];
test('documented first-run examples route where the docs say they do (B11-02)', t => {
  const env = project(t);
  for (const [file, brief, accept] of DOCUMENTED) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.ok(text.includes(brief), `${file} still shows "${brief}"`);
    assert.ok(accept.includes(ids(env, brief)[0]), `${file}: "${brief}" -> ${ids(env, brief).slice(0, 3).join(', ')}`);
  }
});

test('every intent rule targets a canonical catalog workflow and every unless rule names a rule (R1-14)', () => {
  const canonical = new Set(catalog.commands.filter(c => !c.aliasOf).map(c => c.id));
  const names = new Set(intents.map(rule => rule.name).filter(Boolean));
  for (const rule of intents) {
    for (const id of rule.ids) assert.ok(canonical.has(id), `${rule.reason}: unknown workflow ${id}`);
    for (const name of rule.unlessRules || []) assert.ok(names.has(name), `${rule.reason}: unknown rule ${name}`);
  }
});

test('MCP workflows_search uses route semantics: canonical ids, no router entries, negated clauses ignored (R1-12)', async t => {
  const { createMcpServer } = await import('../plugins/just-vibe/scripts/lib/mcp-server.mjs');
  const root = mkdtempSync(join(tmpdir(), 'jv-mcp-search-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = createMcpServer(root, {});
  await server({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25' } });
  await server({ jsonrpc: '2.0', method: 'notifications/initialized' });
  const search = async query => {
    const response = await server({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'workflows_search', arguments: { query } } });
    return JSON.parse(response.result.content[0].text).map(r => r.id);
  };
  const aliases = new Set(catalog.commands.filter(c => c.aliasOf).map(c => c.id));
  for (const query of ['screen reader support', 'make the layout responsive on mobile']) {
    const found = await search(query);
    assert.ok(!found.some(id => aliases.has(id)), `${query}: ${found}`);
    assert.equal(new Set(found).size, found.length, query);
    assert.ok(!found.some(id => ['auto', 'do', 'help', 'tools', 'setup'].includes(id)), `${query}: ${found}`);
  }
  assert.ok(!(await search("don't deploy, just fix the login bug")).includes('deploy'));
});

test('routing a pasted megabyte log stays fast and returns the whole brief (R1-16)', t => {
  const env = project(t);
  const line = 'FAIL test/checkout.spec.ts > verify the visitor can check out: expected 200 got 500\n';
  const brief = `Fix this failing test:\n${line.repeat(Math.ceil(1024 * 1024 / line.length))}`;
  const started = performance.now();
  const result = recommend(catalog, env.discovery, brief, { limit: 5, context: env.context });
  assert.ok(performance.now() - started < 3000, 'bounded routing time');
  assert.equal(result.brief, brief);
  assert.equal(result.routedCharacters, 16000);
});
