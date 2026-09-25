---
name: git-worktree
description: "Create or manage isolated working directories. Use for an explicitly selected isolated checkout; git-recover preserves lost candidates."
---

# git-worktree

Create or manage isolated working directories.

## Choose this workflow

Use for an explicitly selected isolated checkout; git-recover preserves lost candidates.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan worktree organization; apply when the user requests creating or removing a specific local worktree.

**Pack prerequisites:** Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

- **Infer from evidence:** Read repository root, HEAD, branch, refs and staged/unstaged/untracked distinctions; use the configured human identity.
- **Reasonable default:** Limit an ambiguous inspection to the current repository and report that scope; preserve all existing changes.
- **Ask only when needed:** Before mutation, resolve uncertain commit membership, destination ref or history-rewrite intent; do not ask again about already authorized exact actions.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Manage the selected isolated checkout and its Git metadata.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: make the requested changes or execute the requested operation within its resolved target and limits. Local preparation does not authorize live, remote, destructive or paid actions; existing explicit session authorization still applies.

## Execute

1. Inspect existing worktrees/branch ownership, validate target paths, create the requested checkout or inspect removal safety, and verify the resulting state.
2. List existing worktrees and branch ownership, resolve the requested ref or current-state transfer, and verify destination emptiness before creation.
3. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.

## Technical method

- **Inspect:** Inspect worktree porcelain inventory, branch ownership, destination identity and dirty/untracked state.
- **Method:** Create only the requested isolated checkout; keep per-worktree config and shared refs in mind during branch actions.
- **Avoid misdiagnosis:** Shared Git objects do not mean every worktree has an independent branch namespace; removing a checkout can destroy untracked work.
- **Check the result:** Confirm the new checkout's HEAD and root; before cleanup, verify ownership and preserve any changes produced after creation.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Git worked example](../../references/examples/git.md).


## Decision branches

- **When current uncommitted changes must move:** Preserve staged/unstaged distinctions in an explicit transfer plan and validate the copy before removing originals.
- **When the request is for local preparation or implementation:** Inspect existing branches and worktrees, then perform only the requested local lifecycle action; preserve pre-existing changes and require a resolved branch choice when ambiguous.

## Deliver and verify

- Worktree path, branch/HEAD, operation result, and usage guidance.
- Worktree path, starting ref, branch ownership and transferred-state verification.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An existing occupied branch is handled explicitly; removing a dirty worktree stops before losing changes.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Do not invent a starting branch, force removal, or delete unrelated directories. Respect the requested current-state versus clean-ref starting point.

## Example requests

- **Normal (apply):** Create an isolated worktree from the specified branch at the requested path.
- **Edge (apply):** Create a worktree including current edits while another worktree owns the branch.
- **Blocked (inspect):** Inspect removal of a dirty worktree; report its changes without forcing removal.
