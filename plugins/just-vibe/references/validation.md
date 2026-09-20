# Validation scope

For v0.4.0, structural validation, deterministic runtime tests and observed agent behavior are separate catalog fields. `passed-fixtures` means the named bounded tasks passed with directly supplied instructions in Codex collaboration agents. It does not mean every command, host or live integration was evaluated.

Twenty-one independent task trials passed, covering 23 selected command names. The cases include code repair, a stale-response race, in-process idempotency, migration inspection, query cardinality, data reconciliation, ML split/leakage/checkpoint/evaluation/parity analysis, retrieval boundaries, test quality, tenant authorization, log interpretation, event failure windows and a constrained decision matrix. Some cases load two complementary skills together; they do not establish each skill's standalone success rate.

The three matched comparison cases (React request race, migration inspection and ML leakage) passed under all three conditions: just-vibe guidance, no toolkit guidance, and a matched ECC guide. This is a small tie, not evidence of superiority. Models inherited the calling configuration; exact identifier, timing, token and cost metrics were not exposed by the evaluation interface. No statistics are invented for them.

Report fixtures check explicit factual judgments against supplied artifacts; executable fixtures check actual behavior and preserve unrelated inputs. These trials did not run a browser, live database, deployment, training job or native quiz. The previous partial Claude leakage result and unavailable native assessment in the tested Codex mode remain historical limitations; a supplied-instruction Codex pass does not erase them.

See the repository's [v0.4 validation record](https://github.com/Zachshotamartin/just-vibe/blob/main/evals/releases/0.4.0.md) and [machine-readable results](https://github.com/Zachshotamartin/just-vibe/blob/main/evals/releases/0.4.0-results.json) for case identities, input hashes, scope and results. Unexecuted workflows retain `not-evaluated` behavioral status.
