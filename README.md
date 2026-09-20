# just-vibe

Tools, skills, and commands for coding agents.

**v0.1 ships the installation foundation:** a dependency-free installer, native Codex and Claude Code plugin packages, and `help` and `setup` skills. The larger development and ML command catalog is not implemented yet.

## Quick install

You need **Node.js 22+**, **Git**, and either **Codex CLI** or **Claude Code** with native plugin support on your `PATH`. macOS and Linux are the initial supported environments. The repository is private, so your Git client must have access. A one-time npm execution prompt may appear.

### Codex

```sh
npx github:Zachshotamartin/just-vibe setup
```

### Claude Code

```sh
npx github:Zachshotamartin/just-vibe setup --target claude
```

The installer checks prerequisites and the existing marketplace before invoking the host's native plugin manager. Repeat `setup` to finish an interrupted install or confirm an existing one; use `update` to fetch new versions. It stops if the marketplace name belongs to a different source or Claude has an installation in a different scope.

**Start a new conversation after installation.** In Claude Code:

```text
/just-vibe:help what is available?
/just-vibe:setup check whether my installation is healthy
```

In Codex, select the `help` or `setup` skill from the **just-vibe** plugin in the skill picker and add your request. Claude's slash-command syntax is not assumed to work in Codex.

### Private GitHub access

If you already use GitHub CLI, authenticate and configure Git to use it:

```sh
gh auth login
gh auth setup-git
```

If npm's GitHub shorthand attempts SSH and you only have HTTPS credentials, use the explicit HTTPS package source:

```sh
npx --package=git+https://github.com/Zachshotamartin/just-vibe.git just-vibe setup
```

The installer registers the GitHub repository through the host CLI, which controls SSH/HTTPS authentication and fallback. Do not put access tokens in the command. Nothing is published to the npm registry; the command fetches this Git repository. `package.json` is marked private to prevent accidental npm publication.

## Preview, diagnose, update, remove

```sh
npx github:Zachshotamartin/just-vibe setup --dry-run
npx github:Zachshotamartin/just-vibe doctor
npx github:Zachshotamartin/just-vibe update
npx github:Zachshotamartin/just-vibe uninstall
```

Append `--target claude` for Claude Code. `--dry-run` executes no host commands and does not inspect installed state; it shows conditional steps. npm may still fetch/cache this package before starting the dry run.

`doctor` exits nonzero for missing prerequisites, an unexpected marketplace source, an absent installation, or a disabled plugin. It does not modify configuration.

`update` refreshes only the just-vibe marketplace and plugin. `uninstall` removes only the plugin and retains marketplace registration and persistent plugin data. To remove marketplace registration too, use the host's native marketplace-removal command after uninstalling.

If a native operation fails halfway through, the installer stops and explains that earlier steps may have completed. Fix the reported cause and rerun; it does not reset global configuration or automatically delete caches.

## Claude scope

Claude defaults to `user`. For a team-shared project installation, run from that project's directory:

```sh
npx github:Zachshotamartin/just-vibe setup --target claude --scope project
```

Use `--scope local` for a project-only installation that is not shared. Pass the same scope to subsequent `doctor`, `update`, and `uninstall` commands. The marketplace is registered at user scope; the plugin enablement uses the selected scope. Codex does not take the Claude `--scope` option.

## Native install without Node.js

The included skills and plugin manifests can be installed directly. Node.js is still required to run the bundled setup/diagnostic utility.

```sh
# Codex
codex plugin marketplace add Zachshotamartin/just-vibe
codex plugin add just-vibe@just-vibe

# Claude Code
claude plugin marketplace add Zachshotamartin/just-vibe
claude plugin install just-vibe@just-vibe --scope user
```

Use one installation channel per host. The wrapper and native commands above manage the same plugin; do not additionally copy skills or merge global rules by hand.

## Local development

```sh
git clone https://github.com/Zachshotamartin/just-vibe.git
cd just-vibe
npm ci
npm run check
node bin/just-vibe.mjs setup --local --dry-run
node bin/just-vibe.mjs setup --local
```

`--local` registers the persistent checkout, not a temporary download. Keep the checkout in place. Use `--local` consistently for its `doctor`, `update`, and `uninstall` operations. For changes to the plugin payload, bump the version in both plugin manifests and `package.json`, then run `update --local` and start a fresh conversation.

Switching between local and GitHub sources is deliberate: uninstall from the old source, remove its marketplace with the host CLI, then run setup for the new source. The installer will not silently replace one with the other.

### Tests

```sh
npm run check
npm run test:hosts
```

The default checks validate manifests and packaging and test installer behavior without accessing your host configuration. `test:hosts` is an opt-in native lifecycle test requiring both host CLIs. It runs install, repeat install, doctor, update, uninstall, and reinstall inside temporary `CODEX_HOME` and `CLAUDE_CONFIG_DIR` directories. No model calls or paid inference are needed.

### Repository layout

| Path | Purpose |
|---|---|
| `bin/just-vibe.mjs` | npm-executable entry point |
| `plugins/just-vibe/scripts/installer.mjs` | Self-contained installer, also shipped inside the plugin |
| `plugins/just-vibe/skills/` | Currently implemented setup and help skills |
| `.agents/plugins/marketplace.json` | Codex marketplace |
| `.claude-plugin/marketplace.json` | Claude Code marketplace |
| `scripts/` and `tests/` | Validation and lifecycle tests |

The installer has no runtime npm dependencies, no lifecycle install scripts, and adds no hooks, MCP servers, rules, or permissions. It uses argument arrays rather than shell interpolation. Host CLIs own installation state and caches. Local planning and naming documents are excluded from both Git and the npm archive.

## Troubleshooting

- **Host executable not found:** install the selected CLI and reopen your terminal.
- **Plugin subcommands unavailable:** update that host CLI; just-vibe checks command support before changing state.
- **Repository not found / authentication failed:** verify `git ls-remote https://github.com/Zachshotamartin/just-vibe.git` succeeds with your account.
- **Different marketplace source:** use the matching `--local` setting or explicitly switch sources as described above.
- **Claude scope conflict:** inspect `claude plugin list --json`; manage the scope already in use rather than layering installations.
- **Skills not visible:** verify with `doctor`, then start a new conversation.

Host formats evolve. When a JSON inventory format is unrecognized, the installer stops rather than guessing how to change configuration.
