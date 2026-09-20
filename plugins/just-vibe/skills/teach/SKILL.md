---
name: teach
description: "Teach a programming topic or the concepts needed to understand and implement a just-vibe workflow. Use for conceptual instruction or prerequisites; use explain for an existing implementation and teach-test for assessment."
---

# teach

Teach a programming topic or the concepts needed to understand and implement a just-vibe workflow.

## Choose this workflow

Use for conceptual instruction or prerequisites; use explain for an existing implementation and teach-test for assessment.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; a topic, command name, implementation question, or current project context, plus optional experience level, language, depth and time available. Teaching never executes the target workflow.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Explain the requested topic or implementation prerequisites using relevant catalog/source evidence. Do not implement the target command, alter files, install packages, or enroll the user in an unsolicited course.

None by default. Save lesson notes or example files only when explicitly requested.

## Execute

1. Interpret the complete brief first. Explicit requests such as "teach linked lists" are topic lessons. A known workflow ID such as ml-split or git-bisect selects implementation teaching when the user asks how that tool works or how to implement it. If both interpretations fit, state the useful interpretation and cover their connection.
2. For a workflow lesson use toolkit show with the exact ID and read the referenced implementation files. The catalog supplies purpose and boundaries; the current source supplies actual mechanisms. Never call the workflow itself to obtain a lesson.
3. Read the teaching guide at ../../references/teaching.md. Choose the minimum prerequisites, adapt to the requested depth/language, explain in readable connected prose, and use a concrete example before broad abstractions.
4. For a topic lesson, provide the explanation directly. For an implementation lesson, map each prerequisite to the relevant algorithm, data shape, invariant, tool boundary, verification case or source module.
5. Check the lesson for factual accuracy and hidden assumptions. End with optional practice, not a mandatory quiz. Stop at the requested learning scope; do not turn a lesson into an implementation or service action.

Task-specific method: Resolve whether the user wants a topic lesson or an implementation-focused lesson. Infer experience from context; otherwise start with approachable fundamentals and offer depth without blocking on a questionnaire. For a named just-vibe workflow, read its catalog record, skill and relevant utility source, distinguish implemented behavior from design requirements, and identify the concepts necessary to build it. For a standalone topic, define a concrete learning outcome and choose a useful worked example. Order prerequisites from the minimum foundation to the requested implementation. Explain the purpose, core model, and terminology in connected plain-language prose before introducing complexity. Use an annotated example and trace its state step by step. Relate each concept to a concrete design or implementation decision. Explain alternatives, tradeoffs, failure modes and common misconceptions. Use a small diagram or table only when it clarifies the lesson, and short code examples in the requested language when helpful. End with a concise understanding check or optional exercise and a recommended next step. Keep the explanation useful without requiring the user to answer a quiz; offer hints or an answer when requested. Choose one running example and state its assumptions before deriving the mechanism; distinguish conceptual pseudocode from runnable, version-specific code.

## Decision branches

- **When learner asks about a workflow with missing project context:** Teach the concepts using a labeled hypothetical example; do not invent the project's architecture.

## Deliver and verify

- A readable lesson with a clear learning outcome, prerequisite sequence, worked example, relevant tradeoffs and mistakes, and an optional practice/check step. For tool lessons, include a concept-to-implementation map and links to actual source where available.
- Learning objective, worked example, common misconception, and a concrete next exercise.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A linked-list lesson traces nodes/links and operations, distinguishes singly/doubly linked lists, and explains that constant-time insertion requires the position/node to be known; finding it can require linear time.
- An ml-split implementation lesson explains prediction time, entity dependence, temporal/group separation and leakage checks, ties these to the actual workflow, and never runs training or changes datasets.
- An unfamiliar topic is not silently interpreted as a command to execute; unknown experience level yields an accessible explanation rather than a mandatory questionnaire.

## Stop and recover

- Ask one focused question if the topic or workflow cannot be identified. Do not invent source behavior, assume required knowledge without explaining it, claim the user mastered the topic, or execute the workflow merely because it was named. Verify version-sensitive claims against relevant primary sources.

## Example requests

- **Normal (inspect):** Teach linked lists from the basics, with a worked insertion example and practical tradeoffs.
- **edge (inspect):** Teach linked-list deletion when only the head pointer is available.
- **blocked (inspect):** Teach db-migrate concepts without database access; do not run a migration.
