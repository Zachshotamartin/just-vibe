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

For a previewed, integrity-checked update, run `just-vibe updater check`, then `updater preview` and `updater apply` with the returned revision and hash. Apply rechecks the release metadata and verifies the downloaded archive before installing it.

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

## Remove everything

Uninstall alone keeps the marketplace registration, the managed source and your personal data. To remove all of it:

1. Run `uninstall` with the same target and scope you installed with, for example `pnpm dlx just-vibe@latest uninstall --target claude --scope project`.
2. Remove the just-vibe marketplace through the host's native plugin manager.
3. For each editor adapter, run `uninstall --target <adapter> --root <project>`; where you installed Git hooks, run `just-vibe git-hooks status` in that project, then pipe `{"revision":REVISION,"hash":"HASH"}` with the values it reports to `just-vibe git-hooks uninstall --stdin`.
4. Delete your personal just-vibe folder (`$JUST_VIBE_HOME`, default `~/.just-vibe`). It holds the managed sources, task history (kept 30 days by default) and saved lessons. Then delete each project's `.just-vibe/` folder.
5. Hook trust granted in a host is part of that host's settings; revoke it there.

## Older GitHub-source installations

Existing installations made with `--github` should be managed with that same source flag. To move to the bundled npm source, uninstall the old source, remove only its just-vibe marketplace through the host, then run setup without `--github`. Do not keep both installation routes enabled.
