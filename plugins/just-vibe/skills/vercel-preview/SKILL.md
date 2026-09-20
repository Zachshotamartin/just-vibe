---
name: vercel-preview
description: "Prepare and validate a branch or PR preview deployment Use for a specifically requested preview deployment; vercel-release-check assesses production readiness."
---

# vercel-preview

Prepare and validate a branch or PR preview deployment

## Choose this workflow

Use for a specifically requested preview deployment; vercel-release-check assesses production readiness.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; branch/PR, project, revision, and preview goal. An explicit create-preview request authorizes that preview deployment.

exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Preview environment only, including authorized smoke checks.

None by default. Plan artifacts may be saved when requested.

## Execute

- Resolve project/revision, inspect prerequisites, reuse a matching deployment where suitable, create only when requested, and verify URL, revision, routing, and key behavior.
- Resolve intended commit and project, reuse a matching deployment if appropriate and verify identity, access protection, routes and representative behavior.

## Technical method

- **Inspect:** Resolve branch/head SHA, existing matching deployments and access-protection expectations.
- **Apply:** Reuse an appropriate existing preview or create the requested one; check nested routes, APIs and assets at its immutable deployment identity.
- **Avoid misdiagnosis:** Anonymous 401/403 from protection is not necessarily app failure; a branch alias may advance while checks run.
- **Check the result:** Record deployment ID, SHA, URL and actual route observations, including unavailable protected checks.

## Decision branches

- **When a deployment request times out:** Query for the intended revision before retrying; distinguish a protected URL from an unhealthy app.

## Deliver and verify

- Preview plan or actual URL/deployment ID with smoke-check results.
- Preview identity/URL, exact revision, access requirements and observed checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The preview serves the intended commit; a protected preview is reported as access-restricted rather than broken without evidence.

## Stop and recover

- No promotion, production-domain changes, or unsolicited sharing. Check for existing deployment after uncertain creation.

## Example requests

- **Normal (plan):** Prepare a preview for this branch and project; identify prerequisites first.
- **edge (plan):** Create a preview after an earlier request returned no deployment ID.
- **blocked (inspect):** Plan a preview without provider access; do not invent a URL.
