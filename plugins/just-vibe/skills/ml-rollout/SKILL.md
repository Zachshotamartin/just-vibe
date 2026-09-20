---
name: ml-rollout
description: "Prepare shadow, canary, or staged deployment and rollback criteria"
---

# ml-rollout

Prepare shadow, canary, or staged deployment and rollback criteria

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML deployment methods](../../references/packs/ml-deployment.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; candidate/stable models, target service, evaluation evidence, traffic constraints, and rollback thresholds.

versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Shadow/canary/staged rollout and recovery; execution only on explicitly authorized targets.

None by default. Plan artifacts may be saved when requested.

## Execute

- Check package/schema compatibility, define cohort routing and comparison metrics, preserve fallback artifacts, prepare staged gates, and verify authorized transitions against evidence.

## Deliver and verify

- Rollout plan or execution record with actual traffic/version state and rollback criteria.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Canary failures halt progression; rollback accounts for incompatible feature/schema changes.

## Stop and recover

- No automatic full rollout from good offline metrics. Shadow traffic may incur cost and privacy obligations covered by the requested scope.

## Example request

Prepare a canary rollout and rollback plan; do not change production traffic.
