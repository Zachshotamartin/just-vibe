# Git methods

Resolve the repository and inspect `git status --short`, `git diff`, `git diff --cached`, branch/HEAD and relevant refs before mutations. Use argument arrays and `--` before path arguments. For observation use `--no-optional-locks`, disable filesystem-monitor hooks, and avoid external diff/textconv execution. Do not fetch merely to explain last-fetched divergence.

Commit/split workflows inspect the pre-existing index before staging. Select named paths/hunks, review the exact staged result, and preserve unrelated staged work. If it cannot be separated safely, resolve the ambiguity before the commit. Do not use `git add .`, amend, bypass hooks, force push or rewrite published history as a default.

Conflicts require inspecting base/ours/theirs plus caller intent. Resolve generated outputs from their sources. Verify both sides' intended behavior before continuing the requested operation; do not abort/reset automatically.

Bisect uses a separate worktree, verified good/bad endpoints, a deterministic oracle, explicit skip handling and a run limit. Save the candidate and evidence; remove only the worktree owned by this run after checking its state. Recovery begins with read-only reflog/ref/stash investigation and preserves found objects with a new branch/copy when requested, never an unsolicited reset or garbage collection.

Worktree creation validates branch ownership and destination. Removal inspects tracked/untracked changes before any deletion. A clean-looking status is not permission to remove an unrelated directory.
