# ECC backlog implementation

Implement the complete frozen audit as one tracked workstream. The [source comparison](ecc-complete-audit.md) remains the historical baseline. The [implementation ledger](audits/ecc-implementation.json) records current progress, source evidence and verification for every remaining group.

## Sequence

1. Shared bounded inventory, reversible configuration operations, native session adapters, skill provenance, declarative rules, MCP health and security/quality controls.
2. Tours/codemaps, councils and bounded loops, monitoring, evaluations/receipts, usage, terminal/service controls, context graph, scheduling/dispatch and a local operator interface. Reuse existing workers, locks, reviews and evidence.
3. Focused technical recipes and specialists; optional network/science/media/business/healthcare/blockchain methods. Keep discovery broad and actual execution constrained to the requested task.
4. Host adapters, external connector/provider contracts, update flow, documentation/localization tooling and release/compatibility checks.
5. Adversarial integration tests, existing release checks, browser verification for new interfaces, generated docs and a reconciled completion ledger.

## Acceptance rules

- Inventory is read-only. Configuration mutation requires an exact current preview and supports restoration without overwriting intervening edits.
- Runtime work is bounded, revision checked and project scoped. New commands are reachable through CLI and appropriately restricted MCP tools. Hooks call the real implementation.
- Sessions expose user-visible content only; private model reasoning and credentials are excluded. Imported text is data, never higher-priority instructions.
- External execution uses explicit configuration/trust, argv rather than injected shell strings, time/output limits and cancellation. Protocol fixtures do not become claims of live service validation.
- Technical methods include real failure modes, concrete examples, verification and version-sensitive primary references. A new title alone is not an implementation.
- No source change is marked verified merely because it was generated. Preserve the distinctions among implemented, fixture-tested, live-tested and unavailable external capability.

## Work ledger

