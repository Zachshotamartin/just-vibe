---
name: git-bisect
description: "Locate a regression with a reproducible pass/fail check"
---

# git-bisect

Locate a regression with a reproducible pass/fail check

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; known good/bad refs, deterministic oracle, and run budget.

Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Locate a regression in isolated history; no changes to the user's active worktree.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Validate endpoints, create/use an isolated worktree, run the bounded pass/fail oracle, distinguish unbuildable revisions as skips, and confirm the candidate.

## Deliver and verify

- Culprit or narrowed range, tested revisions, oracle, and cleanup state.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A deterministic regression yields a confirmed boundary; flaky or skipped revisions produce qualified results.

## Stop and recover

- Stop when the oracle is unreliable or budget expires. Never label a skipped build as the regression without evidence.

## Example request

Find the regression between these supplied refs using the deterministic fixture; cap at 12 runs.
