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

- **Infer from evidence:** Read framework, training entry point, loss/metric, split manifests and checkpoint conventions from supplied source.
- **Reasonable default:** Implement requested code and tiny isolated smoke checks with existing tools; leave unmeasured model quality explicit.
- **Ask only when needed:** Ask for unresolved objective/data semantics before encoding them, and environment/resource limits before launching training or a search; implementation alone does not need a hardware purchase decision.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Time, memory, utilization, data loading, and cost bottlenecks.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Separate startup/loading/compute/checkpoint time, inspect batch/resource utilization, identify bottlenecks, and propose measured optimizations or bounded profiling.
2. Separate data loading, host-to-device transfer, compute, synchronization and checkpoint time; relate utilization to the same quality target and workload.
## Technical method

- **Inspect:** Measure data loading, compute, synchronization, memory peaks, checkpointing and failed trials.
- **Method:** Profile a representative bounded run; separate throughput from cost per completed useful result and use verified dated rates for money.
- **Avoid misdiagnosis:** GPU utilization alone can hide pipeline stalls; mixed precision or larger batches can change convergence and effective optimization.
- **Check the result:** Compare end-to-end runtime, peak memory and model-quality protocol under matched conditions, including warmup and failures.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML experimentation worked example](../../references/examples/ml-experiments.md).
- The task specifically involves pytorch, autograd, ddp, cuda mismatch; load only the matching method: [PyTorch autograd, device and distributed debugging](../../references/methods/pytorch-debug.md).
- The task specifically involves recommender, ranking metrics, retrieval ranking, ml adoption; load only the matching method: [Retrieval, ranking and recommendation evaluation](../../references/methods/recommender-systems.md).

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
