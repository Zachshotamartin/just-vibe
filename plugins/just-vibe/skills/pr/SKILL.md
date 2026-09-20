---
name: pr
description: "Prepare a focused diff summary, PR description, and validation notes"
---

# pr

Prepare a focused diff summary, PR description, and validation notes

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; branch/base, intended change, and available verification results.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Prepare a PR title/body and diff summary; submission is handled by `github-pr` when requested.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect the actual diff, separate unrelated edits, explain changed behavior, and include only checks supported by evidence.

## Deliver and verify

- Reviewable title, description, risk notes, and readiness gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Description matches the final diff; unrun tests are not listed as passing.

## Stop and recover

- Flag unresolved conflicts, missing base, or unintended files. Do not push, open a PR, or message reviewers from a preparation-only request.

## Example request

Draft a PR title and description for this diff; do not submit it.
