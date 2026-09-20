# Git methods

Resolve the repository and inspect `git status --short`, `git diff`, `git diff --cached`, branch/HEAD and relevant refs before mutations. Use argument arrays and `--` before path arguments. For observation use `--no-optional-locks`, disable filesystem-monitor hooks, and avoid external diff/textconv execution. Do not fetch merely to explain last-fetched divergence.

Commit/split workflows inspect the pre-existing index before staging. Select named paths/hunks, review the exact staged result, and preserve unrelated staged work. If it cannot be separated safely, resolve the ambiguity before the commit. Do not use `git add .`, amend, bypass hooks, force push or rewrite published history as a default.

Conflicts require inspecting base/ours/theirs plus caller intent. Resolve generated outputs from their sources. Verify both sides' intended behavior before continuing the requested operation; do not abort/reset automatically.

Bisect uses a separate worktree, verified good/bad endpoints, a deterministic oracle, explicit skip handling and a run limit. Save the candidate and evidence; remove only the worktree owned by this run after checking its state. Recovery begins with read-only reflog/ref/stash investigation and preserves found objects with a new branch/copy when requested, never an unsolicited reset or garbage collection.

Worktree creation validates branch ownership and destination. Removal inspects tracked/untracked changes before any deletion. A clean-looking status is not permission to remove an unrelated directory.

## Applied methods

### Read the three trees deliberately

In the selected repository, inspect status --porcelain=v2 --branch, diff --cached, and diff separately. Use -- before path arguments. Resolve a branch comparison against its actual merge-base; do not assume main. Where inspection must avoid index refresh writes, use GIT_OPTIONAL_LOCKS=0. These are local observations; remote tracking refs can be stale.

### Partially staged file example

Suppose a file contains a staged logging change and an unstaged bug fix. A request to commit the bug fix does not imply including the logging change. Record both patches, resolve intended membership, and use deliberate hunk selection or an isolated temporary index workflow appropriate to the environment. Review the final complete staged diff before commit and verify the commit afterward. Preserve the user's original staged/unstaged distinction for unrelated work. Never use blanket add/reset as a shortcut.

### Conflict and recovery methods

For a merge conflict, inspect base, ours, theirs and the relevant callers; a syntactically clean merge can still discard a legitimate behavior. Regenerate lockfiles from resolved manifests with the repository's package manager instead of arbitrarily choosing a side.

For lost commits, inspect reflog candidates and compare content, then preserve the candidate on a new ref before changing the active branch. Do not garbage-collect during recovery. A missing reflog is not evidence a specific commit is recoverable.

### Bisect and worktrees

Validate the oracle on known good/bad endpoints. Use an isolated worktree so unrelated edits remain untouched. Treat unbuildable revisions as skipped, bound repetition for flaky oracles, and verify the candidate against its parent. Report a candidate range when skipped commits prevent a unique answer. Resolve branch ownership before creating a worktree; dirty removal is a separate preservation decision.
