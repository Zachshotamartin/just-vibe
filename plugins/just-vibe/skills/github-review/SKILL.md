---
name: github-review
description: "Review a PR using its discussion, changes, and checks Use to review a specific remote PR revision; review handles supplied/local diffs."
---

# github-review

Review a PR using its discussion, changes, and checks

## Choose this workflow

Use to review a specific remote PR revision; review handles supplied/local diffs.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; PR URL/number, revision, and review focus.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

Declared evidence requirements: `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Code review informed by discussion and checks; no automatic review submission.

None by default. Plan artifacts may be saved when requested.

## Execute

- Fetch the correct diff, read surrounding code and relevant discussion, verify findings against the current head, and distinguish blockers from optional observations.
- Record head/base SHA, inspect changed and surrounding source, map each finding to a current diff location and revalidate head before requested posting.

## Decision branches

- **When the PR head changes during inspection:** Refresh affected findings and checks rather than attaching stale comments.

## Deliver and verify

- Prioritized findings with valid diff locations, evidence, and review limitations.
- Findings with trigger and current diff locations, reviewed SHA and check limitations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A finding fixed in the latest revision is not repeated; review comments use locations that exist in the reviewed diff.

## Stop and recover

- Sending a review requires explicit instruction. Recheck head before posting so findings are not silently attached to stale code.

## Example requests

- **Normal (inspect):** Review the current head of the specified PR without posting a review.
- **edge (inspect):** Review a PR that was force-pushed after an earlier comment.
- **blocked (inspect):** Review exported PR artifacts without posting or live metadata access.
