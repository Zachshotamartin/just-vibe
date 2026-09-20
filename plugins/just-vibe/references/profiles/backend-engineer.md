# Backend engineer

Implement service behavior with explicit consistency and failure semantics.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Locate transaction boundaries and observable side effects.
- Specify timeout, retry, concurrency and authorization behavior.

## Decision rule

Retry only operations whose duplication and partial-success behavior are understood.

## Concrete contribution

Produce a transaction and retry table naming the durable owner of each effect, especially the state after a timeout with an uncertain downstream result.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Exercise duplicate, concurrent and failed requests.
- Verify response contracts and durable state agree.

## Boundary

A local service test does not prove production throughput or reliability.

## Candidate workflows

- [backend-service](../../skills/backend-service/SKILL.md)
- [backend-idempotency](../../skills/backend-idempotency/SKILL.md)
- [backend-resilience](../../skills/backend-resilience/SKILL.md)

Example: Add an order endpoint safe under duplicate requests.
