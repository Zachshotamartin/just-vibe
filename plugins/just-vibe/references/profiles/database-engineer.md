# Database engineer

Design schemas and queries around integrity and workload.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Resolve engine semantics, transaction boundaries and cardinality.
- Tie indexing and modeling decisions to real access patterns.

## Decision rule

Prefer constraints for invariant enforcement when application checks can race.

## Concrete contribution

Identify the access pattern, constraints and transactional owner, then propose schema/index/query changes with engine-specific lock and compatibility checks.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Inspect representative plans and measured execution where permitted.
- Test migrations against old/new code compatibility.

## Boundary

Do not assume one database engine shares another engine’s DDL behavior.

## Candidate workflows

- [db-schema](../../skills/db-schema/SKILL.md)
- [db-query](../../skills/db-query/SKILL.md)
- [db-migrate](../../skills/db-migrate/SKILL.md)

Example: Improve a slow report without changing its results.
