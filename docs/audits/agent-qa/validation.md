# Agent QA and learning validation

September 21, 2026 development verification. Publication is manual; GitHub Actions has no npm publishing step or OIDC permission.

## Browser behavior

The synthetic audio fixture first leaves processing unfinished and makes the page wider than a mobile viewport. Agent QA reports the upload and mobile criteria as failed and the unsupported-file criterion as passed. After repairing processing and width, the same immutable criteria pass, including advancing audio playback. The report retains both attempts and six hashed screenshots. Changing source makes the previous result stale.

The runner records an incomplete attempt before browser launch. A process-interruption regression test confirms an interrupted run does not reuse a prior completed result. Missing browser prerequisites remain blocked. Subjective criteria remain needs-human. Capture failures prevent a complete pass; reports cap embedded image data. The runner has a two-minute total budget and a maximum of five attempts.

The local preference dashboard was exercised through browser controls at desktop and 390px width: preview affected/unaffected requests, edit, disable and restore an earlier version. Expanded fields stay inside the viewport. Automated desktop/mobile checks also cover keyboard expansion, empty search, zero axe violations, reviewed fixture installation and coordination. Unit/API tests cover stale revisions, read-only previews, secret rejection boundaries, authentication, origin checks and preserving history. Agent-facing edits still use feedback provenance checks; generic MCP management cannot bypass them through the new dashboard edit API.

## Live hosts

See [the retained observations](live-hosts.json). Codex CLI 0.152.0 completed four turns: ordinary repair, explicit correction, fresh-session repair, follow-up. It fixed the independent regression oracle, saved a project preference and loaded that preference in the fresh session, with no dependency additions.

Claude Code 2.1.258 required development iterations. The first trial fixed the fixture and loaded the preference but hit the 16-turn limit. The second completed all four turns but selected testing workflows for the second repair and did not load the fix-scoped preference. Neither is counted as passing. A more explicit bounded fixture command and a generic code-repair routing signal produced a passing four-turn trial. Specialized authentication and other domain routing remain covered by regression tests. These are observations of author-created tasks, not an objective quality score or proof of universal adherence.

`diagnose status` distinguishes recorded hook receipts, selection, instruction delivery and observed tools. It identifies historical timestamps and does not treat installed settings as proof of current delivery. `diagnose trial` is explicitly opt-in, uses the existing account, and retains failure/blocked results instead of converting them to passes.

## Release and site

The public manifest is generated from package/catalog data. Consumers validate fixed URLs, install commands, counts, catalog hash and monotonic versions, confirm npm has the requested version, and retain a checked-in fallback when fetching fails. The portfolio's fallback was generated from the published v0.11.0 tag, replacing hard-coded v0.9.0 content.

Local release preparation at commit `128a78e` passed with 406 tests, two skips and no failures, including the provider fixture through the bundled Python runtime. The exact archive ran through npm, pnpm 10/12 and Yarn 4, remained usable after cache removal, and passed npm's publication dry run. This preparation did not publish anything. The website built 358 pages and passed its four catalog, links and metadata checks; the portfolio built and verified all 45 routes. Final source CI and publication evidence remain separate from these development observations.

Cross-platform fixes address Windows canonical paths, historical preference-store spelling, npm command shims, TAP diagnostic escaping, file URLs and interruption fixtures. macOS's HTTP fixture hang was traced to reverse DNS during server construction; the loopback fixture now binds without DNS. No billing waiver is used for these runtime failures.

## September 22 implementation checks before the additional review

The eight reproduced defects are fixed with regression coverage: unrelated blocked requests no longer mask failed assertions; diagnosis binds receipts to task and session and surfaces empty-report startup failures; human criteria do not require Playwright; the authenticated proxy restricts every redirect destination; layout checks inspect clipping ancestors; preference drafts survive filters and view changes; and the bounded HTTP transport accepts the complete preference schema.

The local dashboard now launches through `just-vibe dashboard`, with browser opening, `--no-open` and isolated `--demo`. The UI identifies the active project and local persistence, creates explicit project/user preferences, distinguishes saved/loaded/unverified behavior, exposes setting conflicts and task exclusions, and previews project-context export/import. Conditional settings retain their fallbacks for applicability review. Imports preserve IDs, reject stale previews and leave preferences pending. Browser tests exercise desktop and 390px mobile interactions, explicit stale-draft rebasing, keyboard behavior, and zero axe violations. An additional manual browser review inspected the local identity, editor and backup view.

