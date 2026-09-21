# Complete ECC comparison and implementation backlog

Audit date: September 20, 2026. **There are still substantive gaps. The previous rounds closed their selected findings, not every capability in ECC.** This document supersedes those rounds as the comprehensive comparison baseline. It records remaining work; it does not mark that work as implemented.

The comparison is against [affaan-m/ECC at `2b6e839771e53096d8451a213d40dc64ec8acac0`](https://github.com/affaan-m/ECC/tree/2b6e839771e53096d8451a213d40dc64ec8acac0), whose package metadata says 2.2.2. This is a source snapshot, not a claim about the version currently published to npm. The local side is our current working tree, including all Unreleased work. Our published package remains 0.9.0; this audit does not establish that the published artifact contains the working-tree features.

## What was examined

The [full surface inventory](ecc-surface-inventory.md) maps every canonical skill, command, agent, rule file and context, plus runtime sources, hook configurations, host-specific entry points, MCP examples and CLI declarations. The [machine-readable ledger](audits/ecc-snapshot.json) records a classification and SHA-256 digest for **all 3,734 upstream files**, and hashes the local evidence used in each comparison.

| Surface | Entries |
| --- | ---: |
| Canonical skills | 292 |
| Canonical slash commands | 94 |
| Canonical agent definitions | 68 |
| Rule Markdown files, including their index | 122 |
| Context presets | 3 |
| Runtime/source files under scripts, src and ecc2, plus top-level launchers | 340 |
| Hook records in canonical hook JSON | 25 |
| Host adapter/configuration surfaces | 19 |
| Central MCP examples | 34 |
| Additional MCP examples in root/Kiro configuration | 5 |
| Codex MCP configuration entries, including commented examples | 10 |
| OpenCode native tool wrappers | 8 |
| Host-specific command/agent/hook files | 38 / 69 / 14 |
| Main ECC CLI operations | 24 |
| ECC2 Rust CLI/subcommand declarations | 72 |
| Additional integration/configuration records | 5 |
| Python provider CLI entry point | 1 |

There are **1,243 mapped surface records across 58 capability groups**. These totals overlap by design: a command can refer to a runtime file, and a host can copy a canonical skill. They are not independent feature counts or a quality score.

This is a source-level capability audit with targeted implementation inspection. It is not execution of every upstream tool, every paid integration, or a line-by-line correctness/security review of the entire upstream repository. No upstream executable was run to create the inventory. Every catalog entry is accounted for; the depth of verification is stated rather than inferred from a filename or README claim.

## Complete disposition

- **9 groups have the core purpose already covered or intentionally use a different implementation.** This includes ordinary engineering workflows, architecture/decisions, Vite, core DB methods, installation, context health, reviewed learning, continuity and deprecated compatibility surfaces.
- **31 groups contain engineering functionality or technical depth worth implementing or extending:** 7 first-priority groups and 24 second-priority groups, below.
- **18 groups contain optional products, domains, vendors or maintainer infrastructure.** They remain explicit differences. Calling them optional does not count them as implemented or make the gap disappear.

“Covered” means the scoped purpose exists, with cited local source. It does not mean identical instructions, equal model behavior or universal host parity. “Partial” is used when there are only shared primitives, lighter technical depth, or a different operational surface. A role profile is not a specialist agent; a generic backend skill is not a Quarkus guide; an external MCP example is not an installed connector.

## First-priority engineering work

| Area | Remaining work |
| --- | --- |
| Configuration inventory and cleanup | Normalize host MCP/LSP/plugin/skill/hook settings; report overlaps, orphaned files and stale permissions; support reviewed reversible cleanup. |
| Skill portfolio maintenance | Track installed versions/provenance, usage versus unobserved activity, overlap, stale references, compliance and amendment review. |
| Session management | Native session adapters, searchable history, aliases, bounded export/branch/resume, task-preserving side questions and pre-compaction snapshots. |
| Custom behavior rules | A supported rule-authoring workflow plus a real bounded evaluator, preview/explain, rule toggles and recovery. ECC's authoring instructions alone do not establish runtime enforcement. |
| MCP health | Failure classification, authenticated-state distinctions, retry/backoff and explicit reconnection. A reachable endpoint must not be reported as a working authenticated tool. |
| Hook and quality controls | Named presets, individual hook controls, repository Git enforcement, investigation gates and targeted warning recipes. |
| Security depth | Maintained advisory/IOC provenance and exact matching, plus missing authorized security methods and explicit optional analysis integrations. |

Each area has its scope, existing building blocks, implementation requirements and acceptance checks in the detailed ledger below. The order is a product recommendation, not a claim that these seven groups exhaust the gaps.

## Second-priority engineering work

The remaining 24 engineering groups are:

1. Frontend design-direction, click-path and motion-library recipes.
2. Deeper React build, review and testing examples.
3. Backend/infrastructure recipes: Kubernetes, Flox, Uncloud, latency-sensitive systems and content-hash caching.
4. Windows desktop testing and benchmark/regression methods.
5. PyTorch, recommendation-system and ML-adoption methods.
6. Additional PRD/PRP/team-orchestration templates.
7. CodeTour generation/validation and codemap freshness.
8. Bounded persistent work loops and loop diagnostics.
9. Council, multi-model disagreement and independent adversarial review modes.
10. Sustained deployment canaries, SSE/asset checks and notifications.
11. User-facing agent evaluations, replayable evidence and receipt formats.
12. Agent-harness, MCP-server and prompt-engineering methods.
13. Python/Celery depth beyond the existing Django/FastAPI guides.
14. JPA, Ktor, Exposed, Quarkus, Kotlin and tinystruct recipes.
15. Laravel and Rails recipes.
16. Android, Compose, HarmonyOS/ArkTS and Apple platform recipes.
17. Angular, Vue, Nuxt, Next/Turbopack, NestJS and Bun recipes.
18. .NET/C#/F# recipes.
19. Go/Rust/C++ and Perl technical depth.
20. PostgreSQL/MySQL/ClickHouse/Redis/Prisma recipes.
21. Focused specialist agents with distinct methods and routing.
22. Operator telemetry/export and readiness reporting.
23. Explicit update orchestration preserving installed selections and ownership.
24. AdaL, CodeBuddy, JoyCode, Kiro, OpenClaw, Pi and Trae adapters; deeper host-native tool/event integration.

Framework additions should extend conditionally loaded guides and real examples. Creating dozens of nearly identical slash-command files would not close the underlying technical-depth gaps.

## Optional differences, fully accounted for

These are not hidden omissions or commitments to clone every upstream product:

| Group | ECC surface we do not fully provide |
| --- | --- |
| Local catalog applications | ECC has both browser and Tkinter catalog managers; our website provides the catalog purpose but is not an installed desktop/offline manager. |
| Usage accounting | Per-session token/cache/spend reporting, CSV export and model-tier advice. This remains separate from output quality and convenience. |
| Terminal/services | tmux/dmux panes, detached dev servers, terminal operators and PM2 setup. |
| Network engineering | Cisco IOS, Netmiko, BGP, interface/config checks, homelabs, Pi-hole, VLANs and WireGuard. |
| Connector recipes | Named MCP examples and Jira/Confluence, search, browser, workspace and email bridges. All names are in the inventory; none are implied installed. |
| Media/design production | Taste/Tasteforge, branding, Blender/Manim/Remotion/video, slides, icons, FAL/VideoDB and document conversion/translation. |
| Scientific research | PubMed, USPTO, gget, literature reviews and scholar assessment. |
| Marketing/sales | Content, campaigns, cross-posting, SEO, lead intelligence, competitive research, investor materials and outreach. |
| Business operations | Logistics, finance/billing, procurement, inventory, production, quality, returns, agreements/e-signatures, messaging and workspace operations. |
| Healthcare | CDSS/EMR, PHI/HIPAA-specific methods and healthcare evaluation/review. |
| Blockchain/payments | x402, AMM/EVM/Keccak, trading agents, prediction markets and AURA reputation. |
| Vendor bridges | Itô and Nasiko; external scanner/bootstrap recipes. Some upstream managed compute services are explicitly unavailable. |
| Python model host | Standalone provider adapters/CLI for Claude, OpenAI, Ollama, Atlas and AstraFlow. |
| ECC2 operator product | Interactive board/TUI, SQLite daemon, proximity/conflict views, messages, team rebalance, heartbeat enforcement and merge queues. |
| Context graph/migration | Entity/relation/observation graph, connector checkpoints, pin/compact/recall and foreign workspace imports. |
| Scheduled/remote work | Persistent scheduled tasks, remote request processing and computer-use dispatch. |
| Maintainer tooling | Broader OS/Docker/host test matrices, SLSA workflows, coverage, advisory watches and repository/community automation. |
| Documentation/localization | Translations, additional project templates and longform guides. |

## Upstream limitations that affect this comparison

- **Hookify:** authoring/list/configure instructions exist, but no Hookify rule evaluator was found in the shipped scripts/hooks dispatch path. Treat this as a documented workflow, not demonstrated enforcement. [Source](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/hookify-rules/SKILL.md).
- **Evaluation gate:** the executable gate rejects execution because a verified OS isolation backend is not implemented. Capsule/receipt utilities and deterministic recorded-score registry code are separate capabilities. [Source](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/eval-harness/gate.js).
- **OpenCode dependency analyzer:** it reads declared dependencies; outdated flags are fixed false and unused count is fixed zero. The advertised broader analysis is not implemented in that wrapper. [Source](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/.opencode/tools/dependency-analyzer.ts).
- **Managed Itô services:** inference and training guides explicitly state that their managed backends are unavailable. A compute discovery/RFQ bridge is not managed inference/training. [Inference source](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/ito-inference/SKILL.md), [training source](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/ito-training/SKILL.md).
- **ECC2:** the README labels the product alpha, while current source exposes substantially more than its short feature list, including scheduling, remote dispatch, graph operations and migration. Both facts matter. This audit inventories the declared operations without claiming they all work in production. [README](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/README.md), [CLI source](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/src/main.rs).

## Implementation sequence and completion contract

1. Implement the read-only inventories and provenance needed by configuration, session, skill-health and MCP diagnostics. Share schemas and redaction; do not build four incompatible catalogs.
2. Add reversible, explicit operations on top: disable/restore configuration, session aliases, custom rules, reconnection, hook presets and update plans. No global installation or background process is implied.
3. Extend conditional technical guides and focused specialists. Each extension needs a version/source strategy, concrete failures and discriminating verification; a title or five generic bullets is insufficient.
4. Compose CodeTour, councils, bounded loops, canary monitoring and user evaluations on existing runtime contracts. Keep execution permissions, evidence freshness and cancellation intact.
5. Treat the optional control plane, scheduler, remote host and domain packs as distinct product modules. Their absence stays visible until implemented or explicitly declined.
6. For each completed group, update its disposition, exact local evidence and acceptance record, then regenerate this report. Do not mark a group complete solely because files or tests exist.

A closed engineering group needs: actual behavior or a complete scoped method; CLI/MCP/host routing where applicable; documented setup and failure/recovery paths; meaningful fixture or integration checks; explicit live-host limits; and updated catalog/docs. Paid services and untested editors remain unverified. User-approved learning, no agent attribution and no unsolicited emojis remain product requirements.

## Keeping this comparison from becoming another loop

From a repository checkout:

```sh
npm run audit:ecc -- --check
npm run audit:ecc -- --check --upstream /absolute/path/to/clean-ecc-source
```

The first command checks ledger integrity, all canonical entry-point mappings and local evidence freshness. The second additionally compares every upstream file hash and reports additions, removals and changes. Use a clean extracted source tree, not a checkout containing dependencies/build artifacts. It does not fetch code, execute upstream scripts, install hooks, call services or change host settings.

The command exits nonzero on malformed coverage, stale local evidence or upstream drift. It validates inventory completeness and freshness, not semantic equivalence. Source code presence and a hash do not prove a feature works.

To update the baseline, inspect the new upstream diff, add every new surface, revise affected requirements/dispositions and record new evidence hashes in the JSON ledger. Update source counts and the explanatory sections here, then run `npm run audit:ecc -- --render` to regenerate the inventory and detailed requirements. Review those changes before treating a new snapshot as covered. No unreviewed source update is silently accepted.

This provides one finite, reviewable backlog for the pinned snapshot. Future ECC additions are changes against that baseline, not newly discovered omissions from the same comparison. Permanent parity with a moving repository cannot be promised.

## Detailed requirements and evidence

<!-- BEGIN GENERATED REQUIREMENTS -->

<a id="workflow"></a>

### General engineering workflows

**Disposition:** covered. **Priority:** existing.

**Current:** Source-aware planning, specifications, implementation, debugging, cleanup, review and verification have maintained methods.

**Difference:** ECC uses different names and some more prescriptive sequences; naming and command counts do not establish quality.

**Requires:** Keep concrete workflow contracts and evidence-based completion; add only a separately identified method gap.

**Acceptance:** Existing method fixtures and live-host samples remain evidence for their tested cases only.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/build/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/plan/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/review/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/test/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/verify/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/scope/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/orient/SKILL.md).

