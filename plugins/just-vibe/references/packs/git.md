# Git methods

All changes belong to the user. Follow [ownership and attribution](../execution.md#ownership-and-attribution): use the existing user Git identity and add no agent Co-authored-by trailer, model credit, generated-by signature or agent self-attribution. Check the prepared message and resulting new commit, including hook additions. Preserve legitimate human credits and existing history.

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

For a temporary-index approach, start from the current HEAD tree, construct only the intended changed blobs and tests, and inspect that candidate's entire diff. Run the required commit hooks normally against the candidate index; do not bypass them with low-level commit creation. Verify the candidate independently of unrelated worktree changes where they could affect tests. A path-limited commit may still include every worktree hunk in that path.

After the commit, the real index still needs deliberate reconciliation. Preserve the user's unrelated staged content while incorporating the requested committed change; blindly restoring the old index can stage a reversal of the fix against the new HEAD. Compare all three states:

| Comparison | Required outcome |
| --- | --- |
| Old HEAD → new HEAD | Only the intended fix and tests, including any reviewed hook changes |
| New HEAD → real index | The unrelated changes the user had staged |
| Real index → worktree | The unrelated changes the user had left unstaged |

Keep a recoverable index/patch record until all three comparisons succeed, then remove only the temporary artifacts you created. Preserve staged additions, untracked files, file modes and deletions as well as text hunks. On a failed hook or ambiguous overlapping hunk, inspect the resulting state before retrying; never silently reset the user's work.

### Conflict and recovery methods

For a merge conflict, inspect base, ours, theirs and the relevant callers; a syntactically clean merge can still discard a legitimate behavior. Regenerate lockfiles from resolved manifests with the repository's package manager instead of arbitrarily choosing a side.

For lost commits, inspect reflog candidates and compare content, then preserve the candidate on a new ref before changing the active branch. Do not garbage-collect during recovery. A missing reflog is not evidence a specific commit is recoverable. Work lost by `git stash drop`, `git stash clear` or a deleted ref without a reflog survives only as unreachable objects: list them with read-only `git fsck --unreachable --no-reflogs`, inspect commit candidates (stash commits are merge commits titled "WIP on" or "On"), and preserve a match with `git branch` or `git stash store` before running anything that may trigger automatic garbage collection. State a recovery limit only after this search.

### Bisect and worktrees

Validate the oracle on known good/bad endpoints. Use an isolated worktree so unrelated edits remain untouched. Treat unbuildable revisions as skipped, bound repetition for flaky oracles, and verify the candidate against its parent. Report a candidate range when skipped commits prevent a unique answer. Resolve branch ownership before creating a worktree; dirty removal is a separate preservation decision.
