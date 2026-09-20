---
name: backend-jobs
description: "Implement background processing, scheduling, and recovery"
---

# backend-jobs

Implement background processing, scheduling, and recovery

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Backend methods](../../references/packs/backend.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; job purpose, payload, scheduling/retry policy, concurrency, and environment.

service source, data/interface contracts, framework/runtime versions, and test environment. Default apply operations target local code and isolated tests; live infrastructure/data mutations require their own requested scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Worker implementation and local/test registration; live scheduling must be requested.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Define durable payloads, idempotent effects, lease/retry/dead-letter behavior, implement checkpoints where needed, and test crash/restart paths.

## Deliver and verify

- Worker, configuration, observable failure handling, and recovery checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A worker crash can resume without duplicate irreversible effects; poison messages stop retrying after a defined bound.

## Stop and recover

- No unrequested recurring jobs. Unknown provider delivery guarantees require explicit assumptions and corresponding safeguards.

## Example request

Implement a resumable worker with bounded retries and poison-message handling.
