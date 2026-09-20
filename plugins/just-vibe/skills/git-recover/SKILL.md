---
name: git-recover
description: "Investigate reflog and history to recover lost work Use to find and preserve lost Git content; git-conflicts resolves an active operation."
---

# git-recover

Investigate reflog and history to recover lost work

## Choose this workflow

Use to find and preserve lost Git content; git-conflicts resolves an active operation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; lost commit/file symptom, approximate event, and repository.

Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Find recoverable history and prepare non-destructive restoration; no reset by default.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect reflog, refs, stashes, and reachable candidates; compare candidate contents; explain confidence; create a recovery branch/copy only when restoration is requested.
- Inspect reflog/stash/reachable candidates, compare file contents and preserve the chosen commit with a new ref before any active-branch movement.
- All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.

## Decision branches

- **When the candidate is absent or unreachable evidence is incomplete:** State the recovery limit and avoid cleanup that could reduce recoverability.

## Deliver and verify

- Candidate recovery points and exact preservation/restoration steps or recovered artifact.
- Candidate identities, confidence, recovered location and preserved current state.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A lost commit can be preserved without moving the active branch; absent recovery evidence is not claimed as recoverable.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Do not run garbage collection or destructive cleanup during recovery. Preserve current work before any authorized restore.

## Example requests

- **Normal (inspect):** Find a lost commit in reflog without resetting the current branch.
- **edge (inspect):** Recover a dropped commit without moving the current branch.
- **blocked (inspect):** Inspect recovery options after missing reflog history; do not promise restoration.
