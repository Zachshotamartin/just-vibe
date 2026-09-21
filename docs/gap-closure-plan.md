# Runtime integration and gap closure

Scope note: completion here applies to this round's selected findings. The [complete ECC audit](ecc-complete-audit.md) is the broader comparison baseline and records remaining differences.

This work completes the findings from the follow-up runtime review. Existing unpublished changes are preserved. Implementation and local verification do not publish npm or deploy the website.

| Work | Implementation | Acceptance |
| --- | --- | --- |
| Evidence freshness | Bind reported goal verification to the checked project snapshot; legacy or partial evidence stays unverified | Code, branch and index changes prevent completion until rechecked |
| Negative feedback retention | Keep rejected pattern identities through pruning; explicit reconsideration | Rejected patterns do not silently return |
| Configuration scanning | Parse structured runner/URL settings, JSONC and host paths; canonical paths and coverage diagnostics | Normal MCP args, deceptive loopback names, Gemini and malformed settings are covered |
| Failure events | Host-compatible event registration and outcome normalization | Claude failures are recorded; missing host outcome fields remain unknown |
| Instruction consistency | One effective method for native agents, managed workers and tools; selected technical rules loaded with it | Canonical method, applicable rules and active preferences resolve on every supported path |
| Guided configuration | One reviewed setup flow with target, selection and runtime features; native task selection/evidence tools | Dry run is inert, choices persist and tools work without shell JSON bookkeeping |
| Richer learning | Grounded preference proposals with conditions/exceptions and related conflicts, explicit resolution | Source quotes required; proposals never activate themselves; opposing guidance is surfaced |
| Memory continuity | Versioned explicit backup/preview/import for vaults, lessons and goals; controlled worktree transfer | No credentials, worker tokens or activation permissions transferred; collisions preserved; goals revalidated |
| Worker coordination | Dependency-aware assignments, structured results, bounded retries and reviewed local application | DAG validation, failed dependencies, stale result rejection and index-preserving application |
| Plan review canvas | Local authenticated browser review of plan/artifact snapshots with annotations and verdicts | Loopback-only, no arbitrary file serving, stale verdict checks, keyboard/mobile browser validation |
| Composed workflows | Maintained feature/fix/refactor/MVP phases linked to goals, existing methods and worker assignments | Small work stays proportionate; evidence and review precede completion; no automatic external actions |
| Editor breadth | Additional documented managed adapters, with explicit capability limits | Install/update/doctor/uninstall preserve unrelated files and selected rules |
| Live verification | Bounded ordinary-request, correction and resume trials using actual installed hosts | Record observed artifacts, event delivery and tool use; distinguish host/auth blockers from passed checks |

## Order

Fix the four defects, unify instruction loading and native tools, then add configuration, learning and continuity. Build coordination and canvas on the verified primitives. Finish generated workflows, editor adapters, documentation, fixtures, browser checks and live-host trials.

## Status

Implemented and locally verified. These changes remain Unreleased; this work did not publish npm, push GitHub changes, or deploy the website.

Verification completed:

- Release checks: 246 tests, 245 passed and one Windows-only test skipped; metadata, MIT notices, generated catalog consistency, package contents, links and credential-pattern checks passed.
- The 17 focused gap tests cover evidence freshness, retained negative feedback, structured configuration scanning, instruction loading, guided setup, portable context, worker coordination, canvas security, editor adapters and the actual bundled Codex MCP launch command.
- Isolated Codex 0.152.0 and Claude Code 2.1.258 installation, repeated installation, doctor, update, uninstall and reinstall passed. npm, pnpm 10, pnpm 12 and Yarn archive execution passed; the installed payload still runs after its package cache is deleted.
- Canvas checks passed at desktop and mobile sizes, including keyboard interaction, reduced motion, stale approval rejection, sandboxed HTML and blocked remote requests. Automated accessibility checks found no violations. Both viewport screenshots were inspected.
- Website build produced 351 pages; all four website tests passed. New skill and plugin manifests passed their validators.
- Actual Codex and Claude sessions completed an ordinary bug fix, saved an explicit project correction, then resumed. Independent regression checks passed and each host saved one project lesson. Claude's final trial loaded the ordinary-request workflow and made native MCP calls in all three turns. Codex used the supported CLI fallback; native MCP selection was not demonstrated by that trial.

The first live trials exposed a Codex MCP path-expansion incompatibility and Claude skipping workflow loading. Bundled Codex installation now writes a persistent absolute server path; routing and completion reminders now tell hosts to discover deferred native tools and load the relevant method before editing. Both hosts were rerun after the relevant fixes, and Claude was rerun after refreshed authentication.

Remaining limits are explicit: these are bounded behavioral fixtures, not a general model-quality score. Editor file adapters were lifecycle-tested, not exercised in every live editor. Native specialist instruction delivery is fixture-tested; no live specialist delegation trial was run. TOML/YAML scanning remains partial, and unsupported hook events are not advertised. Raw Codex local/GitHub plugin sources need explicit MCP configuration; bundled setup supplies it automatically. These host and installation limits are documented in the runtime reference.
