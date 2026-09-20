# Working alternatives

A plain comparison remains analysis. A request to build alternatives authorizes bounded implementations in separate worktrees. Resolve the common acceptance criteria, budget and two or three distinct approaches. Do not create variants that differ only in labels, expand product scope or spawn subagents without applicable authorization.

## Create and implement

Require a Git worktree root with a HEAD commit and an unconflicted index. Inspect initial changes. `lab create NAME --stdin`:

```json
{"revision":0,"title":"Account switcher alternatives","variants":[{"id":"inline","brief":"Inline searchable menu"},{"id":"dialog","brief":"Search dialog with keyboard navigation"}],"checks":[{"id":"behavior","command":["npm","run","test:account"],"timeoutMs":60000}]}
```

Use real scripts from the project. The helper creates detached worktrees under `.just-vibe/workspaces/lab-NAME-VARIANT`, overlays eligible tracked/untracked starting edits and leaves the original index alone. It records the starting revision and index. The agent then implements each approach only in its returned directory, carrying identical requirements and constraints. Workspaces share Git objects and may resolve ancestor dependencies; they are file-isolation tools, not security containers. For reproducible dependencies, set up the same locked dependencies in each workspace using the authorized project workflow and record environmental differences. Do not copy credentials automatically.

`lab show NAME` returns directories, changed files, snapshots, check freshness and preview state. `lab check NAME --stdin` takes `revision` and executes the same declared checks in every variant. Inspect checks before running them. A check that changes fingerprinted source is stale. Partial snapshots cannot establish freshness. Checks assess their assertions; the agent must inspect each rendered UI and the user makes taste/preferences decisions.

## Preview and review

`lab preview NAME --stdin`:

```json
{"revision":2,"variant":"inline","command":["npm","run","dev","--","--host","127.0.0.1","--port","{port}"],"minutes":15}
```

Use the actual project's foreground server invocation, including an explicit loopback bind; do not daemonize or detach the server itself. The helper chooses a local port, substitutes the literal `{port}` argument and returns a URL. It cannot force an arbitrary program to honor host/port. Check the server response before presenting it as ready. Each preview has a worker-owned process and a 1–60 minute lease, bounded/redacted output and heartbeat. `lab stop NAME --stdin` takes `revision` and `variant`; cleanup also stops known previews. An unresponsive worker blocks cleanup; inspect the process rather than killing a saved PID.

`lab report NAME` writes a local HTML comparison containing briefs, changed files, check results and preview links. Open it and the actual previews for the user where the host supports browser/file panels. Present measured differences, accessibility/behavior observations and subjective tradeoffs separately. Do not invent a universal quality score.

## Select, recover and clean up

`lab select NAME --stdin` takes `revision`, `variant` and a new `task` name. Run it after the user's choice, or when the user explicitly authorized the agent to choose using stated criteria. It requires fresh passing shared checks, the original branch/HEAD and unchanged original files/index within the selected scope. It applies only the chosen changes and creates an undo record. Unrelated original edits are preserved. No commit, merge, push or deployment occurs.

Changed binary files are supported within the file limits; binary overlap is not merged. Custom checkout filters, line-ending conversions, large files, symlinks or unsupported coverage can make exact base matching fail. Reconcile those cases explicitly; never bypass the comparison with a force checkout.

An interrupted selection records its intended variant and undo task before writing source. `lab recover NAME --stdin` takes `revision`, recovers an existing task journal or safely starts that recorded selection, and reconciles the lab state. A changed task identity is refused. An interrupted creation can be inspected and cleaned up; create a new lab afterward rather than overwriting an existing workspace.

`lab cleanup NAME --stdin` takes `revision` and `expected`, mapping each existing variant ID to the exact `snapshot.content` from a freshly reviewed show result. This request intentionally removes those owned workspaces, including their known variant changes and disposable dependency/build output. Preserve any variant worth keeping first. New ignored/private content outside cleanup coverage blocks removal. Changed snapshots, partial coverage and invalid workspace identity also block cleanup. Cleanup never removes the original worktree.
