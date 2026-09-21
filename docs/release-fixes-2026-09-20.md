# Release review corrections

Historical review snapshot. For subsequent versioning, fixes and publication verification, see the [0.10.0 release record](../evals/releases/0.10.0.md).

Follow-up to the [September 20 release review](release-review-2026-09-20.md). The twelve reproduced defects have been corrected in the unreleased checkout. The original review remains historical; this record describes the corrected behavior and subsequent verification. Package version remains 0.9.0. Nothing has been pushed, published or deployed during these corrections.

## Corrections

| Finding | Corrected behavior | Regression evidence |
| --- | --- | --- |
| R1: hook enforcement | Audit persistence failure cannot remove a computed denial or skip later guards. Unavailable PreToolUse enforcement state denies the action with a repair message. | Real hook entrypoint with audit lock contention, composed policy and malformed state. |
| R2: private sessions | Capture/import authorize the existing destination and reject scope changes. | Module and initialized restricted MCP calls cannot replace or expose a user-scope record. |
| R3: shared configuration | All fragments serialize by canonical destination and reread under the lock. | Two real child writers separated by a pre-rename barrier; retry retains both entries and foreign settings. |
| R4: installer recovery | Owned locks carry atomically published process identity; confirmed dead writers can be recovered. Complete files replace destinations atomically, preserving existing permissions. | Real process exits at six installer publication boundaries and three shared-fragment boundaries; live/unknown locks and user edits remain protected. |
| R5: job cancellation | Durable cancellation aborts the owned process group. Every runner/verifier dispatch rechecks cancellation, deadline and trust. | Another CLI process cancels a real running child; verifier never launches. Deadline and trust revocation also suppress follow-up execution. |
| R6: MCP reconnect | Reserve before execution; reject duplicate attempts; explicitly reconcile a dead owner without replay. Retention never evicts unresolved attempts. | Concurrent calls, process exit after reservation, live/dead owner recovery, and full-capacity checks. |
| R7: service startup | Stop and startup share a dispatch lock; startup rechecks ownership, stop, deadline and trust before spawning. | Real supervisor refuses pre-stopped, expired and revoked startup reservations. Existing start/stop lifecycle fixture remains covered. |
| R8: canary stop | Abort active requests and suppress later targets/notifications; in-flight samples preserve the stopped state. | Stop during a signal-aware active request; no second target or notification runs. |
| R9: transcript omissions | Imports/exports disclose truncation and retain full-message identity; explicit windows retrieve omitted text from an unchanged authorized source. | Distinct long messages, suffix retrieval, omission metadata, Markdown/JSON disclosure and changed-source rejection. |
| R10: usage history | Immutable per-delta rate snapshots; unknown boundary-spanning deltas remain unpriced; currencies stay separate. | Price changes, later price edits, mixed currency, overlapping rates and legacy unknown valuations. |
| R11: telemetry identity | Unchanged observations deduplicate; changed status/time has a new ID, with stable entity identity. | Queued-to-finished dispatch export and repeat-export checks. Exports describe latest retained observations, not a complete event stream. |
| R12: dispatch capacity | Retire only finished requests; durable request and row-ID tombstones prevent replay. | Full queue, retirement, new dispatch, duplicate/colliding identity rejection and active-request protection. The board exposes retirement. |

Executable cases live in `tests/release-regressions.test.mjs`. The additional `tests/updater-archive.test.mjs` executes real local packed archives through the installer, upgrades an isolated installation, then rolls back its recorded version and selection. It does not substitute a fake successful execution result. Unavailable registry metadata fails before dispatch.

## Verification

Completed September 21, 2026 on macOS. The [machine-readable correction record](audits/release-fixes-2026-09-20.json) binds the fixes to current source and named tests.

| Check | Observed result |
| --- | --- |
| Full suite and generated-source validation, Node 26.7.0 | 326 passed; one Windows-only skip; zero failures. Includes all 16 release-regression cases, real archive upgrade/rollback and acceptance-accounting rejection tests. |
| Full suite, Node 22.23.2 | 326 passed; the same Windows-only skip; zero failures. The final 17 regression/archive cases also passed after the permission-preservation adjustment. |
| npm release archive | Metadata, MIT notices, shipped references, links and credential-pattern checks passed. |
| Native host installation | Codex 0.152.0 and Claude 2.1.258 install/update/doctor/uninstall lifecycles passed in isolated configurations; 219 skills discovered. |
| Package-manager installation | npm, pnpm 10/12 and Yarn archive execution and bundled previews passed; installed payload survived package-cache removal. |
| Operator browser | Chromium 153 desktop/mobile checks passed, including search, keyboard, reduced motion, fixture installation, acknowledgement and dispatch retirement; zero page errors, overflow or reported accessibility violations. |
| Website | 353 pages built on Node 24.21.0; all four content/link/metadata checks passed. |
| Ledger, localization, whitespace | 49 groups accounted for with partial acceptance; Spanish/Japanese freshness checks and `git diff --check` passed. |

The optional Python fixtures ran with Python 3.12.14. No Windows-only skip, unavailable live integration or configured CI job is counted as a pass. Detailed transient logs and screenshots remain in the ignored `.tmp/` directory.

## Completion accounting and remaining limits

The [49-group ledger](audits/ecc-implementation.json) now separates implementation from acceptance. Every group names actual checks and outstanding requirements. `npm run audit:implementation` validates this accounting and source hashes; it does not execute tests or prove that every requirement passed. The checker rejects verified acceptance with outstanding work or pending evidence.

The twelve reviewed code defects are distinct from unrun acceptance requirements. Full Linux/Windows execution, live activation in every editor, paid-provider behavior, GPU/distributed training, real framework/database/device/cloud scenarios, commercial integrations and independent translation review remain unverified. Existing method/contract fixtures are not substitutes for those environments. The [plan](ecc-implementation-plan.md) and per-group acceptance records retain these limits.

Effects completed before cancellation cannot be undone. Locks with unknown/legacy ownership require inspection; a reused PID is conservatively treated as live. Session windows require the original unchanged source. Cost estimates do not allocate unknown token timing. Telemetry polling may miss intermediate states. Retired dispatch identities remain on disk to preserve replay protection.
