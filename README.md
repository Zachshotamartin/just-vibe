# just-vibe

Tools, skills, and commands for coding agents.

**v0.2 ships 212 workflow names plus setup** for Codex and Claude Code: focused skills for development, architecture, decisions, Git/GitHub, Vercel, Vite, React, UI, backend, APIs, databases, data, ML, LLMs, testing, security, and operations. Each has a procedure, scope, evidence requirements, verification, and stopping conditions.

The active coding agent executes the workflows with its available tools. The dependency-free Node.js utilities provide catalog search, project inspection, capability discovery, and bounded run-state validation. Installing just-vibe does not connect services, grant permissions, provision compute, or make every workflow's prerequisites available.

## Use the workflows

In Claude Code, use a command followed by as much context as needed:

```text
/just-vibe:auto fix checkout, add regression coverage, and verify.
Keep the existing API. No new dependencies. Do not push.

/just-vibe:tools react
/just-vibe:tools --available
/just-vibe:help my model works offline but fails in production
/just-vibe:teach linked lists, with a worked insertion example
/just-vibe:teach the concepts I need to implement ml-split
/just-vibe:teach-test linked lists; five questions, one at a time
/just-vibe:git-split separate formatting from the checkout fix; show the grouping first
/just-vibe:vercel-build-fix compare this preview's logs with the local build
/just-vibe:ml-leakage prediction happens 30 days before cancellation; inspect only
```

In Codex, select the corresponding skill from the **just-vibe** plugin in the skill picker and append the same brief. `do` aliases `auto`. `tools` browses availability; `help` explains which workflow fits a scenario. Inspect, plan, and apply modes preserve the user's constraints and existing authorization. Read the [full command reference](plugins/just-vibe/references/command-reference.md).

`teach` explains a standalone topic or the prerequisites behind a particular workflow. It adapts to your experience, uses worked examples, connects concepts to actual implementation where available, and offers optional practice. Teaching a tool does not execute it.

`teach-test` uses the host's **native multiple-choice question dialog**, waits for your answer, explains mistakes, and adapts the next question. Request test mode to defer feedback until the end. It requires a question tool available and permitted in the current host/mode; when unavailable, it reports that limitation instead of printing inline quiz questions. [Interactive teaching behavior](plugins/just-vibe/references/teach-test.md) documents the adapters and quiz state.

Release testing verified a real native quiz in Claude Code. The tested Codex CLI session restricted question tools to clarification/planning uses, so it correctly stopped without a quiz. Codex quiz adapters are included, but interactive assessment is not available in that tested mode. See the [v0.2 validation record](evals/releases/0.2.0.md) for the tested workflows and remaining environment limitations.