QA coverage maps declared request requirements to criteria; missing review or uncovered requirements cannot yield full acceptance. Real Chromium fixtures prove optional-request failure classification, ancestor clipping, zero unauthorized redirect hits, authorized extra origins, test-session use, screenshot masking (pixel assertion), and exported regression test execution. HTTPS CONNECT tests verify proxy authentication and exact-origin enforcement. Unsupported custom clip paths require human judgment. Exported upload helpers retain private-path restrictions and omit report/screenshot metadata.

Node 22.23.2: `npm run release:check` passed with **417 passing tests, two skips, zero failures**, canonical validation, MIT/metadata checks, 815 packaged files, and archive link/secret-pattern checks. Node 26 development checks and focused regressions also passed. The bundled Python runtime was used for provider fixtures because the system Python wrapper is unavailable. The working-tree package executed successfully through npm, pnpm 10.14.0/12.5.1 and Yarn 4.18.0 and survived package-cache removal. These are packaging development checks, not a prepared or published release archive.

The website built 358 routes and passed four catalog/link/manifest checks. No model usage was consumed by this round's diagnostic failure test: an isolated fake Claude executable exits 42. No fresh live-host trial, new cross-platform CI, GitHub push/merge, npm publication or production deployment is claimed. The final diff was reviewed locally; release preparation must still bind the exact reviewed clean commit to its archive before an explicitly requested manual publication.

## September 22 additional review and corrections

Reviewed the unpublished diff and newly added modules across the dashboard, preferences, delivery diagnosis, browser runner, origin guard, QA export, context transfer, CLI dispatch, canonical command data, tests and documentation. This was a local code review with executable negative controls, not an independent-agent review or a new live-model trial. The previous green checks did not catch the following ten defects.

| Verified defect | Reproduction and corrected result |
| --- | --- |
| Dashboard mixes record types while loading | Hold preference responses after opening the catalog, then filter. Previously threw on `lesson.history.find`; now waits for records for the selected view. |
| Duplicate preference creation | Hold a committed create response and rerender the form. Previously enabled another create and saved two lessons; now retains the pending state, saves one, and preserves edits made during the request. |
| Incorrect latest-delivery timestamp | Put a recently edited task with an older load before a task with a newer load. The previous renderer displayed the older version; the corrected renderer sorts actual load times. |
| Import success associated with the wrong bundle | Hold import A's response while previewing bundle B. Previously displayed B with A's success message; now the reviewed bundle stays fixed through completion and view changes. Slow file reads cannot preview the previous text. |
| Scaled ancestor clipping passes | Place a 300px button inside a 100px clipping parent scaled to 25%. Previously passed; now fails using dimensions in rendered coordinates. |
| Export discards the passing timeout | A result appears after 6.2 seconds and passes with a ten-second timeout. The previous export fails after five seconds; the corrected export preserves ten seconds and passes the same real fixture. |
| Incomplete QA returns successful CLI status | Run without Playwright and inspect/report stale evidence. Previously returned zero; now returns two. Real failed and reviewed passing runs return two and zero respectively. |
| Evolved preference loses its structured setting | Evolve an instruction whose package manager appears only in `setting.value`. Both skill and agent drafts now retain `package-manager=pnpm`. |
| Network reporting stops at the detail cap | Issue 201 denied requests. The 201st still receives 403 but the previous length-based observation reports no new restriction; a separate counter now records it without unbounding the detail log. |
| Forgotten preference blocks task exclusions | Exclude a preference, forget it, then select a remaining preference in the dashboard. Previously failed with HTTP 400 for the invisible ID; now saves the remaining IDs successfully. |

Durable coverage is in `tests/agent-qa.test.mjs`, `tests/preferences.test.mjs`, `tests/qa-network.test.mjs`, `scripts/smoke-operator-races.mjs` and `scripts/smoke-qa-boundaries.mjs`. The normal operator browser command now includes the race regressions. Its existing task-exclusion test also registers its response listener before clicking, fixing a missed-response test race without weakening the assertion.

