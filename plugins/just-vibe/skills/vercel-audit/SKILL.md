---
name: vercel-audit
description: "Inspect project configuration, build settings, and deployment assumptions"
---

# vercel-audit

Inspect project configuration, build settings, and deployment assumptions

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; project and repository plus reported deployment concerns.

exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

Declared evidence requirements: `vercel.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Framework detection, root/build/output settings, runtime assumptions, and deployment configuration.

None by default. Plan artifacts may be saved when requested.

## Execute

- Compare repository scripts/configuration with project settings, inspect recent deployment metadata, and identify drift or unsupported assumptions.

## Deliver and verify

- Configuration inventory, evidence-backed findings, and ordered fixes.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A wrong monorepo root is identified; missing settings access is reported rather than assumed to match local defaults.

## Stop and recover

- No settings edits or new deployment. Do not treat a successful old deployment as evidence the current revision is healthy.

## Example request

Audit the linked project's build settings against this monorepo configuration.
