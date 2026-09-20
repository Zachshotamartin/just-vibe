---
name: git-diff
description: "Summarize changes by behavior and identify unrelated edits Use to understand changes against specified refs; review evaluates their correctness."
---

# git-diff

Summarize changes by behavior and identify unrelated edits

## Choose this workflow

Use to understand changes against specified refs; review evaluates their correctness.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Git methods](../../references/packs/git.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; working/index state or exact base/head refs and desired review focus.

Git, exact repository/worktree, and readable refs/index. Record branch, HEAD, staged/unstaged/untracked state before mutation. Preserve unrelated edits and never default to broad staging, hard reset, clean, force push, or history rewriting.

Declared evidence requirements: `git.repo`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Selected changes and their behavioral meaning; no staging or editing.

None by default. Plan artifacts may be saved when requested.

## Execute

- Resolve refs, inspect rename/binary/submodule metadata, read surrounding context, group by purpose, and identify unrelated edits.
- Separate index versus HEAD, worktree versus index and branch versus merge-base; resolve the requested comparison before summarizing hunks.

## Decision branches

- **When rename, binary or submodule entries appear:** Report their metadata and scope instead of inventing text diffs or flattening submodule changes.

## Deliver and verify

- Diff summary, impacted contracts, notable risks, and files requiring deeper review.
- Comparison refs, files/hunks grouped by purpose and unrelated changes.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Staged and unstaged changes are not conflated; a binary change is acknowledged without invented contents.

## Stop and recover

- Missing comparison refs require resolution. Do not assume every change belongs to the current task.

## Example requests

- **Normal (inspect):** Summarize the diff against main and identify unrelated edits.
- **edge (inspect):** Explain a file with different staged and unstaged edits.
- **blocked (inspect):** Compare against a missing base ref without guessing main or fetching.
