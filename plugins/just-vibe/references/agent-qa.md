# Agent QA for web apps

Turn the original request into observable visitor outcomes before reading the implementation's success claims. Keep a literal request quote for every criterion; label additional assumptions in the criterion text. Include a happy path, a useful failure path and the requested viewport. Do not equate code presence with behavior.

## Execution choices

Use the active host's browser tools to inspect actual controls. If the target project has Playwright and Chromium installed, the portable runtime executes a bounded plan. It uses fresh contexts, blocks service workers and WebSockets, and restricts HTTP(S) requests to explicitly approved origins through an authenticated local proxy, including every redirect hop, and supports synthetic uploads, clicks, fills, visible text, playback progression and selected control geometry. Declare required API/CDN origins and authorize them on each run; a blocked dependency is not proof of a product defect.

The runtime does not install browser packages or start the app. Use existing project tooling, or install dependencies only if authorized. Browser interactions can change server state: use a local/staging fixture and synthetic data. Authorizing a target is not authorization for purchases, messages, destructive actions or real user uploads.

The agent supplies the plan using its existing model. No additional LLM service or training is required. The runtime executes assertions separately from the implementation's tests, but it is not a separate AI reviewer. Say “self-review with browser assertions” unless a different verifier actually ran. Delegate only when the host/user permits it.

## CLI and MCP

The CLI accepts JSON on stdin:

```sh
just-vibe qa create --root . --stdin <<'JSON'
{"id":"audio-upload","revision":0,"title":"Audio upload acceptance","request":"Upload audio and play the result on mobile.","target":"http://127.0.0.1:3000/","maxAttempts":3,"coverage":{"reviewed":true,"reviewNote":"Mapped upload, playback and mobile requirements.","requirements":[{"id":"audio-outcome","text":"Upload, play and use mobile controls","sourceQuote":"Upload audio and play the result on mobile.","criteria":["upload-play"]}]},"criteria":[{"id":"upload-play","text":"A visitor uploads a sample, sees completion and hears the result","sourceQuote":"Upload audio and play the result on mobile.","kind":"browser","path":"/","viewport":{"width":390,"height":844},"steps":[{"action":"upload","selector":"input[type=file]","file":"fixtures/sample.wav"},{"action":"text","selector":"[role=status]","contains":"Complete"},{"action":"media","selector":"audio"},{"action":"layout","selectors":["input[type=file]","audio"]}]}]}
JSON
```

Selectors must come from inspecting the actual app. This is a shape example, not a universal upload test. Add a second criterion that uploads `fixtures/unsupported.txt` and asserts the app's understandable error. Criteria with `kind: "human"` remain `needs-human`; no acceptance is invented.

Run with the saved revision and exact authorized target:

```sh
just-vibe qa run --root . --stdin <<'JSON'
{"id":"audio-upload","revision":1,"reason":"Initial acceptance check","authorizeTarget":"http://127.0.0.1:3000/","timeoutMs":5000}
JSON
```

Use `qa show` or `qa report` with `{"id":"audio-upload"}`. In MCP, `workbench_manage` supports family `qa` operations `create`/`report`; `workbench_read` supports `list`/`show`; `workbench_execute` supports `run` when execution authority is enabled. Ordinary verification does not grant execution authority automatically.

## Evidence and repair

Each run has a two-minute total budget and records an in-progress attempt before opening a browser; an interrupted run cannot leave an earlier pass looking like its result. Missing screenshot evidence prevents a complete passing result.

The report lives in `.just-vibe/reports/` and includes every attempt, screenshot, expected steps, failure detail and completed-step count. This count locates the failing step; it is not a quality score. Inspect screenshots for clipping or overlap outside the selected controls. Playback progression verifies playable media, not its perceptual quality or speaker identity.

When repairs are authorized, reproduce and verify the failure before editing, fix the cause, and rerun the same immutable plan with the new revision and a reason describing the repair. The plan allows one to five attempts, default three. If requirements change, create a new plan and explain why; do not erase old failures.

Source changes and altered/missing screenshots make evidence stale. Snapshot coverage limits also prevent a current passing claim. A local snapshot does not prove which build a remote URL serves; report that limit and capture deployment identity separately. A report with blocked, stale, missing or human-only criteria is incomplete.

