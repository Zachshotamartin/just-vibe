---
name: ml-training-cost
description: "Profile training time, memory, and resource bottlenecks Use to analyze training resource use; ml-inference-perf measures deployed prediction work."
---

# ml-training-cost

Profile training time, memory, and resource bottlenecks

## Choose this workflow

Use to analyze training resource use; ml-inference-perf measures deployed prediction work.

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
- Separate data loading, host-to-device transfer, compute, synchronization and checkpoint time; relate utilization to the same quality target and workload.

## Decision branches

- **When throughput improves by changing effective batch or precision:** Compare convergence/quality and total time-to-target before claiming a useful speedup.

## Deliver and verify

- Resource breakdown, unit-cost assumptions, and prioritized improvement experiments.
- Timing/resource breakdown, verified price basis if used and bounded optimization plan.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Idle accelerator time caused by input loading is recognized; local elapsed time is not converted into a fabricated cloud bill.

## Stop and recover

- New profiling/training requires execution authorization. Do not claim speedup without equivalent model quality and workload comparison.

## Example requests

- **Normal (inspect):** Analyze the supplied profile for loading, compute, and checkpoint bottlenecks.
- **edge (inspect):** Diagnose an idle accelerator stalled by data loading.
- **blocked (inspect):** Estimate training effort from sparse logs without inventing cloud prices.
