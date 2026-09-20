---
name: setup
description: Install, diagnose, update, or uninstall just-vibe for Codex or Claude Code when the user requests setup or maintenance of this toolkit.
---

# just-vibe setup

Use the bundled installer at `../../scripts/installer.mjs`, resolved relative to this skill directory. It is self-contained inside the plugin; do not assume the source repository is available.

Honor the user's requested host, operation, and Claude scope. Infer the host from the active application when unambiguous. Default to `doctor` for a status question, `setup` for an install request, `update` for an update request, and `uninstall` only for an explicit removal request.

Run `node <resolved-installer-path> <operation> --target codex` or `--target claude`. Additional context can specify Claude's `--scope user|project|local`. Use the requested project working directory for project/local scope. For a requested preview, append `--dry-run` and stop after reporting the proposed steps.

The installer delegates changes to the host's plugin manager and stops on an unexpected marketplace source or conflicting Claude scope. Do not bypass these checks by editing global configuration, deleting caches, or reinstalling another marketplace. Explain the specific conflict and resolve only the scope the user authorized.

Node.js 22+, Git, and the chosen host CLI with plugin support are prerequisites. Report missing prerequisites without claiming an installation succeeded. If the repository is private, the user's Git client needs access; never place tokens in commands or saved files.

After success, explain the result and ask the user to start a new conversation to load changed skills. Uninstall retains marketplace registration and persistent plugin data. This version includes setup and help only.
