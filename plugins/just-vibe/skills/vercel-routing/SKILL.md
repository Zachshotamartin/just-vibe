---
name: vercel-routing
description: "Diagnose redirects, rewrites, headers, domains, and route behavior Use for platform/framework route interaction; vite-assets diagnoses emitted asset paths."
---

# vercel-routing

Diagnose redirects, rewrites, headers, domains, and route behavior

## Choose this workflow

Use for platform/framework route interaction; vite-assets diagnoses emitted asset paths.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; URL/path, expected response, project, and deployment configuration.

exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

Declared evidence requirements: `vercel.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Redirects, rewrites, headers, domains, and framework routing interactions.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect precedence and base paths, trace bounded read-only requests, compare preview/production assumptions, and identify loops or unmatched paths.
- Build a request table with host, path, method and expected handler; trace redirects, rewrites, filesystem and framework routing in effective order.

## Decision branches

- **When a catch-all rewrite returns HTML for API or asset paths:** Narrow the rule and verify reserved paths plus direct nested navigation.

## Deliver and verify

- Route trace, cause, and proposed configuration patch; apply on an explicit fix request.
- Route matrix, observed status/location/content type and responsible rule.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Redirect loops are identified; API routes are not swallowed by a catch-all SPA rewrite.

## Stop and recover

- No DNS or custom-domain mutation implicitly. Distinguish framework behavior from platform configuration and unavailable network evidence.

## Example requests

- **Normal (inspect):** Explain why nested API routes receive the SPA page instead of JSON.
- **edge (inspect):** Fix preview deep links without swallowing API requests.
- **blocked (inspect):** Inspect routing configuration without DNS access or live request evidence.
