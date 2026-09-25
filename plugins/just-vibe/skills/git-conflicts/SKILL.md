---
name: git-conflicts
description: "Resolve conflicts while preserving the intent of both changes. Use during a merge/rebase conflict; git-recover restores lost work."
---

# git-conflicts

Resolve conflicts while preserving the intent of both changes.

## Choose this workflow

Use during a merge/rebase conflict; git-recover restores lost work.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; active merge/rebase/cherry-pick conflicts and intended behavior.

**Pack prerequisites:** Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

- **Infer from evidence:** Read repository root, HEAD, branch, refs and staged/unstaged/untracked distinctions; use the configured human identity.
- **Reasonable default:** Limit an ambiguous inspection to the current repository and report that scope; preserve all existing changes.
- **Ask only when needed:** Before mutation, resolve uncertain commit membership, destination ref or history-rewrite intent; do not ask again about already authorized exact actions.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Resolve conflicted paths; continuing/finalizing the Git operation follows the requested scope.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Read the merge base, both sides and their callers to establish each change's intent.
2. Resolve the combined behavior rather than choosing a side wholesale, and regenerate derived files from their sources.
3. Check the combined behavior.
4. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.

## Technical method

- **Inspect:** Read merge-base, both sides, callers and whether the operation is merge, rebase or cherry-pick.
- **Method:** Reconstruct both intended behaviors; resolve source manifests before regenerating outputs. Explain side identity using the actual operation.
- **Avoid misdiagnosis:** During rebase, ours/theirs terminology is easy to invert; deleting conflict markers does not establish semantic correctness.
- **Check the result:** Exercise a behavior contributed by each side and inspect operation state before continuing the requested operation.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Git worked example](../../references/examples/git.md).


## Decision branches

- **When the sides encode incompatible product policy:** Leave that conflict explicit and resolve independent files while requesting the actual decision.

## Deliver and verify

- Resolved files with the rationale for each nontrivial conflict, preserved behaviors, test results and the remaining operation state.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Both legitimate feature changes survive; unresolved policy conflicts remain explicit rather than arbitrarily chosen.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Never abort or reset an operation automatically. Identify unrelated edits before staging resolved files.

## Example requests

- **Normal (apply):** Resolve this merge while preserving both account switching and refresh behavior.
- **Edge (apply):** Resolve a lockfile conflict after compatible dependency changes on both sides.
- **Blocked (inspect):** Inspect a conflict with unknown intended behavior; do not choose ours or theirs blindly.
