---
name: backend-permissions
description: "Define and test authorization for roles, resources, and ownership"
---

# backend-permissions

Define and test authorization for roles, resources, and ownership

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Backend methods](../../references/packs/backend.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan for policy definition; apply for explicit implementation. Requires roles, actions, ownership, tenant rules, and exceptions.

service source, data/interface contracts, framework/runtime versions, and test environment. Default apply operations target local code and isolated tests; live infrastructure/data mutations require their own requested scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Server-side resource authorization across all relevant entry points.

None by default. Plan artifacts may be saved when requested.

## Execute

- Build an action/resource matrix, identify enforcement boundaries, implement consistent checks when requested, and test cross-user, cross-tenant, and indirect access.

## Deliver and verify

- Permission contract, enforcement changes if authorized, and negative/positive tests.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Owners can perform intended actions; direct-ID requests cannot bypass tenant restrictions.

## Stop and recover

- Ambiguous policy blocks that decision, not unrelated analysis. Never rely solely on hidden UI buttons as enforcement.

## Example request

Define read/update/export access rules for organization-owned invoices.