| Group | Phase | Delivery | Acceptance status | Acceptance contract |
| --- | ---: | --- | --- | --- |
| frontend: Frontend interaction and design methods | 3 | implemented | partial | Verify keyboard/focus, reduced motion, page transitions, loading/failure states and widths in a browser; do not equate generated screenshots with shipped UI. |
| react: React-specific work | 3 | implemented | partial | Use discriminating state, cancellation, hydration and interaction tests; profile before claiming render improvements. |
| backend: Backend, deployment and infrastructure depth | 3 | implemented | partial | Exercise representative health/rollback, signal/shutdown, retry and environment-reproduction failures on the selected stack. |
| testing: Test and regression workflows | 3 | implemented | partial | Record platform/browser/host versions, failure cases and limits; avoid arbitrary coverage targets as a substitute for meaningful tests. |
| security: Security review and scans | 1 | implemented | partial | Test stale/adversarial advisories, exact version matching, redaction and no-execution scans; never report unsupported CVE findings. |
| ml: ML methods and specialized libraries | 3 | implemented | partial | Use small CPU fixtures for library bugs, time/entity splits and ranking metrics; expensive training remains an explicitly requested action. |
| orchestration: Planning, workers, worktrees and GitHub epics | 2 | implemented | partial | Test dependency failure, stale acceptance, retry bounds, cancellation, retained dirty worktrees and exact publication recovery. |
| quality: Automated quality gates and hook tuning | 1 | implemented | partial | Exercise hooks from ordinary Git clients as well as agents, partial staging, paths/quoting, failure timeouts and independent toggles. |
| config-audit: Cross-host configuration inventory and cleanup | 1 | implemented | partial | Test mixed Claude/Codex/OpenCode formats, malformed data, secrets, symlinks, duplicates, user edits and rollback. |
| skill-health: Skill portfolio maintenance | 1 | implemented | partial | Test never-used versus unobserved, version changes, conflicting amendments and broken links; no objective quality claim from raw invocation counts. |
| custom-hooks: User-authored behavior rules | 1 | implemented | partial | Test event shapes, Boolean conditions, path scope, non-matches, invalid patterns, rule conflicts, latency bounds and safe failure behavior. |
| mcp-health: MCP connection health and recovery | 1 | implemented | partial | Test OAuth expiry, 401/403/429, timeouts, stdio processes, no double execution, secret redaction and backoff. |
| sessions: Native session history and lifecycle snapshots | 1 | implemented | partial | Test corrupt/partial/large logs, cross-project isolation, alias collisions, privacy, stale paths and resume without lost active-task constraints. |
| cost: Optional usage accounting and model advice | 2 | implemented | partial | Test missing prices, stale rates, snapshots, currencies and multiple sessions; usage and cost must never be presented as output-quality scores. |
| codemaps: CodeTour artifacts and maintained codemaps | 2 | implemented | partial | Reject missing paths and invalid lines; test source moves, stale anchors and regeneration without overwriting hand edits. |
| loops: Bounded iterative and continuous work modes | 2 | implemented | partial | Test duplicate wakeups, stuck tools, repeated failure, restarts, cancellation and clean shutdown; no infinite default loops. |
| council: Independent council and adversarial review modes | 2 | implemented | partial | Verify independent context, genuine disagreement, bounded repair loops and unresolved verdicts; reviewers cannot self-certify success. |
| terminal: Terminal and development-service operations | 2 | implemented | partial | Test quoting, already-running services, occupied ports, restart recovery, Windows/WSL limitations and cleanup of owned processes only. |
| canary: Sustained post-deploy monitoring and notifications | 2 | implemented | partial | Exercise failed assets, wrong content types, SSE inactivity, transient errors, notification opt-in and stop behavior. |
| eval: User-facing harness evaluation and evidence receipts | 2 | implemented | partial | Test artifact tampering, stale evidence, checker access, inconclusive runs and reproducibility; cryptographic hashes are not proof that claimed observations are true. |
| agent-engineering: Agent construction and prompt engineering methods | 3 | implemented | partial | Run representative routing failures, invalid tool inputs, error propagation and injected tool-output fixtures. |
| framework-python: Python and Django/Celery depth | 3 | implemented | partial | Use version-pinned minimal fixtures for task redelivery, rollback, cancellation, auth and serialization; mark live broker tests separately. |
| framework-jvm: JVM frameworks and persistence | 3 | implemented | partial | Use project wrappers and declared versions; test transaction boundaries, query behavior, coroutine cancellation and auth failures. |
| framework-php: Laravel and Rails depth | 3 | implemented | partial | Test mass assignment, tenant scoping, queue retries, rollback and mixed-version migrations on representative apps. |
| framework-mobile: Mobile and Apple platform depth | 3 | implemented | partial | Use supported simulators/devices/toolchains; test lifecycle cancellation, actor isolation, persistence, navigation and accessibility; label device-only limitations. |
| framework-web: Additional web frameworks and runtimes | 3 | implemented | partial | Exercise SSR/hydration, caching, dependency injection, request lifetimes, build/runtime module differences and accessibility. |
| framework-dotnet: C#/.NET and F# | 3 | implemented | partial | Run pinned SDK fixtures for scoped-service misuse, query translation, cancellation and serialization compatibility. |
| framework-systems: Go, Rust, C++ and Perl technical depth | 3 | implemented | partial | Use bounded compile/test fixtures with relevant race/sanitizer checks; absence of failures is limited to exercised paths. |
| framework-storage: Database engine and ORM recipes | 3 | implemented | partial | Use representative schemas, cardinalities and contention; verify generated SQL and migrations rather than generic advice. |
| specialists: Specialized review and build agents | 3 | implemented | partial | Each agent must have a distinct trigger, allowed scope, failure-specific checks, evidence contract and relevant fixtures. |
| network: Network engineering and homelabs | 3 | implemented | partial | Test offline device configs and simulated routing failures before any device mutation; never treat a generic operations profile as protocol expertise. |
| connectors: External connector recipes and discovery | 4 | implemented | partial | Test schema/transport versions and redaction; verify live accounts separately; do not claim installed/authenticated from a recipe. |
| media: Brand, media, document and design production | 3 | implemented | partial | Validate actual rendered/exported artifacts, editable sources and tool availability; never advertise a host-only skill as just-vibe content. |
| scientific: Scientific databases and literature work | 3 | implemented | partial | Verify identifiers, retrieval dates, citation support, retractions and missing data; no fabricated papers or regulatory conclusions. |
| marketing: Marketing, content, sales and investing workflows | 3 | implemented | partial | Verify claims, audience/account, draft previews, exact external side effects and evidence; no autonomous outreach based on inferred intent. |
| business-ops: Business, logistics, finance and legal operations | 3 | implemented | partial | Use synthetic records and dry-run fixtures; live financial/legal/logistics actions need task-specific authority and source verification. |
| healthcare: Healthcare software and PHI-specific methods | 3 | implemented | partial | Use synthetic/deidentified fixtures; separate software checks from clinical efficacy and legal compliance judgments. |
| blockchain: Blockchain, trading and agent payments | 3 | implemented | partial | Use local fixtures/test networks; distinguish financial assertions, reputation signals and source-verified protocol invariants. |
| vendor-bridges: Sponsored and external compute/control bridges | 4 | implemented | partial | Verify the independently installed tool/version, authenticated identity and exact external operation; unavailable services remain unavailable. |
| python-host: Standalone Python LLM provider host | 4 | implemented | partial | Run provider contract fixtures and opt-in live tests; no reuse of host credentials outside their documented boundaries. |
| operator: ECC2 operator surface, proximity and coordination | 2 | implemented | partial | Test concurrent updates, process crashes, stale PIDs, conflicting edits, queued merges, inaccessible worktrees, cancellation and exact action permissions. |
| graph: Context graph, connectors and foreign migration | 2 | implemented | partial | Test duplicates, interrupted imports, changed sources, secret filtering, retention and graph deletion; graph recall does not imply semantic embeddings. |
| scheduler: Persistent scheduled and remote work | 2 | implemented | partial | Test restart/clock drift, duplicate triggers, revoked authorization, cancellation, request validation and remote isolation. |
| observability: Operator telemetry and platform readiness | 2 | implemented | partial | Verify event identity, redaction, delivery failure, missing telemetry and status freshness; no fabricated objective quality scores. |
| maintenance: Maintainer infrastructure and release automation | 4 | implemented | partial | Run actual supported OS/host matrices and verify artifact provenance; blocked CI minutes or skipped tests cannot be labeled passing. |
| translations: Translations, examples and learning material | 4 | implemented | partial | Check translated links, preserved command semantics, stale versions and working examples; file count is not capability count. |
| adapter-depth: Additional hosts and host-native tool surfaces | 4 | implemented | partial | Test install/update/uninstall, foreign settings, event delivery, permissions and installed SDKs; record live host/OS coverage separately. |
| catalog-gui: Local graphical catalog browsers | 2 | implemented | partial | Test offline navigation/search, stale catalog versions, safe local origins and explicit installation actions. |
| auto-update: Upstream update orchestration | 2 | implemented | partial | Test dirty checkout, changed user files, offline registry, incompatible version and recovery. |

