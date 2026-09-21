# Unreleased expansion: release review

Historical review snapshot. For subsequent versioning, fixes and publication verification, see the [0.10.0 release record](../evals/releases/0.10.0.md).

Reviewed September 20, 2026 (America/Los_Angeles). **Recommendation: hold publication.**

All 49 entries in the frozen ECC implementation plan have source artifacts. That establishes coverage of the list, not successful completion of every acceptance requirement. This review reproduced twelve implementation defects, including permission, cancellation, concurrent-write and recovery failures. The prior completion statement overstated readiness.

The review concerns the dirty/untracked expansion on top of commit `a3df78b`, with package metadata still at 0.9.0 and changes marked Unreleased. No product code was changed, and nothing was committed, pushed, published or deployed during this review. The report and its sanitized observations are new review artifacts.

Follow-up: the [correction record](release-fixes-2026-09-20.md) documents the fixes and subsequent checks. This report preserves the original reproduced failures; its line numbers refer to the reviewed source.

## Findings requiring correction

Priority P1 means fix before publishing this expansion. P2 means a confirmed functional defect that also needs correction or an explicitly narrowed feature contract. These are reproducible observations, not a claim that all possible defects have been discovered.

### R1 — P1: a blocking hook becomes a warning when its audit write fails

At [behavior-rules.mjs](../plugins/just-vibe/scripts/lib/behavior-rules.mjs), lines 217–234, recording an observation happens before returning the already-computed denial. A concurrent state lock makes that write throw. The outer catch in [hooks.mjs](../plugins/just-vibe/scripts/hooks.mjs), lines 16–22, returns only a `systemMessage` and exits successfully. Thus an enabled blocking rule fails open; the failure can also prevent subsequent policy/commit guards from running.

Reproduction: configure a command blocker, invoke the real hook entrypoint and observe `permissionDecision: deny`. Hold its audit-state lock and invoke a different matching event: exit 0, warning only, no denial. All files and commands were inert temporary fixtures.

Required correction: preserve computed enforcement decisions independently of optional audit persistence; handle unavailable enforcement state explicitly. Add real-entrypoint lock-contention and write-failure regressions, including composition with policy/commit checks.

### R2 — P1: disabled user-history access does not protect existing records from replacement

At [native-sessions.mjs](../plugins/just-vibe/scripts/lib/native-sessions.mjs), lines 278–290, `capture` writes to the supplied ID without checking the scope of the existing record. `import` has the same replacement issue. `readSession` protects reads but neither replacement path calls it.

Reproduction: import a user-scope transcript with access enabled. With `allowUser:false`, `show` correctly rejects it, but `capture` using the same ID and current revision overwrites it, removes its user-scope provenance and returns a project-visible checkpoint. This overwrites the stored imported record, not the original transcript file.

Required correction: authorize access to any existing destination before mutation; reject cross-scope replacement or require an explicit authorized migration. Test both capture and import through the restricted MCP surface as well as the module API.

### R3 — P1: two connector installs can each succeed while one disappears

At [managed-fragment.mjs](../plugins/just-vibe/scripts/lib/managed-fragment.mjs), lines 155–170, the pre-write hash check and final rename are not serialized across fragment IDs. Separate connector journals do not lock their shared `.mcp.json` destination.

Reproduction: two child processes installing different namespaced MCP entries both pass preflight, then rename their prepared files. Both return success and write ownership records, but the final configuration contains only one new connector. The existing foreign entry survives in this fixture; the other successful install is lost.

Required correction: serialize by canonical destination across all fragment IDs and journal recovery, and re-read/rebase under that lock. Add a two-process regression with a barrier between preflight and rename.

### R4 — P1: an interrupted adapter installation cannot recover through its public operations

At [managed-files.mjs](../plugins/just-vibe/scripts/lib/managed-files.mjs), lines 78–84, the operation lock is an empty directory with no owner/recovery information. Only the normal `finally` removes it.

