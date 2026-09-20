---
name: teach-test
description: "Quiz the user on a topic or workflow through native multiple-choice question dialogs, with feedback and adaptive practice."
---

# teach-test

Quiz the user on a topic or workflow through native multiple-choice question dialogs, with feedback and adaptive practice.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; a topic, workflow, or recent lesson plus optional experience, question count and practice/test preference. Requires an available native question tool permitted for this interaction in the current host mode.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `user.questions`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Assess understanding through one native dialog question at a time. Do not render quiz questions inline, implement the named tool, alter project files, or change host mode/settings automatically.

No project or external-service writes. Keep quiz state in session context; save results only on request.

## Execute

1. Read ../../references/teaching.md and ../../references/teach-test.md. Resolve the topic from the complete brief or immediately preceding lesson; ask for it only if unresolved.
2. Inspect actual callable tools. Prefer request_user_input_async in a Codex environment that exposes and permits it, otherwise request_user_input only in its supported mode; use AskUserQuestion in Claude when available. Follow the actual host schema and restrictions. If no suitable dialog is available, explain that native interactive testing is unavailable here and stop without inline questions.
3. Create quiz state with toolkit quiz create. Generate a question grounded in the lesson or target workflow, with exactly three short neutral choices, a correctOptionId, concept, and explanation. Keep this answer material out of the user-facing question.
4. Call toolkit quiz present to validate and shuffle the choices and produce a presentation payload for the observed dialog. Actually invoke that native host tool with presentation.arguments. Merely printing the payload does not ask the question.
5. For asynchronous tools, retain the quiz as awaiting-answer and wait for a user response; a returned pending tool call or preselected option is not submission. Do not advance, reveal the answer, or end with an inline replacement question while waiting.
6. Normalize the actual response into questionId, submitted, selection/freeText, skipped/cancelled and call toolkit quiz answer. For a free-text explanation, use quiz review only after assessing its meaning; preserve the actual response and explain the judgment.
7. Show returned feedback after answers in practice mode; withhold correctness in test mode until finished. Generate the next question using demonstrated misconceptions and remaining budget, then repeat through the native tool. Use quiz report for the final assessment; report sample limits and optional review topics.

Task-specific method: Resolve the topic or recent lesson, select practice by default or test when requested, and set a bounded question count (default five). Identify the native question tool and verify availability and permitted use before preparing the quiz. Ask one clear question with three plausible short choices using the real native question tool. Include prerequisite understanding, a worked-state prediction and an application or tradeoff question as appropriate; shuffle choices and avoid answer-revealing labels or descriptions. Wait for an actual submitted answer. A default/preselected option, an async call returning, a timeout, skip or cancellation is not a correct or incorrect answer. Keep the same pending question until its response is resolved. In practice mode explain the answer after submission and adapt subsequent difficulty/concept to demonstrated understanding. In test mode defer correctness feedback until completion. Evaluate free-text answers fairly against the actual question rather than guessing a clicked option. Finish at the question limit or user cancellation with a bounded assessment, missed concepts and suggested review. Do not claim mastery from a short quiz or save a permanent learner profile without request.

## Deliver and verify

- Native multiple-choice question dialogs, answer-dependent feedback, and a final short assessment with concepts to revisit. Question text stays in the dialog; explanations may appear in normal conversation after answers.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The host receives question/options only, with no answer key or explanation in the native payload. A second question cannot be presented before the pending answer is resolved.
- Empty, absent, default-only and delayed async responses do not advance or grade the quiz. Skips/cancellations do not count as incorrect; stale answers cannot answer a newer question.
- A linked-list quiz checks traversal, known-node insertion and pointer order. An ml-split quiz checks temporal/entity leakage and never starts training. If native dialogs are unavailable, the workflow reports that limitation and does not substitute inline quiz questions.

## Stop and recover

- Stop on the requested question limit, cancellation, missing native-dialog capability, ambiguous topic, or an unresolved answer. Respect tool-specific host/mode restrictions; do not force Plan mode, grant permissions, or simulate a native dialog by printing JSON or markdown.

## Example request

Quiz me on linked lists using the native question dialog, one question at a time.
