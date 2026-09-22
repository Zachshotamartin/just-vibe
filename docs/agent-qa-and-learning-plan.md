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
- Implementation, behavioral verification, CI and publication: pending.
