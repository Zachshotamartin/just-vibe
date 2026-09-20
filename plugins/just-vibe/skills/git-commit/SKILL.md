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

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Deliberate staging and commit creation; no push, amend, or unrelated content.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect existing index and worktree, identify intended hunks, preserve unrelated staging, review the final staged diff, run relevant checks, and create an accurate message.
- Snapshot the index diff and unrelated work, stage only selected hunks, inspect the entire resulting index and verify the created commit's actual contents.
- All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.

## Decision branches

- **When unrelated changes are already staged:** Preserve their state and resolve commit membership before committing; do not silently include or unstage them.

## Deliver and verify

- Commit hash, included scope, checks, and remaining changes.
- Commit identity, included paths/hunks, checks and preserved unrelated work.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Unrelated edits remain outside the commit; a rejected hook stops without bypassing it.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Resolve ambiguous pre-staged content before committing. Never disable hooks or change global identity to force success.

## Example requests

- **Normal (apply):** Commit only the verified checkout fix; preserve other staged and unstaged work.
- **edge (apply):** Commit only the bug fix when the same file contains unrelated staged edits.
- **blocked (inspect):** Inspect commit readiness with missing identity or a rejected hook; do not bypass either.
