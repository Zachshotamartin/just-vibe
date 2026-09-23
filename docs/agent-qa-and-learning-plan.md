# Agent QA, learning, and release reliability

Requested September 21, 2026. Work is complete only when the acceptance evidence below exists; source presence alone is not a passing result.

## Delivery scope

1. **Cross-platform reliability.** Reproduce the failures in the newly running public CI matrix, fix path/process/provider behavior, preserve meaningful assertions, and rerun Node 22/24 on Linux/macOS/Windows. Record remaining failures rather than waiving them as billing problems.
2. **Live setup diagnosis.** Add a bounded host trial and readable report for hook delivery, workflow selection/loading, and tool discovery. Distinguish installed configuration, observed delivery, and actual agent behavior. Explicitly invoked live trials may use the user's existing host account; ordinary setup must not spend model usage silently.
3. **Learning dashboard.** Extend the existing authenticated loopback operator interface with project/user lessons, source quotes, scope, versions, conditions and exceptions. Provide revision-checked edit, disable, restore and undo with clear empty/error states. Browser mutations remain local and cannot execute arbitrary commands.
4. **Preference preview.** Provide read-only example-based previews of routing and instruction effects, with expected affected/unaffected cases. Literal matching is an explanation of routing mechanics, not a semantic guarantee. Saving requires explicit user input and preserves provenance; preview never activates a lesson.
5. **User journeys.** Exercise install, ordinary request, explicit correction, fresh session and follow-up. Persist raw observations, distinguish assertions from human judgments, retain failures, and test negative controls. Use actual hosts when available; report authentication/tool restrictions accurately.
6. **Public release metadata.** Publish a versioned JSON manifest generated from canonical package/catalog data. Consume a validated snapshot in the portfolio and generate current website installation examples/counts from the same source. Streamline the README while retaining historical release evidence and compatibility limits. Reject invalid/older remote metadata and retain a checked-in fallback.
7. **Manual publication (updated at user request).** Keep publication in the explicit local CLI. GitHub Actions validates code and can prepare an archive, but has no publishing step or OIDC permission. Run complete release preparation from a clean commit and verify the exact published artifact if a release is performed. No trusted-publisher setup is required.
8. **Agent QA for web apps.** Add a canonical discoverable workflow and concrete runtime support for request-derived acceptance criteria, execution records, failure/reproduction evidence and bounded retests. Support uploads, visible states, media playback, invalid input and responsive layout. Reuse the active host's browser tools; do not require a new model service. Distinguish self-review from a separate verifier, host reports from executable assertions, and blocked/subjective checks from passing behavior. Preserve prior failures after fixes and invalidate evidence when the checked source changes. No general correctness claim or unsolicited production mutation.

## Verification

- Focused regression tests for each changed runtime boundary, followed by the full repository check and actual CI matrix.
- Real browser review of desktop/mobile learning and preview controls, including stale edits, empty/error states, keyboard access and no horizontal overflow.
- Agent QA fixture with a working and deliberately broken upload flow, invalid input, playable media, mobile overflow and a repaired retest. Reports must show screenshots and reproduction steps without leaking credentials.
- Live host evidence for setup/learning journeys, with consumed host/version and explicit limitations recorded.
- Website generation/link checks, manifest validation, portfolio build and live deployment verification when published.

## Progress

- Planning: complete.
- The eight original defects and nine follow-up improvements below are implemented. A further review found and fixed ten additional defects; their reproductions and regression coverage are recorded in the final September 22 validation entry.
- Local browser, unit and live-host development evidence: [validation record](audits/agent-qa/validation.md); failed host trials are retained.
- Cross-platform CI and browser checks passed at `149b318`, but those checks missed the defects subsequently fixed below. Earlier archive preparation is development evidence, not approval to publish the current changes.
- Publication and production deployment: not performed. The implementation review and local checks are complete; prepare an exact archive from the final clean commit and review fresh CI before a separately requested manual release.

## Confirmed defects resolved — September 22, 2026

The user explicitly requires review before making changes live. Each item below was reproduced with isolated fixtures. Do not mark an item resolved based only on a source edit: rerun its reproduction, add a regression check, and review the fix. These eight items are defects, separate from optional feature proposals.

- [x] QA reclassifies a genuine assertion failure as blocked when an unrelated optional network request is blocked. Preserve the assertion result and distinguish required dependencies from unrelated requests.
- [x] Task-specific diagnosis reports a hook receipt belonging to another task. Match receipt evidence to the requested task, host and session.
- [x] Human-review criteria become blocked when Playwright is unavailable. Record needs-human independently of browser prerequisites.
- [x] A redirect reaches an unauthorized origin while QA reports a pass and no network restriction. Enforce the authorized-origin boundary throughout redirect chains.
- [x] Layout verification passes a 300px button clipped by a 40px overflow-hidden parent. Account for clipping imposed by ancestors.
- [x] Diagnostic host startup failure (reproduced with exit code 42) is swallowed and returns an empty reports array. Preserve and report startup failures.
- [x] Filtering the dashboard silently discards unsaved preference edits, even when the same preference remains visible. Preserve drafts across rendering or explicitly handle their disposal.
- [x] A valid preference request of 14,116 bytes, within individual form limits and accepted by the preferences API, is rejected by the dashboard's 12,000-byte transport limit. Align the form, schema and bounded request limits.