Reproduction: kill an installer with SIGKILL after it publishes its journal and before its first managed-file write. The next update rejects with “Another adapter operation is in progress,” although the writer is dead. The recovery journal exists but cannot be used. There is no adapter recovery operation for this lock. Separately, line 109 writes destination content directly, so interruption during a write can leave bytes matching neither the old nor new journal hash; that torn-write consequence was identified by inspection, not separately fault-injected.

Required correction: use ownership-aware, recoverable operation locks that preserve live writers, and atomic file replacement. Test crashes before/after journal publication, file replacement, record commit and journal removal. Unknown edits must still be preserved.

### R5 — P1: cancelling a job does not prevent its verifier from being dispatched

At [bounded-jobs.mjs](../plugins/just-vibe/scripts/lib/bounded-jobs.mjs), lines 181–188, the verifier runs before the job's current cancellation state is re-read.

Reproduction: pause the main runner, cancel the running job, then let the main runner return successfully. The verifier still executes. The final record says `cancelled`, hiding that another command was launched after cancellation was acknowledged. This is distinct from unavoidable effects already produced by an in-flight command. Runner execution also receives no cancellation signal from this path.

Required correction: check cancellation, deadline and current authorization before every dispatch, connect cancellation to owned process termination, and retain accurate receipts. Extend the current cancellation test to include a verifier and a real bounded child process.

### R6 — P1: concurrent MCP reconnection requests execute twice

At [mcp-health.mjs](../plugins/just-vibe/scripts/lib/mcp-health.mjs), lines 57–63, reconnect executes the trusted runner before reserving a revision or operation identity.

Reproduction: issue two reconnect calls with the same current revision and defer their runner completions. Both runners execute; only afterward does one state write fail with a revision conflict. A late conflict does not undo a duplicated restart or other reconnect effect.

Required correction: reserve before execution, deduplicate attempts, and reconcile interrupted reservations without replay. Add concurrent reconnect and crash-after-dispatch fixtures.

### R7 — P1: a service can start after stop was acknowledged

At [service-supervisor.mjs](../plugins/just-vibe/scripts/service-supervisor.mjs), lines 17–38, startup checks `state === starting` and runner trust, but does not check the durable stop request before spawning.

Reproduction: create the same valid starting reservation used by service startup, call the public `stop` operation, then launch the real supervisor. Its inert child still runs and prints its marker; the final state becomes `completed`. The later 500 ms polling loop cannot prevent this launch.

Required correction: reconcile stop, deadline and reservation ownership before spawn and during the startup handshake. Test stop-before-launch, stop-during-launch, expired reservations and trust revocation without signalling unrelated PIDs.

### R8 — P2: stopping a canary still probes later targets and becomes a failure

At [canary.mjs](../plugins/just-vibe/scripts/lib/canary.mjs), line 139, the target loop does not check cancellation between requests. Lines 196–200 overwrite the durable stopped state when the resulting revision conflict is caught.

Reproduction: pause target one, stop the watch, then release target one. Target two is still requested, and the final state changes from the acknowledged `stopped` to `failed`.

Required correction: cancellation must win over stale completion/error paths; check it between targets, abort active requests where supported, and suppress post-stop notifications. Test cancellation during fetch, between targets and before notification.

### R9 — P2: session imports silently discard part of a message

At [native-sessions.mjs](../plugins/just-vibe/scripts/lib/native-sessions.mjs), line 28, every message is truncated to 4,000 characters. The returned `truncated` flag only represents exceeding the message-count limit.

Reproduction: import one 4,120-character message with a constraint at its end. Only 4,000 characters survive and `truncated` is false. A caller resuming work cannot tell that the constraint disappeared.

Required correction: disclose character/block/message truncation and omitted counts; provide a bounded way to retrieve or explicitly summarize the missing context. Check distinct long messages sharing the same prefix, since truncation currently also precedes deduplication.

### R10 — P2: a price change retroactively reprices prior usage

At [usage-ledger.mjs](../plugins/just-vibe/scripts/lib/usage-ledger.mjs), lines 81–95, the last cumulative count is multiplied entirely by the rate applicable to its latest timestamp. Previous snapshots have been replaced.

