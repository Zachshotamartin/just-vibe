---
name: ml-inference-perf
description: "Measure latency, throughput, memory, and optimization tradeoffs"
---

# ml-inference-perf

Measure latency, throughput, memory, and optimization tradeoffs

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML deployment methods](../../references/packs/ml-deployment.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; model/runtime, input distribution, concurrency, hardware, quality floor, and benchmark budget.

versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Latency, throughput, memory, batching, warmup, and optimization tradeoffs.

None by default. Plan artifacts may be saved when requested.

## Execute

- Define comparable benchmark conditions, separate cold/warm paths, measure bounded authorized workloads, identify bottlenecks, and check quality after optimizations.

## Deliver and verify

- Benchmark protocol/results and optimization recommendation or authorized patch.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Tail latency and throughput are reported under stated load; quantization gains include a quality comparison.

## Stop and recover

- No production load or paid hardware implicitly. A single warm request cannot establish capacity.

## Example request

Plan a bounded benchmark for cold/warm latency and throughput at fixed quality.
