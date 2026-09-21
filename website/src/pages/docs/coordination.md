---
layout: ../../layouts/Doc.astro
title: Coordinate work and review plans
description: Guide implementation through phases, preserve context and give browser feedback on concrete artifacts.
---

## Availability

These features are included starting in just-vibe 0.10.0.

## Start with the result

Ask for a feature, fix, refactor or MVP normally. The agent can follow a composed workflow when several phases need to fit together. You can also use `/orchestrate` with your full request. Small changes stay direct; a workflow does not require extra agents or paperwork.

A feature follows the existing contract through implementation and verification. A fix starts from a reproducer. A refactor preserves named behavior. An MVP delivers one usable end-to-end path with explicit non-goals and real integration limits.

## Reviewed dependent work

When you authorize additional agents, the coordinator creates bounded assignments with dependencies and file ownership. Only accepted prerequisites unlock dependent work. A successful process exit enters review; it does not automatically mean the work is correct.

The agent inspects changed files, runs relevant checks and applies the exact reviewed result locally. Application preserves your Git index and records an undo task. Changed source, overlapping edits or stale checks stop application for reconciliation. Retry counts are bounded and each retry carries a concrete correction. Nothing commits, merges or publishes automatically.

## Annotate a concrete plan

Ask to review a plan in the browser, or use `/plan-review docs/design.md`. The agent prepares a reviewable artifact and opens a private localhost link. Select a line to annotate it, add a whole-document comment, request changes or approve the displayed version.

Feedback is tied to the file's content hash. Editing the plan invalidates its effective approval. Refreshing the review creates a new snapshot and clears the verdict while retaining bounded history. Approval records your decision about that artifact; it is not a deployment permission.

The browser view supports keyboard input, mobile layouts and reduced motion. HTML previews are sandboxed without scripts or remote resources. The local server expires automatically; it does not publish your plan online.

## Carry context between worktrees

Export selected project memories, goals and reviewed preferences, preview the destination and import deliberately. Existing IDs are preserved. Imported preferences are pending suggestions and goals need fresh evidence. Permissions, worker tokens and old goal evidence are excluded.

Transfer is an explicit snapshot copy, not a live shared store. Review the content before sharing: memory bodies and preferences may include private project details.

## Configure once

```sh
just-vibe setup --guided --root /project
```

Choose hosts, workflow/rule packs, ordinary-request routing, observation and native tools. The wizard previews the exact choices before applying them; `--dry-run` remains inert. Restart existing MCP connections after changing access. Your host still controls hook trust and tool permissions.

See [runtime tools](/docs/runtime/) for memory, learning and adapters, and [persistent goals](/docs/goals/) for durable objectives.