**Upstream examples:** [agents/build-error-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/build-error-resolver.md), [agents/code-explorer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/code-explorer.md), [agents/code-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/code-reviewer.md), [agents/code-simplifier.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/code-simplifier.md), [agents/doc-updater.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/doc-updater.md), [agents/docs-lookup.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/docs-lookup.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="architecture"></a>

### Architecture and decision methods

**Disposition:** covered. **Priority:** existing.

**Current:** Eight architecture workflows and eight decision workflows cover boundaries, contracts, scale, ADRs and revisiting assumptions.

**Difference:** The basic architectural purpose is present; ECC-specific templates are not byte-for-byte equivalents.

**Requires:** Reuse current architecture and decision workflows; preserve concrete source and constraints.

**Acceptance:** A decision record must identify alternatives, evidence, reversible choices and a revisit trigger.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/arch-boundaries/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/decision-adr/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/decision-revisit/SKILL.md).

**Upstream examples:** [agents/architect.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/architect.md), [agents/code-architect.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/code-architect.md), [skills/architecture-decision-records/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/architecture-decision-records/SKILL.md), [skills/hexagonal-architecture/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/hexagonal-architecture/SKILL.md), [skills/recursive-decision-ledger/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/recursive-decision-ledger/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="frontend"></a>

### Frontend interaction and design methods

**Disposition:** partial. **Priority:** P2.

**Current:** UI, accessibility, motion, responsiveness, state and visual-diff workflows are present with icon and reduced-motion constraints.

**Difference:** Missing dedicated design-direction, motion-library and product click-path recipes; no bundled design-media pipeline.

**Requires:** Extend conditional guides for motion libraries, click-path audits, design-system extraction and evidence from real browser states.

**Acceptance:** Verify keyboard/focus, reduced motion, page transitions, loading/failure states and widths in a browser; do not equate generated screenshots with shipped UI.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/ui-motion/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ui-flow/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ui-system/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ui-accessibility/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/design/SKILL.md).

**Upstream examples:** [agents/a11y-architect.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/a11y-architect.md), [rules/web/coding-style.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/web/coding-style.md), [rules/web/design-quality.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/web/design-quality.md), [rules/web/hooks.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/web/hooks.md), [rules/web/patterns.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/web/patterns.md), [rules/web/performance.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/web/performance.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="react"></a>

### React-specific work

**Disposition:** partial. **Priority:** P2.

**Current:** Eight focused React workflows plus framework rules cover effects, state, forms, async behavior, rendering and hydration.

**Difference:** ECC has additional worked React testing/build/review material; comparable method coverage is not proof of equal example depth.

**Requires:** Audit repository-specific React test/build cases and add missing focused examples, keeping framework-version distinctions.

**Acceptance:** Use discriminating state, cancellation, hydration and interaction tests; profile before claiming render improvements.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/react-audit/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/react-rerenders/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/test-unit/SKILL.md), [rule-packs.mjs](../plugins/just-vibe/scripts/lib/rule-packs.mjs).

**Upstream examples:** [agents/react-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/react-build-resolver.md), [agents/react-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/react-reviewer.md), [commands/react-build.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/react-build.md), [commands/react-review.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/react-review.md), [commands/react-test.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/react-test.md), [rules/react/coding-style.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/react/coding-style.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="vite"></a>

### Vite tooling

**Disposition:** covered. **Priority:** existing.

**Current:** Eight Vite workflows cover setup, config, HMR, environment, bundles, chunks, assets and upgrades.

**Difference:** No separate missing Vite tool was established at this snapshot; framework combinations are recorded in framework-web.

**Requires:** Maintain installed-version checks and application-specific build evidence.

**Acceptance:** Verify HMR/build behavior in the actual repository rather than counting configuration fields.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/vite-config/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/vite-hmr/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/vite-upgrade/SKILL.md).

**Upstream examples:** [skills/vite-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/vite-patterns/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="backend"></a>

### Backend, deployment and infrastructure depth

**Disposition:** partial. **Priority:** P2.

**Current:** API/backend, container, deployment, incident and reliability workflows exist.

**Difference:** No dedicated Kubernetes or Flox environment recipes, latency-critical systems method, Uncloud deployment recipe or content-hash-cache example.

**Requires:** Add conditional deployment/environment guides with real prerequisites, rollback and resource bounds; separate optional services from built-in tools.

**Acceptance:** Exercise representative health/rollback, signal/shutdown, retry and environment-reproduction failures on the selected stack.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/backend-resilience/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ops-container/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/deploy/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/backend-cache/SKILL.md).

**Upstream examples:** [skills/content-hash-cache-pattern/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/content-hash-cache-pattern/SKILL.md), [skills/deployment-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/deployment-patterns/SKILL.md), [skills/docker-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/docker-patterns/SKILL.md), [skills/flox-environments/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/flox-environments/SKILL.md), [skills/kubernetes-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/kubernetes-patterns/SKILL.md), [skills/latency-critical-systems/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/latency-critical-systems/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="database"></a>

### Database core methods

**Disposition:** covered. **Priority:** existing.

**Current:** Schema, migrations, queries, query plans, indexes, locks, integrity and access have specialized workflows.

**Difference:** Engine-specific recipes are separate depth gaps; generic DB workflows must not be used to declare engine parity.

**Requires:** Retain current core methods and extend only the missing engine guides.

**Acceptance:** Changes must use schema/transaction evidence and representative plan or concurrency checks.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/db-migrate/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/db-explain/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/db-locks/SKILL.md).

**Upstream examples:** [agents/database-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/database-reviewer.md), [skills/database-migrations/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/database-migrations/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="testing"></a>

### Test and regression workflows

**Disposition:** partial. **Priority:** P2.

**Current:** Unit, integration, E2E, property, regression, flaky, fixture and load methods exist, with proof artifacts and host trials.

**Difference:** Dedicated Windows desktop automation, cross-agent regression recipes and repository-independent benchmark optimization loops are not bundled.

**Requires:** Add platform-specific desktop and benchmark guides only with actual runners and versioned fixtures; retain hypothesis-driven testing.

**Acceptance:** Record platform/browser/host versions, failure cases and limits; avoid arbitrary coverage targets as a substitute for meaningful tests.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/test/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/test-e2e/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/test-property/SKILL.md), [proof.mjs](../plugins/just-vibe/scripts/lib/proof.mjs).