For scripting, `qa run`, `qa show` and `qa report` exit `0` only for a current `passed` verdict, `2` for failed or incomplete acceptance (including stale or human-only evidence), and `1` for an invalid command or execution error. Inspect the JSON verdict and criteria for the reason. Creating or updating a plan is not an acceptance check.

Without Playwright, use host browser tools and the existing proof workflow, attaching actual screenshots and observations as host-reported evidence. Keep failed attempts in separate proof records and link them. Never label host-reported observations as runtime assertions.

## Coverage, authorized sessions and regression export

A plan's optional `coverage` is `{reviewed, reviewNote, requirements}`. Each requirement has a unique `id`, `text`, literal `sourceQuote`, and `criteria` array of existing criterion IDs. An empty array requires `uncoveredReason`. Review the original request for missing clauses, mark assumptions, and expose human decisions. A missing/unreviewed map or uncovered requirement keeps the overall verdict `incomplete` even when `assertionVerdict` is `passed`. Mapping completeness is a reviewed interpretation, not a mechanical proof that all intent was captured. `qa coverage` accepts `{id, revision, coverage}` to record a corrected map without altering the browser criteria or erasing attempts.

`allowedOrigins` on create accepts at most eight additional exact origins such as `https://api.example.test` (no path, credentials, query or fragment). `qa run` requires `authorizeOrigins` to match those additional origins exactly. The runner keeps assertion failures separate from blocked network observations and enforces redirect destinations at the proxy boundary. An origin allowance authorizes contact, not arbitrary side effects. Playwright 1.48+ is required; WebSockets are intentionally unsupported.

For authentication, run with `storageState: ".just-vibe/qa-auth/state.json"` and `authorizeAuth: true`. Obtain that Playwright storage state through an explicitly authorized test-account login; keep the directory ignored by Git and private on disk. The file must be a regular project-local file up to 2 MiB. Cookies/local storage are filtered to allowed origins. Credentials are not persisted in the QA plan, report or generated tests. Do not place login passwords or real data in `fill` steps: steps are saved as reproduction instructions.

A criterion can include `maskSelectors: ["#account-email", "[data-private]"]`. Password inputs and fields supplied by `fill` are masked automatically. Screenshots have private file permissions. This is element masking, not general redaction: identify private UI and inspect the report before sharing. Custom clip paths and unsupported transforms on a control or any ancestor, including CSS `rotate`, require human verification; normal rectangular layout assertions inspect clipping ancestors in rendered coordinates, including assigned slots and shadow hosts. Fully transparent selected elements or ancestors do not satisfy visible, text, media or layout checks; normal fade-ins can finish within the step timeout. These checks do not establish contrast or general visual quality. Standalone exported helpers reject unknown actions instead of treating them as successful checks. Fixture paths cannot enter `.git` or `.just-vibe`, including mixed-case spellings on case-insensitive filesystems.

Text matches must also be supported by rendered text: fully transparent or zero-size descendants cannot supply the expected completion message, including text assigned to shadow slots. Visible text beside hidden content, nested inline markup, uppercase/lowercase transforms and normal fade-ins remain supported. Mixed-visibility text with unsupported text transforms or more than 10,000 inspected DOM nodes requires a narrower selector or human verification. This does not add a general contrast, occlusion or pixel-quality guarantee.

Export after a current passing run and complete reviewed coverage:

```sh
just-vibe qa export-test --root . --stdin <<'JSON'
{"id":"audio-upload","revision":3,"directory":"qa-regression"}
JSON
node --test qa-regression/acceptance.test.mjs
```

Choose a new directory directly under an existing project directory. Export never overwrites tests. Files include the plan, Node tests and standalone assertion/proxy helpers, retaining the passing attempt's step timeout; review their target before running. Keep the app running and the original synthetic fixtures in place. Authenticated exports require the `JUST_VIBE_QA_AUTH_STATE` environment variable pointing to a private test-account storage-state file; credentials are never embedded. Exported tests are repeatable checks, while the original report retains the original source snapshot and attempt history. Adding exported source naturally makes that old snapshot stale.

Coverage updates and regression export are local CLI operations. MCP authority remains unchanged: manage creates/reports, read lists/shows and execution-authorized run performs browser interactions.
