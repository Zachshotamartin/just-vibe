---
name: decision-spike
description: "Design or run a bounded experiment to resolve uncertainty Use for a bounded experiment resolving a decision; build creates production behavior."
---

# decision-spike

Design or run a bounded experiment to resolve uncertainty

## Choose this workflow

Use for a bounded experiment resolving a decision; build creates production behavior.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Decisions methods](../../references/packs/decisions.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; uncertainty, competing hypotheses, success criteria, time/compute budget, and scratch scope.

the decision question, constraints, alternatives or permission to identify them, and relevant project evidence. Current vendor claims and prices require current authoritative sources during execution. Scores are decision aids, not facts.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Design or explicitly run a disposable experiment; no production integration disguised as a spike.

None by default. Plan artifacts may be saved when requested.

## Execute

- Name the decision the spike will inform and the uncertainty that could change it. Define a representative workload/sample and an observable acceptance/rejection criterion before building.
- Set a time/compute/data budget, isolated artifact location and stop rule. Choose the smallest prototype or measurement that can distinguish the alternatives; avoid building production scaffolding that does not test the hypothesis.
- Execute within authorization and record raw observations, versions and deviations from the plan. Preserve failures and resource-limit outcomes; do not change the success threshold after seeing the result.
- Classify supported, rejected or inconclusive. Explain the implication for the original decision and the limits of the sample; prototype success does not establish production readiness.

## Decision branches

- **When budget expires without separation:** Preserve measurements and report inconclusive, including what a larger experiment would need.

## Deliver and verify

- Experiment protocol or results, reusable evidence, and decision implications.
- Hypotheses, experiment, resource cap, observations and decision implication.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The test can reject a hypothesis; reaching the budget yields an inconclusive result rather than endless expansion.

## Stop and recover

- Paid resources require budget authorization. Keep prototype quality and production readiness clearly distinct.

## Example requests

- **Normal (plan):** Design a two-hour local spike to test whether our current search index is sufficient.
- **edge (plan):** Test whether streaming reduces perceived latency without building the full product.
- **blocked (inspect):** Design a spike without available hardware; do not fabricate benchmark results.
