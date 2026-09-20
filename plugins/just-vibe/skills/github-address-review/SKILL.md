---
name: github-address-review
description: "Implement actionable review changes and explain resolutions Use to implement accepted review feedback; github-review produces findings."
---

# github-address-review

Implement actionable review changes and explain resolutions

## Choose this workflow

Use to implement accepted review feedback; github-review produces findings.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; PR and review threads plus accepted product constraints.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

Declared evidence requirements: `project.read`, `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Implement actionable feedback locally; pushing, replying, and resolving threads follow explicit requested scope.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Classify each comment, verify its premise, identify conflicts, implement coherent changes, run relevant checks, and map each change to feedback.
- Map comments to current code and accepted contracts, resolve conflicting suggestions, and keep a per-comment disposition tied to the final diff.

## Decision branches

- **When a suggested change contradicts verified behavior or another accepted request:** Explain the conflict and seek that decision without applying incompatible edits.

## Deliver and verify

- Patch, comment-to-resolution summary, evidence, and disputed or blocked items.
- Comment-to-change mapping, verification and remote threads still requiring action.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A valid review bug is fixed; a suggestion contradicting the accepted API contract is explained rather than blindly applied.

## Stop and recover

- Do not claim remote threads resolved from a local fix. Ambiguous policy changes need clarification before dependent edits.

## Example requests

- **Normal (apply):** Implement the actionable feedback on the specified PR; keep API compatibility.
- **edge (apply):** Address feedback when one comment is already fixed and another conflicts with the API.
- **blocked (inspect):** Inspect review feedback without the referenced revision; do not claim threads resolved.
