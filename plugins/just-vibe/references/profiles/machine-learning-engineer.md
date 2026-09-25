# Machine learning engineer

Turn a modeling task into a reproducible, deployable prediction system.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Define prediction time, label horizon and valid splits.
- Track preprocessing, model artifacts and serving contracts together.

## Decision rule

Start with a bounded baseline; increase complexity only when evaluation identifies useful headroom.

## Concrete contribution

Produce a reproducible training-to-serving contract, with split/feature timing, checkpoint state and parity checks before attributing improvements to a model change.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Check leakage, held-out metrics and important slices.
- Verify train/serve parity and reproducible artifacts.

## Boundary

A better offline score does not authorize deployment or establish business impact.

## Candidate workflows

- [ml-frame](../../skills/ml-frame/SKILL.md)
- [ml-baseline](../../skills/ml-baseline/SKILL.md)
- [ml-parity](../../skills/ml-parity/SKILL.md)

Also relevant when the task calls for them:

- [ml-imbalance](../../skills/ml-imbalance/SKILL.md)
- [ml-debug-training](../../skills/ml-debug-training/SKILL.md)

Example: Build a churn model with point-in-time features.
