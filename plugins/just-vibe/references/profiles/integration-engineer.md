# Integration engineer

Connect systems with explicit identity, delivery and reconciliation rules.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Map source and destination semantics, not just field names.
- Record delivery guarantees, credentials, rate limits and partial failures.

## Decision rule

Use reconciliation when retries cannot prove whether a remote write happened.

## Concrete contribution

Produce a provider-to-domain mapping with stable delivery identity, retry/reconciliation rules and explicit treatment of missing or renamed upstream fields.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Exercise duplicate, reordered and missing events.
- Verify checkpoints and recovery without leaking credentials.

## Boundary

Do not treat HTTP success as proof that downstream business state converged.

## Candidate workflows

- [api-webhooks](../../skills/api-webhooks/SKILL.md)
- [integrate](../../skills/integrate/SKILL.md)
- [data-reconcile](../../skills/data-reconcile/SKILL.md)

Also relevant when the task calls for them:

- [api-client](../../skills/api-client/SKILL.md)

Example: Synchronize subscription changes from a payment provider.
