# Full code review — 2026-09-21

Baseline: `0fba56d` (the repository after verified publication of 0.10.0). These repairs are unreleased working-tree changes, not part of the existing npm archive.

Three reviewers covered execution, integrations, and workflows. The primary reviewer covered the CLI, browser interfaces, website, and release tooling, independently reproduced each reported defect, and reviewed the repairs. Four agents total were used. Reproductions used isolated files, repositories, processes, and loopback servers; no paid model execution or production mutation was needed.

## Confirmed findings and repairs

| ID | Priority | Reproduced failure | Repair and regression evidence |
| --- | --- | --- | --- |
| R01 | P1 | Agent and preview supervisors launched a child even when its matching stop token existed before startup. | Check owned cancellation before spawning. Foreign tokens still permit execution. `tests/worker-startup.test.mjs`. |
| R02 | P1 | Cancelling an orchestration during its first worker's setup acknowledged success, but dispatch launched a second worker afterward and failed its final state save. | Serialize orchestration writes with worker reservations, recheck authoritative state for each launch, reconcile pending attempts on cancellation, and refuse retirement of an unresolved reservation. `tests/orchestration-cancellation.test.mjs`. |
| R03 | P1 | A script symlink was omitted from trusted runner inputs; editing its target left the runner current and executable. | Reject unsupported symlink inputs and recheck actual argv input coverage, including legacy records. Keep ordinary inline code and package-manager arguments valid. `tests/trusted-runner-identity.test.mjs`. |
| R04 | P1 | Workbench recovery could unlink a replacement live lock after reading an older dead owner; async cleanup also unconditionally removed its lock path. | Track host/token/filesystem identity, serialize acquisition and recovery, and release only the same owned lock. A real-child contention regression also prevents successful operations from stranding a lock during cleanup. `tests/workbench-memory.test.mjs`. |
| R05 | P1 | Inherited `GIT_DIR` and `GIT_WORK_TREE` made the selected project's identity report another repository's HEAD; alternate index/configuration variables could redirect operations. | Remove inherited Git overrides and disable replacement objects for project-bound workbench commands. Tests preserve the foreign repository and exercise binary stdin/stdout. `tests/workbench-memory.test.mjs`. |
| R06 | P2 | An explicitly failed nested file-read result satisfied strict investigation's successful-read prerequisite. | Reject nested error markers and nonzero result codes before recording inspection. `tests/capability-runtime.test.mjs`. |
| R07 | P2 | Cursor discarded the native result envelope, so an error returned by a Read tool still satisfied strict investigation. | Normalize native `tool_output` and compatibility result envelopes, keeping malformed or failed reads unverified. `tests/integration-review.test.mjs`. |
| R08 | P2 | A quiz label matching another option's ID produced different grades depending on shuffle order. | Reject cross-option answer aliases and refuse ambiguous legacy answers without consuming the question. `tests/teaching.test.mjs`. |
| R09 | P2 | Kiro's native lowercase tools and aliases bypassed file/command-specific behavior rules. | Normalize exact built-in names and write fields while preserving namespaced remote tool identities. `tests/integration-review.test.mjs`. |
| R10 | P2 | Default inventory missed the root `opencode.json` written by the connector installer and could not resolve its server for health checks. | Include root JSON/JSONC configurations in shared project discovery paths. `tests/integration-review.test.mjs`. |
| R11 | P2 | Default static auditing skipped Kiro and other supported editor roots, missing indicators found by an explicit path scan. | Share host paths between discovery and auditing; check coverage against every project skill adapter and retain scan bounds. `tests/integration-review.test.mjs`. |
| R12 | P2 | Branching a session into an existing alias succeeded, but subsequent lookup resolved the other session. | Reject alias collisions before creating a branch and preserve both original sessions. `tests/integration-review.test.mjs`. |
| R13 | P2 | Installed Git hooks referenced a disposable npm/dlx cache and failed after cache removal. | On explicit install, stage source-bound runtime bytes in durable managed storage; preview remains read-only. Execute both installed entrypoints after deleting the temporary package in `tests/integration-review.test.mjs`. |
| R14 | P2 | Git hook status recomputed the invoking package's proposed hash, making documented uninstall fail after changing package locations. | Status returns installed identity; preview distinguishes proposed and installed hashes. Cover legacy uninstall and edited-hook preservation in `tests/integration-review.test.mjs`. |
| R15 | P2 | A valid UTF-8 character split across HTTP chunks was silently replaced in canvas feedback; the same reader could corrupt operator owner identity. | Accumulate bounded bytes before decoding JSON. Test both APIs and oversize rejection in `tests/http-review.test.mjs`. |
| R16 | P2 | A split UTF-8 character in native Cursor/Kiro stdin stopped a configured rule from matching; the same whole input was blocked. | Decode bounded complete input, preserving rule behavior across pipe boundaries. Installed-entrypoint regressions in `tests/hook-input.test.mjs`. |
| R17 | P2 | Command evidence and agent, preview, and service logs corrupted split characters independently on stdout/stderr. | Use a decoder per stream while preserving output bounds and cancellation behavior. `tests/utf8-output.test.mjs`. |
| R18 | P2 | An older install-preview response re-enabled Apply after the selected editor changed, offering a plan for the wrong editor. | Invalidate pending preview generations on every selection/request; lock installation controls while applying. Delayed-response browser regression in `scripts/smoke-operator-browser.mjs`. |
| R19 | P2 | Reloading the operator page lost its removed fragment token and displayed a JSON parsing error. | Retain the token in tab-scoped session storage; preserve the fragment if storage is unavailable and give a clear missing-token message. Browser reload regression in `scripts/smoke-operator-browser.mjs`. |
| R20 | P2 | The publication workflow's final `npm exec` could run a local checkout binary instead of the registry package and did not assert its version. | Use the existing registry verifier with an unrelated working directory, fresh cache, explicit registry, and exact version assertion. Verified local-shadow behavior with an unpublished offline fixture; helper coverage in `tests/publication.test.mjs`. |
| R21 | P2 | Release preparation could check one commit and later bind its archive receipt to an untested concurrent commit. | Capture the starting commit, require clean unchanged source after checks and before recording the archive, and bind the receipt to that captured commit. Dirty and committed changes at multiple phases are tested in `tests/release-preparation.test.mjs`. |

