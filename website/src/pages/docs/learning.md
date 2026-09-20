---
layout: ../../layouts/Doc.astro
title: Learn while you build
description: Understand the idea, see it work, then try it for yourself.
---

## Learn a topic

```text
/just-vibe:teach linked lists in TypeScript. I understand arrays;
show me a small example and explain the tradeoffs.
```

[Teach](/commands/teach/) gives you a learning objective, prerequisites, a worked example, common mistakes, and a transfer example. It starts from your context instead of requiring a long questionnaire.

## Understand an implementation

```text
/just-vibe:teach the concepts needed to implement ml-evaluate.
Connect the concepts to the actual workflow and verification steps.
```

A workflow lesson should distinguish actual implementation from conceptual pseudocode or a proposed design. Teaching a workflow does not authorize the agent to execute that workflow.

For an explanation of existing code or behavior, use [explain](/commands/explain/). For foundations or implementation prerequisites, use teach.

## Ask for practice

```text
/just-vibe:teach Create a hands-on exercise for the retry logic
in this repository. Give me hints without implementing my solution.
```

When explicitly requested, the agent can prepare solution and learner worktrees with passing-solution and failing-starter controls. This needs Git and a committed project root. The checks should assess the taught behavior. Worktrees separate files; they are not security sandboxes.

## Use native assessment questions

```text
/just-vibe:teach-test Quiz me on linked lists with multiple-choice
questions. Explain each answer after I respond.
```

[Teach-test](/commands/teach-test/) uses a native question tool **only when that tool is available and permitted for assessment in the current host mode**. Some Codex modes restrict question dialogs to planning or clarification. In those modes, the agent must explain the limitation rather than pretending an inline list is an interactive dialog.
