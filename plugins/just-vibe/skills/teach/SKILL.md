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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; a topic, command name, implementation question, or current project context, plus optional experience level, language, depth and time available. Teaching never executes the target workflow. Preparing a requested hands-on exercise is a separately scoped apply run when tracked.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve topic versus named workflow from the appended request and recent lesson; read source only when teaching its implementation.
- **Reasonable default:** Start with an accessible explanation and one concrete example when experience level is unknown; adjust to the next correction.
- **Ask only when needed:** Ask one focused question only if the topic cannot be identified. Language/level preferences may be inferred or stated as assumptions instead of blocking a lesson.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Explain the requested topic or implementation prerequisites using relevant catalog/source evidence. Do not implement the target command, alter files, install packages, or enroll the user in an unsolicited course.

None by default. Save lesson notes or example files only when explicitly requested. An explicit practice request permits bounded lesson preparation and owned solution/learner worktrees; no production/service action.

## Execute

1. Resolve a topic lesson, workflow-implementation lesson or explicitly requested exercise from the full brief. A known workflow name does not authorize executing it.
2. For a topic lesson, read the teaching guide and explain directly with one running example. Infer level from context; otherwise start accessibly without a mandatory questionnaire. State assumptions, trace a small example, then a misconception and a transfer example.
3. For a workflow lesson, read its catalog contract and relevant utility source; map concepts to actual algorithms, data shapes, invariants and verification boundaries. Distinguish implemented behavior, conceptual pseudocode and proposed design.
4. For an explicitly requested hands-on exercise, follow the practice guide: use owned solution/learner worktrees, protect assessment files, and establish passing solution/failing starter controls for the taught behavior before presenting the learner workspace. Keep exercise mechanics out of ordinary lessons.
5. Give only requested hints and let the learner make the implementation. Save progress only on request and preserve requested work before cleanup. Ordinary lessons may offer practice; native assessment belongs to teach-test under actual host restrictions.

## Technical method

- **Inspect:** Resolve the learner's topic or target workflow, existing knowledge and whether a project exercise is wanted.
- **Method:** Build a causal mental model, work a small example, then expose a common misconception and a transfer example.
- **Avoid misdiagnosis:** Teaching a command does not authorize running it; overwhelming prerequisite lists can obscure the actual concept.
- **Check the result:** Use a short prediction or explanation prompt to check understanding; keep optional practice separate from unsolicited repo mutation.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Every topic or workflow-implementation lesson: [Teaching method](../../references/teaching.md).
- The learner requests hands-on practice using repository code: [Project exercises](../../references/practice.md).

## Decision branches

- **When learner asks about a workflow with missing project context:** Teach the concepts using a labeled hypothetical example; do not invent the project's architecture.
- **When hands-on practice is explicitly requested:** Prepare an isolated, control-validated project exercise; do not edit the original project to create a mistake.

## Deliver and verify

- A readable lesson with a clear learning outcome, prerequisite sequence, worked example, relevant tradeoffs and mistakes, and an optional practice/check step. For tool lessons, include a concept-to-implementation map and links to actual source where available.
- Learning objective, worked example, common misconception, and a concrete next exercise.
- Optional actual project exercise, validated controls, learner workspace, progressive hints and behavioral assessment.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A linked-list lesson traces nodes/links and operations, distinguishes singly/doubly linked lists, and explains that constant-time insertion requires the position/node to be known; finding it can require linear time.
- An ml-split implementation lesson explains prediction time, entity dependence, temporal/group separation and leakage checks, ties these to the actual workflow, and never runs training or changes datasets.
- An unfamiliar topic is not silently interpreted as a command to execute; unknown experience level yields an accessible explanation rather than a mandatory questionnaire.

## Stop and recover

- Ask one focused question if the topic or workflow cannot be identified. Do not invent source behavior, assume required knowledge without explaining it, claim the user mastered the topic, or execute the workflow merely because it was named. Verify version-sensitive claims against relevant primary sources.

## Example requests

- **Normal (inspect):** Teach linked lists from the basics, with a worked insertion example and practical tradeoffs.
- **Edge (inspect):** Teach linked-list deletion when only the head pointer is available.
- **Blocked (inspect):** Teach db-migrate concepts without database access; do not run a migration.
