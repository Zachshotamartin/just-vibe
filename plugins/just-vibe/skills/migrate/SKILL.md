---
name: migrate
description: "Plan and apply a version, schema, or implementation migration. Use for coordinated version or platform transitions; db-migrate handles database-specific mechanics; a bundler switch to Vite uses vite-setup."
---

# migrate

Plan and apply a version, schema, or implementation migration.

## Choose this workflow

Use for coordinated version or platform transitions; db-migrate handles database-specific mechanics; a bundler switch to Vite uses vite-setup.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan the migration when asked; apply for requested source/configuration changes and bounded compatibility checks. Executing a live migration needs its target and rollout/recovery constraints.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Ordered migration across affected code/config/data contracts; no unrelated upgrades.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: edit the requested local implementation and perform relevant bounded checks while preserving unrelated work. Live data changes, remote actions and paid jobs require their resolved target and existing session authorization.

## Execute

1. Inventory old and new consumers, dependents and persisted formats, and read the version-specific changes.
2. Design transitional compatibility, prepare the edits and checks, and define recovery and the last reversible point before execution.
3. Validate coexistence before removing compatibility code.

## Technical method

- **Inspect:** Inventory old/new versions, consumers, persisted state, generated artifacts and compatibility requirements.
- **Method:** Read the relevant migration documentation and stage transition with explicit fallback before irreversible cleanup.
- **Avoid misdiagnosis:** Updating a version string does not migrate runtime semantics; code rollback may not read new persisted data.
- **Check the result:** Test old/new compatibility where required, migrated data invariants and interruption/recovery in isolation.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).

## Decision branches

- **When the target rejects an old persisted format:** Add an explicit conversion and recovery path before changing readers.

## Deliver and verify

- Ordered transitions or the authorized patch, a compatibility matrix, the recovery point and its limits, and verified versus unverified stages.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Old/new overlap behaves as specified; interrupted execution has a documented restart or recovery path.

## Stop and recover

- Irreversible data loss, unsupported targets, or ambiguous production scope must be resolved before dependent mutations.

## Example requests

- **Normal (plan):** Plan upgrading the job library while old workers remain active.
- **Edge (apply):** Apply the job-format migration while v1 workers still read stored jobs; define a restart point.
- **Blocked (inspect):** Plan a migration with missing legacy fixtures; identify the compatibility evidence still needed.
