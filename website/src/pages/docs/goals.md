---
layout: ../../layouts/Doc.astro
title: Goals that survive a session
description: Keep an objective, completion criteria, progress and evidence together while you work.
---

## Availability

The goal skill is included starting in just-vibe 0.10.0. Update older installations to use it.

## Start with the outcome

In Claude, use `/just-vibe:goal` followed by your objective. In Codex, select the **goal** skill and provide the same context. A host's built-in `/goal` command is separate.

> Make checkout work with expired and valid discount codes. Preserve the response schema and verify both paths.

The agent saves the objective, concrete completion criteria, constraints and next steps. It then works through the relevant workflows, recording progress and evidence. A saved plan alone does not complete the goal.

## Pick up where you left off

Ask the agent to resume the named goal. It reads the saved state, checks whether evidence artifacts changed, and continues the remaining authorized work. Native resume/compaction hooks also restore a short list of active goals as context. Your current request controls what work resumes.

You can inspect the records directly:

```sh
just-vibe goal list
just-vibe goal resume --stdin <<'JSON'
{"id":"checkout"}
JSON
```

## Know when it is complete

Each criterion needs supporting evidence. Evidence can be an attributed report from the agent or a project artifact whose contents are hashed. The runtime rejects completion when a criterion lacks evidence, its current artifact changed, or blockers remain.

A hash establishes which file was checked; it does not establish that the implementation is correct. The agent still needs checks that exercise the requested behavior. Reopening a completed goal requires fresh verification. Revising the objective, criteria or constraints preserves the previous scope as history and resets the current criteria, so old evidence cannot complete the new work. Updating progress or next steps without changing scope preserves current evidence.

## Native controls and scope

When a host provides native goal controls, the skill can use those alongside the portable record. It sets a token budget only when you explicitly supply one. Without native controls, the record still persists, but it does not schedule the agent to wake up later.

A goal preserves your objective and constraints. Deployment, publication, paid compute and messages still follow the authority you have actually given. Worker processes require separate enablement and an authorized assignment.

Goal records are stored locally outside the repository. See [runtime tools](/docs/runtime/) for memory, learning, workers and installation choices.
