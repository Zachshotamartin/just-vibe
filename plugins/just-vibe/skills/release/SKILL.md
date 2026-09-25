---
name: release
description: "Prepare release notes and readiness checks. Use for release notes, changelog and version preparation; github-release performs explicitly requested GitHub publication."
---

# release

Prepare release notes and readiness checks.

## Choose this workflow

Use for release notes, changelog and version preparation; github-release performs explicitly requested GitHub publication.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; release range/version, audience, compatibility expectations, and release process. Apply for requested local preparation of changelog and version files; tagging, publishing and deployment need their explicit action.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`, `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Release notes and readiness; tagging, publication, and deployment require explicit requested actions.

Inspect/plan: prepare notes and readiness checks; save requested artifacts only. Apply: edit only the requested changelog and version files and run relevant checks. Tagging, publishing and deployment need their own exact request; github-release handles GitHub publication.

## Execute

1. Resolve the verified previous release boundary and map artifacts to the exact candidate revision.
2. Inspect changes since that boundary, group user-facing outcomes, and surface breaking contracts with their migration guidance.
3. Review the required checks for the candidate revision.
4. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.

## Technical method

- **Inspect:** Resolve version, release range, artifact contents, compatibility and validation records.
- **Method:** Prepare notes and readiness gates from actual changes; bind tested artifacts to hashes and identify recovery limits.
- **Avoid misdiagnosis:** Source version changes do not publish a package; a rebuilt archive differs from the one previously tested.
- **Check the result:** Inspect the exact candidate archive and version/manifest consistency and keep unpublished or pending platform checks explicit.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When release history or artifact provenance is ambiguous:** Block a ready claim for that evidence while drafting confirmed changes.
- **When a tag or publication is requested on a host other than GitHub:** Resolve the exact registry or host, version and artifacts, confirm the changelog and version files match, and treat the tag and publish as separate external actions with their own target.

## Deliver and verify

- Release notes for the candidate version/ref grouped by change category, with migration notes, outstanding release gates and ordered release/recovery steps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Included changes fall within the release range; an unresolved breaking migration blocks a ready-to-release claim.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Do not invent version history or assign semantic-version significance without examining compatibility.

## Example requests

- **Normal (plan):** Prepare release notes and readiness checks since the previous verified tag.
- **Edge (plan):** Prepare notes for a release with an irreversible data migration.
- **Blocked (inspect):** Review release readiness with missing artifact checksums; do not publish.
- **Additional (apply):** Write the 2.1.0 CHANGELOG entry and bump package versions; do not tag or publish.
