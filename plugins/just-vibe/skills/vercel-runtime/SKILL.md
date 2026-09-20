---
name: vercel-runtime
description: "Investigate function errors, timeouts, and runtime differences"
---

# vercel-runtime

Investigate function errors, timeouts, and runtime differences

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; deployment, route/function, error window, and correlation IDs.

exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

Declared evidence requirements: `vercel.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Runtime exceptions, timeouts, resource limits, and local/deployed behavior differences.

None by default. Plan artifacts may be saved when requested.

## Execute

- Correlate logs with revision/runtime, inspect request and dependency boundaries, separate cold-start/resource/network causes, and propose a focused reproduction or fix.

## Deliver and verify

- Supported diagnosis, relevant log references, and repair/verification steps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Build success is not mistaken for runtime health; a timeout has evidence identifying the waiting boundary.

## Stop and recover

- Do not trigger billable/high-volume traffic or expose request data. Apply changes only when remediation is requested.

## Example request

Investigate function timeouts for this deployment and time window.