Node 22.23.2 release checks passed with **420 tests passed, two Windows-only tests skipped, zero failures**. Real Chromium operator checks passed at desktop and mobile sizes with zero axe violations, followed by the timing/exclusion regressions. Agent QA checks passed for broken/repaired audio flow, CLI verdicts, network boundaries, clipping, test authentication, screenshot masks, coverage and both exported test fixtures. The website built 358 routes and all four catalog/link/metadata tests passed. The bundled Python runtime was used for provider fixtures.

The reviewed working-tree package also passed archive execution, catalog/profile discovery and bundled setup previews through npm, pnpm 10.14.0 and 12.5.1, and Yarn 4.18.0. The retained installed payload remained usable after the extracted package cache was deleted. Release metadata, MIT notices, all 815 archive files, packaged links and credential-pattern checks passed.

No new cross-platform CI or live-model behavior is claimed. This remains an unpublished working-tree review; clean-commit archive preparation and manual publication are separate release steps. No npm publication, GitHub push/merge or production deployment occurred.

## Repeated review cycle — September 22

At the user's request, repeated inspection, reproduction, fixes and retesting until a subsequent pass produced no additional confirmed defects. This cycle preserved all earlier unpublished work and did not publish or deploy it.

| Pass | Confirmed findings and changes | Verification |
| --- | --- | --- |
| 1: dashboard and QA geometry | A refreshed export could show backup A while downloading B; custom clip paths on the control or document root could pass; independent CSS `rotate` could hide clipped content from rectangular bounds. Persist export rendering/pending state, compare the downloaded JSON to the displayed review, and require human review for unsupported geometry anywhere in the transform chain. | Held-response real-browser download test; invisible self/root clip-path fixtures; rotated clipping fixture; ordinary and scaled rectangular controls still checked normally. |
| 2: task state and network failure | Excluded preferences still imposed completion checks; recent task status could omit the newest task after alphabetic truncation; a truncated upstream response left the proxy client waiting for timeout. Refresh learned checks on workflow load/reselection, sort tasks before truncating, and terminate aborted proxy responses. | Exclusion/restoration/fallback/edit tests with unchanged evidence preserved and changed evidence cleared; 101-task ordering fixture; local HTTP truncation test closes without client timeout. |
| 3: exported checks and integration review | An unknown action such as `visble` silently succeeded in the standalone QA helper. Reject unknown actions explicitly. | Regression asserts rejection; reviewed surrounding transfer journals, revision checks, CLI/MCP access boundaries, runner identity, release checks and website lifecycle code. |
| 4: final review and regression sweep | No additional reproducible defects found in the reviewed paths. No confirmed finding from these passes remains unresolved. | Node 22 full release check: **424 passed, two Windows-only skips, zero failures**. Operator and Agent QA Chromium suites passed. Website built 358 pages and passed four catalog/link/metadata tests plus browser, motion and header/footer checks. |

The final browser sweep covered installation variants, clipboard and prompt-builder behavior, filtering/history, keyboard navigation, mobile menus, interrupted transitions, reduced motion, scroll behavior, responsive overflow and automated accessibility. QA checks retain the prior broken/repaired audio journey, authenticated sessions, origin restrictions, masked screenshots and executable export tests. The review did not require a model-account trial or external service mutation. Local passing evidence is not a claim that every possible host, operating system, remote deployment or subjective judgment has been verified.

## Additional requested review loop — September 22

Repeated local inspection, executable reproduction, fixes and review of the fixes. No subagents or remote mutations were used. All earlier unpublished changes were preserved.

