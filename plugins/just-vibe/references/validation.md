# Validation scope

## Current v0.8 source

The payload contains 216 skill names and 213 canonical workflows. Local release validation passed 154 tests with one Windows-only skip on macOS. The new intent helpers also received actual Git/filesystem, preview process, browser report, native installation and package-manager checks. The [v0.8 validation record](https://github.com/Zachshotamartin/just-vibe/blob/main/evals/releases/0.8.0.md) describes exact coverage and limits; the [workflow index](intent-workflows.md) describes use.

The initial CI matrix passed on Linux/macOS and found a Windows path-identity issue. A fix is committed and passes affected local tests. GitHub account billing blocked the follow-up matrix before any jobs started, so Windows confirmation remains pending. The source version is 0.8.0; the published npm version remains 0.7.0.

Runtime tests do not prove host-agent compliance, actual instruction loading or subjective output quality. The new instruction branches have no independent model trials. Historical behavioral labels refer only to the named fixtures and evidence below; they do not certify every new mode.

## Historical v0.4 behavior trials

For v0.4.0, structural validation, deterministic runtime tests and observed agent behavior are separate catalog fields. `passed-fixtures` means the named bounded tasks passed with directly supplied instructions in Codex collaboration agents. It does not mean every command, host or live integration was evaluated.

Twenty-one independent task trials passed, covering 23 selected command names. The cases include code repair, a stale-response race, in-process idempotency, migration inspection, query cardinality, data reconciliation, ML split/leakage/checkpoint/evaluation/parity analysis, retrieval boundaries, test quality, tenant authorization, log interpretation, event failure windows and a constrained decision matrix. Some cases load two complementary skills together; they do not establish each skill's standalone success rate.

The three matched comparison cases (React request race, migration inspection and ML leakage) passed under all three conditions: just-vibe guidance, no toolkit guidance, and a matched ECC guide. This is a small tie, not evidence of superiority. Models inherited the calling configuration; exact identifier, timing, token and cost metrics were not exposed by the evaluation interface. No statistics are invented for them.

Report fixtures check explicit factual judgments against supplied artifacts; executable fixtures check actual behavior and preserve unrelated inputs. These trials did not run a browser, live database, deployment, training job or native quiz. The previous partial Claude leakage result and unavailable native assessment in the tested Codex mode remain historical limitations; a supplied-instruction Codex pass does not erase them.

See the repository's [v0.4 validation record](https://github.com/Zachshotamartin/just-vibe/blob/main/evals/releases/0.4.0.md) and [machine-readable results](https://github.com/Zachshotamartin/just-vibe/blob/main/evals/releases/0.4.0-results.json) for case identities, input hashes, scope and results. Unexecuted workflows retain `not-evaluated` behavioral status.