After these fixes: review the final diff, run the focused regressions and relevant full/package/browser checks, and prepare the exact release archive from the reviewed clean commit before any manual publication. Review production website changes before deployment as well.

## Approved follow-up implementation

Implement the eight fixes above and the nine requested improvements together, then review before any publication:

- [x] `just-vibe dashboard` opens the authenticated local UI; include no-open and isolated demo modes.
- [x] Identify the active project, local storage, persistence and demo status in the UI and docs.
- [x] Create project/user preferences directly with explicit source and version history.
- [x] Show task-linked preference delivery and distinguish loading from verified behavior.
- [x] Expose conflicts, deterministic scope precedence and task-only exclusions without changing global defaults.
- [x] Display request-to-criterion coverage, including uncovered requirements and unreviewed plans.
- [x] Support explicitly authorized test authentication, additional origins and screenshot masks while preserving network boundaries.
- [x] Export successful, current QA journeys as runnable project regression tests without copying credentials.
- [x] Provide reviewed project-context export/import in the dashboard with collision and stale-preview handling.

Validation: focused negative controls for every defect; browser tests for drafts, creation, delivery, exclusions, transfer and mobile layout; real redirect/auth/masking and exported-test execution; full package/catalog/website checks; final diff review. Model trials remain explicitly opt-in. Production publication is outside this implementation step.

## Follow-up verification completed

- All eight defect reproductions now have regression coverage. Browser checks prove zero requests reach an unapproved redirected origin, optional network restrictions do not mask assertion failures, and clipped ancestors fail. Missing browser support preserves human criteria.
- Preference browser checks cover drafts across filters/views, stale-version rebasing, creation, delivery, exclusions and reviewed imports at desktop and 390px mobile width; axe reports no violations.
- Real authenticated fixture, masked screenshot pixel verification, HTTPS proxy authentication/allowlist tests, and standalone exported-test execution pass. Private fixture paths stay forbidden in exported helpers. Conditional settings retain fallbacks for applicability review.
- Node 22.23.2 release check: 417 passed, two skipped, zero failures; package metadata, 815 archive files and secret-pattern/link checks passed. npm, pnpm 10/12 and Yarn 4 package execution passed.
- Website: 358 generated pages and four tests passed. Browser review confirmed the local dashboard identity and backup UI.
- No fresh model-account trial, npm publication, GitHub push/merge or production deployment was performed in this round. Cross-platform CI and the exact clean-commit release archive remain release-time checks; earlier CI is not claimed as evidence for this diff.

## Additional review of the unpublished implementation

The earlier passing checks missed these defects. They were verified before being treated as fixes; retained regression tests now cover each boundary.

- [x] Filtering while a different dashboard view loads renders the previous view's record shape and throws a browser exception. Bind rendered records to their loaded view.
- [x] Rerendering while preference creation is pending enables another submission and creates duplicates. Retain the pending operation across renders and preserve newer draft edits.
- [x] The latest preference delivery is chosen by task update order, which can display an older load. Sort actual load timestamps.
- [x] A pending context import allows the bundle to change, then attaches the old import's success message to the new bundle. Keep the exact reviewed bundle fixed until completion, including across view changes; file reads also keep preview disabled until ready.
- [x] A scaled clipping ancestor passes the layout check because rendered coordinates are compared with unscaled dimensions. Compare rendered dimensions consistently and defer unsupported geometry to human review.
- [x] Exported checks replace a successful ten-second step timeout with five seconds. Persist and export the actual timeout; execute the same delayed fixture in both forms.
- [x] QA commands exit successfully with incomplete acceptance. Return a nonzero status for failed/incomplete/stale evidence and document the scripting contract.
- [x] Evolving a structured preference into a skill or agent drops its setting value. Include the value in both generated formats.
- [x] Network restrictions stop being observed after the 200-entry detail log fills. Track all blocked requests independently of bounded diagnostic details.
- [x] Forgetting an excluded preference leaves an invisible ID in the dashboard's next save and blocks all further exclusion edits. Submit only IDs that still exist.

Also correct the operator smoke test's response listener ordering: register the listener before the action so a fast valid response cannot be missed. Final verification is recorded in [the validation record](audits/agent-qa/validation.md). Nothing was published or deployed by this review.

## Repeated review cycles completed

The subsequent requested loop completed four passes. The first three found and fixed seven more confirmed defects: mismatched backup preview/download, missed self/root clip paths, missed CSS rotation clipping, stale learned completion checks after exclusions or edits, incorrect recent-task ordering, hanging truncated proxy responses, and silently accepted unknown exported QA actions. Each has a regression reproduction. The fourth pass found no additional reproducible issue in the reviewed paths.