| Pass | Confirmed findings and changes | Verification |
| --- | --- | --- |
| 1: learning recovery | After replacing a preference and then restoring the original, `learn recover` replayed the completed retirement and failed. Check for the final activation record before replaying earlier steps. A forgotten tombstone also represents completed activation. | A new test failed on the original code and passes after the fix, preserving the restored record's revision and the forgotten replacement. Existing process-interruption and pruning recovery tests still pass. |
| 2: dashboard and transport state | Unsaved task-exclusion checkboxes reset on view changes. The HTTPS proxy destroyed its idle upstream socket but left the browser socket open. Persist exclusion drafts, expansion and pending state; compare task revisions before saving; close both ends on tunnel timeout. | The browser reproduction failed before the fix. It now checks view changes, edits during a held response, duplicate-write prevention, forgotten IDs and explicit rebasing after concurrent task updates. A real CONNECT socket test failed with a hung client before the fix and closes afterward; the test shortens the same idle timer to avoid a 15-second suite delay. |
| 3: fix review and adjacent paths | Reviewed the changed control state, activation ordering, transport cleanup, context transfer/recovery, QA validation/export and delivery diagnosis. No additional reproducible defect found in these paths. | Full Node 22 release checks, operator desktop/mobile accessibility and interaction checks, three consecutive timing-suite runs, Agent QA browser fixtures, and website build/tests passed. |

The full repository result is **428 tests: 426 passed, two Windows-only tests skipped, zero failures**, using Node 22.23.2 and the bundled Python runtime. Canonical validation and the 815-file archive metadata, license, link and credential-pattern checks passed. Agent QA fixtures exercised broken/repaired audio, origin enforcement, authenticated sessions, masked screenshots, coverage and exported regression timing. The website built 358 pages and all four site tests passed. Preference documentation and the changelog reflect these fixes.

One early dashboard timing run timed out waiting for a newly created preference. The subsequent full operator run and three consecutive timing runs passed without relaxing that assertion; failure diagnostics now include the dashboard's status text. No repeatable production defect was established from that timeout. This round did not rerun live-model accounts or cross-platform CI, and it does not claim universal absence of bugs. No GitHub push/merge, npm publication or production deployment occurred.

## Further requested review loop — September 22

The next cycle independently reproduced four additional defects before changing their implementation. The private-path reproduction used synthetic files in an isolated project, not real repository metadata or credentials.

| Pass | Confirmed defect and fix | Regression evidence |
| --- | --- | --- |
| 1: paths and browser assertions | Mixed-case `.GIT` and `.JUST-VIBE` bypassed private-directory checks on the local case-insensitive filesystem. Both the shared runtime path validator and standalone upload helper now reject these spellings. | The previous helpers read a synthetic `.git/config` through `.GIT/config`. Tests now reject top-level and nested mixed-case private directories while accepting normal mixed-case filenames and explicitly managed paths. |
| 1: rendered component ancestry | A 300px shadow control inside a 40px clipping ancestor passed. Slotted content could also skip a clipping ancestor in its rendered tree. Follow assigned slots and shadow hosts when checking ancestor geometry. | Real Chromium fixtures fail both clipped cases and pass an ordinary visible shadow control. Existing scale, rotation, custom clip-path and page-overflow checks still pass their expected outcomes. |
| 1: transparent content | Visible/text/layout checks passed targets under `opacity: 0`. Wait for nonzero opacity on the selected element and its rendered ancestors, within the configured timeout. | Fully transparent targets fail all three assertions; a normal delayed fade-in passes. The existing media journey and standalone exported tests also pass with the shared helper. Contrast and general perceptual quality remain outside these checks. |
| 2: persistent goal evidence | A goal completed using desktop-only evidence after its constraint changed to require mobile Safari. Treat constraint-list changes as scope revisions and retain prior constraints in history. | The new test failed on the old code. Changed constraints now reset criteria and refuse completion until new evidence is supplied. Unchanged constraints plus progress/next-step updates preserve valid evidence. |
| 3: final review | Reviewed the completed changes and adjacent transfer/recovery, hook delivery, task evidence, vault, QA export and dashboard paths. No further reproducible defect found in these reviewed paths. | Node 22 release checks, real QA and operator browser suites, website build/tests and final archive checks passed. |

Fresh results: **430 repository tests: 428 passed, two Windows-only skips, zero failures**. Focused checks passed all 65 tests. Agent QA exercised the new component/opacity regressions alongside broken/repaired audio, redirected origins, authorization, screenshot masks and exported-test timing. The operator suite passed desktop/mobile interactions, zero axe violations, installation previews, context transfer and draft/concurrency regressions. The website built 358 pages and passed four catalog/link/metadata tests. The 815-file package passed metadata, MIT notice, link and credential-pattern checks. The evidence ledger's existing test hash was refreshed without changing any acceptance status.

