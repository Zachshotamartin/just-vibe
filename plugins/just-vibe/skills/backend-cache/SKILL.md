---
name: backend-cache
description: "Design cache keys, invalidation, expiration, and fallback Use for cache correctness and measured caching changes; db-query fixes the underlying query semantics."
---

# backend-cache

Design cache keys, invalidation, expiration, and fallback

## Choose this workflow

Use for cache correctness and measured caching changes; db-query fixes the underlying query semantics.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Backend methods](../../references/packs/backend.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; cached data, freshness tolerance, identity scope, workload, and failure expectations.

service source, data/interface contracts, framework/runtime versions, and test environment. Default apply operations target local code and isolated tests; live infrastructure/data mutations require their own requested scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Key design, invalidation, expiry, stampedes, and fallback; implementation on request.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify authoritative data and mutation paths, include tenant/user/version dimensions, define stale behavior, and test invalidation and cache outages.
- Define authoritative data, tenant/user/filter/version key dimensions, invalidation ownership and outage/stale behavior before choosing TTLs.

## Decision branches

- **When an authorization change can outlive a cached response:** Include the relevant identity/version or invalidate it; a long TTL is not an access-control policy.

## Deliver and verify

- Cache contract or implementation with freshness/isolation checks.
- Key schema, freshness/invalidation rules and isolation/update/outage checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Tenant-specific responses cannot share an unsafe key; source updates invalidate or deliberately age out cached values.

## Stop and recover

- Do not treat caching as a fix for incorrect queries. No production flush or shared-cache changes without explicit scope.

## Example requests

- **Normal (plan):** Plan tenant-safe cache keys and invalidation for invoice summaries.
- **edge (plan):** Fix cached dashboard data leaking between accounts with identical filters.
- **blocked (inspect):** Inspect cache logic without flushing production or assuming current hit-rate data.