Reproduction: record one million input tokens at $1/million, then two million cumulative tokens after the rate becomes $2/million. The report returns $4 and loses the known $1 valuation of the first million. It cannot substantiate when the incremental million was consumed across the price boundary.

Required correction: preserve priced deltas or explicit session segments and retain earlier valuations. Treat usage intervals spanning a rate change as uncertain unless allocation is known. If the intended output is a current-rate repricing instead of historical cost, expose and label that as a separate estimate.

### R11 — P2: telemetry lifecycle changes reuse the same event identity

At [telemetry.mjs](../plugins/just-vibe/scripts/lib/telemetry.mjs), lines 29–34, a dispatch event uses the request ID and creation timestamp even after its status changes.

Reproduction: export a queued dispatch, execute it, then export again. The outcome changes to `finished` but both ID and timestamp are identical. A collector following the documented deduplication contract drops the completion. Worker snapshots also reuse the worker ID across state changes.

Required correction: distinguish entity identity from immutable event identity and timestamp, or explicitly expose snapshot/upsert semantics. Test successive exports and collector deduplication across lifecycle transitions.

### R12 — P2: completed dispatch records permanently consume queue capacity

At [operator.mjs](../plugins/just-vibe/scripts/lib/operator.mjs), lines 183–185, dispatch history is capped at 100 records. There is no public operation to retire completed dispatches, despite the error instructing the user to do so.

Reproduction: seed 100 terminal records of the shape produced by a real dispatch and request another enabled ready job. The request is rejected with “Operator capacity reached; retire old records.” This tests the terminal-capacity boundary without executing 100 commands.

Required correction: provide safe terminal-record retention/retirement while preserving request deduplication, and reject retirement of active reservations. Test reuse after the capacity boundary and late duplicate requests.

## Completion-accounting gap

The plan's closing statement at [ecc-implementation-plan.md](ecc-implementation-plan.md), line 80, is too strong relative to its acceptance column. The implementation checker verifies group identity, delivery labels, source hashes and populated verification references. It does not execute or require each promised acceptance scenario.

For example, the focused-method test at `tests/expansion-contracts.test.mjs`, lines 191–200 in the source repository, checks field lengths, HTTPS-shaped references and example length. It does not exercise React hydration, Celery redelivery, JVM transactions, PyTorch gradients, database contention, network routing or domain-specific artifacts. Those methods can be useful authored instructions without being accepted implementations of all the promised fixtures.

Required correction: track implementation and acceptance separately, with a concrete case/result/environment for each acceptance claim. Keep unrun checks pending or explicitly narrow the agreed scope; hashes and prose limitations must not silently convert them into passing results. No subjective output-quality score is needed for these concrete behavioral checks.

## All 49 plan entries reconciled

“Fixture coverage” below means relevant automated cases exist and passed in the local suite; it is not universal acceptance. “Partial acceptance” means artifacts exist but the plan promises checks beyond the recorded evidence. “Blocked” means a reproduced defect affects the feature or its shared implementation. Previously recorded browser/native/package-manager results are distinguished from checks rerun in this review.

