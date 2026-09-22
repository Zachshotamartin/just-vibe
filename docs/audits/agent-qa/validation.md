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

Local release checks passed with 405 tests and one platform-specific skip before the final interruption/Windows-identity regressions were added. The website built 358 pages and passed its four catalog, links and metadata checks; the portfolio built and verified all 45 routes. Final source CI and exact archive checks are recorded in the release evidence, separately from these development observations.

Cross-platform fixes address Windows canonical paths, historical preference-store spelling, npm command shims, TAP diagnostic escaping, file URLs and interruption fixtures. macOS's HTTP fixture hang was traced to reverse DNS during server construction; the loopback fixture now binds without DNS. No billing waiver is used for these runtime failures.
