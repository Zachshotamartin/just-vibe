# just-vibe

Tools, skills, and commands for coding agents.

**v0.4 ships 213 skill names backed by 210 canonical workflows** for Codex and Claude Code: focused skills for development, architecture, decisions, Git/GitHub, Vercel, Vite, React, UI, backend, APIs, databases, data, ML, LLMs, testing, security, and operations. Each canonical workflow has selection guidance, scope, concrete decision branches, evidence requirements, outputs, verification, recovery conditions and three example requests. Applied methods live in 22 pack guides.

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

In Codex, select the corresponding skill from the **just-vibe** plugin in the skill picker and append the same brief. `do` aliases `auto`, `responsive` aliases `ui-responsive`, and `a11y` aliases `ui-accessibility`; each inherits one canonical implementation. `tools` browses availability; `help` explains which workflow fits a scenario. Inspect, plan, and apply modes preserve the user's constraints and existing authorization. Read the [full command reference](plugins/just-vibe/references/command-reference.md).

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

You need **Node.js 22+** and **Codex CLI** or **Claude Code** with native plugin support on your `PATH`. See [compatibility and known limits](docs/compatibility.md).

**Publication status:** npm release preparation is complete in this source tree, but the first npm publication still requires the maintainer's npm login. The short registry commands below work after that publication.

```sh
# Choose your package manager; all use the same npm package.
pnpm dlx just-vibe@latest setup
npx just-vibe@latest setup
yarn dlx just-vibe@latest setup

# Claude Code
pnpm dlx just-vibe@latest setup --target claude
```

The installer copies the included plugin into a persistent directory under `~/.just-vibe`, then registers it through the host's native plugin manager. The installed files survive npm/pnpm/Yarn cache cleanup. No private GitHub access is required for the default bundled source. `JUST_VIBE_HOME` can select another persistent directory.

**Start a new conversation after installation.** In Claude Code, run `/just-vibe:help what is available?`. In Codex, select the `help` skill from the just-vibe plugin and add your request.

Before npm publication, users with repository access can fetch the package from GitHub and still use the bundled installer:

```sh
pnpm --package=git+https://github.com/Zachshotamartin/just-vibe.git dlx just-vibe setup
```

GitHub access is needed to download that package, but the installed marketplace is a persistent local copy.

## Preview, diagnose, update, remove

```sh
pnpm dlx just-vibe@latest setup --dry-run
pnpm dlx just-vibe@latest doctor
pnpm dlx just-vibe@latest update
pnpm dlx just-vibe@latest uninstall
```

Append `--target claude` for Claude Code. `--dry-run` performs no host commands or payload copying and does not inspect installed state; the package manager may still fetch/cache the CLI before it starts.

Repeated `setup` preserves the existing managed version and registration. `update` replaces the managed source with the version in the package you execute and updates the host plugin. Use `@latest` to fetch new releases. `doctor` checks prerequisites, source identity, managed files and enabled installation without changing configuration.

Uninstall removes only this plugin and retains its marketplace, managed source and persistent plugin data. To remove registration too, use the host's native marketplace-removal command after uninstalling. A failed native operation reports partial completion; fix its cause and rerun. Unmanaged destinations, different marketplace sources, and conflicting Claude scopes are never silently overwritten.

## Claude scope

Claude defaults to `user`. From a project's directory, use `--scope project` for shared plugin enablement or `--scope local` for unshared project enablement:

```sh
pnpm dlx just-vibe@latest setup --target claude --scope project
```

Pass the same scope to subsequent commands. Each teammate installs their own local marketplace. Codex does not take Claude's `--scope` option.

## Existing GitHub installs and source migration

v0.2 registered GitHub as the marketplace source. Manage that source explicitly with `--github`:

```sh
node bin/just-vibe.mjs doctor --github
node bin/just-vibe.mjs update --github
```

To switch to bundled installation, uninstall using the old source flag, remove only the just-vibe marketplace through the host CLI, then run setup without a source flag:

