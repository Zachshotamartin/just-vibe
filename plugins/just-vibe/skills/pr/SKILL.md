---
name: pr
description: "Prepare a focused diff summary, PR description, and validation notes Use to prepare a local PR title/body; github-pr handles remote PR identity and creation."
---

# pr

Prepare a focused diff summary, PR description, and validation notes

## Choose this workflow

Use to prepare a local PR title/body; github-pr handles remote PR identity and creation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; branch/base, intended change, and available verification results.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Prepare a PR title/body and diff summary; submission is handled by `github-pr` when requested.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Inspect the actual diff, separate unrelated edits, explain changed behavior, and include only checks supported by evidence.
2. Base the description on the final diff and verified checks, account for generated artifacts, and state user-visible behavior before implementation details.
3. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.
## Technical method

- **Inspect:** Inspect the intended diff, acceptance criteria, actual verification and repository template.
- **Method:** Draft a self-contained title/body around final behavior, scope and evidence; preserve user ownership.
- **Avoid misdiagnosis:** Local PR drafting does not authorize pushing or posting, and unrun checks cannot appear as passed.
- **Check the result:** Reconcile every claim with the final diff and actual check identity, including any material limitation.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When local changes are absent from the pushed head:** Identify them as pending and do not describe them as submitted.

## Deliver and verify

- Reviewable title, description, risk notes, and readiness gaps.
- Title, problem/behavior description, validation and readiness gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Description matches the final diff; unrun tests are not listed as passing.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Flag unresolved conflicts, missing base, or unintended files. Do not push, open a PR, or message reviewers from a preparation-only request.

## Example requests

- **Normal (plan):** Draft a PR title and description for this diff; do not submit it.
- **edge (plan):** Prepare a PR description after the implementation scope changed.
- **blocked (inspect):** Draft from the local diff without remote access or posting anything.
