---
name: migrate
description: "Plan and apply a version, schema, or implementation migration"
---

# migrate

Plan and apply a version, schema, or implementation migration

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; source/target version or implementation, compatibility needs, and rollout environment. Apply only when migration execution is requested.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Ordered migration across affected code/config/data contracts; no unrelated upgrades.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inventory dependents, read version-specific changes, design transitional compatibility, prepare edits/checks, and define recovery before execution.

## Deliver and verify

- Migration sequence or authorized patch, compatibility matrix, verification, and recovery limitations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Old/new overlap behaves as specified; interrupted execution has a documented restart or recovery path.

## Stop and recover

- Irreversible data loss, unsupported targets, or ambiguous production scope must be resolved before dependent mutations.

## Example request

Plan upgrading the job library while old workers remain active.
