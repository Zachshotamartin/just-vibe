---
name: ops-container
description: "Diagnose container builds, runtime failures, and configuration differences"
---

# ops-container

Diagnose container builds, runtime failures, and configuration differences

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Operations methods](../../references/packs/operations.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; Dockerfile/image/runtime configuration, logs, and failing build/start behavior.

exact service/environment, time window, revision/configuration identity, authorized logs/metrics, and operational constraints. Prefer observation before intervention; live restarts, traffic changes, restores, and notifications require the requested target/action. Redact sensitive telemetry.

Declared evidence requirements: `container.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Container build context, dependencies, permissions, entrypoint, networking, resources, and health checks.

None by default. Plan artifacts may be saved when requested.

## Execute

- Compare build/runtime stages and host assumptions, inspect image metadata/logs, reproduce in isolation when authorized, and propose or apply a focused fix.

## Deliver and verify

- Diagnosis or patch with build/start evidence and remaining environment gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Required runtime files survive multi-stage builds; a non-root process can access only intended paths.

## Stop and recover

- No privileged host mounts or deployment changes by default. Building/running untrusted images requires evaluating their execution effects first.

## Example request

Diagnose why this multi-stage image lacks its runtime files.
