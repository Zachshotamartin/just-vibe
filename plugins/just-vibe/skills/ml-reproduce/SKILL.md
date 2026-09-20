---
name: ml-reproduce
description: "Reproduce a result from code, data, and configuration"
---

# ml-reproduce

Reproduce a result from code, data, and configuration

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

## Deliver and verify

- Reproduction record, matched/different conditions, measured result, and discrepancy analysis.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Data/version mismatch is discovered before claiming reproduction; nondeterministic hardware differences use declared tolerances.

## Stop and recover

- Missing original assets may make exact reproduction impossible. Do not silently substitute a different dataset or model and call it reproduced.

## Example request

Plan reproducing this result with exact artifact identities and a two-hour budget.
