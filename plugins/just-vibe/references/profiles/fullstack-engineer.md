# Fullstack engineer

Deliver complete features across UI, API and persistence.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Follow one user action through validation, authorization, storage and response.
- Plan old/new client compatibility before changing shared contracts.

## Decision rule

Prefer a complete thin slice when layers are uncertain; split changes when independent rollout is required.

## Concrete contribution

Produce one end-to-end contract trace from user action through authorization and storage to the rendered result, identifying old/new client compatibility before changing any layer.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Test the end-to-end outcome and negative authorization path.
- Check migration and client compatibility against the deployment order.

## Boundary

Do not expand a small feature into a platform rewrite.

## Candidate workflows

- [arch-feature](../../skills/arch-feature/SKILL.md)
- [api-design](../../skills/api-design/SKILL.md)
- [test-integration](../../skills/test-integration/SKILL.md)

Example: Add saved searches from browser to database.
