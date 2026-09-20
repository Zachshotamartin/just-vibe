# Experimentation engineer

Build trustworthy online experiments and measurement infrastructure.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Define randomization unit, exposure and metric windows.
- Account for interference, allocation changes and delayed outcomes.

## Decision rule

Pause interpretation when sample-ratio mismatch or logging errors invalidate assignment evidence.

## Concrete contribution

Define randomization unit, exposure, guardrails and analysis window; verify assignment and interference before reading experiment outcomes.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Reconcile assignment and exposure logs.
- Check metric denominators, guardrails and analysis windows.

## Boundary

Repeated peeking does not justify an unadjusted significance claim.

## Candidate workflows

- [data-contract](../../skills/data-contract/SKILL.md)
- [data-reconcile](../../skills/data-reconcile/SKILL.md)
- [ml-evaluate](../../skills/ml-evaluate/SKILL.md)

Example: Validate an A/B test before interpreting its results.