Shared host packaging and context behavior follow the [OpenAI skill format](https://developers.openai.com/plugins/build/skills) and [Claude Code skill argument handling](https://code.claude.com/docs/en/skills#pass-arguments-to-skills). No dynamic shell interpolation is used in skill files.

## Terminal utilities

From this checkout:

```sh
node bin/just-vibe.mjs tools
node bin/just-vibe.mjs tools --pack ml-evaluation --json
node bin/just-vibe.mjs tools --available --root /path/to/project
node bin/just-vibe.mjs show auto
node bin/just-vibe.mjs inspect --root /path/to/project
node bin/just-vibe.mjs discover --root /path/to/project
node bin/just-vibe.mjs route --root /path/to/project -- "Investigate failing GitHub checks"
node bin/just-vibe.mjs workflow fix --root /path/to/project --mode plan -- "Fix checkout; preserve the API"
```

`route` suggests candidates for the host agent; it does not execute them or call a model. `workflow` creates a JSON context record on stdout. Use `--stdin` or `--brief-file` to preserve multiline context verbatim. The CLI inventories the shipped payload; native host enablement still applies. It never treats a CLI on PATH as proof of authenticated access.

External capabilities stay unknown until the host observes relevant access or supplied evidence. Explicit capability reports expire after 15 minutes and are bound to a project. The [runtime interface](plugins/just-vibe/references/runtime.md) documents their format and `session create/start/record/finish/resume`. These utilities validate bookkeeping; they do not sandbox host tools or independently prove the agent's evidence.

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

The included skills and plugin manifests can be installed directly. Node.js 22+ is still required for the bundled installer, discovery, run-state, and quiz utilities.

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

### Tests and generation

```sh
npm run check
npm run test:hosts
npm run test:hosts -- --github
npm run eval:runtime
npm run build:skills
```

The default checks validate catalogs, generated skills, references, manifests and packaging; test installer/discovery/run behavior; and exercise context preservation across all command names and both host mappings. They do not access your host configuration or make model calls. `test:hosts` is an opt-in native lifecycle test requiring both host CLIs. It runs install, repeat install, doctor, update, uninstall, and reinstall inside temporary `CODEX_HOME` and `CLAUDE_CONFIG_DIR` directories.

The default host test installs this checkout. `--github` installs the published private repository and requires Git access; use it after pushing a release. Both variants execute the cached plugin runtime and check every skill is present, independently of the source checkout.

Edit `plugins/just-vibe/catalog/commands.json` for command contracts and runtime procedures, `catalog/packs.json` for pack requirements, and `references/packs/` for operational guidance. Run `npm run build:skills` to regenerate skills, the command reference, and evaluation scenarios. `npm run validate` rejects drift. Neither generation nor the installed runtime depends on the ignored local plan.

Every workflow has a realistic scenario and behavior rubric in [evals/scenarios.json](evals/scenarios.json). These are not claims that all 212 workflows have been run against live services or evaluated across models. See [evaluation guidance and isolated fixtures](evals/README.md) for behavioral assessment. External integration, model quality, browser and deployment checks require the relevant task environment.

### Repository layout

| Path | Purpose |
|---|---|
| `bin/just-vibe.mjs` | npm-executable entry point |
| `plugins/just-vibe/scripts/installer.mjs` | Self-contained installer, also shipped inside the plugin |
| `plugins/just-vibe/scripts/toolkit.mjs` | Search, inspection, discovery, routing candidates, run records, and quiz CLI |
| `plugins/just-vibe/scripts/lib/` | Catalog, capability, project, run-state, and native quiz adapter modules |
| `plugins/just-vibe/catalog/` | Canonical command contracts, examples, prerequisites and pack metadata |
| `plugins/just-vibe/skills/` | 213 installed skill entry points, including the `do` alias and setup |
| `plugins/just-vibe/references/` | Shared execution rules, runtime interface, domain guidance and command index |
| `.agents/plugins/marketplace.json` | Codex marketplace |
| `.claude-plugin/marketplace.json` | Claude Code marketplace |
| `scripts/` and `tests/` | Validation and lifecycle tests |
| `evals/` | Behavior scenarios and isolated project/data fixtures |

The installer has no runtime npm dependencies, no lifecycle install scripts, and adds no hooks, MCP servers, rules, or permissions. It uses argument arrays rather than shell interpolation. Host CLIs own installation state and caches. Local planning and naming documents are excluded from both Git and the npm archive.

## Troubleshooting

- **Host executable not found:** install the selected CLI and reopen your terminal.
- **Plugin subcommands unavailable:** update that host CLI; just-vibe checks command support before changing state.
- **Repository not found / authentication failed:** verify `git ls-remote https://github.com/Zachshotamartin/just-vibe.git` succeeds with your account.
- **Different marketplace source:** use the matching `--local` setting or explicitly switch sources as described above.
- **Claude scope conflict:** inspect `claude plugin list --json`; manage the scope already in use rather than layering installations.
- **Skills not visible:** verify with `doctor`, then start a new conversation.

Host formats evolve. When a JSON inventory format is unrecognized, the installer stops rather than guessing how to change configuration.