```sh
# Codex; use the selected package runner instead of node when outside this checkout.
node bin/just-vibe.mjs uninstall --github
codex plugin marketplace remove just-vibe
node bin/just-vibe.mjs setup

# Claude (preserve any --scope option used for the old installation).
node bin/just-vibe.mjs uninstall --github --target claude
claude plugin marketplace remove just-vibe
node bin/just-vibe.mjs setup --target claude
```

Use the equivalent `--local` flag when switching from a development checkout. GitHub sources still require Git access; authenticate using your normal Git credentials, never tokens embedded in commands.

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

`--local` registers the persistent checkout directly. Keep the checkout in place. Use `--local` consistently for its `doctor`, `update`, and `uninstall` operations. For changes to the plugin payload, bump the version in both plugin manifests and `package.json`, then run `update --local` and start a fresh conversation.

Switching between bundled, local and GitHub sources is deliberate: uninstall from the old source, remove its marketplace with the host CLI, then run setup for the new source. The installer will not silently replace one with the other.

### Tests and generation

```sh
npm run check
npm run test:hosts
npm run test:hosts -- --github
npm run eval:runtime
npm run build:skills
```

The default checks validate catalogs, generated skills, references, manifests and packaging; test installer/discovery/run behavior; and exercise context preservation across all command names and both host mappings. They do not access your host configuration or make model calls. `test:hosts` is an opt-in native lifecycle test requiring both host CLIs. It runs install, repeat install, doctor, update, uninstall, and reinstall inside temporary `CODEX_HOME` and `CLAUDE_CONFIG_DIR` directories.

The default host test copies and installs the bundled payload. `--local` tests direct checkout registration. `--github` installs the published private repository and requires Git access; use it after pushing a release. Both variants execute the cached plugin runtime and check every skill is present, independently of the source checkout.

Edit `plugins/just-vibe/catalog/commands.json` for command contracts and runtime procedures, `catalog/packs.json` for pack requirements, and `references/packs/` for operational guidance. Run `npm run build:skills` to regenerate skills, the command reference, and evaluation scenarios. `npm run validate` rejects drift. Neither generation nor the installed runtime depends on the ignored local plan.

Every workflow has normal, edge and missing-evidence cases in [evals/scenarios.json](evals/scenarios.json). The [independent behavioral harness](evals/README.md) additionally prepares and grades 21 raw-artifact tasks, including code repairs and report judgments. Catalog structure, runtime utility coverage and observed agent behavior have separate validation fields. These are not claims that all commands have been run against live services or evaluated across models. See the [v0.4 observed results](evals/releases/0.4.0.md) and [evaluation guidance](evals/README.md) for the tested scope. External integration, model quality, browser and deployment checks require the relevant task environment.

### Repository layout

| Path | Purpose |
|---|---|
| `bin/just-vibe.mjs` | npm-executable entry point |
| `plugins/just-vibe/scripts/installer.mjs` | Self-contained installer, also shipped inside the plugin |
| `plugins/just-vibe/scripts/toolkit.mjs` | Search, inspection, discovery, routing candidates, run records, and quiz CLI |
| `plugins/just-vibe/scripts/lib/` | Catalog, capability, project, run-state, and native quiz adapter modules |
| `plugins/just-vibe/catalog/` | Canonical command contracts, examples, prerequisites and pack metadata |
| `plugins/just-vibe/skills/` | 213 installed names, including three canonical aliases and setup |
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
- **Different marketplace source:** use the matching bundled, `--local`, or `--github` setting or explicitly switch sources as described above.
- **Claude scope conflict:** inspect `claude plugin list --json`; manage the scope already in use rather than layering installations.
- **Skills not visible:** verify with `doctor`, then start a new conversation.

Host formats evolve. When a JSON inventory format is unrecognized, the installer stops rather than guessing how to change configuration.

## Release and license

Licensed under [MIT](LICENSE), copyright 2026 Zachary Martin. Commercial use, modification and redistribution are allowed under the license terms. The license ships with the npm archive and installed plugin.

[Release instructions](docs/releases.md) describe validation, the first npm publication, trusted publishing, versioning and recovery. [Changelog](CHANGELOG.md) records user-visible changes.

Command authoring and alias maintenance follow the [command quality contract](docs/command-quality.md).
