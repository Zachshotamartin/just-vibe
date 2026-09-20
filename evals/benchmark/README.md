# Repeated repository benchmark

This study tests implementation behavior on four newly authored multi-file repositories. They exercise asynchronous cache ownership, SQLite transfers, temporal ML data preparation and a scoped Git commit. These are bounded laboratory tasks, not unfamiliar third-party production repositories. Every graded requirement is visible in the task or project contract. Correct control implementations and original-defect rejection tests validate the graders in the development test suite.

## Registered first study

Before inspecting counted results or changing command guidance, prepare 32 fresh trials: four cases × four instruction arms × two repetitions, deterministically shuffled with seed 5192026. The arms are an unassisted baseline, just-vibe v0.5.0 without profiles, the same instructions with a selected task profile, and matched ECC instructions at revision `934195f955cf0da847d59fcd6f68856bce112d8b`. The exact entry points are in [cases.json](cases.json). The generated study manifest freezes every workspace and instruction hash and the oracle hashes before execution.

Run all arms with `gpt-6-astra`, medium reasoning, CLI 0.155.1, at most two concurrent trials and 240 seconds per trial. Use ephemeral contexts, saved authentication, workspace-write with the fixture's Git metadata explicitly writable, and no user config/rules, host skills, plugins, hooks, apps, subagents, network or dependency installation. The host-discovery flag is experimental. OS sandboxing constrains writes; the prompt constrains cross-trial reads. This is not a hardened isolation boundary or a full native ECC hooks/memory installation. ECC skill directories include their support files; references elsewhere in its repository may be unavailable.

Two setup pilots are excluded from the registered totals and retained separately. The first exposed protected `.git` writes; the second checks explicit Git-directory permission. The scoped-commit task now explicitly directs every arm to the README contract, as the other three tasks already did. Pilot failures remain documented; they are not counted as toolkit comparison evidence.

Primary success requires every independent behavior assertion, preserved protected files and unrelated Git state, an authored regression test that passes with the fix and rejects the original defect, and a completed agent turn within the time limit. Partial correctness is recorded separately. Runtime/model errors and timeouts remain failures in the denominator. The grader checks artifacts, not whether a final message sounds convincing. Review traces for unsupported completion claims and scope violations before interpreting results.

Report individual outcomes, paired outcomes by case and repetition, elapsed wall time, input/cached-input/output tokens, failed shell calls, timeouts and user intervention. Cached input is a subset of input, not an additional total. Wall time includes CLI startup and service delays. Tokens are reported by the CLI, not estimated from text; absent usage is unavailable, never zero. Saved ChatGPT authentication supplies no per-trial monetary charge, so dollar cost remains null. No user answers or corrective hints are supplied during a counted trial.

`toolCalls` counts recognized completed shell, file-change, MCP and web events in the CLI stream, not every possible internal operation. `failedCommands` counts recorded nonzero shell-call exits; a shell sequence can mask an earlier command's failure. Trace review therefore complements artifact checks but cannot prove that every read or internal action was observed. Agent wall time excludes subsequent evaluator execution. Review both partial output and final state before interpreting a successful aggregate shell status.

This small sample supports failure analysis, not statistical superiority, general expertise, or a claim that profiles improve all work. Command revisions after this study are evaluated in separate fresh trials; never replace failed baseline attempts or combine revised instructions into the original arm. A rerun on these same now-known tasks is a development regression check, not held-out proof of generalization. Published fixtures cease to be a blind benchmark.

The v0.6 development check freezes eight further trials: four cases × just-vibe with/without profiles × one repetition, seed 5192027, with the same model, effort, CLI and limits. Run them after the original comparison to keep at most two active trials. These validate the revised instruction bundles on known tasks; they do not add extra repetitions to the original v0.5 arms or establish that the revisions caused an improvement.

## Reproduce

Requires Node 22+, Git, Python 3.9+ with SQLite and a compatible authenticated Codex CLI. On macOS the harness uses `/usr/bin/python3`; `JUST_VIBE_PYTHON` can select the evaluator interpreter elsewhere. Model calls consume the authenticated account's usage. The harness never installs a CLI, logs in, runs remote actions or changes host configuration.

The recorded native model runs use macOS and an executable CLI entry point. Cross-platform grader tests are separate from native Windows model-run validation; Windows shell-shim invocation is not established by these results. Typoed/unknown options and missing run configuration are rejected before trials start.

Interrupting the runner stops dispatching new trials, terminates its owned CLI processes and retains interrupted attempts as failures. A short forced-termination fallback handles a CLI that ignores graceful termination. Authentication links are removed after process closure; interrupted or failed attempts are never silently retried. Resume pending trials with the same study, or prepare a fresh study to deliberately repeat an attempt.

```sh
node evals/benchmark/harness.mjs prepare --out .tmp/benchmark/before --ecc-root /path/to/ECC --repetitions 2 --seed 5192026
node evals/benchmark/harness.mjs run --study .tmp/benchmark/before --codex /path/to/codex --auth-home /path/to/codex-home --model gpt-6-astra --effort medium --seconds 240 --concurrency 2
node evals/benchmark/harness.mjs grade --trial .tmp/benchmark/before/ledger/baseline/1
```

Use a fresh output directory for every attempt. Keep raw prompts, event logs, final answers, manifests, metrics, artifact diffs and grading output locally. Authentication is linked only into an ephemeral per-trial host directory and removed after the process closes; never publish that directory. Review exported results for personal paths before committing them.

Export a completed study with `node evals/benchmark/report.mjs STUDY OUTPUT.json --regrade`. The exporter refuses incomplete studies, records per-trial evidence hashes, preserves unavailable metrics and retains original scores when applying scorer version 2. `prepare --arms just-vibe,just-vibe-profile --repetitions 1` prepares a smaller development comparison with the current instructions; it remains separate from the original study.

## Scorer correction

Scorer version 1 used an overly narrow text match on default test output. Node's default reporter can withhold assertion details until the suite finishes; an early real assertion failure followed by a hung asynchronous test was classified as no regression evidence. Python tests that reached the original implementation and exposed an unexpected behavior exception were also rejected when the exception was not an assertion error. Known-good control tests alone did not expose those reporting differences.

Version 2 uses streaming Node TAP assertion evidence and a Python test-result collector that distinguishes test-body/implementation failures from import/setup errors. A timeout without completed behavior evidence still fails. It also closes a Git grading gap: the committed implementation and tests are executed separately from the mixed worktree, because checking path names and preserved staging alone did not prove the fix was committed. This verifies the existing task contract rather than adding a new requirement. The original code/task/oracle assertions and model attempts are unchanged. Preserve version 1 grades, rescore every arm, and report any changed outcomes. Additional regression tests cover the corrections. These are evaluator corrections, not evidence that an agent improved its work.

Windows CI also exposed an evaluator-owned SQLite connection left open during temporary-directory cleanup. The original 32 runs completed before that resource cleanup was changed; their original oracle files are retained locally. The correction closes the observer connection in `finally` without changing any behavior assertion. Both original and rescoring source hashes are recorded. The eight v0.6 trials were freshly prepared after this cleanup fix; an earlier unexecuted preparation was retained separately and contributes no results.

The CLI's documented [non-interactive mode](https://developers.openai.com/codex/noninteractive) supplies JSON event streams, final-message output and ephemeral runs. Pin the CLI and model when comparing instructions; a model name alone does not guarantee an immutable model backend.
