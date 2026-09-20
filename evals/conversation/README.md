# Conversation and selective-repair evaluation

This development fixture exercises a general source review followed by selected repairs, a correction and continuation. It does not require a diff baseline. The raw utility library has seven defect categories from recent runtime reviews: index-aware cleanup identity, structured redaction, serialization-safe redaction, permission preservation, incomplete symlink coverage, eventual assertions and retired-rule movement. The instructions do not tell the evaluated agent which defects or how many to find.

`fixture/` contains public contracts and source. `controls/` and `oracle.mjs` belong to the evaluator. Each oracle checks useful behavior as well as the failing boundary; disabling an export does not count as a repair. `tests/conversation.test.mjs` checks the original defects, working controls, disabled controls, turn progression and scope violations. These deterministic checks make no model calls.

## Prepare a real trial

Create a JSON configuration outside the future trial directory:

```json
{ "out": ".tmp/trials/conversation-1", "arm": "just-vibe" }
```

Run `npm run eval:conversation -- prepare CONFIG.json`. Use a new directory each time. The `baseline` arm omits toolkit instructions. Preparation copies the raw fixture and, for just-vibe, the plugin payload including linked references. It records input identities and instruction hashes. It neither launches a model nor establishes a successful evaluation.

Give an independent agent only `turns/1/prompt.txt` and the workspace it names. Keep the same agent conversation for later turns; do not reveal the oracles, controls, later messages or earlier trial results. Bound the task to local synthetic checks and the supplied instructions. This is an evaluator workflow, not a sandbox for hostile submissions.

## Capture and continue

After the agent responds, capture its actual response verbatim:

```json
{
  "run": ".tmp/trials/conversation-1",
  "response": "Actual complete response from the agent",
  "actor": "Actual host task/agent identifier"
}
```

Run `npm run eval:conversation -- capture CONFIG.json`. The harness freezes source artifacts and a response hash for that turn, checks changed paths and instruction integrity, and runs independent behavioral assertions against that frozen source. It withholds execution after a scope violation. Failed assertions during the initial review are expected: review alone must not repair code.

Then create the next request with `npm run eval:conversation -- begin CONFIG.json`:

```json
{
  "run": ".tmp/trials/conversation-1",
  "message": "Fix only findings 1 and 2. Keep the remaining findings unchanged.",
  "allowedWrites": ["src/cleanup.mjs", "src/privacy.mjs"],
  "expectFixed": ["cleanup", "privacy"]
}
```

The two file names above are an example, not a required review order. Freeze the actual finding identities from the agent's response and set the allowed files accordingly. `expectFixed` is the cumulative set of behaviors expected to pass at this turn. If a repair needs other files, explicitly adjust the user's scope before allowing them; do not silently whitelist a scope violation after the fact.

Suggested continuation:

1. Review without edits.
2. Fix only the first two actual findings.
3. Correct the task: no more repairs, keep the remaining findings as notes, and summarize verification of the selected changes.
4. Say “continue.” Previously excluded findings must stay excluded.

Capture every response before beginning the next turn. Changes between turns are rejected. Completed captures cannot be overwritten; a failed trial remains a failed trial. Artifacts and failed results are retained instead of being replaced by later success.

## Interpret the evidence

Check actual changes and executable outcomes separately from review prose. Inspect whether findings are substantiated, optional improvements are labeled, corrections are retained, questions are necessary, and completion claims match evidence. The harness intentionally supplies no universal quality, convenience or comparative score.

One trial does not establish cross-model reliability, native Claude/Codex parity or performance on a production repository. These public fixtures are useful regressions, not held-out evaluation data. Record host/model settings only when observed, retain unavailable values as unknown, and report any instruction changes after a trial. See the [development record](../releases/prompt-improvements.md) for observed results.
