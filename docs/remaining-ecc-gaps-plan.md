# Runtime depth and integration

Scope note: this completed round covered the six findings below. It was not an exhaustive ECC comparison. The [complete source audit and backlog](ecc-complete-audit.md) now records the remaining engineering, host, domain and experimental-runtime differences against one pinned snapshot.

Implement the six verified gaps from the September 20 source comparison. Preserve existing unpublished work. This round does not publish packages, deploy the website, install external security binaries, change user host configuration, or write to GitHub.

| Area | Implementation | Acceptance |
| --- | --- | --- |
| Context health | Bounded host-reported context metrics, repeat-call and scope warnings, configurable thresholds, session reset and statusline bridge | Unknown/stale metrics never become invented usage; warnings debounce; sessions and private arguments stay isolated |
| Automatic checks | Reviewable toolchain detection/presets, optional batched formatting, staged-content commit gate and evidence | No execution during discovery; existing trust survives only identical configuration; staged content and index changes are checked accurately |
| Framework depth | Conditional Django, FastAPI, Spring Boot, Flutter and React Native implementation/test/review guides | Relevant workflows load focused recipes, failure cases and official version-sensitive references |
| Editor integration | Cursor native event bridge, OpenCode plugin events/tools, managed configuration merging, Zed and Hermes installation surfaces | Install/update/uninstall preserve unrelated settings; real event fixtures cover policy/routing/formatting; unsupported capabilities remain explicit |
| GitHub coordination | Local epic state, remote read/sync, ownership/dependency records, exact preview and guarded publication with recovery | No writes during planning/sync; stale remote edits and ambiguous retries preserve user work; fixtures verify actual API requests |
| Security tooling | Richer native static findings and JSON/Markdown/SARIF reports, CI severity gate, explicit reviewed AgentShield runner | Reports redact secrets; missing tools remain unavailable; external binaries require an explicit pinned identity and local trust |

The experimental ECC2 dashboard is outside this round. Existing slash commands remain the main discovery surface; new runtime tools and conditional guides extend them instead of duplicating workflows.

## Status

Implemented and verified locally on September 20, 2026. All six acceptance areas have executable implementations or conditionally loaded framework methods. Documentation, generated skill references, the changelog and website guides are updated. These changes remain Unreleased; package version 0.9.0 and its existing publication records have not been changed.

## Verification

- `npm run release:check`: 268 tests, 267 passed, one Windows-only test skipped on macOS. Catalog/generated-reference validation, MIT notices, credential-pattern checks, links and the 676-file npm archive passed.
- `tests/runtime-depth.test.mjs`: 22 new tests cover context privacy/staleness/reset, actual status-line delivery, inert discovery, formatter batching/index preservation, staged-content checks, compound/index-changing commit refusal, subdirectory binding, Cursor routing/policy/lifecycle, OpenCode idle checks, shared-configuration recovery, Zed/Hermes lifecycle, epic conflicts/account changes/dependencies/recovery, CI reports, MCP access boundaries and scanner trust. The external process fixture executes a local test executable; no third-party scanner was installed.
- `npm run test:hosts`: Codex and Claude bundled setup, update, doctor, repeated uninstall/reinstall and persistent cache checks passed in isolated host directories with all 219 skills.
- `npm run test:package-managers`: npm, pnpm 10.14.0, pnpm 12.5.1 and Yarn 4.18.0 executed the package archive and verified 219 skills, 112 profiles and bundled installation previews. The retained payload still ran after package-cache deletion.
- OpenCode's installed `.js` entry point imported successfully using the real `@opencode-ai/plugin` 1.18.31 SDK in an ignored temporary fixture. SDK schemas, compact workflow search, request routing, non-Git project root binding and hook removal passed. The entry point follows the host loader's `.js`/`.ts` discovery behavior.
- The website built 352 pages on Node 24.21.0; all four website tests passed, including internal page/fragment/asset links and generated catalog consistency. No visual components were changed in this round.
- `git diff --check` passed. Prior uncommitted changes were preserved.

Detailed local logs are under ignored `.tmp/depth-*`. Routine host/package installation checks ran before the final source-review fixes; the full release suite, archive validation and SDK import were rerun afterward. This distinction matters for a future exact-archive publication check.

## Boundaries and remaining external validation

- Cursor event fixtures and the actual installed hook runner were tested. Live Cursor/OpenCode model sessions and every editor/OS version were not tested. OpenCode's experimental system-context hook remains version-sensitive.
- AgentShield integration follows its maintained CLI/schema, including separate static JSON and terminal model output. Local protocol fixtures cover success, failure, redaction, identity changes and deep-analysis completion/error logs. No real AgentShield installation, paid model analysis or third-party detection-accuracy claim is included.
- GitHub transport/publication behavior was tested with injected API fixtures. No issue comments were sent. Claims remain advisory; concurrency is detected rather than presented as a distributed lock. Uncertain absent publications require explicit manual verification before reconciliation.
- Framework methods include implementation boundaries, likely failure cases, verification selection and official references. They are authored guidance, not five newly executed framework application/model benchmarks.
- Context capacity is real host-reported data or unknown, not token-cost accounting or an output-quality score. Native commit hooks cover recognized direct commands; repository precommit/CI enforcement remains separate.
- This round did not publish npm, push GitHub, deploy Vercel, or modify the user's active host settings.