| Plan ID | Review status | Evidence and remaining requirement |
| --- | --- | --- |
| frontend | Partial acceptance | Motion/design guidance; prior operator-browser checks cover that UI, not every design/motion recipe or page-transition scenario. |
| react | Partial acceptance | Authored behavior method; no new React race/hydration fixture implementing its worked scenario. |
| backend | Partial acceptance | Deployment/environment/latency methods; representative stack rollback and shutdown cases remain unrun. |
| testing | Partial acceptance | Desktop regression method; no complete native desktop/platform fixture matrix. |
| security | Fixture coverage | Exact dependency indicators, stale feeds, source provenance and no-execution scanning tested; supplied feed authenticity remains separately assessed. |
| ml | Partial acceptance | CPU ranking/time/entity examples run; the promised PyTorch autograd/library fixture is not present in the executed cases. GPU/distributed coverage remains separate. |
| orchestration | Fixture coverage | Dependencies, result/source identities and bounded worker flows have tests; new live cross-host behavioral acceptance remains distinct. |
| quality | Blocked | Native Git checks have fixtures; R1 can bypass the agent hook chain before later guards run. |
| config-audit | Fixture coverage | Scoped formats, redaction, disable/restore and edits covered; TOML support is explicitly partial. |
| skill-health | Fixture coverage | Inventory, use provenance, source drift and user-scope filtering covered; no objective quality inference from invocation counts. |
| custom-hooks | Blocked | Declarative matching exists; R1 invalidates enforcement under persistence contention. |
| mcp-health | Blocked | Failure classification/backoff covered; R6 violates no-double-execution acceptance. |
| sessions | Blocked | Visible-message/privacy and alias fixtures exist; R2 and R9 break scope protection and context-loss disclosure. |
| cost | Blocked | Basic cumulative deduplication covered; R10 loses historical pricing information. |
| codemaps | Fixture coverage | Source/line anchors and edited export rejection covered; lexical maps are not compiler-resolved analysis. |
| loops | Blocked | Reservation/attempt tests exist; R5 violates cancellation before follow-up execution. |
| council | Partial acceptance | Independent assignments and source identities tested; actual independent disagreement/convergence was not exercised with live models in this expansion. |
| terminal | Blocked | Owned process start/stop fixture exists; R7 violates stop-before-spawn. Windows process handling remains unverified here. |
| canary | Blocked | HTTP/content/SSE fixtures exist; R8 violates stop behavior. |
| eval | Fixture coverage | Artifact tampering, runner trust and receipt semantics covered; target-model quality and hostile-subject isolation need their own environment. |
| agent-engineering | Partial acceptance | Harness/prompt methods and routing checks exist; representative generated-agent failure fixtures are not established by those structural tests. |
| framework-python | Partial acceptance | Celery/packaging guidance; pinned broker redelivery, transaction rollback and wheel-import worked fixtures remain unrun. |
| framework-jvm | Partial acceptance | JVM/Kotlin guidance; transaction/query/coroutine/auth fixtures remain unrun. |
| framework-php | Partial acceptance | Laravel/Rails guidance; representative mass-assignment, tenant, queue and migration fixtures remain unrun. |
| framework-mobile | Partial acceptance | Android/Swift/HarmonyOS guidance; actual toolchain/device lifecycle and accessibility cases remain unrun. |
| framework-web | Partial acceptance | Angular/Vue/Next/Nest/Bun guidance; representative SSR/cache/DI/runtime fixtures remain unrun. |
| framework-dotnet | Partial acceptance | .NET/F# guidance; pinned SDK DI/query/cancellation/serialization fixtures remain unrun. |
| framework-systems | Partial acceptance | Systems/Perl guidance; representative compile/race/sanitizer/taint fixtures remain unrun. |
| framework-storage | Partial acceptance | Engine/ORM guidance; representative SQL, migration and contention fixtures remain unrun. |
| specialists | Partial acceptance | Agent definitions, routing and generated surfaces covered; distinct real host/framework outcomes are not established for every specialist. |
| network | Partial acceptance | Network operations guidance; no executed offline configuration/routing simulation for its worked scenario. |
| connectors | Blocked | Recipe and ownership fixtures exist; R3 permits lost installs. Recipes do not establish live account/schema compatibility. |
| media | Partial acceptance | Production guidance; no complete new rendered/exported media/document artifact set demonstrates these methods. |
| scientific | Partial acceptance | Evidence/patent guidance; no executed identifier/retraction/citation verification fixture for each method. |
| marketing | Partial acceptance | Content/research guidance; synthetic claims, audience and reviewed side-effect scenarios remain to be exercised. |
| business-ops | Partial acceptance | Operations/agreements guidance; representative synthetic dry-run artifacts remain unverified. |
| healthcare | Partial acceptance | Software/data-handling guidance; synthetic PHI workflow fixtures remain unrun; no clinical/compliance approval is implied. |
| blockchain | Partial acceptance | Protocol/payment guidance; local/test-network invariant and transaction-authority fixtures remain unrun. |
| vendor-bridges | Partial acceptance | Provider-neutral bridge guidance; actual external tool/account/operation verification requires an available integration. |
| python-host | Fixture coverage | Seven Python cases passed, including request/stream/loopback contracts; no new paid-provider execution or live cancellation test. |
| operator | Blocked | Local claims/inbox/dispatch and origin/token tests exist; R12 prevents continued dispatch after terminal history fills. |
| graph | Fixture coverage | Atomic imports, duplicate IDs, removal, provenance and manual-node preservation covered; recall remains literal, not semantic search. |
| scheduler | Blocked | Explicit authorization and reservation plumbing exists; R5/R12 affect dispatch lifecycle and continued operation. No hosted remote scheduler is supplied. |
| observability | Blocked | Privacy/export shape tests exist; R11 breaks documented event deduplication semantics. |
| maintenance | Partial acceptance | CI/publishing configurations exist; local macOS Node 22/26 checks passed, but Linux/Windows matrix and artifact provenance have not been exercised for this release. |
| translations | Partial acceptance | Source/command freshness checks pass; independent Spanish/Japanese language review remains pending. |
| adapter-depth | Blocked | Owned file/event fixtures and prior native installation smoke checks exist; R4 breaks crash recovery. Every added editor's real activation remains unverified. |
| catalog-gui | Blocked | Prior browser checks and reviewed-install API fixtures passed; its installation path inherits R4. |
| auto-update | Blocked | Integrity/selection/rollback tests exist; R4 affects target installation recovery. The updater test injects a successful command result instead of exercising a real downloaded update end to end. |

