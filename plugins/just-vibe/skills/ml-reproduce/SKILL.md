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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; claimed result, code/data/artifact identities, environment, tolerance, and budget.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Re-run a defined result with explicit reproducibility criteria.

None by default. Plan artifacts may be saved when requested.

## Execute

- Verify immutable inputs and dependency versions, reconstruct the procedure, run authorized bounded work, compare outputs/metrics within justified tolerance, and isolate deviations.
- Resolve exact data/artifact/code/dependency identities, reconstruct preprocessing and evaluation, and declare nondeterminism tolerances before execution.

## Technical method

- **Inspect:** Resolve code revision, dependencies, artifacts, dataset access, hardware and claimed tolerance.
- **Apply:** Recreate the stated protocol; document each unavoidable substitution and whether it affects exact reproduction or only qualitative comparison.
- **Avoid misdiagnosis:** Matching a seed or top-line metric does not establish the same data, selection process or training trajectory.
- **Check the result:** Compare artifacts and outputs under declared tolerances and preserve failures or inaccessible inputs as limits on the claim.

## Decision branches

- **When original assets are unavailable and substitutes are necessary:** Label the result a reimplementation or approximate reproduction and list each substitution.

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
