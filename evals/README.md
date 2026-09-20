# Evaluating just-vibe

Validation has three separate dimensions in the catalog:

- `structural: automated`: contracts, generation, references and packaging are checked.
- `runtime: fixtures-tested | not-applicable`: deterministic utilities have relevant fixture coverage. This does not measure an agent's judgment.
- `behavioral: not-evaluated | passed-fixtures | partial-fixtures`: observed agent outcomes on named bounded fixtures. Evaluated entries name an evidence record; no label means universal reliability or host parity.

The generated [scenarios.json](scenarios.json) supplies normal, edge and missing-evidence invocations plus evidence requirements and a rubric for all 216 skill names. These are specifications, not completed model runs. Aliases inherit their canonical contract and validation.

## Independent behavioral fixtures

[behavior/cases.json](behavior/cases.json) defines 21 raw-artifact tasks. Their inputs and task briefs are separate from [evaluator oracles](behavior/oracles.json). The harness copies only raw task files and selected instructions into an isolated workspace. It never copies grading answers into that workspace. Expected facts and executable behavior assertions were authored independently of generated command wording.

Prepare a fresh trial:

```bash
npm run eval:behavior -- prepare --case react-race --out .tmp/trials/react-race
```

Give an independent agent only the resulting `prompt.txt` and its referenced workspace. It must preserve supplied files except the explicitly allowed implementation targets and write `answer.json` outside the workspace. Do not show it evaluator oracles or previous trial answers. Local code checks are permitted by the task; network, installations, external mutations and further delegation are excluded from these fixtures.

Grade afterward:

```bash
npm run eval:behavior -- grade --run .tmp/trials/react-race
```

The grader verifies input/instruction hashes, permitted changed files, independently specified factual judgments, and relevant executable assertions. Regression-test evaluation runs the authored test against the correct implementation and two independent mutants, rejecting vacuous tests. Report inspection checks verify explicit judgments against supplied facts; the reasoning prose still requires human review. Executable grading runs reviewed local fixture code; this harness is not a sandbox for hostile submissions.

`npm run eval:behavior -- list` shows available cases. `npm run check` checks the harness itself against seeded wrong reports, broken code, vacuous tests and correct controls. Those synthetic harness checks are **not** model trials. It does not call models or services.

## Controlled comparisons

Prepare the same case in three fresh directories with `--arm baseline`, `--arm just-vibe`, or `--arm ecc --ecc-root /path/to/pinned/ECC`. ECC supports cases with a declared matched source file in the manifest. Record the ECC revision before preparation. The comparator supplies that matched guide, not ECC's complete installed hooks/agents/runtime; name this limitation when interpreting results.

Keep model, effort, host tools, task artifacts, action permissions and budget equal. Use separate fresh agent contexts, randomize order for a larger study, repeat trials, and retain failures. Record source/prompt hashes, changed files, checks, host/model settings and actual usage/timing from host logs. Do not infer cost from elapsed preparation time. A small tied comparison demonstrates no superiority; a single observed difference needs replication.

Results should distinguish task correctness, unsupported claims, unrequested edits, completion, elapsed execution time, tokens and verified cost. Unsupported metrics remain unavailable. Keep development fixtures separate from future held-out benchmark tasks; public fixtures are useful regressions but are not a durable blind benchmark.

## Existing evidence and limits

The [v0.8 record](releases/0.8.0.md) describes current runtime, browser, package and native installation checks, including the pending Windows CI confirmation. These helper tests are separate from the historical model trials below; new instruction branches have not received independent model evaluations.

The [repeated repository benchmark](benchmark/README.md) adds fresh multi-file tasks, matched baseline/just-vibe/profile/ECC arms, randomized repeated runs and native CLI usage/timing capture. Its controlled correct/defective implementations test the scorer without model calls. Run model trials explicitly; `npm run check` does not consume account usage. These new fixture repositories are authored test environments, not a production-repository benchmark or a full native ECC installation.

The [v0.2 record](releases/0.2.0.md) contains native Codex/Claude trials, including a partial Claude leakage audit and the tested Codex mode's unavailable native assessment dialog. Later instruction changes do not retroactively turn those trials into passes.

The original [checkout](fixtures/checkout/) and [ML](fixtures/ml/) fixtures remain available. `npm run test:hosts` verifies native installation lifecycles in isolated host configuration directories. It does not establish model behavior, authenticated deployments, database execution, browser rendering or training quality. These need separately identified environments and evidence.

## Technical guidance controls

The [technical audit](../docs/technical-audit.md) updates all canonical workflow instructions. [Security controls](security/README.md) exercise five isolated vulnerable/corrected pairs and reject disabling fixes. Run `npm run eval:security`; it makes no model calls. Catalog behavioral status for changed instructions is not-evaluated; previous results are retained as historical records and are not reassigned to this revision.
