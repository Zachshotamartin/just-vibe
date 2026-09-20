---
name: ops-logs
description: "Correlate available logs around a specific failure"
---

# ops-logs

Correlate available logs around a specific failure

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Operations methods](../../references/packs/operations.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; service/environment, time window, correlation identifiers, and question.

exact service/environment, time window, revision/configuration identity, authorized logs/metrics, and operational constraints. Prefer observation before intervention; live restarts, traffic changes, restores, and notifications require the requested target/action. Redact sensitive telemetry.

Declared evidence requirements: `telemetry.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Focused log correlation and anomaly explanation, not unrestricted telemetry export.

None by default. Plan artifacts may be saved when requested.

## Execute

- Normalize timestamps, follow request/job IDs, compare related services, separate repeated symptoms from root events, and redact sensitive fields.

## Deliver and verify

- Evidence-linked timeline, likely causal sequence, and gaps requiring metrics/traces.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Clock/time-zone differences are considered; missing logs are not proof that an event never occurred.

## Stop and recover

- Bound query range and volume. Do not dump entire production logs into the conversation or external storage.

## Example request

Correlate sanitized logs for this request ID and time window.