The goal and Agent QA documentation and changelog describe the corrected behavior. This remains a local review; no new cross-platform CI or live-model account trial was performed. No push, merge, npm publication or production deployment occurred, and no universal correctness claim is made.

## Server and backup review loop — September 22

Another local review cycle reproduced three defects before changing their production implementations. Earlier unpublished changes were preserved.

| Pass | Confirmed defect and fix | Regression evidence |
| --- | --- | --- |
| 1: HTTP shutdown | An authenticated client that sent an unfinished JSON body kept both the dashboard and review canvas from closing. Stop accepting connections and close all current HTTP connections when explicitly shutting down. | Real partial-body requests to both servers reproduced the hang. The regression closes both servers within the deadline without waiting for the client to finish its upload. |
| 2: backup round trip | A valid bundle below 512 KiB became larger than 512 KiB when the download added indentation. Its own file picker then rejected it. Download compact JSON while retaining the formatted preview. | A real Chromium download/import test failed with the file-size error before the fix. It now compares the downloaded content with the reviewed JSON, loads the near-limit file and obtains an import preview. |
| 3: canvas drafts | Completing a delayed feedback submission erased newer text and a newly selected line. Track draft changes and clear only an unchanged submitted draft. | The held-response browser test failed on the old code. It now preserves the next draft and line 5 while verifying the saved comment still contains the original text and line 3. Ordinary unchanged submissions still clear normally. |
| 4: final review | Reviewed the completed fixes, shutdown cleanup, request limits, import previews/recovery, preference edits and canvas revision/approval behavior. No further reproducible defect found in these reviewed paths. | Focused HTTP tests and both new browser reproductions passed after their fixes. |

Fresh Node 22.23.2 release checks passed: **431 repository tests: 429 passed, two Windows-only skips, zero failures**. The operator desktop/mobile suite passed with zero axe violations, installation/coordination checks and the full draft/transfer timing suite. The canvas desktop/mobile suite passed with zero axe violations, unchanged-draft clearing, retained new drafts, stale-approval checks and sandboxed HTML. The website built 358 pages and passed all four catalog/link/metadata tests. All 815 package files passed archive metadata, MIT notice, link and credential-pattern checks. The existing implementation ledger hashes were refreshed without changing acceptance statuses.

This cycle used isolated synthetic fixtures and local Chromium. It did not repeat live-model account trials or cross-platform CI, and the unchanged Agent QA browser helper was not modified or separately rerun. The backup and canvas documentation and changelog describe the fixes. No push, merge, npm publication or production deployment occurred. These results cover the reviewed paths, not every possible operating system, host or failure mode.

## Continuous broad review — September 22

The earlier follow-up passes were too narrow to justify stopping the requested review loop. This review continued across subsystem boundaries after each set of fixes, including negative controls for the fixes themselves. It preserved the existing unpublished work. Confirmed failures were reproduced before changing their production implementations.

| Defect family | Reproduction and correction | Follow-up controls |
| --- | --- | --- |
| Repeat request context | “Again” after a coding task became an idle/feedback turn. Restore task routing for short repeat requests. A later boundary check also reproduced leading constraints being truncated when repeats were appended to a near-16,000-character brief; retain the original brief unchanged and store the new message separately. | Repeated requests retain both beginning and end of the original task, including “do not deploy.” Unrelated requests and new sessions do not resurrect or invent coding work. |
| Skipped prompt attribution | An oversized, missing, empty or malformed prompt left the previous task attached to the session. Later tool/Stop events could modify that task. Detach the skipped turn without deleting the previous task. | Claude and Codex events without turn IDs remain isolated; later valid prompts start a new task. |
| Interrupted approval recovery | A process stopped after retiring old guidance but before publishing its replacement. Reconsidering the decision discarded the remaining recovery journal. Reject reconsideration until activation recovers. | A real interrupted child process leaves the journal intact; recovery publishes the replacement. Completed activations can still be reconsidered without replaying retirements. |
| Stale canvas polling | Hold a pre-approval GET response, approve successfully, then release the old response. It reverted the UI to “Ready.” Serialize routine polls and invalidate responses superseded by submissions. | Delayed successful responses and delayed errors cannot revert approval or stop the newer review. New feedback drafts, stale artifact checks and sandboxed previews still work. |
| Overlapping preference mutations | Hold a committed save response and refresh the dashboard. Saving an unchanged draft could expose the new revision and enable another mutation while the first remained pending. Keep a per-lesson pending state across renders. | Save, toggle, discard and rollback remain exclusive; edits typed during the pending save survive. Failed saves retain the draft and permit an explicit successful retry. |
| Invisible completion text | A visible status container containing an opacity-zero completion message passed. Inspect rendered text descendants as well as the selected container. Follow-up fixtures also reproduced direct slotted text and zero-area transformed descendants. | Invisible-only text fails in both the runtime and an executed standalone export. Visible siblings, nested markup, uppercase/lowercase text and delayed fade-ins pass. Unsupported mixed-visibility transforms/oversized DOMs require human review. |
| Shared lesson capacity | With 199 lessons, interleave two real processes just before the first record is published. Per-record locks allowed 201 lessons. Lock creation across the whole scope and recheck capacity under that lock. | Direct preference creation, feedback, reviewed approval and user-wide creation from different project roots stop at 200. Existing lesson edits and interrupted approval recovery still pass. |

