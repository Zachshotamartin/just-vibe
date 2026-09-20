---
name: git-commit
description: "Prepare coherent commits with accurate messages and deliberate staging Use for an explicit bounded commit; git-split designs several coherent commits."
---

# git-commit

Prepare coherent commits with accurate messages and deliberate staging

## Choose this workflow

Use for an explicit bounded commit; git-split designs several coherent commits.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; intended changes, commit scope, and message preferences. A direct commit request authorizes the bounded commit.

Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

- **Infer from evidence:** Read repository root, HEAD, branch, refs and staged/unstaged/untracked distinctions; use the configured human identity.
- **Reasonable default:** Limit an ambiguous inspection to the current repository and report that scope; preserve all existing changes.
- **Ask only when needed:** Before mutation, resolve uncertain commit membership, destination ref or history-rewrite intent; do not ask again about already authorized exact actions.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Deliberate staging and commit creation; no push, amend, or unrelated content.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Resolve the repository, HEAD, configured user identity and exact requested commit membership. Inspect both the index and worktree, including untracked files; record unrelated staged and unstaged changes before touching the index.
2. Separate intended changes by hunk, not merely path. If a file mixes user staging with the requested fix, use deliberate patch selection or a temporary index based on HEAD; a whole-file add or commit --only can include unrelated worktree content.
3. Review the actual candidate tree and verify it independently when unrelated worktree changes could affect the result. With a temporary index, stage only intended blobs/tests and run the normal commit path with that index so required hooks still run. Preserve a recoverable record of the original real index until post-commit reconciliation succeeds.
4. After committing through a temporary index, reconcile intended committed changes into the real index while retaining unrelated staged hunks. Verify HEAD contains only the intended change, HEAD-to-index retains the user’s staged work, and index-to-worktree retains the user’s unstaged work. Do not blindly restore an old index against the new HEAD.
5. Use the existing user identity and describe the change without agent/model self-attribution or agent Co-authored-by trailers. Inspect actual committed content and message, including hook changes. A failed hook leaves the operation incomplete; inspect state before retrying and never bypass it.
## Technical method

- **Inspect:** Capture the user's initial index and worktree distinctions and the exact requested commit membership.
- **Method:** Use deliberate hunks or the existing temporary-index procedure; inspect the candidate tree and normal hook results before committing.
- **Avoid misdiagnosis:** A path-limited commit can include unwanted unstaged hunks, and blindly restoring an old index can stage a reversal.
- **Check the result:** Compare old HEAD to new HEAD, new HEAD to index and index to worktree; preserve unrelated staging and inspect the resulting author/message.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Git worked example](../../references/examples/git.md).


## Decision branches

- **When unrelated changes are staged in a file that also contains the requested fix:** Build a candidate that excludes those hunks and verify all three trees afterward. If hunks depend on each other and membership is genuinely ambiguous, preserve the recoverable state and ask only about that dependency.
- **When the candidate passes in the mixed worktree but fails in isolation:** Identify the undeclared dependency. Do not claim the commit is verified or silently include unrelated user work to make it pass.

## Deliver and verify

- Commit hash and included scope, candidate-tree verification, actual message/identity, and evidence that unrelated staged, unstaged and untracked work remains.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The committed tree contains only the requested change and works without unrelated worktree edits. The user’s unrelated HEAD-to-index and index-to-worktree differences survive. Required hooks and attribution checks pass.

## Stop and recover

- Resolve ambiguous pre-staged content before committing. Never disable hooks or change global identity to force success.

## Example requests

- **Normal (apply):** Commit only the verified checkout fix; preserve other staged and unstaged work.
- **edge (apply):** Commit only the bug fix when the same file contains unrelated staged edits.
- **blocked (inspect):** Inspect commit readiness with missing identity or a rejected hook; do not bypass either.
