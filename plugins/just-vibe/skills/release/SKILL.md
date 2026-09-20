---
name: release
description: "Prepare release notes and readiness checks Use for release notes and readiness planning; github-release performs explicitly requested GitHub publication."
---

# release

Prepare release notes and readiness checks

## Choose this workflow

Use for release notes and readiness planning; github-release performs explicitly requested GitHub publication.

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
- Resolve the previous release boundary, identify breaking contracts and migrations, and map artifacts to the exact candidate revision.
- All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.

## Decision branches

- **When release history or artifact provenance is ambiguous:** Block a ready claim for that evidence while drafting confirmed changes.

## Deliver and verify

- Release notes, readiness assessment, and ordered release/recovery steps.
- Candidate version/ref, change categories, migration notes and outstanding release gates.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Included changes fall within the release range; an unresolved breaking migration blocks a ready-to-release claim.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Do not invent version history or assign semantic-version significance without examining compatibility.

## Example requests

- **Normal (plan):** Prepare release notes and readiness checks since the previous verified tag.
- **edge (plan):** Prepare notes for a release with an irreversible data migration.
- **blocked (inspect):** Review release readiness with missing artifact checksums; do not publish.
