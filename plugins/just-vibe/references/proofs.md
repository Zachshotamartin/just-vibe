# Requirement-linked evidence

Translate the user's acceptance criteria into observable checks and separate human judgments. A command exit code can verify a targeted behavior; it cannot accept a design preference on the user's behalf. Use this workflow when evidence/reporting is requested or meaningful to the task, not as mandatory ceremony for a tiny edit.

## Define criteria

`proof create NAME --stdin`:

```json
{"revision":0,"title":"Checkout acceptance","criteria":[{"id":"retry","text":"Retry discards the earlier response","kind":"automated","files":["src/checkout.ts","tests/checkout.test.ts","package.json"]},{"id":"readability","text":"The retry state is clear to the user","kind":"human","files":["src/Checkout.tsx","src/checkout.css"]}]}
```

Declare all relevant source, test, fixture, script, configuration and lockfiles within the bounded selected-file limits. File hashes only invalidate changes to declared files; the helper does not infer dependency closure. Prefer focused criteria and report uncovered dependencies explicitly. Missing files are represented as null and later creation makes their evidence stale. Criteria with no files can describe external observations but cannot certify local source.

## Collect actual evidence

`proof run NAME --stdin` takes `revision`, `criterion`, argv `command` and optional `timeoutMs` (1–120000). Inspect the command's effects and run a meaningful test of the criterion. A no-op that exits zero is not a behavioral test. The helper stores exit status, bounded output, time and file identities before/after. Source mutations mark the observation stale.

`proof collect NAME --stdin`:

```json
{"revision":1,"criterion":"retry","collector":"browser","options":{"url":"http://127.0.0.1:5173","steps":"checks/retry.json","screenshots":true},"maxAgeMinutes":15}
```

The [daily evidence guide](daily-workflows.md) defines step files and prerequisite CLIs. Collector options are: browser `url`, `steps`, optional `screenshots`; GitHub `repo`, `pr`; Vercel `deployment`, optional `team`; migrations `directory`, optional `applied`. Existing read-only collector limitations still apply. Browser interactions must be authorized for the target site. Up to ten viewport screenshots are captured in a new proof-owned artifact directory; do not capture sensitive pages. The helper does not authenticate a browser or install Playwright.

Collector observations expire after `maxAgeMinutes` (default 15, at most 1440). Remote target identity is retained; source hashes alone do not prove a deployed app serves those bytes. Reconcile commit/deployment identity with the actual environment. Pending/unknown/static migration observations remain review-needed; they do not turn green because collection succeeded. Recheck a remote observation after expiration.

## Human review

`proof show NAME` exposes each criterion and recorded evidence. To record acceptance, the reviewer must actually examine the named source/render and its exact version. `proof attach NAME --stdin` takes `revision`, `criterion`, `source`, `summary`, ISO `observedAt`, `verdict` (`accepted`, `rejected`, `observed`), optional project-relative `artifacts`, and `files` with the exact reviewed identities:

```json
{"revision":2,"criterion":"readability","source":"User review in this task","summary":"Accepted the preview's retry state","observedAt":"2026-09-20T00:00:00Z","verdict":"accepted","files":{"src/Checkout.tsx":{"sha256":"ACTUAL_REVIEWED_SHA256","executable":false},"src/checkout.css":{"sha256":"ACTUAL_REVIEWED_SHA256","executable":false}}}
```

Replace placeholders and the time with actual observations; do not fabricate a reviewer or acceptance. The helper checks identities against current files. Attribution remains caller-supplied and is labeled as such, including historical observations; it is not independent authentication. An attachment cannot pass an automated criterion. `observed` can save a useful non-acceptance note. Artifacts are local regular files up to 4 MiB, hashed for freshness.

## Read and render

`proof show NAME` recomputes freshness; `proof report NAME` writes a self-contained local HTML report with criterion results, observations, escaped output and hash-checked PNGs. Open the actual report. Overall verified requires every automated criterion to pass and every human criterion to be accepted. Missing, changed, expired, failed and review-needed evidence remains visible. A later observation supersedes the earlier one for current status without deleting history.

Reports cover declared assertions and environments. They are not an objective quality score. Changed dependency installations, runtime settings or undeclared files need new evidence even when the helper cannot detect them. Keep private reports/screenshots local unless the user requests sharing them.
