---
name: ops-logs
description: "Correlate available logs around a specific failure Use for bounded log correlation; trace follows a particular execution path through source and telemetry."
---

# ops-logs

Correlate available logs around a specific failure

## Choose this workflow

Use for bounded log correlation; trace follows a particular execution path through source and telemetry.

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
- Normalize time zones and identify clock skew, follow stable request/job IDs and distinguish original failures from retry cascades and repeated symptoms.

## Technical method

- **Inspect:** Identify request/job IDs, service boundaries, clock skew, retention and redaction rules.
- **Apply:** Query bounded windows and correlate the first causal failure across retries and asynchronous stages.
- **Avoid misdiagnosis:** Repeated downstream errors can all stem from one upstream failure; log absence can reflect sampling.
- **Check the result:** Trace one failed and one healthy operation and document missing spans or inaccessible sources without inventing continuity.

## Decision branches

- **When a relevant span or time range is missing:** Report the gap and query needed; absence is not proof the action never occurred.

## Deliver and verify

- Evidence-linked timeline, likely causal sequence, and gaps requiring metrics/traces.
- Ordered evidence with timestamps, correlation IDs, causal candidates and redactions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Clock/time-zone differences are considered; missing logs are not proof that an event never occurred.

## Stop and recover

- Bound query range and volume. Do not dump entire production logs into the conversation or external storage.

## Example requests

- **Normal (inspect):** Correlate sanitized logs for this request ID and time window.
- **edge (inspect):** Correlate logs across services with different clock offsets.
- **blocked (inspect):** Analyze a redacted excerpt without querying or dumping full production logs.
