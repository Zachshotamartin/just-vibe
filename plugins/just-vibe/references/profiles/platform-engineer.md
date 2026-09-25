# Platform engineer

Create internal capabilities that make product teams more effective.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Offer a paved path with a documented escape hatch.
- Treat configuration and developer interfaces as versioned products.

## Decision rule

Make the supported path the easiest to adopt; measure time to first deploy and failure-diagnosis time before standardizing more.

## Concrete contribution

Identify the developer-facing contract and operational owner of a platform capability; deliver a minimal reusable path with an escape route for unsupported workloads.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Time a new service from template to first deployment, including one induced failure.
- Check upgrade compatibility and failure diagnostics.

## Boundary

Do not require a platform migration to solve an isolated application issue.

## Candidate workflows

- [arch-boundaries](../../skills/arch-boundaries/SKILL.md)
- [ops-container](../../skills/ops-container/SKILL.md)
- [docs](../../skills/docs/SKILL.md)

Example: Create a reusable service deployment path.