Final local results: 424 tests passed, two Windows-only tests skipped, no failures; operator and QA browser checks passed; 358 website pages built and four site tests plus browser, motion and header/footer checks passed. Full pass-by-pass findings and limitations are in the validation record. Publishing, merging and deployment remain separate from this completed review loop.

## Additional requested review loop — September 22

- [x] Reproduce recovery replaying completed preference retirements after the user restores earlier guidance. Treat the final lesson record, including a forgotten tombstone, as a completed activation and preserve subsequent user changes. Interrupted activations still recover.
- [x] Reproduce unsaved task-exclusion choices disappearing after switching dashboard views. Persist choices and expanded state in the tab, preserve edits during delayed saves, prevent duplicate pending submissions, and require explicit rebasing after a concurrent task update.
- [x] Reproduce the browser side of an idle HTTPS proxy tunnel remaining open after its upstream timeout. Close both connections and retain authenticated exact-origin enforcement.
- [x] Review the completed fixes and adjacent recovery, transfer, dashboard and QA paths again; no further reproducible defect found. Add regression tests before fixing each confirmed defect.

Fresh verification: Node 22 release checks passed with **426 tests passed, two Windows-only skips, zero failures**; operator desktop/mobile checks, three consecutive dashboard timing runs and the full Agent QA browser suite passed. The website built 358 routes and passed all four site checks. See the validation record for the early transient browser-test timeout and verification limits. Nothing was pushed, merged, published or deployed.

## Further requested review loop — September 22

- [x] Reproduce and reject mixed-case private-directory paths in the shared runtime validator and standalone QA upload helper.
- [x] Reproduce clipped controls passing inside shadow trees and slots; follow rendered ancestor relationships during layout checks.
- [x] Reproduce fully transparent targets passing visibility/text/layout assertions; wait for the selected target and its ancestors to become nontransparent within the step timeout.
- [x] Reproduce goal completion using old evidence after constraints change; reset criteria and preserve the previous constraints and evidence in scope history.
- [x] Review the fixes and adjacent runtime paths again. No further reproducible defect found in the reviewed paths.

Fresh results: **428 tests passed, two Windows-only skips, zero failures**; Agent QA and operator browser suites passed, including new negative controls and normal-use checks. The website built 358 pages and passed four tests; archive checks passed. Full reproductions, scope and limitations are recorded in the validation record. Nothing was pushed, merged, published or deployed.

## Server and backup review loop — September 22

- [x] Reproduce both local review servers hanging on close with unfinished HTTP request bodies. Stop accepting connections and close existing HTTP connections during shutdown.
- [x] Reproduce the dashboard rejecting its own near-limit backup download. Use compact JSON for downloads while retaining the same formatted on-screen review; verify the downloaded file can be loaded and previewed for import.
- [x] Reproduce a delayed canvas submission erasing newer feedback and its line selection. Preserve changes made during the request and keep the submitted feedback bound to the original text and line.
- [x] Review the completed fixes and adjacent server cleanup, transfer, draft, revision and preview paths again. No additional reproducible issue was found in these paths.

Fresh verification and limits are recorded in [the validation record](audits/agent-qa/validation.md). This review does not publish or deploy changes.

## Continuous broad review — September 22

The user correctly identified that the earlier follow-up scope was too narrow. This pass continued reviewing adjacent subsystems after fixes and added negative controls to the fixes themselves.

- [x] Preserve coding-task context for “again” and other short repeats without inventing work through unrelated messages. Preserve the entire original request at the length limit instead of accumulating repeat text and dropping leading constraints.
- [x] Detach oversized, empty and malformed host prompts from the previous task before later tool/Stop events arrive.
- [x] Preserve interrupted preference-approval journals until activation recovers; allow reconsideration after completion.
- [x] Prevent old canvas poll responses and errors from overwriting a newer approved state.
- [x] Keep preference mutations exclusive across dashboard refreshes while retaining new draft edits and failed-save retries.
- [x] Reject completion text supplied only by invisible descendants, including assigned slots and zero-area transforms. Verify normal visible text and standalone exported tests too.
- [x] Enforce the 200-lesson capacity across concurrent direct creation, feedback, approval and user-wide writes from different projects.
- [x] Review the completed fixes and the broader routing, hooks, durable state/recovery, local HTTP/UI, QA/network/export, CLI/package and website paths. The follow-up pass found no additional reproducible defect after the final request-length fix.

Fresh results: **436 tests passed, two Windows-only skips, no failures**; release/archive validation, package-manager execution, operator/canvas/activity/proof/QA browser suites, deterministic security controls and website checks passed. The website checks cover 358 generated routes, all layout templates at 15 widths and 352 detail/guide pages at both 320px and 768px. The validation record retains the initial undiagnosed website-browser exit and its two passing reruns, exact reproductions, review scope and limits. No live-model trial, cross-platform CI, push, merge, publication or deployment is claimed.
