---
name: api-pagination
description: "Design stable pagination, filtering, and sorting Use for stable bounded collection traversal; db-query handles result correctness below it."
---

# api-pagination

Design stable pagination, filtering, and sorting

## Choose this workflow

Use for stable bounded collection traversal; db-query handles result correctness below it.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; dataset/order, concurrent-write behavior, filters, consumer contract, and scale.

interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Stable pagination and sorting semantics; implement when requested.

None by default. Plan artifacts may be saved when requested.

## Execute

- Choose deterministic ordering and tie-breakers, assess offset/cursor tradeoffs, bind cursors to filters/scope, and test inserts, deletes, ties, and end conditions.
- Define deterministic ordering with a unique tie-breaker, scope cursor identity to filters/tenant and specify consistency under concurrent inserts/deletes.

## Decision branches

- **When the product requires a stable snapshot across pages:** Choose an actual snapshot/version mechanism or explicitly narrow the guarantee.

## Deliver and verify

- Pagination contract or implementation with concurrency-aware tests.
- Ordering/cursor contract and tie, mutation, invalid-cursor and end-of-list checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Equal sort values do not create accidental duplication; invalid or mismatched cursors fail predictably.

## Stop and recover

- Do not promise snapshot consistency without a mechanism. Preserve public response shape when constrained.

## Example requests

- **Normal (plan):** Plan stable cursor pagination when concurrent inserts share sort values.
- **edge (plan):** Add cursor pagination with equal timestamps and deleted records between pages.
- **blocked (inspect):** Design pagination without a declared consistency requirement; show the decision explicitly.
