---
name: decision-matrix
description: "Compare options using weighted criteria and explain the weights. Use when several explicit criteria need weighted comparison; decide suffices for a decisive hard constraint."
---

# decision-matrix

Compare options using weighted criteria and explain the weights.

## Choose this workflow

Use when several explicit criteria need weighted comparison; decide suffices for a decisive hard constraint.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Decisions methods](../../references/packs/decisions.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; options, measurable criteria, weights or priority guidance.

**Pack prerequisites:** The decision question, constraints, alternatives or permission to identify them, and relevant project evidence. Current vendor claims and prices require current authoritative sources during execution. Scores are decision aids, not facts.

- **Infer from evidence:** Recover hard constraints, the current option, adoption status and stated priorities from the brief and prior decisions.
- **Reasonable default:** When only a priority order is given, derive provisional weights from it, show them, and report whether plausible reweighting changes the winner.
- **Ask only when needed:** Ask only about a missing constraint or preference that could reverse the recommendation; do not demand a complete scoring questionnaire.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Transparent weighted comparison, including hard exclusions and sensitivity analysis.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Separate must-haves and feasibility from scored criteria, and define score anchors before rating.
2. Score each option with cited evidence and normalized weights.
3. Vary uncertain weights and scores over plausible ranges to test ranking stability.

## Technical method

- **Inspect:** Collect criterion definitions, score anchors, weights, evidence ranges and excluded options.
- **Method:** Separate feasibility from preference; vary uncertain weights and scores and report ties or rank reversals.
- **Avoid misdiagnosis:** Double-counting correlated criteria can manufacture a winner; unknown evidence is not a neutral numeric score.
- **Check the result:** Recalculate plausible extremes and explain the smallest assumption change that alters the winner.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Decisions worked example](../../references/examples/decisions.md).


## Decision branches

- **When a small plausible perturbation changes the winner:** Report the unstable ranking and seek evidence on the sensitive criterion.

## Deliver and verify

- Matrix with criterion definitions, sources, exclusions, score rationale, weighted calculation, sensitivity result and recommendation.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An infeasible option cannot win by averaging; small weight changes that flip the result are disclosed.

## Stop and recover

- Unknown scores remain unknown or bounded. Avoid false precision and do not invent numeric confidence from subjective ratings.

## Example requests

- **Normal (plan):** Compare three authentication options; maintenance is the highest priority.
- **Edge (plan):** Compare three databases when one fails a hard regional requirement.
- **Blocked (inspect):** Build a comparison with unknown costs; use bounds or missing values instead of invented scores.
