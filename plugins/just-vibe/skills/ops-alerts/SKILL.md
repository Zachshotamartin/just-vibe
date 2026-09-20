---
name: ops-alerts
description: "Design actionable alerts with ownership and response guidance"
---

# ops-alerts

Design actionable alerts with ownership and response guidance

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Operations methods](../../references/packs/operations.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; service objectives, telemetry, response ownership, notification destination, and noise tolerance.

exact service/environment, time window, revision/configuration identity, authorized logs/metrics, and operational constraints. Prefer observation before intervention; live restarts, traffic changes, restores, and notifications require the requested target/action. Redact sensitive telemetry.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Actionable alert rules and response guidance; enabling/sending notifications requires an explicit request.

None by default. Plan artifacts may be saved when requested.

## Execute

- Tie signals to impact, define windows/thresholds and missing-data behavior, test historical/fixture events, include recovery and suppression rules, and identify the responder action.

## Deliver and verify

- Alert definitions, rationale, runbook links, and false-positive/missed-event checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Sustained harmful failure triggers; expected brief transients do not page indiscriminately.

## Stop and recover

- Do not invent owners or send test pages implicitly. Missing signal quality is a prerequisite, not something thresholds can hide.

## Example request

Design actionable error-rate alerts with recovery behavior; do not enable notifications.
