---
name: vercel-release-check
description: "Verify a deployment and prepare promotion or rollback steps"
---

# vercel-release-check

Verify a deployment and prepare promotion or rollback steps

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

## Deliver and verify

- Evidence-based go/no-go assessment and exact promotion/recovery steps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Wrong revision blocks readiness; irreversible schema changes prevent claiming instant full rollback.

## Stop and recover

- Do not promote or change aliases from a check request. Missing required health evidence means not yet verified.

## Example request

Check the candidate deployment before promotion; do not promote it.
