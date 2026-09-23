---
layout: ../../layouts/Doc.astro
title: Preferences and delivery diagnosis
description: Open your local dashboard, manage preferences, inspect delivery and transfer project context.
---

The dashboard runs on **your computer**. This public website only documents it: there is no website login, cloud preference account or automatic synchronization.

## Open the dashboard

From your project:

```sh
npx just-vibe dashboard --root .
```

The CLI starts an authenticated loopback server and opens its private URL in your browser. Keep the terminal running while using it. `--no-open` prints the URL without opening a browser. `--demo` creates an isolated sample project; sample changes disappear when that process stops. Demo mode never loads your real preferences. These commands require the upcoming 0.12 release or this repository checkout; the registry's 0.11 release does not include the dashboard launcher.

The top of the dashboard identifies the project and storage directory. Real preferences live under `~/.just-vibe` by default, or `JUST_VIBE_HOME` when configured. Project preferences are keyed to the local project path; user preferences apply across projects on this computer. Saved records persist after closing the browser or stopping the server. Unsaved drafts remain in the current tab across filtering, refresh-button clicks and view changes; closing or reloading the tab discards them.

Keep the private URL private. The token authenticates this local session. The dashboard cannot authenticate npm, GitHub or your coding host, and does not run arbitrary commands. Project adapter installation is available only when launched with `--allow-install` and requires reviewing the concrete file changes.

## Create and review preferences

Choose **Preferences**, then **Create a preference**. Supply a canonical workflow ID such as `fix` or `ui-states`, an instruction and project or user scope. Optional triggers, tools, checks, conditions and exceptions refine when the instruction applies. Creation records an explicit local source and version history. Editing, disabling and restoring versions require the latest saved revision; stale edits remain visible for comparison, explicit rebasing or disposal.

Use **Preview examples** with one request that should select the workflow and one that should not. Previewing does not save the draft. Literal routing examples cannot predict agent adherence or resolve arbitrary natural-language contradictions.

While a preference is saving, its save, restore, toggle and draft-reset actions remain locked across refreshes and view changes. You can keep typing the next draft. A failed save retains that draft and makes retry available.

Optional setting keys provide a precise way to detect conflicts. For example, `package-manager=pnpm` in project scope overrides `package-manager=npm` in user scope for that workflow. Different values at the same scope are held back until resolved. Conditional settings retain their alternatives for applicability review, because natural-language conditions cannot be evaluated reliably by the matcher. Multiple unstructured instructions are flagged for review rather than declared contradictory automatically. Your current request always takes precedence.

## See what was delivered

**Preference activity** shows task IDs, workflow loads, exact preference versions, timestamps and observed tools. It distinguishes saved preferences from instructions actually returned to a host. **Loaded does not mean followed or independently verified.** Historical receipts also do not establish that today's connection works.

Expand a task to ignore selected preferences for that task only. The exclusion takes effect on the next workflow load, including checks added by that preference; it cannot remove instructions already seen by a model. Uncheck preferences to restore them. Reloading also refreshes checks after preference edits and discards evidence for changed checks. Other tasks and saved defaults remain unchanged.

Unsaved exclusion choices survive filtering, dashboard refreshes and switching views. If the task changes before saving, compare its saved exclusions and explicitly keep or discard your draft. Choices made while a save is pending remain unsaved for your next submission.

## Backup and transfer

**Backup and transfer** previews a project context export before downloading JSON. It includes active project preferences, memory and goals. It omits user-wide preferences, credentials, execution permissions and verification evidence. Read the contents before sharing: instructions and memory can still contain private context.

Bundles and uploaded files are limited to 512 KiB. The preview is indented for readability; the downloaded file contains the same data in compact JSON so formatting does not make a valid backup too large to import.

Import a file or paste JSON, inspect the proposed changes and collisions, then apply that exact preview. Changed destination records or expired previews require another review. Existing IDs are preserved. Imported preferences remain pending suggestions; inspect and explicitly approve them with `just-vibe learn status` and the learning CLI before they can affect workflows. This is an explicit project transfer, not cloud synchronization.

## Diagnose host delivery

```sh
npx just-vibe diagnose status --root .
```

This separates hook receipt, workflow selection, instruction loading and observed tools. To inspect one task, pass JSON with `taskId` and optionally `host` using `--stdin`; receipts must match that task.

For a fresh trial, explicitly authorize use of your existing model account:

```sh
printf '%s' '{"host":"claude","useAccount":true}' | npx just-vibe diagnose trial --root . --stdin
```

Use `codex` for Codex. The trial creates an isolated fixture, submits an ordinary fix request and an explicit correction, then starts a fresh session and follows up. Reports retain observations and failures. Startup failures and unavailable authentication do not count as passing behavior. The trial consumes model usage; opening the dashboard, ordinary setup and `diagnose status` do not.
