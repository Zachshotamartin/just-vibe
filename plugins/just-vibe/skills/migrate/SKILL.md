---
name: migrate
description: "Plan and apply a version, schema, or implementation migration Use for coordinated version or platform transitions; db-migrate handles database-specific mechanics."
---

# migrate

Plan and apply a version, schema, or implementation migration

## Choose this workflow

Use for coordinated version or platform transitions; db-migrate handles database-specific mechanics.

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
- Inventory old/new consumers and persisted formats; identify the last reversible point and validate coexistence before removing compatibility code.

## Technical method

- **Inspect:** Inventory old/new versions, consumers, persisted state, generated artifacts and compatibility requirements.
- **Apply:** Read the relevant migration documentation and stage transition with explicit fallback before irreversible cleanup.
- **Avoid misdiagnosis:** Updating a version string does not migrate runtime semantics; code rollback may not read new persisted data.
- **Check the result:** Test old/new compatibility where required, migrated data invariants and interruption/recovery in isolation.

## Read when relevant

- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).

## Decision branches

- **When the target rejects an old persisted format:** Add an explicit conversion and recovery path before changing readers.

## Deliver and verify

- Migration sequence or authorized patch, compatibility matrix, verification, and recovery limitations.
- Compatibility matrix, ordered transitions, recovery point and verified/unverified stages.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Old/new overlap behaves as specified; interrupted execution has a documented restart or recovery path.

## Stop and recover

- Irreversible data loss, unsupported targets, or ambiguous production scope must be resolved before dependent mutations.

## Example requests

- **Normal (plan):** Plan upgrading the job library while old workers remain active.
- **edge (plan):** Migrate a library while older workers continue reading stored jobs.
- **blocked (inspect):** Plan a migration with missing legacy fixtures; identify the compatibility evidence still needed.
