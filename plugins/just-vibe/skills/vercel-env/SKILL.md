---
name: vercel-env
description: "Compare required variable names and scopes without exposing values"
---

# vercel-env

Compare required variable names and scopes without exposing values

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; project, environment/branch scopes, and required variable names.

exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

Declared evidence requirements: `vercel.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Presence, scope, and source of configuration names; values remain secret.

None by default. Plan artifacts may be saved when requested.

## Execute

- Derive required names from code/configuration, compare authorized metadata, identify missing/mis-scoped variables, and explain rebuild/redeployment implications.

## Deliver and verify

- Redacted name/scope matrix and proposed corrections.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A preview-only missing variable is distinguished from production; reports and commands never include secret values.

## Stop and recover

- Mutation needs an explicit configuration request and secure input channel. Do not fetch values when metadata suffices or copy production secrets into previews.

## Example request

Compare required variable names across preview and production without exposing values.
