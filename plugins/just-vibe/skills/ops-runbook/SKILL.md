---
name: ops-runbook
description: "Write operational procedures from verified commands and behavior Use to write an operational procedure; ops-incident executes a scoped response."
---

# ops-runbook

Write operational procedures from verified commands and behavior

## Choose this workflow

Use to write an operational procedure; ops-incident executes a scoped response.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Operations methods](../../references/packs/operations.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; operational scenario, environment, existing procedures, and verified commands.

exact service/environment, time window, revision/configuration identity, authorized logs/metrics, and operational constraints. Prefer observation before intervention; live restarts, traffic changes, restores, and notifications require the requested target/action. Redact sensitive telemetry.

- **Infer from evidence:** Read service/environment, time window, revision, available telemetry and existing incident or recovery procedure.
- **Reasonable default:** Start from supplied logs and read-only observation; rank hypotheses without presenting an unexecuted intervention as recovery.
- **Ask only when needed:** Resolve the precise target and missing authority before restart, restore, notification or traffic changes; continue evidence analysis while waiting.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Diagnosis, intervention, validation, and recovery instructions for a defined event.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Inspect actual tooling/configuration, document prerequisites and target checks, order low-risk diagnostics first, mark destructive steps, and specify observable success/abort criteria.
2. Resolve actual environment/tool conventions, order diagnostics before mutation and give each action a target check, expected observation and abort/recovery path.
## Technical method

- **Inspect:** Verify target identity, command support, preconditions, expected observations and recovery dependencies.
- **Method:** Write steps that branch on real outcomes with abort conditions and explicit irreversible boundaries.
- **Avoid misdiagnosis:** A plausible command copied from another version or environment can be dangerous; documentation is not evidence it was exercised.
- **Check the result:** Rehearse in an appropriate isolated environment or mark untested steps, recording the exact observations needed to proceed.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Operations worked example](../../references/examples/operations.md).
- The procedure covers a Kubernetes rollout, rollback or readiness check: [Kubernetes release and readiness](../../references/methods/kubernetes-release.md).
- The procedure rebuilds or pins an environment: [Reproducible environments](../../references/methods/reproducible-environments.md).
- The procedure changes network device configuration: [Network operations](../../references/methods/network-operations.md).

## Decision branches

- **When a command cannot be exercised safely:** Mark it unverified and state its prerequisites rather than presenting it as rehearsed.

## Deliver and verify

- Runbook with exact contextualized commands, expected outcomes, escalation conditions, and recovery steps.
- Runnable steps with target checks, expected outputs and escalation/recovery conditions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A responder can distinguish the intended environment; each mutating step has a verification and failure path.

## Stop and recover

- Do not execute the incident procedure merely to write it. Mark commands not exercised in a safe environment as unverified.

## Example requests

- **Normal (plan):** Write a restore runbook with exact target checks and verification steps.
- **edge (plan):** Write a runbook for restoring queue processing without replaying completed charges.
- **blocked (inspect):** Draft a runbook without executing incident operations or fabricating terminal output.
