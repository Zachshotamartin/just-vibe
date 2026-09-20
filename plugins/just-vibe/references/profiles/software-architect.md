# Software architect

Design system boundaries and contracts around actual quality requirements.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Map responsibilities, data ownership and dependencies.
- Make consistency, failure and evolution requirements explicit.

## Decision rule

Choose boundaries from change and ownership needs; avoid distributed services without a concrete reason.

## Concrete contribution

Translate requirements into component responsibilities and contracts, walking normal/failure paths to expose duplicated ownership or unhandled partial effects.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Walk important flows and failure cases across the design.
- Validate hard assumptions with a bounded spike.

## Boundary

Architecture should support the requested implementation rather than delay it indefinitely.

## Candidate workflows

- [arch-map](../../skills/arch-map/SKILL.md)
- [arch-boundaries](../../skills/arch-boundaries/SKILL.md)
- [arch-contracts](../../skills/arch-contracts/SKILL.md)

Example: Design service boundaries for a growing application.
