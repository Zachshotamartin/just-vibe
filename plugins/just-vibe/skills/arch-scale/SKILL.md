---
name: arch-scale
description: "Identify bottlenecks for a specified workload and growth scenario"
---

# arch-scale

Identify bottlenecks for a specified workload and growth scenario

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; workload shape, expected growth, SLOs, current metrics, and resource limits.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Capacity constraints and targeted scaling strategy; no speculative whole-system rewrite.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify hot paths and shared limits, quantify available evidence, distinguish throughput from latency, and compare incremental capacity options.

## Deliver and verify

- Bottleneck model, assumptions, capacity experiments, scaling sequence, and cost factors.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A serialized database operation is not solved by app replicas alone; estimates identify their workload assumptions.

## Stop and recover

- No invented capacity numbers or automatic provisioning. Missing measurements yield an instrumentation/benchmark plan first.

## Example request

Plan capacity experiments for a tenfold increase in checkout traffic.
