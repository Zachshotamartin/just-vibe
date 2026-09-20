---
name: ml-explain
description: "Investigate behavior with appropriate explanation methods and limits Use to interpret model behavior; explain describes code and teach explains concepts."
---

# ml-explain

Investigate behavior with appropriate explanation methods and limits

## Choose this workflow

Use to interpret model behavior; explain describes code and teach explains concepts.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; model, prediction/global behavior question, data access, and audience.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Appropriate feature/behavior explanation with method limitations; not causal attribution by default.

None by default. Plan artifacts may be saved when requested.

## Execute

- Choose a method compatible with the model/question, inspect baseline/background dependence, check stability/correlated features, and connect explanations to actual examples.
- State whether the question concerns one prediction or global behavior, select a compatible method and examine background data and correlated-feature sensitivity.

## Decision branches

- **When explanations vary strongly with reasonable baselines:** Report that dependence and avoid a causal or uniquely determined attribution claim.

## Deliver and verify

- Explanation, method/settings, supporting evidence, and limits.
- Method/question fit, example explanations, stability checks and limitations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Correlated features are not treated as independent causal effects; unstable explanations are disclosed.

## Stop and recover

- Expensive explanation runs need bounded execution. Do not expose proprietary or personal data through unnecessary examples.

## Example requests

- **Normal (inspect):** Explain these predictions and separate feature association from causation.
- **edge (inspect):** Explain correlated feature importance without implying causation.
- **blocked (inspect):** Plan explanations without model artifacts or expensive inference authorization.