The second broad pass reviewed the finished changes and adjacent code rather than only repeating their new tests:

- Task lifecycle: routing, feedback/thanks continuations, explicit dispatch, prompt validation, turn/session association, hook delivery receipts and completion evidence.
- Durable state: preference create/edit/disable/rollback/forget, scope precedence, exclusions, capacity locks, approval/prune/reconsider/recovery, goal evidence invalidation, context-transfer normalization, collisions, revisions and journals.
- Local interfaces: initial loading, filters, retained drafts, concurrent submissions, stale polls/errors, download/import identity, byte limits, authenticated HTTP actions, shutdown and sandboxed artifact previews.
- QA: plan/coverage validation, request attribution, authenticated-origin restrictions, redirect/proxy failure handling, assertion classification, rendered geometry/text, masks, stale reports, CLI exit codes and exported executable checks.
- Distribution and website: CLI dispatch, adapter/setup paths, canonical catalogs/generated skills, package contents, manual-release guards, documentation claims, installation snippets, search, clipboard, navigation, mobile menus, history, motion, header/footer and layout templates.

No additional reproducible defect was found in that follow-up pass after the complete-request boundary fix. This is a statement about the reviewed paths and controls, not a proof that the repository has no bugs.

Fresh verification on Node 22.23.2:

- **438 repository tests: 436 passed, two Windows-only skips, zero failures**, plus canonical validation and release metadata/MIT/link/credential-pattern checks for all 815 archive files. The bundled Python runtime handled provider fixtures.
- Real Chromium operator, dashboard timing, canvas, activity and proof suites passed. Desktop/mobile operator, canvas and activity checks reported zero axe violations. Proof controls include deliberately failing expectations.
- Full Agent QA browser suite and the expanded boundary/export fixtures passed, including failed/repaired audio, unauthorized redirects, authenticated sessions, screenshot masking, timing and hidden-text regressions. Deterministic security fixture controls passed; no live-model security review is claimed.
- npm, pnpm 10/12 and Yarn 4 executed the working-tree archive, discovered 221 skills and 112 profiles, previewed both bundled setups, and retained a usable installation after package-cache removal.
- The website built 358 routes and passed four catalog/link/metadata tests. Browser, motion, header/footer and layout checks passed, including all templates at 15 viewport widths, 352 detail/guide pages at both 320px and 768px, and expanded text spacing. An initial website-browser invocation exited 1 without a diagnostic; two subsequent complete runs passed without changing website code. The initial run remains in the local logs rather than being counted as a pass.

Regression coverage lives in `tests/adaptive.test.mjs`, `tests/workflow-state-review.test.mjs`, `scripts/smoke-operator-races.mjs`, `scripts/smoke-canvas-browser.mjs` and `scripts/smoke-qa-boundaries.mjs`. Runtime references, website guides and the changelog describe the corrected behavior and assertion limits. No new live-host account trial or cross-platform CI was performed. No push, merge, npm publication or production deployment occurred. A future release must still prepare and verify the exact archive from the reviewed clean commit; this working-tree review is not that release artifact.
