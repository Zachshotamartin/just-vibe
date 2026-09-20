---
name: ml-ablation
description: "Measure contributions of features or model components Use to estimate component contribution; ml-tune optimizes parameters."
---

# ml-ablation

Measure contributions of features or model components

## Choose this workflow

Use to estimate component contribution; ml-tune optimizes parameters.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; hypothesis, reference model, feature/component variants, fixed evaluation, and budget.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Isolate the contribution of specified components using controlled comparisons.

None by default. Plan artifacts may be saved when requested.

## Execute

- Define one meaningful variation at a time or a justified factorial design, hold data/evaluation constant, repeat seeds when needed, and compare uncertainty/cost.
- State the causal comparison, hold data/protocol constant and repeat seeds or matched runs where variance could overwhelm the effect.

## Decision branches

- **When removing a component changes another required contract:** Redesign the comparison or disclose the confound instead of attributing all change to one component.

## Deliver and verify

- Ablation protocol or run results with attributable differences and caveats.
- Variant matrix, controlled differences, uncertainty and cost/quality interpretation.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Data changes do not confound the component comparison; noisy score differences are not declared decisive.

## Stop and recover

- Do not remove interdependent components without explaining the changed model contract. Budget limits constrain repeats and confidence.

## Example requests

- **Normal (plan):** Plan a controlled comparison of the new features at fixed data and seed conditions.
- **edge (plan):** Ablate a feature group while preprocessing depends on those columns.
- **blocked (inspect):** Plan an ablation with insufficient run budget; state the confidence limitation.
