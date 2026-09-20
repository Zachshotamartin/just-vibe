# git worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Commit the verified fix; keep my other staged and unstaged changes.

**Evidence:** One file contains the fix plus an unrelated staged hunk; a second file is untracked.

**Decision:** Select intended hunks and verify the candidate tree. Preserve all three Git states while reconciling the real index after commit.

**Useful artifact:** A commit containing only the fix, its human-owned message, and evidence for preserved staged/unstaged differences.

**Verification to perform:** Compare old HEAD→new HEAD, new HEAD→index and index→worktree; run normal required hooks on the actual candidate.

**Misleading case:** A path-limited commit is not safe merely because its filename belongs to the fix.
