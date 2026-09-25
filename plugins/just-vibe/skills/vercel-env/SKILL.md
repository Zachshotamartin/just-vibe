---
name: vercel-env
description: "Compare required variable names and scopes without exposing values. Use to inspect or explicitly manage variable names/scopes; vite-env traces client exposure and build modes."
---

# vercel-env

Compare required variable names and scopes without exposing values.

## Choose this workflow

Use to inspect or explicitly manage variable names/scopes; vite-env traces client exposure and build modes.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; project, environment/branch scopes, and required variable names. Adding, changing or removing a requested variable uses apply mode.

**Pack prerequisites:** Exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

- **Infer from evidence:** Read the linked project, team, framework, environment and deployment SHA from local config and supplied deployment evidence.
- **Reasonable default:** Diagnose locally with existing build scripts when deployment access is missing; do not infer a production target from a preview URL.
- **Ask only when needed:** Resolve a missing deployment/team/environment before the dependent remote operation; names and scope suffice without exposing environment values.

Declared evidence requirements: `vercel.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Presence, scope, and source of configuration names; values remain secret.

Inspect/plan: report names, scopes and gaps without reading or printing secret values; save requested artifacts only. Apply: add, update or remove only the requested variable in the resolved project and environment scope through a secure input channel, never echoing its value. Redeploying to pick up the change is a separate requested action.

## Execute

1. Derive required names from code and configuration, and map each to build-time or runtime usage and its intended environment and branch.
2. Compare with authorized metadata to report presence and scope without fetching secret values; identify missing or mis-scoped variables and explain rebuild or redeployment implications.

## Technical method

- **Inspect:** Inventory required names across the default and any custom environments, and whether consumers read them during build, server runtime or browser execution.
- **Method:** Compare development, preview, branch, production and any custom environment presence using names only; identify which changes require a rebuild/redeployment.
- **Avoid misdiagnosis:** Public prefixes expose compiled values; changing a setting does not update already-built assets.
- **Check the result:** Verify the expected consumer sees the correct environment using a non-secret sentinel or presence check without downloading or printing credentials.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Vercel worked example](../../references/examples/vercel.md).


## Decision branches

- **When a changed value is compiled into a static client bundle:** Explain the required rebuild/deployment and inspect public exposure; editing a variable alone does not change an existing bundle.

## Deliver and verify

- Redacted variable-name table with consumer, environment, branch scope, rebuild implications and proposed corrections.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A preview-only missing variable is distinguished from production; reports and commands never include secret values.

## Stop and recover

- Mutation needs an explicit configuration request and secure input channel. Do not fetch values when metadata suffices or copy production secrets into previews.

## Example requests

- **Normal (inspect):** Compare required variable names across preview and production without exposing values.
- **Edge (inspect):** Inspect a variable present in production but absent on a branch-specific preview.
- **Blocked (inspect):** Assess required environment names from source without downloading secret values.
