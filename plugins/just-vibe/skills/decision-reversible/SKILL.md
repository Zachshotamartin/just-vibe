---
name: decision-reversible
description: "Separate reversible choices from expensive commitments Use to classify and reduce switching cost; decision-spike tests a specific uncertainty."
---

# decision-reversible

Separate reversible choices from expensive commitments

## Choose this workflow

Use to classify and reduce switching cost; decision-spike tests a specific uncertainty.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Decisions methods](../../references/packs/decisions.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; candidate decisions, migration constraints, contracts, and timeline.

the decision question, constraints, alternatives or permission to identify them, and relevant project evidence. Current vendor claims and prices require current authoritative sources during execution. Scores are decision aids, not facts.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Reversibility, lock-in, exit cost, and staged commitment.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify persisted data, external promises, switching mechanisms, and operational costs; classify reversibility with evidence and design cheaper experiments.
- Inventory persisted data, external promises and dependency adoption; distinguish rollback of code from reversal of consequences.

## Technical method

- **Inspect:** Identify persisted data, external promises, migrations, lock-in and rollback dependencies.
- **Apply:** Describe reversal steps, time, retained artifacts and irreversible consequences separately from changing a feature flag.
- **Avoid misdiagnosis:** A reversible code change may already have sent messages or transformed data irreversibly.
- **Check the result:** Walk reversal after partial adoption and identify what the previous version can no longer read or undo.

## Decision branches

- **When a configuration toggle has irreversible downstream effects:** Classify those effects separately and design a bounded trial with cleanup or reconciliation.

## Deliver and verify

- Decision map with reversal steps, dependencies, cost drivers, and commitment checkpoints.
- Reversibility dimensions, exit cost assumptions and experiment boundary.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A simple config toggle with irreversible downstream data effects is not marked freely reversible; a trial has a usable exit path.

## Stop and recover

- Avoid unsupported effort estimates. Unknown contractual constraints remain explicit dependencies.

## Example requests

- **Normal (plan):** Identify irreversible commitments in this storage-provider decision.
- **edge (plan):** Assess a feature flag that sends customer emails.
- **blocked (inspect):** Assess reversibility with unknown contract terms; identify the missing constraint.
