---
name: perf
description: "Measure a performance problem and improve its cause Use for measured performance repair; architecture scaling work needs workload-level evidence."
---

# perf

Measure a performance problem and improve its cause

## Choose this workflow

Use for measured performance repair; architecture scaling work needs workload-level evidence.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; slow operation, workload, performance objective, and measurement budget.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Measured bottlenecks and focused optimization; no blanket rewrites or unbounded production load.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Establish repeatable baseline conditions, profile the path, target the dominant cause, and compare latency/resource use and correctness after the change.
- Define a repeatable workload and metric, preserve baseline conditions, and isolate the dominant resource or wait before changing code.

## Decision branches

- **When a faster implementation changes output quality or consistency:** Reject the comparison or disclose the product tradeoff for an explicit decision.

## Deliver and verify

- Patch, measurement method, before/after results, and tradeoffs.
- Workload, sample size, before/after measurements, correctness checks and tradeoffs.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Improvement persists under comparable workloads; optimized behavior remains correct at a relevant boundary.

## Stop and recover

- If measurement is unavailable, provide hypotheses without numerical claims. Stop when noise or resource limits prevent trustworthy conclusions.

## Example requests

- **Normal (apply):** Measure and fix slow product filtering; preserve search results.
- **edge (apply):** Optimize a slow search without changing ranking or using a warmer cache baseline.
- **blocked (inspect):** Inspect source without profiler data; provide hypotheses and a bounded measurement plan.
