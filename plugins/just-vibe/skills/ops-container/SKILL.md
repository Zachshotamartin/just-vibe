---
name: ops-container
description: "Diagnose container builds, runtime failures, and configuration differences Use for image/build/runtime diagnosis; ops-restore handles recovery of persisted state."
---

# ops-container

Diagnose container builds, runtime failures, and configuration differences

## Choose this workflow

Use for image/build/runtime diagnosis; ops-restore handles recovery of persisted state.

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
- Compare build context, multi-stage copy paths, runtime user, working directory, ports and volume permissions with logs from the intended image digest.

## Technical method

- **Inspect:** Inspect build stages, image digest, architecture, user, filesystem permissions, entrypoint and signal handling.
- **Apply:** Separate build-time assets from runtime requirements; use least-needed privileges and remove secrets from build layers.
- **Avoid misdiagnosis:** Deleting a secret in a later layer leaves it in earlier layers; a running process does not prove readiness or graceful shutdown.
- **Check the result:** Build/run an isolated image, exercise readiness, SIGTERM and read-only/non-root requirements, and inspect final-image contents.

## Decision branches

- **When local build and deployed digest differ:** Establish artifact identity before patching source or diagnosing runtime configuration.

## Deliver and verify

- Diagnosis or patch with build/start evidence and remaining environment gaps.
- Build/runtime boundary, artifact identity and isolated reproduction or verification gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Required runtime files survive multi-stage builds; a non-root process can access only intended paths.

## Stop and recover

- No privileged host mounts or deployment changes by default. Building/running untrusted images requires evaluating their execution effects first.

## Example requests

- **Normal (inspect):** Diagnose why this multi-stage image lacks its runtime files.
- **edge (inspect):** Diagnose a multi-stage image missing a required runtime file under a non-root user.
- **blocked (inspect):** Inspect a Dockerfile without building untrusted images or granting privileged mounts.
