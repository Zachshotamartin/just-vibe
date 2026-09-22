---
layout: ../../layouts/Doc.astro
title: Your first workflow
description: Choose a starting point. Add the context that matters. Let the agent work through a clear method.
---

## Start with the outcome

Starting in v0.9.0, just-vibe can select workflows from ordinary requests after its native hooks are trusted. Say “Fix the mobile menu” or “Why is training unstable?” without remembering a command. Read [automatic assistance](/docs/automatic/) for setup, feedback and limits. Update older installations to receive it.

When you prefer an explicit shortcut, append your request after a command in Claude Code:

```text
/just-vibe:auto Fix the checkout bug, add regression coverage,
and verify. Preserve the API and avoid new dependencies.
```

In Codex, select **auto** from the just-vibe skill picker, then send the same brief. The host agent reads the workflow and uses the tools available in your session. just-vibe does not run a separate model service.

The next release adds `/jv <command>`, `/just-vibe <command>` and `/jv:<command>` alternatives in Claude, plus `reprompt` for improving a prompt. See [command shortcuts and context](/docs/command-shortcuts/) for all four forms, examples, installation and host differences.

Useful context includes the target, observed behavior, desired outcome, constraints, relevant files, environment, and what would count as done. You do not need to fill out a form for every task; the agent should recover what it can from the conversation and repository.

## Know which mode you want

- **Inspect:** read and investigate. Do not make product changes.
- **Plan:** prepare the approach and identify requirements before implementation.
- **Apply:** carry out the requested changes within the authorized scope.

Each [command page](/commands/) publishes its default mode and exact scope. Saying “review” does not automatically authorize fixing every finding; saying “fix this bug” authorizes the relevant implementation. Deployment, external messages, and data mutations still need the corresponding user intent and access.

## Find a command without memorizing the catalog

```text
/just-vibe:tools React state and stale requests
/just-vibe:tools --all
/just-vibe:help How do profiles work?
```

Use [auto](/commands/auto/) when the request crosses disciplines. Use a specific command when you already know the job, such as [review](/commands/review/), [explain](/commands/explain/), or [ml-train](/commands/ml-train/).

## Discover from the terminal

```sh
pnpm dlx just-vibe@latest tools react
pnpm dlx just-vibe@latest route "Investigate a checkout regression"
```

The CLI can inventory and route workflows. These commands do not call a model or execute the proposed task. Native host enablement still applies.

## Ownership stays with you

Changes, commits, pull requests, and messages belong to the user. The toolkit directs agents not to add agent self-attribution. Profiles and workflows guide how the agent works; they do not replace your instructions or expand its permissions.
