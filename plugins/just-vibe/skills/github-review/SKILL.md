---
name: github-review
description: "Review a PR using its discussion, changes, and checks"
---

# github-review

Review a PR using its discussion, changes, and checks

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

## Deliver and verify

- Prioritized findings with valid diff locations, evidence, and review limitations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A finding fixed in the latest revision is not repeated; review comments use locations that exist in the reviewed diff.

## Stop and recover

- Sending a review requires explicit instruction. Recheck head before posting so findings are not silently attached to stale code.

## Example request

Review the current head of the specified PR without posting a review.