The earlier `/goal` addition is present as a skill and revision-checked runtime with completion evidence; its existing tests ran in both local Node suites. It was one of the already-addressed capabilities outside this 49-item backlog. Its existence does not make unrelated backlog acceptance complete.

## Verification performed in this review

| Check | Result |
| --- | --- |
| `npm run release:check`, Node 26.7.0, macOS, explicit Python 3.12.14 | 309 tests: 308 passed, one Windows-only skip, zero failed; release checks inspected 777 archive files. This ran before adding the review documents. |
| `node scripts/test.mjs` through Node 22.23.2, same Python/macOS | 309 tests: 308 passed, one Windows-only skip, zero failed. |
| `npm run audit:implementation` | 49 source-hashed entries accounted for: 22 runtime, 22 method, three integration, two maintenance. This is an inventory check, not acceptance completion. |
| Adversarial review probes | Twelve defects above reproduced in isolated temporary projects/private stores, with injected inert executions where noted. |
| npm execution precedence check | A local inert verified archive's binary was selected ahead of a project binary. That suspected updater issue was not reproduced and is not reported as a defect. |
| `git diff --check` | Passed for tracked changes. |
| Packaging/link/credential checks after adding this review | Passed again with 779 archive files; no publication. |

The reproduction harness is retained locally at `.tmp/review/reproduce.mjs`; run `node .tmp/review/reproduce.mjs` from the repository root. It asserts the observed bugs, so it is a diagnostic, not a passing regression suite proving correctness. It uses temporary directories and no real host histories, configured services, accounts or external messages. The installer crash and fragment-write race use child-process fault injection; the capacity check seeds terminal fixture records. Sanitized observations and reviewed source hashes are retained in [the review evidence](audits/release-review-2026-09-20.json).

Prior browser, website, native installation and package-manager results remain in [the implementation verification record](ecc-implementation-results.md). They were not rerun in this review and do not invalidate the new defects. No live commercial/provider, GPU, mobile-device, production-database, network-device or clinical/legal validation is claimed. GitHub Actions minutes remain unavailable; skipped CI is not a pass.

## Required release sequence

1. Correct the reproduced defects and add discriminating regressions that fail on this reviewed source.
2. Reconcile every acceptance row with actual case/results or an explicit pending/narrowed scope; update the implementation ledger and user-facing completion claims consistently.
3. Exercise a real packed-archive update/rollback and fault recovery, then rerun relevant native/package-manager/browser checks affected by the fixes.
4. Prepare a new version and verify the exact archive intended for publication. Record unavailable OS/live-host evidence accurately. Only then reconsider GitHub/npm publication.
