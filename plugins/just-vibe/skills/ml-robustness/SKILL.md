---
name: ml-robustness
description: "Test missing inputs, noise, distribution changes, and boundaries Use for bounded valid perturbation tests; ml-drift compares observed populations."
---

# ml-robustness

Test missing inputs, noise, distribution changes, and boundaries

## Choose this workflow

Use for bounded valid perturbation tests; ml-drift compares observed populations.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; model, plausible perturbations, operating bounds, metrics, and evaluation budget.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

- **Infer from evidence:** Read frozen model/data identities, metric definitions, denominators and supplied predictions; separate validation from test use.
- **Reasonable default:** Compute only supported metrics on permitted samples and label missing labels or subgroup coverage as unknown.
- **Ask only when needed:** Ask when the operating cost/threshold or population changes the evaluation decision; do not fabricate labels to avoid a question.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Missing inputs, noise, boundary cases, and realistic distribution changes.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Define validity-preserving perturbations, protect labels from invalid transformations, run bounded authorized tests, compare baseline sensitivity, and identify failure envelopes.
2. Define which changes should preserve labels and expected behavior, cap the sweep and compare both failure rate and input validity against a baseline.
## Technical method

- **Inspect:** Identify plausible missingness, noise, boundary values and deployment shifts with bounded perturbations.
- **Method:** Test semantic-preserving perturbations separately from changed-label cases; measure quality, rejection and coverage.
- **Avoid misdiagnosis:** Arbitrary corruption may not represent deployment, and invariance is wrong when the perturbation should change the answer.
- **Check the result:** Include an unchanged control, boundary-valid input and deliberately unsupported input; report the exact tested threat/shift model.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML evaluation worked example](../../references/examples/ml-evaluation.md).
- The task specifically involves pytorch, autograd, ddp, cuda mismatch; load only the matching method: [PyTorch autograd, device and distributed debugging](../../references/methods/pytorch-debug.md).
- The task specifically involves recommender, ranking metrics, retrieval ranking, ml adoption; load only the matching method: [Retrieval, ranking and recommendation evaluation](../../references/methods/recommender-systems.md).

## Decision branches

- **When a perturbation changes the true label or leaves the valid domain:** Classify it separately from an invariance failure.

## Deliver and verify

- Robustness protocol/results and prioritized mitigations.
- Perturbation contract, tested envelope, failures and unsupported regions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Missing required inputs fail predictably; label-changing perturbations are not scored as ordinary invariance tests.

## Stop and recover

- No claims of universal robustness from a finite suite. Large synthetic sweeps stop at the declared compute cap.

## Example requests

- **Normal (plan):** Plan plausible missing-input and noise tests with fixed labels and bounded compute.
- **edge (plan):** Test missing optional fields while rejecting transformations that change the outcome.
- **blocked (inspect):** Design robustness tests without running a large synthetic inference sweep.
