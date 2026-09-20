---
name: ml-experiments
description: "Compare runs and check that data and evaluation conditions match"
---

# ml-experiments

Compare runs and check that data and evaluation conditions match

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; run IDs/artifacts, metric of interest, and comparison scope.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Compare existing experiments and their compatibility; no automatic reruns.

None by default. Plan artifacts may be saved when requested.

## Execute

- Reconcile data/split/code/config identities, normalize metric definitions, inspect failed/missing runs, compare quality and resources, and separate incompatible cohorts.

## Deliver and verify

- Experiment comparison, strongest supported result, and comparability gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Different test populations are not ranked as directly comparable; failed trials are not silently omitted from cost accounting.

## Stop and recover

- Missing metadata prevents strong conclusions. Do not select a winner solely from rounded headline scores.

## Example request

Compare these runs and flag different datasets or metric definitions.
