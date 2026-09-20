---
name: decide
description: "Recommend an option against explicit requirements Use to recommend one bounded choice; brainstorm expands options and compare describes differences."
---

# decide

Recommend an option against explicit requirements

## Choose this workflow

Use to recommend one bounded choice; brainstorm expands options and compare describes differences.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Decisions methods](../../references/packs/decisions.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; decision, options, hard requirements, and priorities.

the decision question, constraints, alternatives or permission to identify them, and relevant project evidence. Current vendor claims and prices require current authoritative sources during execution. Scores are decision aids, not facts.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Recommend one bounded choice; no purchase, installation, or commitment.

None by default. Plan artifacts may be saved when requested.

## Execute

- Write the decision question, outcome, deadline, hard constraints and current/default option. Eliminate confirmed infeasible choices before scoring preferences; unknown feasibility is pending evidence, not a middle score.
- Compare remaining options using evidence with dates and scope. Separate observed facts, estimates and preferences; avoid double-counting correlated criteria or presenting subjective weights as objective truth.
- Identify the assumption capable of changing the recommendation. Vary plausible scores/weights or bounds and report whether the preferred option changes; use a bounded discriminating spike when its information is worth the delay.
- Recommend an option or conditional reversible choice, explain consequences and rejected alternatives, and set an observable revisit trigger. Record adoption only when it occurred; a recommendation does not commit stakeholders or authorize a purchase.

## Decision branches

- **When evidence cannot distinguish feasible options:** Make a reversible conditional choice or propose a discriminating spike rather than fake certainty.

## Deliver and verify

- Decision and recommendation, feasibility/evidence table, decisive uncertainty or sensitivity, consequences, adoption status and revisit trigger.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A hard requirement outweighs a cosmetic advantage; insufficient evidence produces a conditional recommendation.

## Stop and recover

- Ask only for preferences that can flip the outcome. Do not fabricate stakeholder agreement or imply the recommendation is already adopted.

## Example requests

- **Normal (plan):** Choose a job queue approach given our small team and existing Postgres service.
- **edge (plan):** Choose a cache strategy when consistency is mandatory but traffic is uncertain.
- **blocked (inspect):** Recommend a conditional choice with no stakeholder cost weights.
