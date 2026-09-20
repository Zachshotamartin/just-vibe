---
name: ml-tune
description: "Design a bounded hyperparameter search with a fixed evaluation protocol"
---

# ml-tune

Design a bounded hyperparameter search with a fixed evaluation protocol

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; baseline, search space, objective, fixed splits, trial/time/compute caps, and selection rule.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Bounded hyperparameter search; execution only within authorized resources.

None by default. Plan artifacts may be saved when requested.

## Execute

- Validate comparable trials, select search strategy, define pruning/failure behavior, log every trial, and choose by the predeclared validation criterion.

## Deliver and verify

- Search configuration, trial ledger, selected candidate, and cost/selection caveats.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Trial failures remain visible; test labels never influence parameter selection.

## Stop and recover

- Stop at any resource cap and preserve partial results. Do not enlarge the search merely because no improvement appears.

## Example request

Plan at most 20 trials on validation PR-AUC; never tune on the test set.
