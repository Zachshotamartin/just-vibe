---
name: ops-runbook
description: "Write operational procedures from verified commands and behavior"
---

# ops-runbook

Write operational procedures from verified commands and behavior

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Operations methods](../../references/packs/operations.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; operational scenario, environment, existing procedures, and verified commands.

exact service/environment, time window, revision/configuration identity, authorized logs/metrics, and operational constraints. Prefer observation before intervention; live restarts, traffic changes, restores, and notifications require the requested target/action. Redact sensitive telemetry.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Diagnosis, intervention, validation, and recovery instructions for a defined event.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect actual tooling/configuration, document prerequisites and target checks, order low-risk diagnostics first, mark destructive steps, and specify observable success/abort criteria.

## Deliver and verify

- Runbook with exact contextualized commands, expected outcomes, escalation conditions, and recovery steps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A responder can distinguish the intended environment; each mutating step has a verification and failure path.

## Stop and recover

- Do not execute the incident procedure merely to write it. Mark commands not exercised in a safe environment as unverified.

## Example request

Write a restore runbook with exact target checks and verification steps.
