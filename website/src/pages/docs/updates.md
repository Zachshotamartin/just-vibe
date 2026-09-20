---
layout: ../../layouts/Doc.astro
title: Update and troubleshoot
description: Keep the installed payload current and make installation problems visible.
---

## Diagnose first

```sh
pnpm dlx just-vibe@latest doctor
```

Doctor checks prerequisites, source identity, managed files, and the enabled installation without changing configuration. For Claude Code, append `--target claude` and your original scope when applicable.

## Update the installed plugin

```sh
pnpm dlx just-vibe@latest update
npx just-vibe@latest update
yarn dlx just-vibe@latest update
```

Choose one. All use the same npm package. The update operation replaces the managed source with the payload in the package you execute and updates the host registration. Start a new conversation afterward.

Repeated **setup preserves an existing managed version**. To refresh an existing installation, use update. If you installed a project dependency, upgrade that dependency with its package manager before running its local update command.

## If a command is missing

1. Confirm the host supports native plugins and is on your PATH.
2. Run doctor for the same host and scope used during setup.
3. Update the managed payload, then open a new conversation.
4. In Codex, use the just-vibe skill picker. In Claude, use the namespaced slash command.

An installed CLI is not proof of authenticated GitHub, Vercel, or database access. Check those tools separately when a workflow needs them.

## Remove the plugin

```sh
pnpm dlx just-vibe@latest uninstall
```

Append `--target claude` for Claude Code. Uninstall removes this plugin but retains marketplace registration, managed source files, and persistent plugin data. Remove the specific marketplace separately through the host's native manager if you also want to remove that registration.

If a native operation fails midway, inspect the reported partial state, fix the cause, and rerun. The installer does not silently overwrite unmanaged destinations, conflicting sources, or Claude scope conflicts.

## Older GitHub-source installations

Existing installations made with `--github` should be managed with that same source flag. To move to the bundled npm source, uninstall the old source, remove only its just-vibe marketplace through the host, then run setup without `--github`. Do not keep both installation routes enabled.
