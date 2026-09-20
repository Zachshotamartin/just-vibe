---
name: release
description: "Prepare release notes and readiness checks"
---

# release

Prepare release notes and readiness checks

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; release range/version, audience, compatibility expectations, and release process.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Release notes and readiness; tagging, publication, and deployment require explicit requested actions.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect changes since the verified previous release, group user-facing outcomes, surface breaking changes, and review required checks and migration guidance.

## Deliver and verify

- Release notes, readiness assessment, and ordered release/recovery steps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Included changes fall within the release range; an unresolved breaking migration blocks a ready-to-release claim.

## Stop and recover

- Do not invent version history or assign semantic-version significance without examining compatibility.

## Example request

Prepare release notes and readiness checks since the previous verified tag.
