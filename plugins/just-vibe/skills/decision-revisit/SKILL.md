---
name: decision-revisit
description: "Reassess a decision using new constraints or evidence Use when new evidence may invalidate a recorded choice; decision-adr preserves the resulting decision record."
---

# decision-revisit

Reassess a decision using new constraints or evidence

## Choose this workflow

Use when new evidence may invalidate a recorded choice; decision-adr preserves the resulting decision record.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Decisions methods](../../references/packs/decisions.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; prior decision record, new evidence, and changed constraints.

the decision question, constraints, alternatives or permission to identify them, and relevant project evidence. Current vendor claims and prices require current authoritative sources during execution. Scores are decision aids, not facts.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Reassess a specific choice while preserving its historical rationale.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify original assumptions, compare them to current facts, estimate transition consequences, and recommend retaining, modifying, or superseding the decision.
- Compare original assumptions with current facts and include migration costs, disruption and option value in retaining versus replacing.

## Decision branches

- **When only preferences or fashion changed:** Retain the decision unless an explicit new priority justifies transition costs.

## Deliver and verify

- Reassessment with changed premises, alternatives, migration implications, and proposed status update.
- Changed assumption table, retain/change recommendation and adoption/revisit conditions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- New fashion alone does not invalidate a sound decision; a broken core assumption triggers a concrete alternative analysis.

## Stop and recover

- Do not rewrite history or silently mark a decision superseded without an adoption instruction.

## Example requests

- **Normal (plan):** Reassess the cache decision now that writes occur in two regions.
- **edge (plan):** Revisit a queue choice after workload ordering requirements change.
- **blocked (inspect):** Review an old decision without its rationale; distinguish reconstruction from recorded facts.
