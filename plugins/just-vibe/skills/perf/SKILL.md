---
name: perf
description: "Measure a performance problem and improve its cause. Use for measured performance repair; architecture scaling work needs workload-level evidence. Once the bottleneck is located in one layer, prefer react-rerenders, vite-bundle, vercel-performance, db-explain or ml-inference-perf."
---

# perf

Measure a performance problem and improve its cause.

## Choose this workflow

Use for measured performance repair; architecture scaling work needs workload-level evidence. Once the bottleneck is located in one layer, prefer react-rerenders, vite-bundle, vercel-performance, db-explain or ml-inference-perf.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; slow operation, workload, performance objective, and measurement budget.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Measured bottlenecks and focused optimization; no blanket rewrites or unbounded production load.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Define a repeatable workload and metric and record the baseline conditions.
2. Profile the path to isolate the dominant resource or wait before changing code.
3. After the change, compare latency, resource use and correctness under the same conditions.

## Technical method

- **Inspect:** Obtain a reproducible workload, baseline, resource measurements and an explicit user-impact metric.
- **Method:** Profile the critical path before optimizing and compare under matched revision/data/cache conditions.
- **Avoid misdiagnosis:** Lower allocation or fewer renders may not improve observed latency; averages hide regressions in tails or errors.
- **Check the result:** Repeat the same workload, retain correctness checks and report distributions, tradeoffs and measurement uncertainty.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- The affected project uses Flutter: [Flutter](../../references/frameworks/flutter.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).

## Decision branches

- **When a faster implementation changes output quality or consistency:** Reject the comparison or disclose the product tradeoff for an explicit decision.

## Deliver and verify

- Patch with the workload, sample size, before/after measurements, correctness checks and tradeoffs.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Improvement persists under comparable workloads; optimized behavior remains correct at a relevant boundary.

## Stop and recover

- If measurement is unavailable, provide hypotheses without numerical claims. Stop when noise or resource limits prevent trustworthy conclusions.

## Example requests

- **Normal (apply):** Measure and fix slow product filtering; preserve search results.
- **Edge (apply):** Optimize a slow search without changing ranking or using a warmer cache baseline.
- **Blocked (inspect):** Inspect source without profiler data; provide hypotheses and a bounded measurement plan.
