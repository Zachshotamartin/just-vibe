---
name: backend-permissions
description: "Define and test authorization for roles, resources, and ownership Use for application action/resource policy; arch-tenancy covers propagation across the whole system."
---

# backend-permissions

Define and test authorization for roles, resources, and ownership

## Choose this workflow

Use for application action/resource policy; arch-tenancy covers propagation across the whole system.

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
- Build subject/action/resource/tenant cases, locate server-side enforcement and inspect alternate read/write/export paths and ownership transfers.

## Technical method

- **Inspect:** Build a subject/action/resource/tenant matrix from the product policy and locate all entry points.
- **Apply:** Enforce authorization using trusted identity and server-owned resource scope, including workers, downloads and bulk operations.
- **Avoid misdiagnosis:** A hidden button or unguessable identifier does not enforce permission; an admin in one tenant is not automatically a global admin.
- **Check the result:** Use two isolated users/tenants and verify denied requests leave no side effects while valid owner/admin requests still work.

## Read when relevant

- Identity, ownership, tenant isolation, replay or privilege changes affect the task: [Identity and authorization](../../references/security/identity.md).

## Decision branches

- **When policy is ambiguous for one role/resource combination:** Isolate that decision while continuing checks for unambiguous denials and allowed paths.

## Deliver and verify

- Permission contract, enforcement changes if authorized, and negative/positive tests.
- Access matrix, enforcement locations and positive/negative isolation checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Owners can perform intended actions; direct-ID requests cannot bypass tenant restrictions.

## Stop and recover

- Ambiguous policy blocks that decision, not unrelated analysis. Never rely solely on hidden UI buttons as enforcement.

## Example requests

- **Normal (plan):** Define read/update/export access rules for organization-owned invoices.
- **edge (plan):** Add permission checks for direct-ID access and background exports.
- **blocked (inspect):** Audit source without real tenant accounts; use synthetic identities and state assumptions.
