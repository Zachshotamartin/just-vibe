---
name: git-status
description: "Explain branches, staged changes, unstaged changes, and repository state. Use to explain repository state; git-diff explains actual content changes."
---

# git-status

Explain branches, staged changes, unstaged changes, and repository state.

## Choose this workflow

Use to explain repository state; git-diff explains actual content changes.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; repository and optional concern such as divergence or interrupted operation.

**Pack prerequisites:** Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

- **Infer from evidence:** Read repository root, HEAD, branch, refs and staged/unstaged/untracked distinctions; use the configured human identity.
- **Reasonable default:** Limit an ambiguous inspection to the current repository and report that scope; preserve all existing changes.
- **Ask only when needed:** Before mutation, resolve uncertain commit membership, destination ref or history-rewrite intent; do not ask again about already authorized exact actions.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

HEAD, branches, worktrees, index, working tree, and known remote tracking state.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Read status --porcelain=v2 --branch and resolved refs with GIT_OPTIONAL_LOCKS=0 where supported; inspect worktrees and merge/rebase/bisect operation markers without changing them.
2. Distinguish staged, unstaged and untracked changes and explain the relevant next action.

## Technical method

- **Inspect:** Inspect HEAD, branch, porcelain status, index, worktree, untracked paths and merge/rebase state with optional locks disabled.
- **Method:** Explain HEAD-to-index separately from index-to-worktree and use last-fetched refs explicitly.
- **Avoid misdiagnosis:** Clean tracked files do not imply no untracked work; ahead/behind may use stale remote observations.
- **Check the result:** Reconcile every reported change category with the correct tree comparison without fetching or modifying the index.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Git worked example](../../references/examples/git.md).


## Decision branches

- **When upstream tracking refs are stale or absent:** Describe local facts and unknown remote state without fetching implicitly.

## Deliver and verify

- Branch/HEAD, staged/unstaged/untracked state and any operation in progress, with explicit local-versus-last-fetched remote evidence and the safe next action.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A detached HEAD is explained; stale remote tracking refs are not described as live server status.

## Stop and recover

- No fetch or cleanup implicitly. An unresolved repository path prevents mutation advice tied to a guessed repository.

## Example requests

- **Normal (inspect):** Explain staged, unstaged, untracked, and interrupted-operation state here.
- **Edge (inspect):** Explain a detached HEAD with an interrupted rebase and dirty files.
- **Blocked (inspect):** Inspect a directory that is not a Git repository; do not initialize it.
