---
name: decision-matrix
description: "Compare options using weighted criteria and explain the weights Use when several explicit criteria need weighted comparison; decide suffices for a decisive hard constraint."
---

# decision-matrix

Compare options using weighted criteria and explain the weights

## Choose this workflow

Use when several explicit criteria need weighted comparison; decide suffices for a decisive hard constraint.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Decisions methods](../../references/packs/decisions.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; options, measurable criteria, weights or priority guidance.

the decision question, constraints, alternatives or permission to identify them, and relevant project evidence. Current vendor claims and prices require current authoritative sources during execution. Scores are decision aids, not facts.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Transparent weighted comparison, including hard exclusions and sensitivity analysis.

None by default. Plan artifacts may be saved when requested.

## Execute

- Define score scales, cite evidence for scores, separate must-haves, normalize weights, and vary uncertain values to test ranking stability.
- Define score anchors before rating, keep feasibility separate, and vary uncertain weights/scores over plausible ranges.

## Decision branches

- **When a small plausible perturbation changes the winner:** Report the unstable ranking and seek evidence on the sensitive criterion.

## Deliver and verify

- Matrix with score rationale, assumptions, sensitivity, and recommendation.
- Criterion definitions, sources, exclusions, weighted calculation and sensitivity result.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An infeasible option cannot win by averaging; small weight changes that flip the result are disclosed.

## Stop and recover

- Unknown scores remain unknown or bounded. Avoid false precision and do not invent numeric confidence from subjective ratings.

## Example requests

- **Normal (plan):** Compare three authentication options; maintenance is the highest priority.
- **edge (plan):** Compare three databases when one fails a hard regional requirement.
- **blocked (inspect):** Build a comparison with unknown costs; use bounds or missing values instead of invented scores.
