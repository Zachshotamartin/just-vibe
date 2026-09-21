# Frozen ECC backlog: implementation verification

Recorded 2026-09-20 for the current unreleased source checkout. Baseline: ECC commit `2b6e839771e53096d8451a213d40dc64ec8acac0`. The [plan](ecc-implementation-plan.md) and [source-hashed ledger](audits/ecc-implementation.json) account for all 49 remaining groups: 22 runtime deliveries, 22 focused-method groups, three integration groups and two maintenance groups.

These are the historical pre-correction results. The subsequent [release fixes and verification](release-fixes-2026-09-20.md) supersede readiness claims; the twelve reproduced runtime defects are tracked separately from remaining acceptance requirements.

## Checks actually run

| Check | Observed result | Scope |
| --- | --- | --- |
| `npm run release:check` | 308 passed; one Windows-only test skipped; no failures | Node 26.7.0 on macOS; reproducible generated skills/methods, runtime regressions, ownership, privacy, injection/authority and packaging checks |
| Optional Python fixtures within the test suite | Seven Python cases passed | Python 3.12.14; provider-native request formats, visible streaming, bounded/incomplete responses, loopback HTTP, rejected tool execution and CPU ranking/time/entity split examples |
| Release archive inspection | 777 files checked | MIT notices, metadata, complete shipped references and credential-pattern scan; no publication |
| `npm run test:hosts` | Both native lifecycles passed | Codex CLI 0.152.0 and Claude Code 2.1.258; install, update, doctor, uninstall and cached runtime checks in temporary configurations; 219 skills discovered |
| `npm run test:package-managers` | npm, pnpm 10/12 and Yarn passed | Packed-archive execution, bundled setup previews and persistent payload behavior after cache removal |
| `npm run test:operator-browser` | Passed; zero reported accessibility violations or page errors | Chromium 153.0.8010.12, 1440/390 px widths, no horizontal overflow, keyboard details, method search, reduced motion, local acknowledgement and exact reviewed fixture installation |
| Website build | 353 pages built | Node 24.21.0, static command/profile/docs generation |
| `npm run website:test` | Four passed | Published-page presence, contract parity, internal links, assets, fragments, metadata and sitemap |
| `npm run audit:implementation` | All 49 groups present with current evidence hashes | Completeness against the frozen backlog; not an evaluation of subjective output quality |
| `npm run check:localizations` | Spanish/Japanese source and command consistency passed | Getting-started pages only; independent native-speaker review remains pending |
| `git diff --check` | Passed | Whitespace/conflict checks on tracked changes |

Detailed transient logs and screenshots are in the ignored `.tmp/` directory. The maintained automated suites, generated documentation and per-group source identities remain in the repository. Package-manager/native lifecycle tests establish installation behavior, not guaranteed model compliance with every method.

## Scope that remains explicitly unverified

No new live paid-provider evaluation, GPU/distributed training, production database operation, mobile-device test, network-device mutation, commercial vendor invocation or clinical/legal validation was performed. Focused methods supply concrete procedures and failure cases for those tasks; the active project must supply the real environment and evidence. New editor adapters have file/event-contract coverage, not live model activation coverage in every listed editor.

The configured Linux/macOS/Windows CI matrix was not run on GitHub during this implementation. The local Windows-only skip is not a Windows pass. Native host hook fixtures and installation checks are distinct from live delivery of every new event. The optional provider client uses separate API credentials and does not reuse host OAuth.

The original ECC audit remains historical; its old local hashes are expected to drift after implementation. Current completeness is checked against the separate implementation ledger. No assertion is made about future ECC changes, identical internals, universal superiority or unavailable upstream commercial backends.

This work remains **Unreleased**. No npm publication, GitHub push or production website deployment was performed. Existing user installations and account authentication were not modified; installation checks used isolated fixtures.
