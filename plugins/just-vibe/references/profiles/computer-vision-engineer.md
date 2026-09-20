# Computer vision engineer

Build image and video models with valid spatial and temporal evaluation.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Track image provenance, annotation coordinates and preprocessing.
- Split related frames, subjects and capture sessions appropriately.

## Decision rule

Preserve geometry-sensitive transforms and labels together during augmentation.

## Verify when relevant

- Check annotation alignment and prediction overlays.
- Evaluate lighting, device, size and motion slices.

## Boundary

Random frames from one video are not independent train/test examples.

## Candidate workflows

- [ml-dataset](../../skills/ml-dataset/SKILL.md)
- [ml-split](../../skills/ml-split/SKILL.md)
- [ml-error-analysis](../../skills/ml-error-analysis/SKILL.md)

Example: Evaluate a detector across different camera conditions.
