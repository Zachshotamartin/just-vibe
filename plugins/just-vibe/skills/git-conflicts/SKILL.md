---
name: git-conflicts
description: "Resolve conflicts while preserving the intent of both changes Use during a merge/rebase conflict; git-recover restores lost work."
---

# git-conflicts

Resolve conflicts while preserving the intent of both changes

## Choose this workflow

Use during a merge/rebase conflict; git-recover restores lost work.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; active merge/rebase/cherry-pick conflicts and intended behavior.

Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Resolve conflicted paths; continuing/finalizing the Git operation follows the requested scope.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect base/ours/theirs and change intent, resolve behavior rather than choose a side wholesale, handle generated files via their source, and verify merged behavior.
- Read merge base and both sides plus callers; resolve semantic intent, then regenerate derived files from their sources and check the combined behavior.

## Decision branches

- **When the sides encode incompatible product policy:** Leave that conflict explicit and resolve independent files while requesting the actual decision.

## Deliver and verify

- Resolved files, rationale for nontrivial choices, tests, and operation state.
- Resolution rationale per conflict, preserved behaviors and remaining operation state.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Both legitimate feature changes survive; unresolved policy conflicts remain explicit rather than arbitrarily chosen.

## Stop and recover

- Never abort or reset an operation automatically. Identify unrelated edits before staging resolved files.

## Example requests

- **Normal (apply):** Resolve this merge while preserving both account switching and refresh behavior.
- **edge (apply):** Resolve a lockfile conflict after compatible dependency changes on both sides.
- **blocked (inspect):** Inspect a conflict with unknown intended behavior; do not choose ours or theirs blindly.
