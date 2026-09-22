---
layout: ../../layouts/Doc.astro
title: Compatibility and limits
description: What the toolkit provides, what your agent provides, and where access still matters.
---

## Runtime and hosts

The toolkit requires **Node.js 22+**. Codex CLI or Claude Code must support native plugins. The npm, pnpm, and modern Yarn commands all resolve the same public npm package.

Native installation lifecycle checks have been run on macOS for both hosts. Cross-platform runtime and package tests do not by themselves establish native host support on every operating system. Windows requires a host CLI that supports native plugins; standard npm Node command shims are supported. WSL follows the Linux path when its selected host supports it.

## The host executes the workflow

Commands are skills with instructions, contracts, references, and optional Node helpers. Your coding agent reasons about the task and calls its available tools. The CLI can install the payload, discover commands, manage local records, and collect supported evidence; it does not replace the host model.

The toolkit's scope rules and state bookkeeping are not a security sandbox. Current user instructions and host restrictions still apply. A saved record or a profile never grants fresh permission.

## Optional capabilities

GitHub workflows need appropriate GitHub access. Vercel operations need your team, project, and authenticated tool. Database operations need the selected engine and environment. Training needs data, a compute budget, and authorized hardware. The standalone browser evidence collector requires project-installed Playwright and Chromium; an active agent can also use its available native browser tools.

Installation does not install those optional providers or authenticate external services.

## Native question dialogs

Teach-test requires a question tool that permits assessment in the active mode. Some Codex modes restrict questions to clarification or planning. That mode cannot be treated as native quiz support. Claude interaction was tested separately; it does not prove every host and mode behaves identically.

## Local state and ownership

Most supporting state lives in `.just-vibe/` in the selected project. Automatic assistance in v0.9.0 and later keeps personal/project learning and bounded task records under `~/.just-vibe/adaptive`, outside the repository. Instructions can be saved to AGENTS.md or CLAUDE.md. Nothing is uploaded automatically by these helpers. Local reports may contain paths, source excerpts, and command output, so share them intentionally.

All changes belong to the user. Agents are instructed not to add self-attribution to commits, pull requests, or messages.

## What verification means

Structural validation confirms that the shipped contracts and payload are consistent. Runtime tests check utility behavior against fixtures. Behavioral evaluations cover particular scenarios under particular conditions. None of those establish universal output quality, complete vulnerability coverage, or superiority over another toolkit.

## Next-release integrations

The source checkout adds local native MCP tools and skill adapters for Cursor, OpenCode, Copilot, Gemini, Kimi, Qwen, Windsurf, Antigravity IDE, Zed and Hermes. Cursor and OpenCode also have optional native event adapters, selected explicitly with `--editor-hooks`. Hermes targets your actual Hermes home; Zed and the other file adapters use project skills. Installation preserves host permissions and provider configuration.

Event fixtures verify adapter logic, not live behavior on every editor version. OpenCode's experimental system-context hook is version-sensitive. The included context-capacity bridge uses Claude status-line data; other hosts need actual metrics through the observation interface. Optional specialist workers use installed Codex or Claude CLIs and may consume account usage. Read [checks and integrations](/docs/integrations/), [runtime tools](/docs/runtime/) and [persistent goals](/docs/goals/). These additions are included starting in just-vibe 0.10.0.

## Workbench in v0.10.0

The source checkout adds focused methods, native session import, configuration cleanup, behavior rules, reviewed jobs/services, cross-host councils, evaluation receipts and an offline local tool browser. See the [workbench guide](/docs/workbench/). Seven additional skill-file adapters and Kiro v1 hooks have fixture coverage; live activation and provider authentication are separate checks. These changes are included starting in v0.10.0.
