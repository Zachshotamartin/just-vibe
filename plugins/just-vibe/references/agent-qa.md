# Agent QA for web apps

Turn the original request into observable visitor outcomes before reading the implementation's success claims. Keep a literal request quote for every criterion; label additional assumptions in the criterion text. Include a happy path, a useful failure path and the requested viewport. Do not equate code presence with behavior.

## Execution choices

Use the active host's browser tools to inspect actual controls. If the target project has Playwright and Chromium installed, the portable runtime executes a bounded plan. It uses fresh contexts, blocks service workers, WebSockets and cross-origin HTTP requests, and supports synthetic uploads, clicks, fills, visible text, playback progression and selected control geometry. A target depending on another API/CDN needs a host-browser check instead; a blocked dependency is not proof of a product defect.

The runtime does not install browser packages or start the app. Use existing project tooling, or install dependencies only if authorized. Browser interactions can change server state: use a local/staging fixture and synthetic data. Authorizing a target is not authorization for purchases, messages, destructive actions or real user uploads.

The agent supplies the plan using its existing model. No additional LLM service or training is required. The runtime executes assertions separately from the implementation's tests, but it is not a separate AI reviewer. Say “self-review with browser assertions” unless a different verifier actually ran. Delegate only when the host/user permits it.

## CLI and MCP

The CLI accepts JSON on stdin:

```sh
just-vibe qa create --root . --stdin <<'JSON'
{"id":"audio-upload","revision":0,"title":"Audio upload acceptance","request":"Upload audio and play the result on mobile.","target":"http://127.0.0.1:3000/","maxAttempts":3,"criteria":[{"id":"upload-play","text":"A visitor uploads a sample, sees completion and hears the result","sourceQuote":"Upload audio and play the result on mobile.","kind":"browser","path":"/","viewport":{"width":390,"height":844},"steps":[{"action":"upload","selector":"input[type=file]","file":"fixtures/sample.wav"},{"action":"text","selector":"[role=status]","contains":"Complete"},{"action":"media","selector":"audio"},{"action":"layout","selectors":["input[type=file]","audio"]}]}]}
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

Without Playwright, use host browser tools and the existing proof workflow, attaching actual screenshots and observations as host-reported evidence. Keep failed attempts in separate proof records and link them. Never label host-reported observations as runtime assertions.
