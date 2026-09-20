# Selective task undo

Use the `undo` skill to reverse a known local task while preserving unrelated edits. This requires a before/after ownership record. A checkpoint alone stores hashes and cannot undo an unrecorded change. Do not infer ownership from file timestamps, the last assistant message or the entire dirty Git tree.

## Record before editing

When the user requests reversibility, or a selected alternative is applied, record the exact bounded scope before the first edit. `task begin NAME --stdin`:

```json
{"revision":0,"purpose":"Fix checkout retry identity","paths":["src/checkout.ts","tests/checkout.test.ts"],"externalEffects":[]}
```

Paths may include absent files that the task will create. A recording captures those file bytes, mode, HEAD, branch and the scoped index state. It does not stage, stash or commit. Keep unrelated edits outside the task or preserve them in the recorded starting state. If another contributor/user edits the same scope during the task, reconcile ownership before capturing; before/after boundaries alone cannot identify who authored an interleaved change.

After reviewing the actual diff and completing the bounded local changes, `task capture NAME --stdin` takes `revision` and optional `externalEffects` descriptions. It records current bytes only for the original paths and refuses a changed branch/HEAD/scoped index. Record external effects as facts, without credentials. It cannot undo a deployment, sent message, applied database migration or remote commit.

## Preview and undo

`task show NAME` shows the record. `task preview NAME` computes a dry-run inverse patch against current files. Equal-to-after files restore before; unchanged task files preserve the current version; nonoverlapping text edits are merged using an inverse three-way merge. New POSIX records retain ordinary permission bits as well as the executable flag, so restoration preserves restrictive modes and independent later permission changes. Older records without those bits preserve existing access permissions; if the original file is absent, restoration defaults to user-only access (0600 or 0700). Windows uses its native permission model; POSIX modes are not a saved Windows ACL. Creation/deletion or binary overlaps, changed scoped index entries, changed branch/HEAD and conflicting hunks are refused. No source files change during preview.

Read the preview and fulfill an explicit undo request without redundant approval when it is unambiguous and conflict-free. `task undo NAME --stdin` takes the exact `revision`. It rechecks current bytes, journals the intended changes and writes only the inverse result. All conflicts are found before starting the transaction. The user's index and unrelated files remain alone. Rerun proportionate existing checks after undo and report preserved edits plus any external effects that remain.

If there is no ownership record, inspect Git and conversation evidence and prepare a narrowly attributable inverse change for the user's actual request. Do not claim automatic undo coverage, create a fictional before snapshot, use `reset --hard`, broad `checkout`, `clean` or silently revert other work. Ambiguous ownership needs a focused clarification after useful inspection.

## Interrupted operations

`task recover NAME --stdin` takes `revision`. It can finish an interrupted selection/undo only while each file is still its recorded before or after version. A third version blocks recovery; preserve it and reconcile explicitly. A completed undo is not rerun against a later tree. `workbench recover` handles a dead operation lock before journal recovery; it never kills a live process.

Git history undo remains a separate Git workflow with explicit commit/ref and publication considerations. Task undo is for the recorded local working-tree change, not a rewrite of published history. All changes remain owned by the user; do not add agent self-attribution.
