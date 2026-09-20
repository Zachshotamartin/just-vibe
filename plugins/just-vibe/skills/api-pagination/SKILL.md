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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan a pagination contract when requested; apply for requested implementation with resolved ordering, cursor scope and consistency semantics.

interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

- **Infer from evidence:** Read producer/consumer schemas, error contracts, auth conventions and known supported client versions.
- **Reasonable default:** Keep compatible response and pagination semantics where the brief does not request a breaking change.
- **Ask only when needed:** Ask when contract sources disagree or an unknown consumer changes compatibility; do not require live credentials to write or test an isolated client.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Stable pagination and sorting semantics; implement when requested.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: edit the requested local implementation and perform relevant bounded checks while preserving unrelated work. Live data changes, remote actions and paid jobs require their resolved target and existing session authorization.

## Execute

1. Choose deterministic ordering and tie-breakers, assess offset/cursor tradeoffs, bind cursors to filters/scope, and test inserts, deletes, ties, and end conditions.
2. Define deterministic ordering with a unique tie-breaker, scope cursor identity to filters/tenant and specify consistency under concurrent inserts/deletes.
## Technical method

- **Inspect:** Inspect ordering columns, uniqueness, null ordering, filters, tenant scope and consistency requirements.
- **Method:** Use a deterministic composite position and bind cursors to query/scope; define live versus snapshot traversal.
- **Avoid misdiagnosis:** Offset shifts under writes and nonunique sort keys can skip or duplicate records; base64 is not tamper protection.
- **Check the result:** Test equal sort values, concurrent insert/delete, empty/last pages and a cursor from another tenant or filter.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [APIs worked example](../../references/examples/api.md).


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
- **edge (apply):** Add cursor pagination with equal timestamps and deleted records between pages.
- **blocked (inspect):** Design pagination without a declared consistency requirement; show the decision explicitly.
