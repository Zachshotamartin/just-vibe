---
name: git-split
description: "Divide a mixed change into understandable commits"
---

# git-split

Divide a mixed change into understandable commits

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; mixed changes or commits and desired grouping. Applying a split requires explicit execution scope.

Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Separate coherent changes while preserving content; rewriting published history is a distinct action.

None by default. Plan artifacts may be saved when requested.

## Execute

- Snapshot current state, map hunks to behaviors, identify dependencies, propose commit ordering, and apply authorized grouping with verification.

## Deliver and verify

- Split plan or resulting commits plus evidence the final content is preserved.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Formatting and functional edits separate cleanly; overlapping hunks retain both intended behaviors.

## Stop and recover

- Do not rewrite shared history implicitly or lose pre-existing index state. Stop if grouping cannot preserve a buildable dependency order.

## Example request

Plan separate formatting and checkout-fix commits without changing shared history.