## Delivery and verification

The [recorded check results](ecc-implementation-results.md) distinguish passing local checks, isolated native installations and unavailable live/CI evidence.

All 49 planned groups now have a delivered implementation or focused host-agent method. The JSON ledger records source hashes, test locations and a specific limitation for every group. Acceptance remains partial: the separate acceptanceReview fields name observed checks and outstanding work. This does not close unrun framework, domain, host or OS acceptance requirements. The release review and subsequent correction record distinguish fixed runtime defects from those remaining checks.

Read the [operation reference](../plugins/just-vibe/references/runtime-expansion.md), [compatibility record](compatibility.md) and [website workbench guide](https://just-vibe-tools.vercel.app/docs/) (the new source page is unpublished). The local browser provides real catalog search and explicitly enabled reviewed project installs. Methods, specialists and connectors remain separately classified from executable runtime operations.

Run `npm run audit:implementation` to verify current source evidence and `npm run audit:ecc` to inspect the unchanged historical baseline. Historical local hashes are expected to differ after implementation; that is preserved rather than rewriting the old gap claims. `npm run check:localizations` checks translation freshness and command semantics. Tests do not convert subjective quality into a numeric score.

No npm publication, GitHub push, production deployment, user-host installation or paid provider run was performed as part of this implementation.
