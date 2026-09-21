# Second code review — 2026-09-21

This pass reviews the working tree after the [first review](full-code-review-2026-09-21.md). Three reviewers rotated areas; the primary reviewer independently reproduced every reported failure before authorizing repairs and then inspected the resulting changes. Four reviewers total were used. Reproductions used isolated repositories, inert subprocesses, fixture credentials, and loopback servers. No model inference or production mutation was needed to reproduce the defects.

## Confirmed findings

| ID | Priority | Failure and repair |
| --- | --- | --- |
| S01 | P1 | Agent, preview, and command supervisors considered execution finished while ordinary descendants in their owned process group could still change files. Completion now includes group cleanup, including children holding inherited output pipes. |
| S02 | P2 | A service published terminal status before its termination grace period ended, allowing overlapping restart/reconfiguration. It now retains nonterminal state until cleanup finishes. |
| S03 | P1 | Trusted Node runners omitted directly named preload modules such as `--import=./loader.mjs`; replacing the file left trust current. Startup-file inputs now participate in the existing content identity checks, including supported attached/separate forms and legacy records. |
| S04 | P2 | Runner configuration trimmed literal argument whitespace. Argument validation now preserves the exact argument values. |
| S05 | P2 | Preview logging repeatedly redacted an already-redacted buffer, exposing credential suffixes split across chunks. It now retains bounded raw output internally and redacts persisted snapshots. |
| S06 | P1 | Explicit adaptive lock recovery could remove a replacement live writer's lock. It now shares the acquisition/recovery gate and host/owner identity checks. |
| S07 | P2 | Pruning deleted a task or session updated after its initial read. Deletion now holds the record lock and rechecks its revision and eligibility. |
| S08 | P2 | Learning cleanup removed an approved but unfinished activation journal, permanently losing the recoverable preference. It now retains approval data until the lesson exists. |
| S09 | P2 | Session import collapsed repeated user requests across distinct records or interrupted turns. It now pairs adjacent response/event mirrors once and preserves separate identities and turn boundaries. |
| S10 | P2 | Implemented session windows, MCP health recovery, and dispatch retirement were missing from the public operation registry. The operations are now reachable with the existing access restrictions. |
| S11 | P2 | Benchmark output corrupted UTF-8 characters split across process chunks. Each output stream now uses incremental decoding. |
| S12 | P2 | Benchmark sensitivity rejected real implementation exceptions detected by regression tests. It now recognizes completed TAP behavior failures with test/source stack evidence while excluding setup, syntax, loader, filesystem, and unsupported failure evidence. |
| S13 | P2 | Native pre-commit checks scanned the normal index instead of Git's temporary `--only`/`--all` index, allowing an actual commit containing conflict markers. The hook validates and explicitly passes the repository-owned index; standalone checks still discard foreign Git overrides. |
| S14 | P2 | A failed hook ownership write left an executable hook installed but permanently classified as foreign. Installation/removal now serialize ownership and retain an exact recoverable pending record before changing the hook. Foreign or edited hooks remain protected. |
| S15 | P2 | Native doctor reported healthy after a required runtime module was deleted. It now compares managed files against the recorded manifest without modifying them, and reports unknown integrity for legacy manifests. |
| S16 | P2 | Inherited Git overrides redirected live-evaluation fixture initialization and configuration into a foreign repository. The evaluator now sanitizes Git and child environments and disables fixture hooks/signing. Offline tests invoke the actual helper; live models were not run. |
| S17 | P1 | Inherited Git overrides made release preparation bind dirty source to another repository's clean HEAD. Preparation and publication now use sanitized repository-bound Git operations and child environments. |
| S18 | P2 | A release archive replaced during smoke or dry-run validation could receive a trusted receipt for different bytes. Preparation now binds the initial archive digest and checks it after each verification phase. |

## Coverage and scope

The rotated review covered runtime storage and recovery, execution and cancellation, worker/service ownership, runner trust, CLI/MCP routing, native and editor installation, hooks, learning/session retention, evaluation harnesses, release preparation/publication, and their regression tests. Canonical catalog contracts and generated-artifact parity remain part of validation; prompt quality is not claimed to be objectively proven for every scenario.

Website work in this round adds full-width lime header/footer surfaces, clearer current-section navigation, scroll-aware header visibility, consistent catalog card insets, and a transparent logo. Navigation keeps text at its final position, avoids full-page blank fades, and does not replay entrances on already-visible content. The motion regression samples heading position over 60 frames after each of three bottom-of-document navigations. One Voice's separate repository receives full-width charcoal chrome, stable header opacity, shared page introduction spacing, and aligned hero columns.

## Verification

- Complete suites on Node 22 and Node 24: **392 passed, zero failed, one Windows-only test skipped** on each version (393 total), using the available Python runtime for provider tests.
- Node 24 release check: canonical/generated artifact validation, complete tests, MIT notices, metadata, internal links, credential-pattern checks, and **790 package files** passed.
- A separate review archive passed npm, pnpm 10, pnpm 12, and Yarn execution, all 219 skills and 112 profiles, both host setup previews, and execution after deleting the temporary package cache. Current implementation integrity validation retains all 49 groups as acceptance-partial.
- Website: **353-page production build**, all four static tests, formatting, header/footer/card checks, navigation/motion checks, and browser accessibility/control checks passed. Layout checks covered 15 template widths, all 347 detail pages at 320px and 768px, and expanded text spacing.
- The original execution reproductions now report no post-completion side effects for command, agent, preview, and service execution; literal whitespace remains exact and split/whole preview output receives identical redaction. The new regressions also cover inherited pipes, cancellation, and service stop requests during cleanup.
- Final review of preload handling caught a directory resolution exception to the explicit-file rule. The primary reviewer reproduced it with a symlinked `index.js`; directory preloads are now rejected while explicit files and supported extension resolution remain covered.

Focused repair suites and reproduction logs are retained under `.tmp/second-review/` in the local checkout. The prior published 0.10.0 archive is preserved; website deployment does not publish a new npm version.

## Limits

These repairs address reproduced failures, not a claim of universal correctness or complete ECC parity. POSIX process ownership is not a hostile-process sandbox: deliberately detached/reparented processes remain outside that guarantee. Windows/Linux process behavior and real paid model sessions were not executed during this pass. Current implementation hashes are refreshed without changing the historical ECC snapshot or promoting partial acceptance to verified.
