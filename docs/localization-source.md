# Getting started with just-vibe

just-vibe provides workflows and runtime tools for coding agents. Install Node.js 22 or newer. From your project, choose your host:

```sh
npx just-vibe@latest setup --target codex
npx just-vibe@latest setup --target claude
```

For an optional project skill adapter:

```sh
npx just-vibe@latest setup --target cursor --root . --profile core
```

Describe the result you want and include constraints. Appended context is preserved. Installation does not authenticate external services, grant permissions or start workers. Review the host's available tools when a task needs a service.

Use `npx just-vibe@latest doctor --target codex` to inspect installation and `npx just-vibe@latest update --target codex` to update. A source-checkout feature marked Unreleased is unavailable in the registry until a separate publication.

For complete English instructions, read [installation](../README.md) and [runtime operations](../plugins/just-vibe/references/runtime-expansion.md). Translations cover only this getting-started page; they are not complete translations of the catalog.
