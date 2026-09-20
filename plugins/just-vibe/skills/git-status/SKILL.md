---
name: git-status
description: "Explain branches, staged changes, unstaged changes, and repository state Use to explain repository state; git-diff explains actual content changes."
---

# git-status

Explain branches, staged changes, unstaged changes, and repository state

## Choose this workflow

Use to explain repository state; git-diff explains actual content changes.

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
- Read status --porcelain=v2 --branch and resolved refs with GIT_OPTIONAL_LOCKS=0 where supported; inspect worktrees and operation markers without changing them.

## Decision branches

- **When upstream tracking refs are stale or absent:** Describe local facts and unknown remote state without fetching implicitly.

## Deliver and verify

- Human-readable state with explicit local-versus-last-fetched remote evidence.
- Branch/HEAD, staged/unstaged/untracked state, operation in progress and safe next action.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A detached HEAD is explained; stale remote tracking refs are not described as live server status.

## Stop and recover

- No fetch or cleanup implicitly. An unresolved repository path prevents mutation advice tied to a guessed repository.

## Example requests

- **Normal (inspect):** Explain staged, unstaged, untracked, and interrupted-operation state here.
- **edge (inspect):** Explain a detached HEAD with an interrupted rebase and dirty files.
- **blocked (inspect):** Inspect a directory that is not a Git repository; do not initialize it.
