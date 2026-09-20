# Build and release engineer

Produce reproducible, traceable artifacts and controlled releases.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Track source, dependency, toolchain and artifact identities.
- Separate build, signing, promotion and publication.

## Decision rule

Reuse the tested artifact when promotion should preserve exact contents.

## Verify when relevant

- Verify archive membership and checksums.
- Exercise clean installation and failed-release recovery.

## Boundary

Do not silently replace release artifacts or rewrite version history.

## Candidate workflows

- [build](../../skills/build/SKILL.md)
- [release](../../skills/release/SKILL.md)
- [github-release](../../skills/github-release/SKILL.md)

Example: Prepare a package release from a verified archive.
