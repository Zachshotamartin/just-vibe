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

- **Infer from evidence:** Read frozen model/data identities, metric definitions, denominators and supplied predictions; separate validation from test use.
- **Reasonable default:** Compute only supported metrics on permitted samples and label missing labels or subgroup coverage as unknown.
- **Ask only when needed:** Ask when the operating cost/threshold or population changes the evaluation decision; do not fabricate labels to avoid a question.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Appropriate feature/behavior explanation with method limitations; not causal attribution by default.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Choose a method compatible with the model/question, inspect baseline/background dependence, check stability/correlated features, and connect explanations to actual examples.
2. State whether the question concerns one prediction or global behavior, select a compatible method and examine background data and correlated-feature sensitivity.
## Technical method

- **Inspect:** Resolve whether the question is global behavior, a local prediction, debugging or causal effect.
- **Method:** Use a method compatible with model/data semantics and check explanation stability and plausible feature combinations.
- **Avoid misdiagnosis:** Attributions are not causal effects; correlated inputs or impossible counterfactuals can make an explanation misleading.
- **Check the result:** Compare nearby valid inputs or a known simple model and state approximation, background-data and stability limits.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML evaluation worked example](../../references/examples/ml-evaluation.md).
- The task specifically involves pytorch, autograd, ddp, cuda mismatch; load only the matching method: [PyTorch autograd, device and distributed debugging](../../references/methods/pytorch-debug.md).
- The task specifically involves recommender, ranking metrics, retrieval ranking, ml adoption; load only the matching method: [Retrieval, ranking and recommendation evaluation](../../references/methods/recommender-systems.md).

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