**Upstream examples:** [agents/e2e-runner.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/e2e-runner.md), [agents/tdd-guide.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/tdd-guide.md), [skills/ai-regression-testing/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/ai-regression-testing/SKILL.md), [skills/benchmark/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/benchmark/SKILL.md), [skills/benchmark-optimization-loop/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/benchmark-optimization-loop/SKILL.md), [skills/e2e-testing/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/e2e-testing/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="security"></a>

### Security review and scans

**Disposition:** partial. **Priority:** P1.

**Current:** Technical security methods, a native static configuration scanner, SARIF/JSON/Markdown reports and an explicitly trusted AgentShield bridge exist.

**Difference:** No maintained supply-chain IOC feed/scanner, dedicated authorized bounty workflow, or GateGuard-style pre-edit fact collection. External InsAIts integration is also absent.

**Requires:** Add an advisory-source provenance model and exact package/version/config matching; separate static heuristics, verified exploits and optional model analysis.

**Acceptance:** Test stale/adversarial advisories, exact version matching, redaction and no-execution scans; never report unsupported CVE findings.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/security/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/security-dependencies/SKILL.md), [security-audit.mjs](../plugins/just-vibe/scripts/lib/security-audit.mjs), [config-scan.mjs](../plugins/just-vibe/scripts/lib/config-scan.mjs).

**Upstream examples:** [agents/security-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/security-reviewer.md), [scripts/ecc.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ecc.js), [commands/security-scan.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/security-scan.md), [scripts/ci/scan-supply-chain-iocs.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ci/scan-supply-chain-iocs.js), [scripts/ci/supply-chain-advisory-sources.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ci/supply-chain-advisory-sources.js), [scripts/hooks/insaits-security-wrapper.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/insaits-security-wrapper.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="ml"></a>

### ML methods and specialized libraries

**Disposition:** partial. **Priority:** P2.

**Current:** Thirty-two ML workflows, eight LLM workflows and ML profiles cover data, training, evaluation and serving.

**Difference:** Missing dedicated PyTorch build/debug recipes, recommender-system architecture and ML adoption playbook; generic ML breadth is not their implementation.

**Requires:** Add conditional guides for autograd/device/distributed training, retrieval/ranking evaluation, online-offline skew and staged ML adoption.

**Acceptance:** Use small CPU fixtures for library bugs, time/entity splits and ranking metrics; expensive training remains an explicitly requested action.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/ml-debug-training/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ml-leakage/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ml-serving/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/llm-rag/SKILL.md).

