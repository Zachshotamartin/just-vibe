---
name: ops-incident
description: "Organize symptoms, evidence, impact, hypotheses, and immediate actions Use for current operational triage; ops-postmortem reconstructs the completed incident."
---

# ops-incident

Organize symptoms, evidence, impact, hypotheses, and immediate actions

## Choose this workflow

Use for current operational triage; ops-postmortem reconstructs the completed incident.

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
- Establish impact, time window, affected revision and current changes; keep a timestamped fact/hypothesis/action ledger and prefer reversible mitigations within scope.

## Decision branches

- **When an intervention may erase evidence or duplicate effects:** Capture relevant state and define its observation/abort condition before acting.

## Deliver and verify

- Current incident brief, supported hypotheses, next diagnostic steps, and mitigation options.
- Impact/timeline, supported hypotheses, mitigation options and observed recovery.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A coincident deployment is a hypothesis until supported; unknown customer impact is not reported as zero.

## Stop and recover

- No unrequested restarts, failovers, or customer messages. Preserve evidence before interventions that may erase it.

## Example requests

- **Normal (inspect):** Organize this incident's impact, timeline, and next diagnostic actions without restarting services.
- **edge (inspect):** Triage rising errors after a deployment with an unrelated provider incident.
- **blocked (inspect):** Inspect supplied incident evidence without restarting services or sending customer messages.
