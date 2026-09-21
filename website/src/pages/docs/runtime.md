---
layout: ../../layouts/Doc.astro
title: Memory, agents and runtime tools
description: Search saved context, inspect activity, review learned patterns and run bounded specialist work.
---

## Availability

These features are included starting in just-vibe 0.10.0. They complement the existing [automatic assistance](/docs/automatic/) and add a persistent [goal skill](/docs/goals/).

## Tools your agent can discover

The local MCP server exposes workflow search, full instruction loading, memory, goals, feedback, learning review, configuration scanning and specialist information. Your agent can discover these capabilities through its normal tool interface, so you do not have to remember a slash command.

The default server excludes memory and preference writes, user-wide memory browsing, global lesson history and worker launching. Explicit configuration can enable those capabilities separately. Workflow loading still applies preferences you previously approved for all projects, without exposing their original feedback quotes or history. It can record instruction delivery for the current task. Tool availability does not guarantee the model will choose correctly; the activity report shows what was actually observed.

## Searchable context

Project, team and user memory have separate scopes. Save a decision with its source, search it by keywords, or create a handoff with completed work, remaining work, constraints and evidence. Team records can be reviewed in Git. Personal records stay outside the repository.

Memories are context, not authority. The agent checks them against your current request and the code. Retire obsolete entries or forget them when they should no longer be stored.

## Learning you can review

Optional observation records workflow and tool names, hashed recording IDs and coarse outcomes. It does not scrape transcripts or retain tool arguments and outputs. Repeated activity creates a suggestion for review, not an automatic rule.

Approved suggestions become versioned project preferences. You can inspect, retire or roll back them, export selected lessons, or import someone else's lessons as pending suggestions. An approved lesson can also become a local skill or agent draft; installing that draft is a separate choice. Git history analysis can suggest conventions from observed commit prefixes without activating them.

## Independent specialists

Twelve specialists cover code review, security, planning, architecture, frontend, backend, databases, ML, tests, reliability, documentation and bounded implementation. Each has a narrower assignment and fresh investigation context.

Claude discovers the packaged agents. Codex can use project agent definitions. The optional worker manager launches installed Codex or Claude CLIs in separate Git worktrees, with a concurrency limit, timeout, status, logs and cancellation. It preserves changed work and does not automatically merge or publish it. Additional model processes can consume your account usage.

## Inspect activity

```sh
just-vibe activity report --root /project
```

Open the generated local HTML file to filter workflow selection reasons, instruction delivery, observed tool calls, failures, lesson versions, suggestions and goals. The report has no network dependencies and uploads nothing. It is a snapshot; generate it again for new activity.

These are operational records, not a quality score. A returned tool call or successful process exit does not prove that the work is correct.

## Targeted checks

The optional before-action policy recognizes protected quality configuration edits and specific Git bypass, force and discard operations. Exceptions apply to one exact action for a short time. The checks do not interpret arbitrary shell programs or replace the host's sandbox.

```sh
just-vibe scan config --root /project
```

The static configuration scanner inspects agent instructions, permissions, hooks and MCP settings without executing them. It reports possible credential exposure, unsafe runners, broad permissions and related indicators with locations and remedies. Findings need contextual review; a clean scan is not a security guarantee.

## Choose the installation

For one reviewed setup flow, use `just-vibe setup --guided --root /project`. It covers host/profile/rule choices and optional runtime capabilities. `--dry-run` previews without changes; existing MCP connections need a restart after access changes.

Profiles select full, core, frontend, backend or ML workflows. Individual packs and language rules can refine that selection. Updates retain the selected configuration. Reference methods remain readable even when they are excluded from native skill discovery.

```sh
just-vibe setup --target claude --profile frontend --rules typescript,react
just-vibe setup --target cursor --root /project --profile frontend --rules react
```

Skill adapters support Cursor, OpenCode, Copilot, Gemini, Kimi, Qwen, Windsurf, Antigravity IDE, Zed and Hermes. Cursor also receives scoped rules. Cursor/OpenCode native events are an explicit `--editor-hooks` option; Hermes requires its actual home as the destination. Updates track owned files and stop if you edited one; unrelated configuration is preserved. Host behavior and event coverage remain version-specific.

The MCP catalog now contains 45 tools, including context health, quality preview and commit verification, security reports, and local GitHub epic reading/preparation. See [checks and integrations](/docs/integrations/) for activation, examples and limits.

The package's `references/runtime-platform.md` contains operation schemas, examples, storage paths and recovery instructions. The source documentation records implementation and validation limits.

See [coordination and plan review](/docs/coordination/) for composed feature/fix/refactor/MVP workflows, dependent workers, reviewed local application, browser annotations and portable context. Learning proposals now preserve conditions and exceptions and surface related guidance before approval. Rejected patterns stay rejected through pruning until explicitly reconsidered.

## Expanded methods and workbench

The next release contains 24 specialists, 48 MCP tools, 43 focused methods and 22 connector recipes. The [workbench guide](/docs/workbench/) covers local sessions, configuration cleanup, bounded work, evidence, catalog browsing and reviewed updates. Counts describe available surfaces, not an objective quality score. Additional file adapters include AdaL, CodeBuddy, JoyCode, Kiro, OpenClaw, Pi and Trae; their documented support levels remain separate from live model behavior.
