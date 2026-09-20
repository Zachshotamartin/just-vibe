---
name: ml-baseline
description: "Establish simple, reproducible baselines"
---

# ml-baseline

Establish simple, reproducible baselines

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; task, training/validation split, metric, and run budget. Explicit baseline-run requests select apply.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Simple reproducible reference models, including a naive/rule-based comparator.

None by default. Plan artifacts may be saved when requested.

## Execute

- Match baseline to task, build leakage-safe preprocessing, fix evaluation protocol, run bounded training when authorized, and report score plus cost/uncertainty.

## Deliver and verify

- Baseline configuration/code and results if executed.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A naive comparator is included; all candidates use identical permitted evaluation data.

## Stop and recover

- Do not begin extensive model search. Missing label/split validity blocks trustworthy benchmark claims even if training technically runs.

## Example request

Plan reproducible naive and simple-model baselines under the fixed split.
