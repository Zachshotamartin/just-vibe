---
name: arch-scale
description: "Identify bottlenecks for a specified workload and growth scenario Use for workload-driven capacity design; perf measures and repairs a specific bottleneck."
---

# arch-scale

Identify bottlenecks for a specified workload and growth scenario

## Choose this workflow

Use for workload-driven capacity design; perf measures and repairs a specific bottleneck.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; workload shape, expected growth, SLOs, current metrics, and resource limits.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Capacity constraints and targeted scaling strategy; no speculative whole-system rewrite.

None by default. Plan artifacts may be saved when requested.

## Execute

- State workload shape, service objectives and measured constraints: arrival rate, service time distribution, concurrency, queue age and resource saturation. Separate observed production data from assumptions or synthetic samples.
- Locate the limiting serial/shared boundary before recommending replicas, caching, queues or extraction. Model steady-state and burst behavior, failure recovery and downstream limits with explicit units.
- Compare options against the bottleneck and consistency requirements. Define admission control/backpressure and degradation before adding unbounded concurrency; scaling callers can overload the shared dependency.
- Propose a bounded measurement or authorized load experiment with rejecting observations and recovery. Report the capacity range established by evidence and what remains unknown; do not invent traffic or throughput.

## Decision branches

- **When a shared database or serialized step dominates:** Quantify that constraint before recommending application replicas or new services.

## Deliver and verify

- Bottleneck model, assumptions, capacity experiments, scaling sequence, and cost factors.
- Assumptions, limiting resource, incremental options and a bounded benchmark plan.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A serialized database operation is not solved by app replicas alone; estimates identify their workload assumptions.

## Stop and recover

- No invented capacity numbers or automatic provisioning. Missing measurements yield an instrumentation/benchmark plan first.

## Example requests

- **Normal (plan):** Plan capacity experiments for a tenfold increase in checkout traffic.
- **edge (plan):** Plan growth for a service bottlenecked by a serialized inventory update.
- **blocked (inspect):** Assess scale without production metrics; avoid invented throughput estimates.
