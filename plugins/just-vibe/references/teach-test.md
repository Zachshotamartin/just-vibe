# Native interactive teaching tests

Use the host's real multiple-choice question UI, one question at a time. Do not put quiz questions and answer options into normal chat, an HTML mockup, printed JSON, or a shell prompt. Explanations and the final assessment can be conversational.

## Dialog availability

Discover the actually callable question tool, including its current schema and allowed uses. Codex environments may expose `request_user_input_async` or `request_user_input`; the latter may be restricted to a particular mode. Claude uses `AskUserQuestion` where exposed. Do not switch host modes, enable tools, or bypass a restriction automatically. If native questions are unavailable or the tool's restrictions do not permit this interaction, report the limitation and stop; do not invent an inline fallback.

An async call returning only confirms the question was issued. Wait for the user's actual submission. A preselected choice, timeout, dismissed dialog, or empty result is not an answer. Keep pending state and avoid repeated question popups. If the user changes the topic or cancels, acknowledge it and end/restart deliberately rather than grading against a stale question.

## Quiz state and payloads

Use `node toolkit.mjs quiz OPERATION` with JSON stdin (`--stdin` is optional). The utility returns state/payloads only; the host agent must call the named native tool. Keep state in context, saving only on request. Pass input through a literal stdin/heredoc rather than writing temporary state or question files. Choose the `dialog` value from the tool actually observed:

| Value | Native tool | Payload shape |
|---|---|---|
| `codex-async` | `request_user_input_async` | `questions: [{title, options: [string]}]` |
| `codex` | `request_user_input` | `questions: [{id, header, question, options: [{label, description}]}]` |
| `claude` | `AskUserQuestion` | `questions: [{header, question, options: [{label, description}], multiSelect: false}]` |

Follow the live schema if the host version differs; do not call a tool merely because this table names it. Use neutral choices; recommendation markers must not disclose the answer. These are learner-assessment questions, not permission or implementation approval requests.

Operations:

- `create`: `{topic, maxQuestions?, difficulty?, mode?}`. Defaults: five questions, difficulty 1, practice mode. Limits: 1–20 questions and difficulty 1–3.
- `present`: `{quiz, question, dialog}`. A question has `prompt`, `concept`, `options` (exactly three unique `{id,label,description}` records), `correctOptionId`, and `explanation`. Labels use 1–5 words. The utility shuffles choices and returns `{quiz,presentation}`. Only `presentation.arguments` goes to the native question tool; answer keys and explanations do not.
- `answer`: `{quiz,response}`. Normalize an actual user response to `{questionId,submitted:true,selection}`; selection can be a choice ID or the exact returned label. For custom text use `freeText`; for an explicit skip/cancel use `skipped`/`cancelled`. Without `submitted:true`, the state remains pending and no grade is produced. Never manufacture submission from a default selection.
- `review`: `{quiz,judgment:{result,explanation}}`. For pending free-text answers only; result is correct, partial or incorrect. Base the judgment on the learner's real explanation and the question, not on whether it matches the answer wording exactly.
- `report`: `{quiz}`. Report answered/graded/skipped counts, missed concepts and explanations. Active test mode withholds correctness; completed/cancelled test mode can report the assessed answers.

In practice mode explain why an answer is right or wrong after submission, then revisit a missed concept with another framing or increase application difficulty after success. In test mode defer feedback until completion. Do not disclose answer explanations or the full state in normal chat before the learner answers.

Ask about mechanisms and assumptions, not trivia alone. A linked-list quiz should test traversal cost, known-node insertion, pointer order and empty/head cases. A tool implementation quiz should test its invariants and tradeoffs: for `ml-split`, prediction time, dependent entities and leakage boundaries. Never run the named tool while testing knowledge about it.

Before presenting, check every choice against the stated assumptions and ensure exactly one is correct. For pointer-order questions, show the exact assignments and available references; a saved successor reference can make more than one order valid. If an answer exposes an ambiguity, acknowledge it and accept valid reasoning or withdraw the question instead of forcing the original key. Keep conversational updates focused on learning; do not narrate internal schemas, capability names or bookkeeping steps.

Source references: [Codex native question schema](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/handlers/request_user_input_spec.rs) and [Anthropic interactive-command guidance](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/plugin-dev/skills/command-development/references/interactive-commands.md). Packaging cannot make a host expose a tool that is absent in its current mode.
