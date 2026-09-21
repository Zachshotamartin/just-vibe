---
name: ml-reproduce
description: "Reproduce a result from code, data, and configuration Use to repeat a specified run; ml-baseline defines a new benchmark."
---

# ml-reproduce

Reproduce a result from code, data, and configuration

## Choose this workflow

Use to repeat a specified run; ml-baseline defines a new benchmark.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Inspect reproduction evidence or plan the attempt; apply for requested reproduction code or bounded execution.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

- **Infer from evidence:** Read framework, training entry point, loss/metric, split manifests and checkpoint conventions from supplied source.
- **Reasonable default:** Implement requested code and tiny isolated smoke checks with existing tools; leave unmeasured model quality explicit.
- **Ask only when needed:** Ask for unresolved objective/data semantics before encoding them, and environment/resource limits before launching training or a search; implementation alone does not need a hardware purchase decision.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Re-run a defined result with explicit reproducibility criteria.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: make the requested changes or execute the requested operation within its resolved target and limits. Local preparation does not authorize live, remote, destructive or paid actions; existing explicit session authorization still applies.

## Execute

1. Verify immutable inputs and dependency versions, reconstruct the procedure, run authorized bounded work, compare outputs/metrics within justified tolerance, and isolate deviations.
2. Resolve exact data/artifact/code/dependency identities, reconstruct preprocessing and evaluation, and declare nondeterminism tolerances before execution.
## Technical method

- **Inspect:** Resolve code revision, dependencies, artifacts, dataset access, hardware and claimed tolerance.
- **Method:** Recreate the stated protocol; document each unavoidable substitution and whether it affects exact reproduction or only qualitative comparison.
- **Avoid misdiagnosis:** Matching a seed or top-line metric does not establish the same data, selection process or training trajectory.
- **Check the result:** Compare artifacts and outputs under declared tolerances and preserve failures or inaccessible inputs as limits on the claim.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML experimentation worked example](../../references/examples/ml-experiments.md).
- The task specifically involves pytorch, autograd, ddp, cuda mismatch; load only the matching method: [PyTorch autograd, device and distributed debugging](../../references/methods/pytorch-debug.md).
- The task specifically involves recommender, ranking metrics, retrieval ranking, ml adoption; load only the matching method: [Retrieval, ranking and recommendation evaluation](../../references/methods/recommender-systems.md).

## Decision branches

- **When original assets are unavailable and substitutes are necessary:** Label the result a reimplementation or approximate reproduction and list each substitution.
- **When the request is for local preparation or implementation:** Create the requested environment/configuration and synthetic smoke path; separate pipeline reproduction from matching a reported scientific result.

## Deliver and verify

- Reproduction record, matched/different conditions, measured result, and discrepancy analysis.
- Reproduction manifest, deviations, observed differences and tolerance justification.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Data/version mismatch is discovered before claiming reproduction; nondeterministic hardware differences use declared tolerances.

## Stop and recover

- Missing original assets may make exact reproduction impossible. Do not silently substitute a different dataset or model and call it reproduced.

## Example requests

- **Normal (plan):** Plan reproducing this result with exact artifact identities and a two-hour budget.
- **edge (plan):** Reproduce a GPU run on another supported device with explicit tolerances.
- **blocked (inspect):** Assess reproducibility when the original dataset snapshot is missing.
