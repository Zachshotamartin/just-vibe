---
name: ops-postmortem
description: "Produce evidence-based timelines and concrete follow-up work"
---

# ops-postmortem

Produce evidence-based timelines and concrete follow-up work

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Operations methods](../../references/packs/operations.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; incident evidence, timeline, impacts, actions, and intended audience.

exact service/environment, time window, revision/configuration identity, authorized logs/metrics, and operational constraints. Prefer observation before intervention; live restarts, traffic changes, restores, and notifications require the requested target/action. Redact sensitive telemetry.

Declared evidence requirements: `telemetry.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Evidence-based learning and follow-up design; no blame assignment or external publication.

None by default. Plan artifacts may be saved when requested.

## Execute

- Reconcile times and observations, distinguish trigger from contributing conditions, document detection/recovery gaps, and define specific preventive/detective actions with measurable outcomes.

## Deliver and verify

- Postmortem with evidence-linked timeline, impact, causal analysis, and follow-up proposals.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Unknown root cause remains explicit; each proposed action addresses a documented failure mechanism.

## Stop and recover

- Do not invent owners, impact counts, or consensus. Sending the report or creating external action tickets requires explicit instructions.

## Example request

Write an evidence-based postmortem without inventing impact counts or owners.
