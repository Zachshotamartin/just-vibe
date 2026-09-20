---
layout: ../../layouts/Doc.astro
title: Context that carries forward
description: Turn important decisions and corrections into project instructions that future sessions can read.
---

## Save the parts worth keeping

```text
/just-vibe:remember context both — save the decisions and corrections
from this conversation. Preserve existing host-specific guidance.
```

This requests updates to **AGENTS.md and CLAUDE.md**. You can select the relevant host instead. The agent should preserve existing instructions, identify conflicts, and save concise guidance rather than copying the entire conversation.

The command can only use context still available to the agent. It cannot recover forgotten messages or force a host to load every instruction file. Read the resulting changes and keep project instruction files under version control when you want to share them.

## Make rules concrete

```text
/just-vibe:remember Use our existing Button component for new controls;
make this checkable and explain where the rule applies.
```

The memory helpers support scoped rules, evidence checks, and inspection of why a rule is not being picked up. A source-pattern check can confirm the pattern it looks for; it cannot prove every UI choice is correct.

## Preserve unfinished work

```text
/just-vibe:remember context both, including a checkpoint named checkout
for unfinished work and the next verification step.
```

Ask for the decisions, current state, verified facts, unresolved issues, and next step. Keep temporary investigation details separate from enduring project conventions.

## Where the state goes

Instruction blocks live in the selected project files. Supporting records live under `.just-vibe/`, including memory, guard, task, and decision records. Keep local records ignored unless sharing them is intentional: they can contain source excerpts, paths, snapshots, and check output.

These helpers upload nothing automatically. Saved command arrays are evidence and configuration, not fresh permission to run them. Recovery uses recorded revisions and refuses conflicting concurrent edits.
