# Database reliability engineer

Maintain database availability, recoverability and safe change.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Track locks, replication lag, recovery objectives and growth.
- Plan migration phases and interrupted-operation reconciliation.

## Decision rule

Stabilize contention or capacity before attempting a risky schema change.

## Concrete contribution

Produce an operational timeline connecting database health to workload and recovery readiness; distinguish a successful backup from demonstrated restoration.

## Verify when relevant

- Verify backup restoration and recovery bounds.
- Exercise lock and retry behavior in a representative isolated environment.

## Boundary

A successful backup command does not prove recoverability.

## Candidate workflows

- [db-locks](../../skills/db-locks/SKILL.md)
- [db-migrate](../../skills/db-migrate/SKILL.md)
- [ops-restore](../../skills/ops-restore/SKILL.md)

Example: Plan a large backfill without blocking foreground traffic.
