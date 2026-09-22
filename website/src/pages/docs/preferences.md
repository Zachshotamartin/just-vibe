---
layout: ../../layouts/Doc.astro
title: Preferences and delivery diagnosis
description: Inspect learned instructions, preview their routing effects, and check whether your host actually used just-vibe.
---

Explicit corrections can become saved project preferences. Open the local operator interface and choose **Preferences** to inspect the instruction, source quote, scope and version. Edit an instruction, disable it, or restore an earlier version. Every edit retains history; your current request takes precedence.

Use **Preview examples** with one request that should select the workflow and one that should not. The preview shows before/after routing candidates without saving the draft. Literal matching is useful for explaining triggers, but cannot predict whether an agent will follow the instruction. Conditions, exceptions and conflicts still require judgment.

## Diagnose delivery

```sh
npx just-vibe diagnose status --root .
```

This separates recorded hook delivery, workflow selection, instruction loading and observed tools. It reports timestamps and missing stages. Installed files do not establish that the current host connection is active; old observations do not prove a new session works.

For a fresh trial, explicitly authorize use of your existing model account:

```sh
printf '%s' '{"host":"claude","useAccount":true}' | npx just-vibe diagnose trial --root . --stdin
```

Use `codex` for Codex. The trial creates an isolated fixture, installs its integration, submits an ordinary fix request and an explicit correction, then starts a fresh session and follows up. It checks regression behavior, saved preference delivery and absence of added dependencies. Results and redacted host events stay in a private local report directory. The trial consumes model usage; ordinary setup and `diagnose status` do not.

A live trial can fail or be blocked by authentication or host tool restrictions. These are reported separately from passing behavior. There is no universal output-quality score.
