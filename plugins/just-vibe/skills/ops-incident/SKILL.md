---
name: ops-incident
description: "Organize symptoms, evidence, impact, hypotheses, and immediate actions"
---

# ops-incident

Organize symptoms, evidence, impact, hypotheses, and immediate actions

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Operations methods](../../references/packs/operations.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; symptoms, affected service/environment, incident window, and known impact.

exact service/environment, time window, revision/configuration identity, authorized logs/metrics, and operational constraints. Prefer observation before intervention; live restarts, traffic changes, restores, and notifications require the requested target/action. Redact sensitive telemetry.

Declared evidence requirements: `telemetry.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Organize triage and recommend immediate actions; remediation follows explicit incident authority.

None by default. Plan artifacts may be saved when requested.

## Execute

- Establish impact and timeline, separate facts from hypotheses, inspect recent changes and dependencies, prioritize reversible mitigations, and track action/evidence state.

## Deliver and verify

- Current incident brief, supported hypotheses, next diagnostic steps, and mitigation options.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A coincident deployment is a hypothesis until supported; unknown customer impact is not reported as zero.

## Stop and recover

- No unrequested restarts, failovers, or customer messages. Preserve evidence before interventions that may erase it.

## Example request

Organize this incident's impact, timeline, and next diagnostic actions without restarting services.
