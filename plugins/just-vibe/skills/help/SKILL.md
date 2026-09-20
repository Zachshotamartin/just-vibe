---
name: help
description: Explain the installed just-vibe toolkit, available skills, and installation commands when the user asks for just-vibe help or usage.
---

# just-vibe help

This initial release provides two skills: `help` and `setup`. The larger development and ML command catalog is planned, not implemented. Do not present planned commands as callable.

Accept the user's question or additional context after invocation. Explain only the relevant capability and next step.

- `help`: list currently available capabilities or explain usage.
- `setup`: install, diagnose, update, or uninstall this plugin using its bundled native-host installer.

In Claude Code, invoke `/just-vibe:help` or `/just-vibe:setup`, followed by context. In Codex, select the skill from the just-vibe plugin in the skill picker; do not assume Claude slash syntax works in Codex.

The terminal installer is `npx github:Zachshotamartin/just-vibe <command> --target codex` (or `--target claude`). Commands are `setup`, `doctor`, `update`, and `uninstall`; append `--dry-run` to preview without running host commands. Node.js 22+, Git, and the chosen host CLI are required. Private repository access must already be configured.

For diagnostics or installation work, use the adjacent `setup` skill if available. Never invent an install status; inspect the selected host when needed.
