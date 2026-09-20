---
name: ops-restore
description: "Prepare or validate backup restoration in an appropriate environment"
---

# ops-restore

Prepare or validate backup restoration in an appropriate environment

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Operations methods](../../references/packs/operations.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; backup identity, source system, isolated destination, recovery objectives, and encryption/access prerequisites.

exact service/environment, time window, revision/configuration identity, authorized logs/metrics, and operational constraints. Prefer observation before intervention; live restarts, traffic changes, restores, and notifications require the requested target/action. Redact sensitive telemetry.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Validate restoration and readiness; production replacement requires exact explicit authorization.

None by default. Plan artifacts may be saved when requested.

## Execute

- Verify backup provenance/completeness, plan target isolation, execute authorized restore, check schema/counts/integrity and application behavior, and record recovery duration/data loss window.

## Deliver and verify

- Restore procedure or exercise report with verified recovery evidence and limitations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Restore succeeds into the intended isolated destination; a readable backup alone does not count as demonstrated recoverability.

## Stop and recover

- Never overwrite live data implicitly. Missing keys, integrity checks, or target identity stops execution before destructive steps.

## Example request

Plan restoring the specified backup into an isolated target, not production.
