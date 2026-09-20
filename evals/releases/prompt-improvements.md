# Prompt development record — 2026-09-20

This change, prepared for v0.8.1, adds input policies, request variants, conditional worked examples, concrete profile contributions and multi-turn guidance. The catalog still labels the changed command instructions as not broadly evaluated. No npm publication or native host update is part of this work.

## Independent conversation

One fresh Codex desktop subagent received only a copied plugin, a raw local utility library and a general review request. It was not given expected defects, counts, fixes, future turns or evaluator files. The same agent then received three follow-ups, with each turn captured before the next request. See the [responses, identities and results](prompt-improvements/conversation.json).

| Turn | Request | Observed result |
| --- | --- | --- |
| 1 | General source review, no edits | Identified all seven seeded defect categories and an additional ambiguous hash-encoding defect; no workspace changes. |
| 2 | Fix only findings 1 and 2 | Changed only cleanup and privacy modules. Both independent behavior checks passed; five intentionally excluded defect categories still failed. |
| 3 | Correction: no further repairs, keep remaining findings as notes | No changes; selected repairs still passed. Distinguished remaining hashing defects from the repaired index-identity issue. |
| 4 | “continue” | No changes or invented new work. Preserved the correction and explicitly said no additional checks were performed. |

The agent reported 28 initial temporary checks and 15 checks after repair. Those are agent-reported observations, separate from the harness's seven independently executed behavior checks and hash-based scope verification. Its additional hashing finding was retained, not discarded because it exceeded the seeded count. The first oracle version was not hashed at capture; later captures record the oracle hash. The evaluator added a pending-reader timeout control during development without exposing it to the agent.

## Independent ordinary lesson

A separate fresh subagent received the copied `teach` skill and a short request to teach linked lists to someone who knows arrays and basic Python. It explained traversal, insertion ordering, complexity, edge cases and practical tradeoffs with a running Python example. It did not require an initial questionnaire, edit files or start a practice/assessment workflow. The example was subsequently executed independently and printed A, B, X, C as stated.

The [actual lesson](prompt-improvements/lesson.md) ends with an optional inline self-check. This was an ordinary teaching request; it is not evidence that native `teach-test` dialogs work. [Lesson provenance and review](prompt-improvements/lesson.json) preserve that distinction.

## Checks and limitations

Deterministic controls reject the seven defective implementations, accept working implementations and reject disabled exports. Conversation tests cover selected repairs, immutable turn captures, rejected edits outside scope, changes between turns and withheld oracle execution after integrity failures. Catalog tests cover missing policies, alias drift, duplicate procedures and generated profile contributions. These controls make no model calls.

Final local validation: `npm run check` passed with 176 tests, 175 passes and one Windows-only skip on macOS. Catalog/generation validation covered 216 skills and 1,692 shipped Markdown links. All 216 skills passed the skill-creator validator. The npm package dry run passed metadata, MIT notices, shipped links and credential-pattern checks for 595 files. This check did not publish or rebuild the previously published archive.

The review conversation used a frozen instruction snapshot before the final wording consolidation; the lesson used the later snapshot. Instruction identities are recorded. Final generation and structural checks cover the shipped wording, but the conversation was not rerun after those editorial changes.

This is one public development conversation and one lesson, with inherited parent model settings and no separately observed backend version or token/cost accounting. It does not establish comparative superiority, convenience across users, cross-model consistency, native Claude parity, live service behavior or the effectiveness of every command/profile. No baseline or ECC arm was run for these changes.
