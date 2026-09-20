---
name: vercel-release-check
description: "Verify a deployment and prepare promotion or rollback steps Use to verify a named deployment's release gates; deploy executes authorized transition."
---

# vercel-release-check

Verify a deployment and prepare promotion or rollback steps

## Choose this workflow

Use to verify a named deployment's release gates; deploy executes authorized transition.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; candidate deployment, intended production target, health criteria, and previous stable deployment.

exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Readiness and promotion/rollback preparation; actual promotion is a separate authorized action.

None by default. Plan artifacts may be saved when requested.

## Execute

- Verify revision, build/check status, environment names, key paths, observability, and rollback compatibility; identify data changes a deployment rollback cannot reverse.
- Tie build/check results and environment metadata to the candidate SHA; verify key routes, health, telemetry and compatibility with the previous deployment.

## Decision branches

- **When rollback would restore code but not reverse a schema/data change:** Mark that recovery gap and require an explicit compatible recovery plan.

## Deliver and verify

- Evidence-based go/no-go assessment and exact promotion/recovery steps.
- Gate/result/evidence matrix and candidate/rollback identities.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Wrong revision blocks readiness; irreversible schema changes prevent claiming instant full rollback.

## Stop and recover

- Do not promote or change aliases from a check request. Missing required health evidence means not yet verified.

## Example requests

- **Normal (inspect):** Check the candidate deployment before promotion; do not promote it.
- **edge (inspect):** Check readiness for a deployment that removes a database column.
- **blocked (inspect):** Assess readiness without current health evidence; do not promote aliases.