The repair review caught and corrected two intermediate regressions: cleanup contention in the first lock fix, and long inline Node arguments in the first runner-input fix. Neither is left in the final implementation.

## Coverage

- All runtime library modules, supervisors, CLI entrypoints, installer, native adapters, MCP definitions, hook paths, Python provider, and plugin manifests were assigned and reviewed. This includes storage, cancellation, execution authorization, import/export boundaries, recovery, evidence freshness, and result handling.
- The command, role, method, connector, rule, and specialist catalogs received contract/schema and targeted semantic review. Generated copies are checked against their canonical sources; the 402 generated artifacts were not separately hand-edited or claimed as independent behavioral evaluations.
- Reviewed skill generation, validation, archive and release tooling, CI workflows, host smoke helpers, behavior/conversation/security/benchmark harnesses, language oracles, and fixture contracts.
- Reviewed website components, navigation lifecycle, installation and command controls, catalog pages, documentation routes, CSS layout/motion behavior, and static hosting configuration. Browser checks cover every command/profile/guide page at 320 and 768 pixels, template breakpoints, expanded text spacing, navigation, clipboard, keyboard controls, reduced motion, and automated accessibility checks.
- Reviewed both local web applications, including token/origin checks, HTML preview isolation, state freshness, installation previews, and browser interaction tests.

## Verification

- Complete test suite on Node 22 and Node 24: **365 passed, zero failed, one Windows-only test skipped** on each version (366 tests total). Tests used the available Python runtime explicitly for provider coverage.
- Node 24 `release:check`: canonical catalog and generated-artifact validation, the full suite above, release metadata, MIT notices, internal links, credential-pattern checks, and all **789 packaged files** passed.
- A separate review archive passed execution, all 219 skills and 112 profiles, and both bundled setup previews through npm, pnpm 10, pnpm 12, and Yarn. The installed payload also ran after deleting its temporary package cache. The previously published archive was not overwritten.
- Website production build: **353 pages**. All four static tests passed. Browser checks passed for installation variants, navigation/history, clipboard, search, keyboard controls, dropdown/menu states, reduced motion, automated accessibility, and no-JavaScript catalog use. Layout checks covered 15 template widths and all 347 command/profile/guide pages at both 320 and 768 pixels, plus expanded text spacing.
- Operator and canvas browser suites passed on desktop and mobile with zero reported automated accessibility violations. These include the new stale-install-preview and private-page-reload regressions, plus annotation, stale-approval, and HTML-isolation checks.
- Current implementation evidence validation and `git diff --check` passed. The implementation ledger still records all 49 groups as acceptance-partial; passing these checks does not promote their status.

Local logs and reproduction fixtures are retained under `.tmp/full-review/` (ignored by Git). These results describe the reviewed working tree on macOS, not a newly published release.

## Limits and rejected concerns

An install-widget history/restoration mismatch was investigated in Chromium and not reproduced; controls and displayed command remained consistent, so no speculative website change was made. An archive-invocation shadowing concern in updater tests was also disproved; it is separate from the publication workflow's verified local-resolution issue.

This review does not establish universal correctness, complete ECC parity, or successful model behavior for every prompt. Catalog prose received targeted semantic review, not a claim that every reference sentence was independently fact-checked. Generated artifacts received parity checks. Live model/account integrations, Windows/Linux execution, and every possible process-crash ordering remain outside the observed local results. The historical ECC snapshot and prior release receipts remain unchanged; current implementation evidence is refreshed without upgrading partial acceptance to verified.

Host schema references checked during this review: [Kiro built-in tools](https://kiro.dev/docs/reference/built-in-tools/) and [Cursor hook result envelopes](https://cursor.com/docs/hooks).
