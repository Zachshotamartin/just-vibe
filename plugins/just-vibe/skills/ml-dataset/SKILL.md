---
name: ml-dataset
description: "Audit whether data can support the modeling task Use to assess whether data supports a task; data-profile summarizes its columns."
---

# ml-dataset

Audit whether data can support the modeling task

## Choose this workflow

Use to assess whether data supports a task; data-profile summarizes its columns.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; framed task, dataset version, collection process, and sampling budget.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

- **Infer from evidence:** Read prediction moment, label horizon, entity/time keys, split policy and dataset provenance from the task and manifests.
- **Reasonable default:** Use explicit synthetic examples for design when raw data is unavailable; do not infer missing labels or fit preprocessing across held-out boundaries.
- **Ask only when needed:** Ask when unresolved label timing, grouping or target semantics would change the split/features; do not demand a full dataset to explain the method.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Task suitability, population coverage, missingness, dependencies, and collection bias.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Compare available fields/outcomes with task needs, inspect cohort/time coverage, assess missing-label patterns and selection processes, and identify unsupported deployment populations.
2. Compare collection/selection and follow-up windows with deployment population, inspect coverage by cohort/time and identify censored or missing outcomes.
## Technical method

- **Inspect:** Inspect collection mechanism, row grain, entity coverage, duplicates, labels and permission to use the data.
- **Method:** Assess whether observations cover the intended deployment population and whether outcomes are observable without selection artifacts.
- **Avoid misdiagnosis:** More rows do not remove survivor bias or dependence between observations.
- **Check the result:** Reconcile sample membership and label coverage by important groups; distinguish observed gaps from unsupported population conclusions.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML data worked example](../../references/examples/ml-data.md).
- The task specifically involves pytorch, autograd, ddp, cuda mismatch; load only the matching method: [PyTorch autograd, device and distributed debugging](../../references/methods/pytorch-debug.md).
- The task specifically involves recommender, ranking metrics, retrieval ranking, ml adoption; load only the matching method: [Retrieval, ranking and recommendation evaluation](../../references/methods/recommender-systems.md).

## Decision branches

- **When training data excludes the intended deployment cohort:** Limit generalization claims and propose evidence collection before model complexity.

## Deliver and verify

- Dataset readiness report with exclusions, risks, and needed collection/validation work.
- Population/coverage table, missingness/selection risks and supported deployment claims.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A dataset missing outcome follow-up is not treated as fully labeled; a deployment cohort absent from training is flagged.

## Stop and recover

- Do not infer representativeness from sample size alone. Unsupported collection semantics remain unknown.

## Example requests

- **Normal (inspect):** Assess whether this dataset covers the intended deployment population.
- **edge (inspect):** Assess a dataset with many rows but no labels for recently enrolled users.
- **blocked (inspect):** Review dataset metadata without row access; avoid inferring representative coverage.
