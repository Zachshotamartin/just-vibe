---
name: git-recover
description: "Investigate reflog and history to recover lost work. Use to find and preserve lost Git content; git-conflicts resolves an active operation."
---

# git-recover

Investigate reflog and history to recover lost work.

## Choose this workflow

Use to find and preserve lost Git content; git-conflicts resolves an active operation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; lost commit/file symptom, approximate event, and repository. Restoring uses apply mode and writes only a new preservation ref.

**Pack prerequisites:** Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

- **Infer from evidence:** Read repository root, HEAD, branch, refs and staged/unstaged/untracked distinctions; use the configured human identity.
- **Reasonable default:** Limit an ambiguous inspection to the current repository and report that scope; preserve all existing changes.
- **Ask only when needed:** Before mutation, resolve uncertain commit membership, destination ref or history-rewrite intent; do not ask again about already authorized exact actions.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Find recoverable history and prepare non-destructive restoration; no reset by default.

Inspect/plan: locate candidates and describe restoration steps without writing. Apply: create only a new preservation ref (branch or tag) for the chosen content, or a copy of a recovered file outside tracked paths; never move the active branch, reset, rewrite history or run garbage collection.

## Execute

1. Inspect reflog, refs, stashes, and reachable candidates, then unreachable objects with read-only git fsck --unreachable --no-reflogs (stash commits are merge commits titled WIP on or On); avoid commands that may trigger automatic garbage collection until the candidate is preserved; compare candidate contents; explain confidence; in apply mode, create a recovery ref or copy only when restoration is requested.
2. Inspect reflog/stash/reachable candidates, compare file contents and preserve the chosen commit with a new ref before any active-branch movement.
3. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.

## Technical method

- **Inspect:** Inspect reflogs, stashes, reachable refs, unreachable objects from git fsck and candidate object contents before changing active refs.
- **Method:** Preserve a verified candidate with a new branch or copy, then explain how it differs from current work.
- **Avoid misdiagnosis:** Reflogs expire and may not exist for another clone; garbage collection can remove the very objects being recovered.
- **Check the result:** Verify the recovered tree contains the requested content and leaves the original branch, index and worktree recoverable.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Git worked example](../../references/examples/git.md).


## Decision branches

- **When the candidate is absent after the reflog, ref, stash and unreachable-object search:** State the recovery limit only then, and avoid cleanup that could reduce recoverability.

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
- **Edge (apply):** Recover a dropped commit without moving the current branch.
- **Blocked (inspect):** Inspect recovery options after missing reflog history; do not promise restoration.
- **Edge (inspect):** Find stash entries lost after git stash clear without running garbage collection.
