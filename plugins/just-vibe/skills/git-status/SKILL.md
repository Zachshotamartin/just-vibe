---
name: git-status
description: "Explain branches, staged changes, unstaged changes, and repository state"
---

# git-status

Explain branches, staged changes, unstaged changes, and repository state

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; repository and optional concern such as divergence or interrupted operation.

Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

HEAD, branches, worktrees, index, working tree, and known remote tracking state.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect porcelain status and refs, distinguish staged from unstaged changes, detect merge/rebase/bisect state, and explain relevant next actions.

## Deliver and verify

- Human-readable state with explicit local-versus-last-fetched remote evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A detached HEAD is explained; stale remote tracking refs are not described as live server status.

## Stop and recover

- No fetch or cleanup implicitly. An unresolved repository path prevents mutation advice tied to a guessed repository.

## Example request

Explain staged, unstaged, untracked, and interrupted-operation state here.
