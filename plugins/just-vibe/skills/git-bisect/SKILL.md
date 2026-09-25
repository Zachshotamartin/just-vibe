---
name: git-bisect
description: "Locate a regression with a reproducible pass/fail check. Use to locate a deterministic regression boundary; debug first establishes a reliable oracle."
---

# git-bisect

Locate a regression with a reproducible pass/fail check.

## Choose this workflow

Use to locate a deterministic regression boundary; debug first establishes a reliable oracle.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; known good/bad refs, deterministic oracle, and run budget.

**Pack prerequisites:** Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

- **Infer from evidence:** Read repository root, HEAD, branch, refs and staged/unstaged/untracked distinctions; use the configured human identity.
- **Reasonable default:** Limit an ambiguous inspection to the current repository and report that scope; preserve all existing changes.
- **Ask only when needed:** Before mutation, resolve uncertain commit membership, destination ref or history-rewrite intent; do not ask again about already authorized exact actions.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Locate a regression in isolated history; no changes to the user's active worktree.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Validate endpoints, create/use an isolated worktree, run the bounded pass/fail oracle, distinguish unbuildable revisions as skips, and confirm the candidate.
2. Confirm good/bad endpoints and oracle exit semantics, run in an isolated worktree, treat untestable revisions as skips and retest the candidate and parent.
3. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.

## Technical method

- **Inspect:** Resolve known-good and known-bad commits and validate the oracle at both endpoints.
- **Method:** Use an isolated worktree, bounded trials, explicit skip codes and a preserved candidate log.
- **Avoid misdiagnosis:** Build failures may require skip rather than bad; flaky tests can point to an innocent commit.
- **Check the result:** Recheck the candidate and parent with the same oracle; report a range if skipped revisions prevent a unique cause.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Git worked example](../../references/examples/git.md).


## Decision branches

- **When skipped revisions or flaky outcomes prevent a unique boundary:** Report the candidate range and uncertainty rather than a definite offending commit.

## Deliver and verify

- Culprit or narrowed range, tested revisions, oracle, and cleanup state.
- Endpoint refs, oracle, tested/skipped revisions and independently confirmed boundary.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A deterministic regression yields a confirmed boundary; flaky or skipped revisions produce qualified results.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Stop when the oracle is unreliable or budget expires. Never label a skipped build as the regression without evidence.

## Example requests

- **Normal (apply):** Find the regression between these supplied refs using the deterministic fixture; cap at 12 runs.
- **Edge (apply):** Bisect across a dependency migration where intermediate commits do not build.
- **Blocked (inspect):** Plan bisect when the failure is not reproducible; do not move the active checkout.