**Upstream examples:** [agents/mle-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/mle-reviewer.md), [agents/pytorch-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/pytorch-build-resolver.md), [agents/rag-pipeline-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/rag-pipeline-reviewer.md), [skills/cost-aware-llm-pipeline/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/cost-aware-llm-pipeline/SKILL.md), [skills/ml-adoption-playbook/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/ml-adoption-playbook/SKILL.md), [skills/mle-workflow/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/mle-workflow/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="learning"></a>

### Reviewed learning and memory adaptation

**Disposition:** alternative. **Priority:** existing.

**Current:** Feedback, negative lessons, conditional preferences, versioned overlays, approval, evolution, imports, exports and rollback are implemented.

**Difference:** ECC has confidence-scored instincts, observer processes and skill amendments; our explicit review model intentionally differs from automatic confidence promotion.

**Requires:** Keep learning provenance and approval boundaries; any new automatic promotion needs separate evidence and a deliberate product decision.

**Acceptance:** Test conflicting lessons, rejection persistence, project/user isolation, stale revisions and rollback without restoring rejected behavior.

**Local evidence:** [adaptive-learning.mjs](../plugins/just-vibe/scripts/lib/adaptive-learning.mjs), [pattern-learning.mjs](../plugins/just-vibe/scripts/lib/pattern-learning.mjs), [adaptive.md](../plugins/just-vibe/references/adaptive.md).

**Upstream examples:** [commands/evolve.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/evolve.md), [commands/instinct-export.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/instinct-export.md), [commands/instinct-import.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/instinct-import.md), [commands/instinct-status.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/instinct-status.md), [commands/learn.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/learn.md), [commands/learn-eval.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/learn-eval.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="install"></a>

### Install, discovery and owned-file lifecycle

**Disposition:** covered. **Priority:** existing.

**Current:** Guided install, pack/profile selection, bundled cache retention, host adapters, conflict detection, update/doctor/uninstall and workflow discovery exist.

**Difference:** ECC exposes different command names; automatic upstream fetching and additional host support are separately listed.

**Requires:** Preserve current ownership-aware lifecycle rather than duplicating commands merely for name parity.

**Acceptance:** Run isolated install/update/uninstall and package-manager archive checks; preserve unrelated settings and user edits.

**Local evidence:** [guided-setup.mjs](../plugins/just-vibe/scripts/lib/guided-setup.mjs), [managed-files.mjs](../plugins/just-vibe/scripts/lib/managed-files.mjs), [installer.mjs](../plugins/just-vibe/scripts/installer.mjs), [SKILL.md](../plugins/just-vibe/skills/tools/SKILL.md).

**Upstream examples:** [scripts/ecc.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ecc.js), [commands/ecc-guide.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/ecc-guide.md), [commands/setup-pm.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/setup-pm.md), [install.ps1](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/install.ps1), [install.sh](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/install.sh), [scripts/build-opencode.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/build-opencode.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="continuity"></a>

### Goals, handoffs and portable context

**Disposition:** alternative. **Priority:** existing.

**Current:** Persistent goals, checkpoints, scoped vaults, instruction memory and reviewed context transfer already work.

**Difference:** ECC additionally imports foreign session/memory stores; native transcript session browsing and context-graph connectors are distinct gaps.

**Requires:** Keep current continuity formats stable; add foreign import adapters only with scoped consent and explicit provenance.

**Acceptance:** Preserve collisions, reset imported verification and reject secret-bearing or execution-permission transfers.

**Local evidence:** [continuity.mjs](../plugins/just-vibe/scripts/lib/continuity.mjs), [vault.mjs](../plugins/just-vibe/scripts/lib/vault.mjs), [portable-context.mjs](../plugins/just-vibe/scripts/lib/portable-context.mjs), [goals.mjs](../plugins/just-vibe/scripts/lib/goals.mjs).

**Upstream examples:** [scripts/ecc.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ecc.js), [commands/checkpoint.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/checkpoint.md), [commands/resume-session.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/resume-session.md), [commands/save-session.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/save-session.md), [mcp-configs/mcp-servers.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/mcp-configs/mcp-servers.json), [scripts/lib/memory-vault-format.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/memory-vault-format.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="orchestration"></a>

### Planning, workers, worktrees and GitHub epics

**Disposition:** partial. **Priority:** P2.

**Current:** Bounded worker processes, DAG phases, structured results, reviewed apply/undo, plan canvas and GitHub epic coordination are implemented.

**Difference:** ECC has additional PRD/PRP templates, team-building/delegation conventions and cross-provider roles; no equivalent tmux control plane or continuous scheduler exists here.

**Requires:** Add reusable phase templates and review modes on existing workers; separate autonomous schedulers and terminal management as larger features.

**Acceptance:** Test dependency failure, stale acceptance, retry bounds, cancellation, retained dirty worktrees and exact publication recovery.

**Local evidence:** [orchestration.mjs](../plugins/just-vibe/scripts/lib/orchestration.mjs), [workers.mjs](../plugins/just-vibe/scripts/lib/workers.mjs), [github-coordination.mjs](../plugins/just-vibe/scripts/lib/github-coordination.mjs), [plan-canvas.mjs](../plugins/just-vibe/scripts/lib/plan-canvas.mjs).

**Upstream examples:** [commands/epic-claim.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/epic-claim.md), [commands/epic-decompose.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/epic-decompose.md), [commands/epic-publish.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/epic-publish.md), [commands/epic-review.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/epic-review.md), [commands/epic-sync.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/epic-sync.md), [commands/epic-unblock.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/epic-unblock.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="quality"></a>

### Automated quality gates and hook tuning

**Disposition:** partial. **Priority:** P1.

**Current:** Toolchain detection, trusted check presets, batched formatting, staged-content checks and before-action guards exist.

**Difference:** Missing named minimal/standard/strict hook profiles, arbitrary per-hook toggles, native repository pre-push enforcement, console/doc/design-specific hook recipes and session investigation gates.

**Requires:** Provide explicit presets and inspectable hook selection; native Git hook installation must be repository-scoped and preserve existing hooks.

**Acceptance:** Exercise hooks from ordinary Git clients as well as agents, partial staging, paths/quoting, failure timeouts and independent toggles.

**Local evidence:** [automation.mjs](../plugins/just-vibe/scripts/lib/automation.mjs), [quality.mjs](../plugins/just-vibe/scripts/lib/quality.mjs), [action-policy.mjs](../plugins/just-vibe/scripts/lib/action-policy.mjs).

**Upstream examples:** [commands/quality-gate.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/quality-gate.md), [hooks/hooks.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/hooks/hooks.json), [scripts/lib/hooks-config.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/hooks-config.js), [scripts/codex-git-hooks/pre-commit](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/codex-git-hooks/pre-commit), [scripts/codex-git-hooks/pre-push](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/codex-git-hooks/pre-push), [scripts/codex/install-global-git-hooks.sh](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/codex/install-global-git-hooks.sh). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="context-health"></a>

### Context, repetition and scope signals

**Disposition:** covered. **Priority:** existing.

**Current:** Host-reported context metrics, stale-data handling, repetition hashes, scope warnings and a Claude statusline bridge exist.

**Difference:** ECC combines this with cost estimates; we intentionally keep cost accounting distinct from context health.

**Requires:** Preserve known/unknown/stale distinctions; do not synthesize usage numbers from prompt length.

**Acceptance:** Test session isolation, unknown and stale metrics, debounce and actual hook delivery.

**Local evidence:** [context-health.mjs](../plugins/just-vibe/scripts/lib/context-health.mjs), [context-statusline.mjs](../plugins/just-vibe/scripts/context-statusline.mjs).

**Upstream examples:** [hooks/hooks.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/hooks/hooks.json), [scripts/hooks/ecc-statusline.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/ecc-statusline.js), [scripts/hooks/suggest-compact.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/suggest-compact.js), [skills/context-budget/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/context-budget/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="config-audit"></a>

### Cross-host configuration inventory and cleanup

**Disposition:** partial. **Priority:** P1.

**Current:** Configuration security scans, executable discovery and owned-install doctor exist.

**Difference:** Missing a normalized cross-host MCP/LSP/plugin inventory, duplicate/conflicting servers, orphaned hooks/permissions/caches, skill overlap and reversible cleanup of non-owned configuration.

**Requires:** Build read-only scoped inventories with redaction, then exact reviewable backup/disable/restore operations; age alone must not imply deletion.

**Acceptance:** Test mixed Claude/Codex/OpenCode formats, malformed data, secrets, symlinks, duplicates, user edits and rollback.

**Local evidence:** [config-scan.mjs](../plugins/just-vibe/scripts/lib/config-scan.mjs), [discovery.mjs](../plugins/just-vibe/scripts/lib/discovery.mjs), [editor-adapters.mjs](../plugins/just-vibe/scripts/lib/editor-adapters.mjs).

**Upstream examples:** [agents/harness-optimizer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/harness-optimizer.md), [commands/harness-audit.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/harness-audit.md), [scripts/harness-audit.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/harness-audit.js), [scripts/lib/inspection.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/inspection.js), [scripts/lib/mcp-inventory/canonical-mcp.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/mcp-inventory/canonical-mcp.js), [scripts/lib/mcp-inventory/collect.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/mcp-inventory/collect.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="skill-health"></a>

### Skill portfolio maintenance

**Disposition:** partial. **Priority:** P1.

**Current:** Our activity report tracks selection, delivery, observations and lessons; skill creation has a workflow.

**Difference:** Missing third-party skill stocktaking, duplicate/overlap review, reference freshness, installed-source compliance, per-skill version/provenance dashboard and amendment queues.

**Requires:** Add inventory and provenance plus evidence-linked human review outcomes; distinguish tool completion from successful user outcomes.

**Acceptance:** Test never-used versus unobserved, version changes, conflicting amendments and broken links; no objective quality claim from raw invocation counts.

**Local evidence:** [activity.mjs](../plugins/just-vibe/scripts/lib/activity.mjs), [adaptive-learning.mjs](../plugins/just-vibe/scripts/lib/adaptive-learning.mjs), [SKILL.md](../plugins/just-vibe/skills/skill/SKILL.md).

**Upstream examples:** [commands/skill-create.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/skill-create.md), [commands/skill-health.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/skill-health.md), [scripts/lib/skill-evolution/dashboard.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/skill-evolution/dashboard.js), [scripts/lib/skill-evolution/health.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/skill-evolution/health.js), [scripts/lib/skill-evolution/index.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/skill-evolution/index.js), [scripts/lib/skill-evolution/provenance.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/skill-evolution/provenance.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="custom-hooks"></a>

### User-authored behavior rules

**Disposition:** absent. **Priority:** P1.

**Current:** Current hooks and policies are maintained built-in behaviors, with configured command checks.

**Difference:** No Hookify-style authoring/list/configure workflow. ECC documents declarative warn/block rules, but this audit found no Hookify evaluator wired into its shipped hook dispatcher; enforcement must not be assumed from rule files alone.

**Requires:** Create a versioned declarative rule schema with bounded matchers, preview/explain, enable/disable and recovery; avoid arbitrary evaluator code or pathological regex execution.

**Acceptance:** Test event shapes, Boolean conditions, path scope, non-matches, invalid patterns, rule conflicts, latency bounds and safe failure behavior.

**Local evidence:** [action-policy.mjs](../plugins/just-vibe/scripts/lib/action-policy.mjs), [automation.mjs](../plugins/just-vibe/scripts/lib/automation.mjs).

**Upstream examples:** [agents/conversation-analyzer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/conversation-analyzer.md), [commands/hookify.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/hookify.md), [commands/hookify-configure.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/hookify-configure.md), [commands/hookify-help.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/hookify-help.md), [commands/hookify-list.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/hookify-list.md), [skills/hookify-rules/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/hookify-rules/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="mcp-health"></a>

### MCP connection health and recovery

**Disposition:** absent. **Priority:** P1.

**Current:** The bundled MCP server has protocol/access checks; discovery reports host-supplied capability evidence.

**Difference:** No host-wide MCP preflight reachability state, failure categorization, reconnect/backoff or cross-harness configuration normalization.

**Requires:** Expose status and bounded diagnostics separately from explicit reconnection; endpoint reachability is not authenticated tool availability.

**Acceptance:** Test OAuth expiry, 401/403/429, timeouts, stdio processes, no double execution, secret redaction and backoff.

**Local evidence:** [mcp-server.mjs](../plugins/just-vibe/scripts/lib/mcp-server.mjs), [discovery.mjs](../plugins/just-vibe/scripts/lib/discovery.mjs).

**Upstream examples:** [hooks/hooks.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/hooks/hooks.json), [scripts/hooks/mcp-health-check.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/mcp-health-check.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="sessions"></a>

### Native session history and lifecycle snapshots

**Disposition:** partial. **Priority:** P1.

**Current:** Just-vibe run records, task history, checkpoints, handoffs and cross-worktree context export exist.

**Difference:** Missing native Claude/OpenCode/Codex transcript session adapters, aliases/search/pagination, session inspect/branch/export, interruption-side-question contract and model-generated PreCompact summaries.

**Requires:** Create opt-in adapters for user-visible session content, stable IDs/aliases and bounded previews; build explicit pre-compaction capture without reading private model reasoning.

**Acceptance:** Test corrupt/partial/large logs, cross-project isolation, alias collisions, privacy, stale paths and resume without lost active-task constraints.

**Local evidence:** [run.mjs](../plugins/just-vibe/scripts/lib/run.mjs), [continuity.mjs](../plugins/just-vibe/scripts/lib/continuity.mjs), [assistant-runtime.mjs](../plugins/just-vibe/scripts/lib/assistant-runtime.mjs).

**Upstream examples:** [scripts/ecc.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ecc.js), [commands/aside.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/aside.md), [commands/sessions.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/sessions.md), [hooks/codex-hooks.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/hooks/codex-hooks.json), [hooks/hooks.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/hooks/hooks.json), [scripts/claw.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/claw.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="cost"></a>

### Optional usage accounting and model advice

**Disposition:** absent. **Priority:** optional.

**Current:** Context capacity and ML/LLM cost-planning workflows exist; no account-spend ledger is maintained.

**Difference:** ECC records cumulative per-session token/cache usage, estimates spend, exports reports and recommends model tiers.

**Requires:** If added, consume actual host usage, deduplicate cumulative snapshots and version pricing; offer advisory model selection separately from automatic switching.

**Acceptance:** Test missing prices, stale rates, snapshots, currencies and multiple sessions; usage and cost must never be presented as output-quality scores.

**Local evidence:** [context-health.mjs](../plugins/just-vibe/scripts/lib/context-health.mjs), [SKILL.md](../plugins/just-vibe/skills/llm-cost/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ml-training-cost/SKILL.md).

**Upstream examples:** [commands/cost-report.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/cost-report.md), [commands/model-route.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/model-route.md), [hooks/hooks.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/hooks/hooks.json), [scripts/hooks/cost-tracker.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/cost-tracker.js), [scripts/hooks/ecc-metrics-bridge.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/ecc-metrics-bridge.js), [scripts/lib/session-cost-snapshot.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/session-cost-snapshot.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="codemaps"></a>

### CodeTour artifacts and maintained codemaps

**Disposition:** partial. **Priority:** P2.

**Current:** Explain, map, architecture mapping and documentation workflows exist.

**Difference:** No dedicated CodeTour .tour generator/validator or codemap freshness/diff tooling.

**Requires:** Add referenced, bounded walkthrough artifacts with reader intent and file/line anchors; track source identities so stale tours are visible.

**Acceptance:** Reject missing paths and invalid lines; test source moves, stale anchors and regeneration without overwriting hand edits.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/map/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/explain/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/docs/SKILL.md).

**Upstream examples:** [commands/update-codemaps.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/update-codemaps.md), [scripts/codemaps/generate.ts](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/codemaps/generate.ts), [skills/code-tour/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/code-tour/SKILL.md), [skills/documentation-lookup/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/documentation-lookup/SKILL.md), [skills/living-docs-governance/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/living-docs-governance/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="loops"></a>

### Bounded iterative and continuous work modes

**Disposition:** partial. **Priority:** P2.

**Current:** Goals and worker DAGs support bounded tasks and explicit retries.

**Difference:** No persistent continuous-PR/RFC loop manager, loop wakeup/transcript inspector, loop design preflight or autonomous runtime that starts later sessions.

**Requires:** Design a resumable loop state machine with progress evidence, timeout/attempt/spend limits and explicit stop/cancel; use host scheduling when available.

**Acceptance:** Test duplicate wakeups, stuck tools, repeated failure, restarts, cancellation and clean shutdown; no infinite default loops.

**Local evidence:** [goals.mjs](../plugins/just-vibe/scripts/lib/goals.mjs), [orchestration.mjs](../plugins/just-vibe/scripts/lib/orchestration.mjs).

**Upstream examples:** [agents/loop-operator.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/loop-operator.md), [scripts/ecc.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ecc.js), [commands/loop-start.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/loop-start.md), [commands/loop-status.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/loop-status.md), [scripts/loop-status.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/loop-status.js), [skills/agent-introspection-debugging/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/agent-introspection-debugging/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="council"></a>

### Independent council and adversarial review modes

**Disposition:** partial. **Priority:** P2.

**Current:** Decision/challenge workflows and independent specialist workers provide building blocks.

**Difference:** No packaged council, multi-model dissent, two-independent-reviewer convergence, generator/evaluator harness or evidence-based self-reflection contract.

**Requires:** Compose explicit independent review briefs, budgets, stopping rules and disagreement reports on existing worker orchestration; label subjective assessment.

**Acceptance:** Verify independent context, genuine disagreement, bounded repair loops and unresolved verdicts; reviewers cannot self-certify success.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/challenge/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/decide/SKILL.md), [specialists.mjs](../plugins/just-vibe/scripts/lib/specialists.mjs), [orchestration.mjs](../plugins/just-vibe/scripts/lib/orchestration.mjs).

**Upstream examples:** [agents/gan-evaluator.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/gan-evaluator.md), [agents/gan-generator.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/gan-generator.md), [agents/gan-planner.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/gan-planner.md), [commands/gan-build.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/gan-build.md), [commands/gan-design.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/gan-design.md), [commands/santa-loop.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/santa-loop.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="terminal"></a>

### Terminal and development-service operations

**Disposition:** absent. **Priority:** optional.

**Current:** Worker subprocesses and worktrees exist but are not a terminal multiplexer or service manager.

**Difference:** No tmux/dmux pane orchestration, terminal opener/operator, detached development-server hooks or PM2 service-config workflow.

**Requires:** Add optional terminal/service adapters with executable discovery, process ownership, preview, stop and restart; never silently install global tools.

**Acceptance:** Test quoting, already-running services, occupied ports, restart recovery, Windows/WSL limitations and cleanup of owned processes only.

**Local evidence:** [workers.mjs](../plugins/just-vibe/scripts/lib/workers.mjs), [process.mjs](../plugins/just-vibe/scripts/lib/process.mjs).

**Upstream examples:** [commands/pm2.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/pm2.md), [scripts/hooks/auto-tmux-dev.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/auto-tmux-dev.js), [scripts/hooks/pre-bash-dev-server-block.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/pre-bash-dev-server-block.js), [scripts/hooks/pre-bash-tmux-reminder.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/pre-bash-tmux-reminder.js), [scripts/lib/platform-launch.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/platform-launch.js), [scripts/lib/tmux-worktree-orchestrator.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/tmux-worktree-orchestrator.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="canary"></a>

### Sustained post-deploy monitoring and notifications

**Disposition:** partial. **Priority:** P2.

**Current:** Deployment verification, Vercel runtime/performance checks, browser evidence and operational workflows exist.

**Difference:** No sustained canary watch with interval/duration, staging-production diff, SSE heartbeat checks or cross-platform desktop completion notifications.

**Requires:** Add bounded explicit monitoring with baseline identity, change-only alerts and cancellation; distinguish a one-shot check from a scheduler.

**Acceptance:** Exercise failed assets, wrong content types, SSE inactivity, transient errors, notification opt-in and stop behavior.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/vercel-release-check/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ops-observability/SKILL.md), [evidence.mjs](../plugins/just-vibe/scripts/lib/evidence.mjs).

**Upstream examples:** [hooks/hooks.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/hooks/hooks.json), [ecc2/src/notifications.rs](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/src/notifications.rs), [scripts/hooks/desktop-notify.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/desktop-notify.js), [scripts/hooks/post-bash-build-complete.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/post-bash-build-complete.js), [skills/canary-watch/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/canary-watch/SKILL.md), [skills/unified-notifications-ops/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/unified-notifications-ops/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="eval"></a>

### User-facing harness evaluation and evidence receipts

**Disposition:** partial. **Priority:** P2.

**Current:** Maintainer behavior/security/host trials and user proof/lab/experiment artifacts are available.

**Difference:** No general cross-agent task-suite CLI, canonical evaluation capsule/replay format, effect-fenced portable receipts or harness configuration promotion registry. ECC gate execution is explicitly unavailable without isolation at this snapshot.

**Requires:** Define immutable input/artifact identities, trusted verifier execution, repeatable fixtures and comparison reports; keep quality judgments and observed outcomes separate.

**Acceptance:** Test artifact tampering, stale evidence, checker access, inconclusive runs and reproducibility; cryptographic hashes are not proof that claimed observations are true.

**Local evidence:** [proof.mjs](../plugins/just-vibe/scripts/lib/proof.mjs), [experiments.mjs](../plugins/just-vibe/scripts/lib/experiments.mjs), [harness.mjs](../evals/behavior/harness.mjs), `scripts/eval-live-hosts.mjs` (repository checkout).

**Upstream examples:** [agents/agent-evaluator.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/agent-evaluator.md), [ecc2/src/harness_eval.rs](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/src/harness_eval.rs), [scripts/eval-harness.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/eval-harness.js), [scripts/lib/eval-harness/canonical.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/eval-harness/canonical.js), [scripts/lib/eval-harness/capsule.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/eval-harness/capsule.js), [scripts/lib/eval-harness/effect-fence.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/eval-harness/effect-fence.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="agent-engineering"></a>

### Agent construction and prompt engineering methods

**Disposition:** partial. **Priority:** P2.

**Current:** LLM prompt/tool/eval/injection workflows and a skill-authoring workflow exist.

**Difference:** Missing specific agent harness construction, introspection audits, MCP server implementation recipes, routing-surface design and reusable prompt-optimization procedures.

**Requires:** Add focused conditional engineering guides with tool contracts, state ownership, retries and evaluation cases; do not add opaque quality scores.

**Acceptance:** Run representative routing failures, invalid tool inputs, error propagation and injected tool-output fixtures.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/llm-tools/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/llm-prompt/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/llm-evals/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/skill/SKILL.md).

**Upstream examples:** [skills/agent-harness-construction/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/agent-harness-construction/SKILL.md), [skills/agent-sort/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/agent-sort/SKILL.md), [skills/api-connector-builder/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/api-connector-builder/SKILL.md), [skills/iterative-retrieval/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/iterative-retrieval/SKILL.md), [skills/mcp-server-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/mcp-server-patterns/SKILL.md), [skills/prompt-optimizer/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/prompt-optimizer/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="framework-python"></a>

### Python and Django/Celery depth

**Disposition:** partial. **Priority:** P2.

**Current:** Python rules and Django/FastAPI conditional guides exist.

**Difference:** ECC includes larger Python test/pattern examples and a dedicated Celery task/queue/transaction guide; current guides are not complete equivalents.

**Requires:** Extend guides for broker delivery, task retry/idempotency, on-commit publication, async boundary tests and Python packaging/runtime behavior.

**Acceptance:** Use version-pinned minimal fixtures for task redelivery, rollback, cancellation, auth and serialization; mark live broker tests separately.

**Local evidence:** [rule-packs.mjs](../plugins/just-vibe/scripts/lib/rule-packs.mjs), [django.md](../plugins/just-vibe/references/frameworks/django.md), [fastapi.md](../plugins/just-vibe/references/frameworks/fastapi.md).

**Upstream examples:** [agents/django-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/django-build-resolver.md), [agents/django-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/django-reviewer.md), [agents/fastapi-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/fastapi-reviewer.md), [agents/python-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/python-reviewer.md), [commands/fastapi-review.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/fastapi-review.md), [commands/python-review.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/python-review.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="framework-jvm"></a>

### JVM frameworks and persistence

**Disposition:** partial. **Priority:** P2.

**Current:** Java/Kotlin rules and a Spring Boot guide exist.

**Difference:** Missing dedicated JPA, Ktor, Exposed, Quarkus patterns/security/test/verification and tinystruct guides; Kotlin coroutine/testing depth is lighter.

**Requires:** Add framework-aware conditional recipes for transactions, persistence, cancellation, security filters and test environments.

**Acceptance:** Use project wrappers and declared versions; test transaction boundaries, query behavior, coroutine cancellation and auth failures.

**Local evidence:** [rule-packs.mjs](../plugins/just-vibe/scripts/lib/rule-packs.mjs), [spring-boot.md](../plugins/just-vibe/references/frameworks/spring-boot.md).

**Upstream examples:** [agents/java-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/java-build-resolver.md), [agents/java-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/java-reviewer.md), [agents/kotlin-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/kotlin-build-resolver.md), [agents/kotlin-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/kotlin-reviewer.md), [commands/gradle-build.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/gradle-build.md), [commands/kotlin-build.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/kotlin-build.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="framework-php"></a>

### Laravel and Rails depth

**Disposition:** partial. **Priority:** P2.

**Current:** PHP/Ruby rules and generic backend/security/test workflows exist.

**Difference:** Missing dedicated Laravel patterns, security, tests, verification and plugin discovery, and substantial Rails-specific implementation recipes.

**Requires:** Add conditional framework guides with migrations, policies, ORM scope, jobs, transactions and version-aware testing.

**Acceptance:** Test mass assignment, tenant scoping, queue retries, rollback and mixed-version migrations on representative apps.

**Local evidence:** [rule-packs.mjs](../plugins/just-vibe/scripts/lib/rule-packs.mjs), [SKILL.md](../plugins/just-vibe/skills/backend-service/SKILL.md).

**Upstream examples:** [agents/php-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/php-reviewer.md), [rules/php/coding-style.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/php/coding-style.md), [rules/php/hooks.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/php/hooks.md), [rules/php/patterns.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/php/patterns.md), [rules/php/security.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/php/security.md), [rules/php/testing.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/php/testing.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="framework-mobile"></a>

### Mobile and Apple platform depth

**Disposition:** partial. **Priority:** P2.

**Current:** Flutter/React Native guides and Kotlin/Swift rules exist.

**Difference:** Missing Android clean architecture, Compose Multiplatform, HarmonyOS/ArkTS, SwiftUI, actor persistence, Swift 6.2 concurrency, protocol-DI testing, on-device Foundation Models and Liquid Glass recipes.

**Requires:** Add platform/version-specific guides and specialist checks; preserve accessibility, offline and lifecycle semantics.

**Acceptance:** Use supported simulators/devices/toolchains; test lifecycle cancellation, actor isolation, persistence, navigation and accessibility; label device-only limitations.

**Local evidence:** [flutter.md](../plugins/just-vibe/references/frameworks/flutter.md), [react-native.md](../plugins/just-vibe/references/frameworks/react-native.md), [rule-packs.mjs](../plugins/just-vibe/scripts/lib/rule-packs.mjs).

**Upstream examples:** [agents/dart-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/dart-build-resolver.md), [agents/flutter-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/flutter-reviewer.md), [agents/harmonyos-app-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/harmonyos-app-resolver.md), [agents/swift-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/swift-build-resolver.md), [agents/swift-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/swift-reviewer.md), [commands/flutter-build.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/flutter-build.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="framework-web"></a>

### Additional web frameworks and runtimes

**Disposition:** partial. **Priority:** P2.

**Current:** Vue/Angular rules, React/Vite workflows and generic frontend/backend methods exist.

**Difference:** Missing substantial Angular/Vue guides, Nuxt 4, Next.js/Turbopack, NestJS, Bun runtime and UI-to-Vue conversion recipes.

**Requires:** Add conditional guides keyed to detected versions and task scope; include server/client boundaries, framework-specific tests and migrations.

**Acceptance:** Exercise SSR/hydration, caching, dependency injection, request lifetimes, build/runtime module differences and accessibility.

**Local evidence:** [rule-packs.mjs](../plugins/just-vibe/scripts/lib/rule-packs.mjs), [SKILL.md](../plugins/just-vibe/skills/react-hydration/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/vite-config/SKILL.md).

**Upstream examples:** [agents/vue-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/vue-reviewer.md), [commands/vue-review.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/vue-review.md), [rules/angular/coding-style.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/angular/coding-style.md), [rules/angular/hooks.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/angular/hooks.md), [rules/angular/patterns.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/angular/patterns.md), [rules/angular/security.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/angular/security.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="framework-dotnet"></a>

### C#/.NET and F#

**Disposition:** partial. **Priority:** P2.

**Current:** C# rules exist; no F# rule pack or dedicated .NET framework guide exists.

**Difference:** Missing detailed .NET patterns and C#/F# test/review recipes.

**Requires:** Add conditional guides for DI lifetimes, async/cancellation, EF behavior, nullable types and F# functional/property testing.

**Acceptance:** Run pinned SDK fixtures for scoped-service misuse, query translation, cancellation and serialization compatibility.

**Local evidence:** [rule-packs.mjs](../plugins/just-vibe/scripts/lib/rule-packs.mjs), [SKILL.md](../plugins/just-vibe/skills/test-unit/SKILL.md).

**Upstream examples:** [agents/csharp-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/csharp-reviewer.md), [agents/fsharp-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/fsharp-reviewer.md), [rules/csharp/coding-style.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/csharp/coding-style.md), [rules/csharp/hooks.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/csharp/hooks.md), [rules/csharp/patterns.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/csharp/patterns.md), [rules/csharp/security.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/csharp/security.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="framework-systems"></a>

### Go, Rust, C++ and Perl technical depth

**Disposition:** partial. **Priority:** P2.

**Current:** Go/Rust/C++ rule packs exist with short concrete checks; there is no Perl pack.

**Difference:** ECC has more extensive language patterns/test/build/review recipes and Perl security/testing material.

**Requires:** Add conditional examples for ownership/lifetimes, sanitizers, races, feature/toolchain matrices and Perl taint/input handling.

**Acceptance:** Use bounded compile/test fixtures with relevant race/sanitizer checks; absence of failures is limited to exercised paths.

**Local evidence:** [rule-packs.mjs](../plugins/just-vibe/scripts/lib/rule-packs.mjs), [SKILL.md](../plugins/just-vibe/skills/debug/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/test-unit/SKILL.md).

**Upstream examples:** [agents/cpp-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/cpp-build-resolver.md), [agents/cpp-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/cpp-reviewer.md), [agents/go-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/go-build-resolver.md), [agents/go-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/go-reviewer.md), [agents/rust-build-resolver.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/rust-build-resolver.md), [agents/rust-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/rust-reviewer.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="framework-storage"></a>

### Database engine and ORM recipes

**Disposition:** partial. **Priority:** P2.

**Current:** SQL and backend-cache methods provide foundations.

**Difference:** Missing dedicated PostgreSQL, MySQL, ClickHouse, Redis and Prisma guides with engine-specific behavior and tuning examples.

**Requires:** Add conditional engine/version recipes for plans, locks, transactions, migrations, cache semantics and operational recovery.

**Acceptance:** Use representative schemas, cardinalities and contention; verify generated SQL and migrations rather than generic advice.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/db-explain/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/db-migrate/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/backend-cache/SKILL.md).

**Upstream examples:** [skills/clickhouse-io/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/clickhouse-io/SKILL.md), [skills/mysql-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/mysql-patterns/SKILL.md), [skills/postgres-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/postgres-patterns/SKILL.md), [skills/prisma-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/prisma-patterns/SKILL.md), [skills/redis-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/redis-patterns/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="specialists"></a>

### Specialized review and build agents

**Disposition:** partial. **Priority:** P2.

**Current:** Twelve canonical specialists load workflows; 112 profiles are guidance, not 112 independently executable specialists.

**Difference:** ECC has narrower language/framework build resolvers and reviewers, silent-failure, comment, type-design, PR-test, RAG, performance, SEO, network, healthcare and other specialist briefs.

**Requires:** Add only useful focused methods and bounded agent definitions, with canonical reuse and specific routing; do not inflate counts through shallow aliases.

**Acceptance:** Each agent must have a distinct trigger, allowed scope, failure-specific checks, evidence contract and relevant fixtures.

**Local evidence:** [specialists.mjs](../plugins/just-vibe/scripts/lib/specialists.mjs), [agent-instructions.mjs](../plugins/just-vibe/scripts/lib/agent-instructions.mjs), [profiles.mjs](../plugins/just-vibe/scripts/lib/profiles.mjs).

**Upstream examples:** [agents/comment-analyzer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/comment-analyzer.md), [agents/performance-optimizer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/performance-optimizer.md), [agents/pr-test-analyzer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/pr-test-analyzer.md), [agents/silent-failure-hunter.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/silent-failure-hunter.md), [agents/type-design-analyzer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/type-design-analyzer.md), [agents/typescript-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/typescript-reviewer.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="network"></a>

### Network engineering and homelabs

**Disposition:** absent. **Priority:** optional.

**Current:** General operations and security workflows can assist but contain no network-specific methods.

**Difference:** No Cisco IOS, Netmiko, BGP, interface-health, configuration-validation, homelab readiness/setup, Pi-hole, VLAN or WireGuard recipes.

**Requires:** Create an optional network pack with topology/config inventories, read-only diagnosis and explicit rollback/maintenance-window boundaries.

**Acceptance:** Test offline device configs and simulated routing failures before any device mutation; never treat a generic operations profile as protocol expertise.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/ops-runbook/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/security-config/SKILL.md).

**Upstream examples:** [agents/homelab-architect.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/homelab-architect.md), [agents/network-architect.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/network-architect.md), [agents/network-config-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/network-config-reviewer.md), [agents/network-troubleshooter.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/network-troubleshooter.md), [skills/cisco-ios-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/cisco-ios-patterns/SKILL.md), [skills/homelab-network-readiness/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/homelab-network-readiness/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="connectors"></a>

### External connector recipes and discovery

**Disposition:** external. **Priority:** optional.

**Current:** GitHub/Vercel/browser collectors and a native just-vibe MCP server exist; host-provided tools can be used when available.

**Difference:** No maintained catalog/configurator for ECC’s named MCP servers or Jira/Confluence, email, workspace and search integrations. Access to a host tool is not a bundled connector.

**Requires:** Provide versioned read-only recipe metadata, prerequisites and explicit setup/trust boundaries; credentials stay with the host.

**Acceptance:** Test schema/transport versions and redaction; verify live accounts separately; do not claim installed/authenticated from a recipe.

**Local evidence:** [discovery.mjs](../plugins/just-vibe/scripts/lib/discovery.mjs), [evidence.mjs](../plugins/just-vibe/scripts/lib/evidence.mjs), [integration.mjs](../plugins/just-vibe/scripts/lib/integration.mjs).

**Upstream examples:** [commands/jira.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/jira.md), [.mcp.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/.mcp.json), [.kiro/settings/mcp.json.example](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/.kiro/settings/mcp.json.example), [.codex/config.toml](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/.codex/config.toml), [mcp-configs/mcp-servers.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/mcp-configs/mcp-servers.json), [skills/ck/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/ck/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="media"></a>

### Brand, media, document and design production

**Disposition:** absent. **Priority:** optional.

**Current:** Frontend and copy workflows exist, and hosts may separately have image/document tools.

**Difference:** No bundled Taste/Tasteforge pipeline, brand-discovery/voice system, Blender or Manim workflow, Remotion/video editing, slides, icon generation, FAL/VideoDB or document conversion/translation pack.

**Requires:** Treat these as optional production packs with real tool dependencies, licensing, asset provenance and preview/verification steps.

**Acceptance:** Validate actual rendered/exported artifacts, editable sources and tool availability; never advertise a host-only skill as just-vibe content.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/design/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/copy/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ui-motion/SKILL.md).

**Upstream examples:** [skills/blender-motion-state-inspection/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/blender-motion-state-inspection/SKILL.md), [skills/brand-discovery/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/brand-discovery/SKILL.md), [skills/brand-voice/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/brand-voice/SKILL.md), [skills/fal-ai-media/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/fal-ai-media/SKILL.md), [skills/frontend-slides/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/frontend-slides/SKILL.md), [skills/ios-icon-gen/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/ios-icon-gen/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="scientific"></a>

### Scientific databases and literature work

**Disposition:** absent. **Priority:** optional.

**Current:** Research is a general workflow, not a scientific database or evidence-review implementation.

**Difference:** Missing PubMed, USPTO, gget, literature-review and scholar-evaluation guides.

**Requires:** Create an optional research pack with primary sources, reproducible queries, citation verification and clearly scoped evidence assessment.

**Acceptance:** Verify identifiers, retrieval dates, citation support, retractions and missing data; no fabricated papers or regulatory conclusions.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/research/SKILL.md).

**Upstream examples:** [skills/scientific-db-pubmed-database/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/scientific-db-pubmed-database/SKILL.md), [skills/scientific-db-uspto-database/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/scientific-db-uspto-database/SKILL.md), [skills/scientific-pkg-gget/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/scientific-pkg-gget/SKILL.md), [skills/scientific-thinking-literature-review/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/scientific-thinking-literature-review/SKILL.md), [skills/scientific-thinking-scholar-evaluation/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/scientific-thinking-scholar-evaluation/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="marketing"></a>

### Marketing, content, sales and investing workflows

**Disposition:** absent. **Priority:** optional.

**Current:** Copy, research and decision workflows exist but do not implement these operator workflows.

**Difference:** Missing article/content/crosspost/social publishing, SEO, lead intelligence, marketing campaigns, competitive analysis/reports, investor materials/outreach and social ranking/connection optimization.

**Requires:** Keep an optional business pack separate from engineering defaults; require source support and explicit authority for outbound publication/contact.

**Acceptance:** Verify claims, audience/account, draft previews, exact external side effects and evidence; no autonomous outreach based on inferred intent.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/copy/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/research/SKILL.md).

**Upstream examples:** [agents/marketing-agent.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/marketing-agent.md), [agents/seo-specialist.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/seo-specialist.md), [commands/marketing-campaign.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/marketing-campaign.md), [skills/article-writing/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/article-writing/SKILL.md), [skills/competitive-platform-analysis/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/competitive-platform-analysis/SKILL.md), [skills/competitive-report-structure/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/competitive-report-structure/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="business-ops"></a>

### Business, logistics, finance and legal operations

**Disposition:** absent. **Priority:** optional.

**Current:** General data and operations workflows are engineering-focused.

**Difference:** Missing carrier/billing/customs/energy/procurement/inventory/production/returns/quality workflows, email/messages/workspace operations, agreements/e-signatures, research ops and relationship/channel policies.

**Requires:** Create separate optional packs backed by actually available systems; preserve account identity, reviewable writes and domain-specific validation.

**Acceptance:** Use synthetic records and dry-run fixtures; live financial/legal/logistics actions need task-specific authority and source verification.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/data-pipeline/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ops-runbook/SKILL.md).

**Upstream examples:** [agents/chief-of-staff.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/chief-of-staff.md), [skills/carrier-relationship-management/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/carrier-relationship-management/SKILL.md), [skills/counterparty-channel-discipline/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/counterparty-channel-discipline/SKILL.md), [skills/customer-billing-ops/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/customer-billing-ops/SKILL.md), [skills/customs-trade-compliance/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/customs-trade-compliance/SKILL.md), [skills/data-scraper-agent/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/data-scraper-agent/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="healthcare"></a>

### Healthcare software and PHI-specific methods

**Disposition:** absent. **Priority:** optional.

**Current:** General security/data/ML methods exist but no healthcare-specific pack does.

**Difference:** Missing CDSS, EMR, healthcare evaluation, PHI and HIPAA-specific workflows/reviewer.

**Requires:** Treat as a dedicated domain pack with current authoritative requirements, clinical validation boundaries and explicit data handling.

**Acceptance:** Use synthetic/deidentified fixtures; separate software checks from clinical efficacy and legal compliance judgments.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/security/SKILL.md), [SKILL.md](../plugins/just-vibe/skills/ml-evaluate/SKILL.md).

**Upstream examples:** [agents/healthcare-reviewer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/healthcare-reviewer.md), [skills/healthcare-cdss-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/healthcare-cdss-patterns/SKILL.md), [skills/healthcare-emr-patterns/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/healthcare-emr-patterns/SKILL.md), [skills/healthcare-eval-harness/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/healthcare-eval-harness/SKILL.md), [skills/healthcare-phi-compliance/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/healthcare-phi-compliance/SKILL.md), [skills/hipaa-compliance/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/hipaa-compliance/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="blockchain"></a>

### Blockchain, trading and agent payments

**Disposition:** absent. **Priority:** optional.

**Current:** No wallet/payment or blockchain-specific execution is bundled.

**Difference:** Missing x402 payments, AMM security, EVM decimals, Keccak distinctions, trading-agent security, prediction-market/oracle analysis and AURA reputation adapter.

**Requires:** Keep optional and isolated from engineering defaults, with exact authority and no automatic wallet/payment action.

**Acceptance:** Use local fixtures/test networks; distinguish financial assertions, reputation signals and source-verified protocol invariants.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/security-threat-model/SKILL.md).

**Upstream examples:** [integrations/aura/README.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/integrations/aura/README.md), [skills/agent-payment-x402/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/agent-payment-x402/SKILL.md), [skills/defi-amm-security/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/defi-amm-security/SKILL.md), [skills/evm-token-decimals/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/evm-token-decimals/SKILL.md), [skills/llm-trading-agent-security/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/llm-trading-agent-security/SKILL.md), [skills/nodejs-keccak256/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/nodejs-keccak256/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="vendor-bridges"></a>

### Sponsored and external compute/control bridges

**Disposition:** external. **Priority:** optional.

**Current:** No paid compute broker, Nasiko bridge or proprietary analysis service is bundled.

**Difference:** ECC offers Itô compute/baskets bridges and a pinned Nasiko lifecycle bridge; some Itô inference/training guides explicitly describe unavailable backends.

**Requires:** Document optional provider-agnostic integration boundaries before selecting a vendor; never copy remote bootstrap or live RFQ behavior into default setup.

**Acceptance:** Verify the independently installed tool/version, authenticated identity and exact external operation; unavailable services remain unavailable.

**Local evidence:** [SKILL.md](../plugins/just-vibe/skills/ml-training-cost/SKILL.md), [security-audit.mjs](../plugins/just-vibe/scripts/lib/security-audit.mjs).

**Upstream examples:** [scripts/ecc.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ecc.js), [mcp-configs/mcp-servers.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/mcp-configs/mcp-servers.json), [scripts/hooks/ecc-context-monitor.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/ecc-context-monitor.js), [scripts/hooks/insaits-security-monitor.py](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/hooks/insaits-security-monitor.py), [scripts/ito.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ito.js), [scripts/lib/compute-sponsor.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/compute-sponsor.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="python-host"></a>

### Standalone Python LLM provider host

**Disposition:** absent. **Priority:** optional.

**Current:** Just-vibe delegates model execution to existing Claude/Codex hosts.

**Difference:** ECC additionally includes a Python LLM CLI/provider layer for Claude, OpenAI, Ollama, Atlas and AstraFlow, with prompt and tool execution support.

**Requires:** Treat a new host as a separate product decision, including provider auth, streaming, cancellation, tool authority and maintenance.

**Acceptance:** Run provider contract fixtures and opt-in live tests; no reuse of host credentials outside their documented boundaries.

**Local evidence:** [workers.mjs](../plugins/just-vibe/scripts/lib/workers.mjs).

**Upstream examples:** [pyproject.toml](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/pyproject.toml), [src/llm/__init__.py](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/src/llm/__init__.py), [src/llm/__main__.py](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/src/llm/__main__.py), [src/llm/cli/__init__.py](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/src/llm/cli/__init__.py), [src/llm/cli/selector.py](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/src/llm/cli/selector.py), [src/llm/core/__init__.py](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/src/llm/core/__init__.py). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="operator"></a>

### ECC2 operator surface, proximity and coordination

**Disposition:** experimental. **Priority:** optional.

**Current:** Local activity reports, plan canvas, workers, DAGs and reviewed worktree application exist.

**Difference:** No unified interactive operator board/TUI, SQLite session daemon, agent proximity/conflict graph, automatic team rebalance, message inbox, heartbeat enforcement or merge queue. ECC2 README labels alpha; source has substantially more features than its short README list.

**Requires:** Design an optional control plane on existing contracts, with explicit process ownership, coordination state, actions and recoverability; do not pretend a static report is equivalent.

**Acceptance:** Test concurrent updates, process crashes, stale PIDs, conflicting edits, queued merges, inaccessible worktrees, cancellation and exact action permissions.

**Local evidence:** [activity.mjs](../plugins/just-vibe/scripts/lib/activity.mjs), [plan-canvas.mjs](../plugins/just-vibe/scripts/lib/plan-canvas.mjs), [orchestration.mjs](../plugins/just-vibe/scripts/lib/orchestration.mjs), [workers.mjs](../plugins/just-vibe/scripts/lib/workers.mjs).

**Upstream examples:** [scripts/ecc.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ecc.js), [ecc2/Cargo.lock](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/Cargo.lock), [ecc2/Cargo.toml](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/Cargo.toml), [ecc2/README.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/README.md), [ecc2/rust-toolchain.toml](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/rust-toolchain.toml), [ecc2/src/comms/mod.rs](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/src/comms/mod.rs). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="graph"></a>

### Context graph, connectors and foreign migration

**Disposition:** experimental. **Priority:** optional.

**Current:** Scoped lexical vaults and explicit context transfer exist.

**Difference:** Missing entity/relation/observation graph, pin/compact/recall, connector checkpoints for JSONL/Markdown/env sources and Hermes/OpenClaw-style schedules/tools/plugins/memory migration.

**Requires:** Add scoped provenance-aware import adapters and graph semantics only if product needs justify them; exclude credentials and private model reasoning.

**Acceptance:** Test duplicates, interrupted imports, changed sources, secret filtering, retention and graph deletion; graph recall does not imply semantic embeddings.

**Local evidence:** [vault.mjs](../plugins/just-vibe/scripts/lib/vault.mjs), [portable-context.mjs](../plugins/just-vibe/scripts/lib/portable-context.mjs).

**Upstream examples:** [ecc2/src/main.rs](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/src/main.rs). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="scheduler"></a>

### Persistent scheduled and remote work

**Disposition:** experimental. **Priority:** optional.

**Current:** Explicit goals and foreground bounded worker launches exist; scheduling remains a host capability.

**Difference:** ECC2 contains scheduled tasks, run-due processing, remote dispatch queue/server and computer-use request dispatch.

**Requires:** Prefer host scheduling when supported; an owned service needs authenticated transport, opt-in recurring authority, durable deduplication and revocation.

**Acceptance:** Test restart/clock drift, duplicate triggers, revoked authorization, cancellation, request validation and remote isolation.

**Local evidence:** [goals.mjs](../plugins/just-vibe/scripts/lib/goals.mjs), [workers.mjs](../plugins/just-vibe/scripts/lib/workers.mjs).

**Upstream examples:** [ecc2/src/main.rs](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/src/main.rs). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="observability"></a>

### Operator telemetry and platform readiness

**Disposition:** partial. **Priority:** P2.

**Current:** Activity and health reports expose recorded operational events and evidence.

**Difference:** Missing OpenTelemetry export, combined platform/coordination inventory, observability readiness, numeric risk/budget enforcement and integrated operator status dashboards.

**Requires:** Add structured export and evidence-based readiness; numeric risk/cost measures must be labeled heuristics with inputs and limits.

**Acceptance:** Verify event identity, redaction, delivery failure, missing telemetry and status freshness; no fabricated objective quality scores.

**Local evidence:** [activity.mjs](../plugins/just-vibe/scripts/lib/activity.mjs), [context-health.mjs](../plugins/just-vibe/scripts/lib/context-health.mjs).

**Upstream examples:** [scripts/ecc.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ecc.js), [ecc2/src/observability/mod.rs](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc2/src/observability/mod.rs), [scripts/coordination-inventory.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/coordination-inventory.js), [scripts/lib/coordination-inventory.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/coordination-inventory.js), [scripts/observability-readiness.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/observability-readiness.js), [scripts/platform-audit.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/platform-audit.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="maintenance"></a>

### Maintainer infrastructure and release automation

**Disposition:** maintenance. **Priority:** optional.

**Current:** Release metadata/archive validation, package-manager checks, tests and a website build already exist.

**Difference:** ECC has additional Docker/Windows harness tests, coverage gates, adapter compliance suites, SLSA release workflows, advisory watch, announcement bots and project-specific platform/discussion audits.

**Requires:** Adopt relevant cross-platform and provenance checks separately from product features; do not copy ECC-specific community/announcement machinery.

**Acceptance:** Run actual supported OS/host matrices and verify artifact provenance; blocked CI minutes or skipped tests cannot be labeled passing.

**Local evidence:** `scripts/release-check.mjs` (repository checkout), `scripts/smoke-hosts.mjs` (repository checkout), `scripts/smoke-package-managers.mjs` (repository checkout).

**Upstream examples:** [agents/opensource-forker.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/opensource-forker.md), [agents/opensource-packager.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/opensource-packager.md), [agents/opensource-sanitizer.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/agents/opensource-sanitizer.md), [scripts/ci/catalog.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ci/catalog.js), [scripts/ci/check-hooks-schema-keys.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ci/check-hooks-schema-keys.js), [scripts/ci/check-unicode-safety.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ci/check-unicode-safety.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="translations"></a>

### Translations, examples and learning material

**Disposition:** partial. **Priority:** optional.

**Current:** English documentation, generated references, project examples and a website exist.

**Difference:** ECC includes extensive translated docs, language-specific instruction templates and longform/security/setup guides beyond our documentation set.

**Requires:** Prioritize complete maintained English reference and versioned examples, then deliberate localization with source freshness.

**Acceptance:** Check translated links, preserved command semantics, stale versions and working examples; file count is not capability count.

**Local evidence:** [README.md](../README.md), [compatibility.md](../docs/compatibility.md), [command-reference.md](../plugins/just-vibe/references/command-reference.md).

**Upstream examples:** [rules/README.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/rules/README.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="deprecated"></a>

### Deprecated compatibility surfaces

**Disposition:** alternative. **Priority:** existing.

**Current:** Current reviewed learning and explicit orchestration provide the corresponding purposes.

**Difference:** ECC retains deprecated continuous-learning/autonomous-loops and legacy command/install copies; these are not independent new capabilities to clone.

**Requires:** Record aliases and deprecations in the audit, preserving only compatibility actually needed by just-vibe users.

**Acceptance:** Ensure aliases resolve to canonical methods without duplicating or silently enabling runtime behavior.

**Local evidence:** [catalog.mjs](../plugins/just-vibe/scripts/lib/catalog.mjs), [pattern-learning.mjs](../plugins/just-vibe/scripts/lib/pattern-learning.mjs), [orchestration.mjs](../plugins/just-vibe/scripts/lib/orchestration.mjs).

**Upstream examples:** [skills/autonomous-loops/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/autonomous-loops/SKILL.md), [skills/continuous-learning/SKILL.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/skills/continuous-learning/SKILL.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="adapter-depth"></a>

### Additional hosts and host-native tool surfaces

**Disposition:** partial. **Priority:** P2.

**Current:** Claude/Codex support and ten additional adapter IDs are present; native event integration is narrower than file installation.

**Difference:** ECC has AdaL, CodeBuddy, JoyCode, Kiro, OpenClaw, Pi and Trae surfaces we lack, plus eight OpenCode tool wrappers, Kiro-specific hooks/steering and an initial gitagent export manifest. Its dependency-analyzer wrapper only reads declared packages and leaves outdated/unused analysis unimplemented. Adapter presence does not prove live event parity.

**Requires:** Verify each official host schema and capability first, then add owned-file/event adapters and focused tool wrappers only with explicit support levels.

**Acceptance:** Test install/update/uninstall, foreign settings, event delivery, permissions and installed SDKs; record live host/OS coverage separately.

**Local evidence:** [editor-adapters.mjs](../plugins/just-vibe/scripts/lib/editor-adapters.mjs), [opencode-plugin.mjs](../plugins/just-vibe/scripts/lib/opencode-plugin.mjs), [compatibility.md](../docs/compatibility.md).

**Upstream examples:** [.adal/README.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/.adal/README.md), [.agents/plugins/marketplace.json](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/.agents/plugins/marketplace.json), [scripts/lib/install-targets/antigravity-project.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/install-targets/antigravity-project.js), [.claude/commands/add-language-rules.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/.claude/commands/add-language-rules.md), [.codebuddy/README.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/.codebuddy/README.md), [.codex/AGENTS.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/.codex/AGENTS.md). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="catalog-gui"></a>

### Local graphical catalog browsers

**Disposition:** alternative. **Priority:** optional.

**Current:** Our website has generated searchable command/profile catalogs and the CLI provides workflow discovery.

**Difference:** ECC also has local browser and Python/Tkinter catalog applications. These are separate from its ECC2 operator control pane; our public website is not an installed desktop catalog manager.

**Requires:** If local/offline GUI management is wanted, reuse canonical catalog data and expose installation actions through reviewed ownership-aware contracts.

**Acceptance:** Test offline navigation/search, stale catalog versions, safe local origins and explicit installation actions.

**Local evidence:** `website/src/pages/commands/index.astro` (repository checkout), `website/src/lib/catalog.mjs` (repository checkout), [discovery.mjs](../plugins/just-vibe/scripts/lib/discovery.mjs).

**Upstream examples:** [ecc_dashboard.py](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/ecc_dashboard.py), [scripts/dashboard-web.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/dashboard-web.js), [scripts/lib/ecc_dashboard_runtime.py](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/lib/ecc_dashboard_runtime.py). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<a id="auto-update"></a>

### Upstream update orchestration

**Disposition:** partial. **Priority:** P2.

**Current:** Package installation and owned-file updates exist.

**Difference:** No updater that checks an upstream checkout/release and reinstalls the recorded target selections; ECC has a standalone auto-update command.

**Requires:** Add explicit check/preview/update with pinned version, preserved selections, ownership checks and rollback; do not introduce unrequested background self-update.

**Acceptance:** Test dirty checkout, changed user files, offline registry, incompatible version and recovery.

**Local evidence:** [installer.mjs](../plugins/just-vibe/scripts/installer.mjs), [bundle.mjs](../plugins/just-vibe/scripts/lib/bundle.mjs).

**Upstream examples:** [scripts/ecc.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/ecc.js), [commands/auto-update.md](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/commands/auto-update.md), [scripts/auto-update.js](https://github.com/affaan-m/ECC/blob/2b6e839771e53096d8451a213d40dc64ec8acac0/scripts/auto-update.js). All related rows appear in the [surface inventory](ecc-surface-inventory.md).

<!-- END GENERATED REQUIREMENTS -->

## Audit verification

The audit validator checks every indexed path/group, duplicate IDs, canonical entry-point coverage, counts, evidence files and source hashes. Regression tests exercise missing mappings, invalid references, duplicate records, malformed paths, source drift and stale local evidence. Report generation is checked against the canonical ledger. This is verification of the audit tooling; it does not upgrade existing model or framework validation claims.

Observed results for this audit:

- `npm run audit:ecc -- --check --upstream <frozen extracted source>`: all 3,734 files and 1,243 surface records validated, with no upstream or local-evidence drift.
- `node --test tests/ecc-audit.test.mjs`: all six tests passed, including missing-entry and changed-source cases.
- `npm run validate`: generated 219-skill catalog and 2,058 local plugin-reference links validated.
- `node scripts/release-check.mjs`: metadata, MIT notices, all 679 package files, shipped links and credential-pattern checks passed. This check creates no publication.
- JavaScript syntax checks and `git diff --check` passed. No new live model, paid integration or editor tests were claimed for this documentation/audit-tool change.

Local logs are under ignored `.tmp/complete-audit-*`. Existing unpublished implementation changes were preserved. This round added the audit, comparison checks and documentation corrections; it did not implement the newly listed feature backlog, publish npm, push GitHub or deploy the website.

ECC names and source links identify the upstream project by Affaan Mustafa and contributors. This ledger contains classifications and our comparison, not a vendored copy of its implementation or skill bodies. Any future code reuse must retain the upstream license notices.
