---
layout: ../../layouts/Doc.astro
title: Command shortcuts and context
description: Four ways to invoke the same workflow. Add your request, constraints and files after its name.
---

## Four forms, one workflow

With the updated just-vibe installer for **Claude Code**, these are equivalent:

```text
/jv reprompt Make this prompt clearer: Fix the stale search results.
/just-vibe reprompt Make this prompt clearer: Fix the stale search results.
/jv:reprompt Make this prompt clearer: Fix the stale search results.
/just-vibe:reprompt Make this prompt clearer: Fix the stale search results.
```

Use whichever form is easiest to remember. Replace `reprompt` with any command included in your installation. All forms use the same canonical workflow, defaults and permission boundaries. A shortcut does not grant permission to deploy, publish or change data.

**Availability:** `reprompt` and the shorter shortcuts are in the source checkout for the next release. They are not in npm version 0.10.0. The website catalog describes the current source; installing 0.10.0 does not install these additions.

## Add context after the command

The command name comes first. Everything after it is your request. Include files, symptoms, goals and constraints when they help; multiline requests work too.

```text
/jv review src/auth/
Inspect token refresh and logout for race conditions.
Explain findings with file references. Do not change code.
```

```text
/jv:teach linked lists
Assume I know arrays. Use TypeScript examples, then ask me
whether I want to try an exercise.
```

```text
/just-vibe ml-debug-training Loss becomes NaN after epoch 3.
Start with logs and gradient statistics. Keep the training run alive.
```

The first name selects one workflow. Mentioning another command later supplies context; it does not automatically start a second workflow. Unknown names produce a correction request instead of silently running a different command. Excluded or disabled skills must be enabled before they can run.

## Improve a prompt with reprompt

```text
/jv reprompt Rewrite this using relevant installed skills:
Build a React search view. It should handle slow requests,
empty results and keyboard navigation. No new dependencies.
```

The agent returns a paste-ready prompt that preserves your intent. It checks which skills are actually available before including them, uses only those that help, and explains meaningful changes briefly. Add “output only the rewritten prompt” when you want just the result. You can also refer to a clearly identified earlier prompt or a file.

`reprompt` rewrites the request; it does not execute the task described inside it. It does not install skills, alter persistent instructions or save a file unless you explicitly ask for that additional action. Read its [full command contract](/commands/reprompt/).

## Install the Claude shortcuts

Until the next npm release, use the source checkout:

```sh
node bin/just-vibe.mjs setup --target claude --local
```

For an existing checkout installation, use `update` with the same flags. For a future published version containing this feature, use `pnpm dlx just-vibe@latest update --target claude` for a bundled installation. Keep your existing source and scope; changing install channels requires the steps in the [update guide](/docs/updates/).

Start a new Claude conversation afterward. `/just-vibe:<command>` comes from the native plugin. The installer adds two dispatchers under Claude's commands directory and a small `jv` shortcut plugin under its skills directory. The shortcut plugin forwards to just-vibe; it does not duplicate hooks or connected services. Direct native plugin installation alone does not add those files. This integration is checked against Claude Code 2.1.258; update older hosts if they do not discover skills-directory plugins, and accept project trust when prompted.

User scope follows `CLAUDE_CONFIG_DIR`, or `~/.claude` by default. Project and local scopes place shortcuts in the project's `.claude/commands` and `.claude/skills/just-vibe-shortcuts`; Claude has no separate local-only directory for these files. Review those generated files before committing them if your plugin installation is local. `doctor` checks shortcut health, and `uninstall` removes only unchanged installer-owned files. Conflicting or edited files are preserved and reported.

## Codex and other agents

In Codex, select the command from the **just-vibe skill picker**, then append the same request. Custom Claude slash-menu entries are not portable to Codex. Use its native skill mention or picker if the input box rejects an unknown slash command.

The just-vibe router recognizes all four forms when they reach it as request text, including through `route` or supported prompt hooks. This does not register new slash commands inside another application's input box. Other editor adapters use that editor's skill interface; consult [compatibility](/docs/compatibility/).

```sh
node bin/just-vibe.mjs route '/jv reprompt Explain linked lists more clearly'
```

The CLI reports the selected workflow and preserves the request. It does not run a model or produce the rewritten prompt itself.

## Find the right command

Use `/jv tools React state` to search your installed commands, or browse the [command catalog](/commands/). `/jv auto` chooses a workflow for a broader task. You can also describe the outcome in plain language with [automatic assistance](/docs/automatic/) enabled.
