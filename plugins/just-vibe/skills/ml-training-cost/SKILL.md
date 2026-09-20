---
name: ml-training-cost
description: "Profile training time, memory, and resource bottlenecks"
---

# ml-training-cost

Profile training time, memory, and resource bottlenecks

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; training traces, hardware, workload, budget, and cost-rate evidence.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Time, memory, utilization, data loading, and cost bottlenecks.

None by default. Plan artifacts may be saved when requested.

## Execute

- Separate startup/loading/compute/checkpoint time, inspect batch/resource utilization, identify bottlenecks, and propose measured optimizations or bounded profiling.

## Deliver and verify

- Resource breakdown, unit-cost assumptions, and prioritized improvement experiments.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Idle accelerator time caused by input loading is recognized; local elapsed time is not converted into a fabricated cloud bill.

## Stop and recover

- New profiling/training requires execution authorization. Do not claim speedup without equivalent model quality and workload comparison.

## Example request

Analyze the supplied profile for loading, compute, and checkpoint bottlenecks.
