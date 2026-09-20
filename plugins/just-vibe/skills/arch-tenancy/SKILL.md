---
name: arch-tenancy
description: "Evaluate tenant isolation across authentication, storage, queries, and jobs Use for system-wide tenant isolation; backend-permissions handles individual application checks."
---

# arch-tenancy

Evaluate tenant isolation across authentication, storage, queries, and jobs

## Choose this workflow

Use for system-wide tenant isolation; backend-permissions handles individual application checks.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; tenant model, resource types, membership rules, and access boundaries.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Tenant identity propagation across APIs, storage, caches, jobs, exports, and support operations.

None by default. Plan artifacts may be saved when requested.

## Execute

- Map tenant ownership, follow identity through every boundary, inspect membership changes and shared resources, and identify missing isolation checks.
- Follow tenant identity through API, database role, cache key, queue payload, file storage and support/admin paths.

## Decision branches

- **When an identity belongs to several organizations:** Separate membership from selected-tenant authorization at each effect boundary.

## Deliver and verify

- Isolation map, risk findings, and proposed negative tests or migration design.
- Resource ownership and propagation matrix with concrete bypass candidates.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Background jobs preserve tenant identity; multi-organization users cannot access an unselected unauthorized organization.

## Stop and recover

- Do not use real cross-tenant data for probing. Policy ambiguity must be resolved before implementing access changes.

## Example requests

- **Normal (inspect):** Audit organization isolation across caches, jobs, APIs, and exports.
- **edge (inspect):** Review multi-organization users and background exports.
- **blocked (inspect):** Inspect tenancy without authorized test identities; use source and synthetic fixtures only.
