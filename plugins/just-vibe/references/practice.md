# Exercises in the user's project

A request to explain a topic remains a readable lesson. Use this workflow only when the user requests hands-on practice/exercises or accepts the offered exercise. Select a small, understandable behavior from actual source. Explain its purpose and prerequisites before opening the exercise. Never sabotage the original tree to create a challenge.

## Prepare

Inspect a Git project with a HEAD commit, a passing focused test and a bounded source example. Establish why the existing test checks the taught concept; add a targeted test only within the authorized exercise preparation. The helper needs a working solution in the source tree and creates separate solution and learner worktrees with the same initial edits. The learner's starter code intentionally violates one explained objective.

`practice create NAME --stdin`:

```json
{"revision":0,"lesson":{"title":"Retry identity","objective":"Ignore an earlier response after retry","explanation":"A request identity connects each result to the current attempt.","sourceFiles":["src/retry.ts"]},"edits":[{"path":"src/retry.ts","content":"ACTUAL_RUNNABLE_STARTER_SOURCE"}],"checks":[{"id":"retry","command":["npm","run","test:retry"],"timeoutMs":60000}],"checkFiles":["tests/retry.test.ts","package.json"],"hints":["Compare the result's attempt identity with the current one.","Update the current identity before starting a new request."],"saveProgress":false}
```

Supply real code and actual scripts, not the placeholder. Protect all test/runner/config files relevant to assessment with `checkFiles`; starter edits cannot touch them. Source files and protected tests must fit the selected-file bounds. Prepare the same required dependency environment in both returned directories without changing the exercise/solution source snapshots. Dependency setup is a separate project action and is not automatic.

## Validate controls before teaching

`practice validate NAME --stdin` takes `revision`. It runs identical checks on the working solution and seeded exercise. The solution must pass and the starter must fail an actual assertion, not timeout, missing tooling or truncated output. Source changes during checks invalidate their evidence. Inspect the failure to ensure it concerns the taught concept; an arbitrary syntax error is not a useful control unless syntax is the lesson. Invalid controls cannot be submitted; preserve learner work and create a corrected exercise under a new name.

`practice show NAME` returns the lesson, learner workspace, control results and optional progress. Present the objective, source links and exact check command. Allow the user to edit and experiment. It is a learning workspace, not a hidden-answer secure exam; the solution and Git objects remain locally accessible.

## Hints and assessment

`practice hint NAME --stdin` takes `revision` and a one-based `level`. Reveal only the requested hint, progressing from conceptual direction to a more concrete clue. Do not run the solve workflow or silently replace the learner's code. The runtime returns only that hint; the host controls how it is presented.

`practice submit NAME --stdin` takes `revision`. It checks protected test identities and runs the actual assessment. Report the observed failure, explain the misconception, and offer a suitable next hint. Passing means the supplied assertions passed, not complete mastery. Source mutations, altered protected files or execution failures cannot pass. Tests/imports are ordinary project code, not an anti-cheating sandbox.

`saveProgress` is opt-in and defaults false. With false, submissions and hint history are returned but not persisted; with true, the local record keeps bounded results and hint levels. Configuration and control-validation evidence are saved in either case. No learner data is uploaded.

## Native question prompts and cleanup

For conceptual multiple-choice questions, use the existing [teach-test question workflow](teaching.md) and the host's actual question tool where available. Read its mode restrictions; never fake a native prompt inline or ask implementation-approval questions as assessment. If unavailable, explain the fallback and offer an exercise or ordinary conversational quiz according to the user's preference. Practice complements teach-test; it does not invent a new host API.

`practice cleanup NAME --stdin` takes `revision` and `expected` hashes from each existing variant in `practice show`. Preserve the learner's work if requested, then remove only those reviewed workspaces. The same [workspace cleanup and recovery constraints](working-alternatives.md) apply. The original project remains untouched by exercise edits.
