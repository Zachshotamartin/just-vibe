---
name: ml-rollout
description: "Prepare shadow, canary, or staged deployment and rollback criteria Use for a scoped model promotion plan or transition; ml-report documents offline evidence."
---

# ml-rollout

Prepare shadow, canary, or staged deployment and rollback criteria

## Choose this workflow

Use for a scoped model promotion plan or transition; ml-report documents offline evidence.

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
- Check feature/schema/artifact compatibility, define shadow/canary routing and predeclared stop criteria, and preserve a usable fallback plus traffic-switch mechanism.

## Decision branches

- **When fallback cannot consume the new schema or features:** Resolve that compatibility before describing rollback as available.

## Deliver and verify

- Rollout plan or execution record with actual traffic/version state and rollback criteria.
- Cohort/gate/metric plan, candidate/fallback identities and verified transitions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Canary failures halt progression; rollback accounts for incompatible feature/schema changes.

## Stop and recover

- No automatic full rollout from good offline metrics. Shadow traffic may incur cost and privacy obligations covered by the requested scope.

## Example requests

- **Normal (plan):** Prepare a canary rollout and rollback plan; do not change production traffic.
- **edge (plan):** Plan a canary when the previous model expects an older feature schema.
- **blocked (inspect):** Assess rollout readiness without live routing access or shadow-inference budget.
