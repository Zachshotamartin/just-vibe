# just-vibe

**Next-release command shortcuts:** Claude setup adds `/jv <command>`, `/just-vibe <command>` and `/jv:<command>` alongside `/just-vibe:<command>`. Append the same request after any form. For example, `/jv reprompt Make this prompt clearer: Fix stale search results.` See the [shortcut guide](https://just-vibe-tools.vercel.app/docs/command-shortcuts/) for setup, context examples and Codex's skill-picker equivalent. These additions are not in npm 0.10.0.

Tools, skills, and commands for coding agents.

[Website](https://just-vibe-tools.vercel.app/) · [Documentation](https://just-vibe-tools.vercel.app/docs/) · [Command library](https://just-vibe-tools.vercel.app/commands/) · [Engineering profiles](https://just-vibe-tools.vercel.app/profiles/)

**v0.10.0 contains 112 engineering profiles and 219 skill names backed by 216 canonical workflows** for Codex and Claude Code: focused skills for development, architecture, decisions, Git/GitHub, Vercel, Vite, React, UI, backend, APIs, databases, data, ML, LLMs, testing, security, and operations. Each canonical workflow has selection guidance, scope, concrete decision branches, evidence requirements, outputs, verification, recovery conditions and at least three example requests. Each entry point also contains an authored technical method: evidence to inspect, a procedure, a likely misdiagnosis and a discriminating check. Applied methods live in 22 pack guides. The v0.8.1 prompt update adds explicit infer/default/ask policies, a conditional worked example for each pack, and guidance for preserving corrections across turns; see [prompt improvements](docs/prompt-improvements.md).

The [technical audit](docs/technical-audit.md) and [complete coverage inventory](docs/technical-coverage.md) document the latest expansion across every canonical workflow. Review/security commands now route to concrete vulnerability, framework, language and scanner guides. [Security fixture controls](evals/security/README.md) distinguish seeded defects from legitimate behavior; they do not claim model-review accuracy.

The active coding agent executes the workflows with its available tools. The dependency-free Node.js utilities provide catalog search, project inspection, capability discovery, and bounded run-state validation. Installing just-vibe does not connect services, grant permissions, provision compute, or make every workflow's prerequisites available.

v0.7 adds a quick path for simple work, a small starter catalog, contextual routing with reasons, project preferences and checkpoints, explicit evidence collectors, and optional project hooks. Detailed auth, component, training and delivery scenarios load only when relevant. See [daily workflows](plugins/just-vibe/references/daily-workflows.md) for configuration and examples, and the [v0.7 validation record](evals/releases/0.7.0.md) for tested scope and limits.


## Next release: runtime tools and goals

The frozen ECC backlog now has a separate [implementation and evidence ledger](docs/ecc-implementation-plan.md). This expansion adds 43 focused methods, 22 connector recipes, native session imports, configuration cleanup, behavior rules, MCP health, bounded jobs and services, independent councils, evaluation receipts, CodeTour exports, a context graph, usage accounting and an offline operator/catalog interface. [Use these features](plugins/just-vibe/references/runtime-expansion.md). These capabilities are included starting in **v0.10.0**. Acceptance is tracked separately: local regression and installation checks do not establish every framework, live-provider or operating-system requirement. See the [release fixes and remaining validation](docs/release-fixes-2026-09-20.md).

The source checkout adds **/goal**, scoped searchable memory, 48 native MCP tools, 24 independent specialists, optional worktree workers, before-action policy, a configuration scanner, reviewed pattern learning, preference sharing/evolution, an activity report, selective installations and 16 language/framework rule packs. Cursor, OpenCode, Copilot, Gemini, Kimi, Qwen, Windsurf and Antigravity IDE have project file adapters. The source catalog now contains **220 skill names and 217 canonical workflows**, including the unreleased `reprompt` workflow. Guided setup, portable context, reviewed dependent workers and a browser plan canvas are included. These additions have not yet been published to npm.

Read [the feature guide](docs/runtime-tools.md), [operation schemas and examples](plugins/just-vibe/references/runtime-platform.md), and [the implementation/validation plan](docs/runtime-expansion-plan.md). Existing installs retain their defaults; observation, blocking policy and worker launching are opt-in.

The next release also includes context and repeated-call warnings, detected check presets, batched formatting, staged commit checks, Cursor/OpenCode event adapters, Zed/Hermes skill installation, GitHub epic coordination, and JSON/Markdown/SARIF security reports with an optional reviewed AgentShield runner. Focused Django, FastAPI, Spring Boot, Flutter and React Native guides extend existing workflows. See [configuration, examples and limits](plugins/just-vibe/references/runtime-depth.md) and [verification](docs/remaining-ecc-gaps-plan.md).

The [complete ECC comparison](docs/ecc-complete-audit.md) inventories a pinned upstream snapshot and records remaining functionality, technical-depth gaps, optional products and implementation requirements. Earlier completed rounds covered their selected findings; they did not establish full ECC parity. The ledger distinguishes source presence from live verification and includes a maintainer check for upstream drift.

## Improve a prompt

In the source checkout, select **just-vibe → reprompt** in Codex, or use `/just-vibe:reprompt` in Claude Code, and append the prompt:

```text
/just-vibe:reprompt Fix our React search page when older requests finish last.
Keep the current API and dependencies. Do not deploy.
Use relevant installed skills in the rewritten prompt.
```

It returns a paste-ready prompt, preserves your constraints, and names only skills it can verify (with availability checks for another host). It does not execute the embedded task. Add “output only,” “no skills,” or identify an earlier prompt or file to refine. See [examples and boundaries](plugins/just-vibe/references/reprompt.md). This command is not in the published 0.10.0 package yet.

## Automatic assistance

Describe the outcome normally: “Fix the mobile menu,” “Why is training unstable?” or “Address this PR’s feedback.” Trusted native hooks now route each request to a focused shortlist, restore selected work after compaction, and direct the agent to discover and use its actual tools. Command names remain optional.

The agent loads the relevant full workflow with versioned personal/project feedback. Explicit corrections and endorsements can change instructions, routing triggers, preferred tools and required checks. History, rollback, retirement and forgetting are supported. Silence and passing tests do not create preferences. Source and artifact changes invalidate old evidence; completion can request one bounded follow-up for missing evidence, then reports unresolved work honestly.

Automatic assistance is included starting in **v0.9.0**. Native hook support and host trust are required; setup does not grant that trust. Personal state lives under `~/.just-vibe/adaptive`, outside repositories, with bounded task retention. No additional model service or runtime dependency is used. See [automatic assistance, schemas and limits](plugins/just-vibe/references/adaptive.md) and [validation](docs/adaptive-assistance.md).

## Intent, evidence and reversible work

v0.8.0 adds working runtime helpers behind natural-language skill requests:

- Remember an explicit correction, inspect instruction provenance/loading, and test a rule with compliant/violating controls.
- Build two or three alternatives in owned worktrees, run equal checks, preview them, and apply the selected result with an undo record.
- Tie requirements to actual checks, screenshots and attributed human review in a local HTML report with freshness checks.
- Learn from isolated exercises in the actual project, with validated controls, progressive hints and real submissions.
- Import MLflow, W&B or JSON exports; compare binary/regression metrics, slices, identity, feature parity and temporal coverage.
- Reverse a recorded local task while preserving nonoverlapping later edits; retain decision history with observable reconsideration triggers.

See the [workflow guide](plugins/just-vibe/references/intent-workflows.md) for examples, boundaries and recovery. Users provide ordinary briefs; the agent prepares the helper inputs. These features support judgment rather than claiming an objective quality score.

**Publication status:** [just-vibe 0.10.0 is published on npm](https://www.npmjs.com/package/just-vibe/v/0.10.0) as `latest`. Registry integrity and fresh-cache execution match the tested archive. See the [publication record](evals/releases/0.10.0-publication.json) and [release validation](evals/releases/0.10.0.md). GitHub Actions was waived for this release because account billing prevented jobs from starting; no CI pass is claimed.


## Use the workflows

With trusted hooks, use an ordinary request. For explicit shortcuts, Claude Code supports a command followed by as much context as needed:

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

## Remember project instructions

Save decisions and corrections from the current conversation in one invocation:

```text
/just-vibe:remember context
/just-vibe:remember context both
/just-vibe:remember context both, including a checkpoint named checkout for unfinished work
```

In Codex, select **remember** from just-vibe and append the same brief. The skill updates the established `CLAUDE.md` or `AGENTS.md`, merges existing guidance and saves only explicit instructions and accepted decisions. `both` keeps common rules in `AGENTS.md` with a relative import in `CLAUDE.md`. A checkpoint keeps temporary progress separate. You can also append one specific rule or ask for a preview without writing.

The host interprets the conversation; the `memory` helper can persist individual rules with provenance and file-hash checks, while the agent merges established context sections and shared imports. Terminal `project remember` only stores JSON notes. See [rule checks and memory inspection](plugins/just-vibe/references/memory-checks.md) for the new helper. Saved instructions improve continuity but do not guarantee adherence or recover unavailable chat history. See [merging, host loading and examples](plugins/just-vibe/references/instruction-memory.md). Update older installations to receive this extension.

## Engineering profiles

Profiles shape the agent's priorities and verification throughout a task. They are separate from commands: a machine learning engineer emphasizes prediction-time data, evaluation and serving parity; a frontend engineer emphasizes state, interactions and rendered behavior. Each of the **112 profiles** has concrete priorities, a decision rule, checks, a scope boundary, a concrete task contribution and candidate workflows.

```text
/just-vibe:profiles architecture
/just-vibe:profile machine-learning-engineer with mlops-engineer as secondary
/just-vibe:profile frontend-engineer for this task
/just-vibe:profile principal-engineer; review the design without expanding the project
/just-vibe:profile auto — choose an appropriate role for this task
/just-vibe:profile status
/just-vibe:profile clear
```

In Codex, select the **profile** or **profiles** skill in the plugin picker and append the same request. Explicit choices are pinned for the current task. The agent may choose an unpinned role from task evidence, but cannot replace a user pin. Choose one primary role and up to two complementary roles. Profiles preserve the original brief, scope, mode, permissions and budgets; they do not create additional agents or persist global preferences.

The catalog covers application engineering, interface and experience, platform/infrastructure, data/databases, ML/AI, security/privacy, quality/technical leadership, and systems/specialized computing. Examples include firmware, robotics, compilers, graphics, game networking, geospatial computing, scientific software, privacy, identity, AI evaluation, agent systems, inference, and data governance.

Architecture and seniority profiles have different emphasis:

| Profile | Focus |
|---|---|
| Senior software engineer | Complete a bounded implementation with maintainable choices |
| Staff engineer | Cross-team interfaces, migration and adoption |
| Principal engineer | Systemic constraints, technical direction and reversible strategy |
| Software architect | System responsibilities, boundaries and contracts |
| Solutions architect | Fit a specific use case to a workable system |
| Enterprise architect | Shared capabilities and transitions across systems |
| Domain architects | Frontend, data, cloud, security, ML, platform and integration architecture |

Titles vary across companies; these are working approaches, not credentials or grants of authority. Browse the [complete profile catalog](plugins/just-vibe/references/profile-reference.md) and [selection/runtime guide](plugins/just-vibe/references/profiles.md).

The [v0.5 profile validation record](evals/releases/0.5.0.md) distinguishes tested profile selection and packaging from profession-specific model judgment.

All changes are owned by the user. Commit messages, PRs, comments and other messages must contain **no agent self-attribution**, agent co-author trailers, generated-by signatures or AI badges. Existing human attribution and required third-party notices are preserved. See the [ownership rule](plugins/just-vibe/references/execution.md#ownership-and-attribution).

## Terminal utilities

From this checkout:

```sh
node bin/just-vibe.mjs tools
node bin/just-vibe.mjs tools --pack ml-evaluation --json
node bin/just-vibe.mjs tools --available --root /path/to/project
node bin/just-vibe.mjs show auto
node bin/just-vibe.mjs profiles architecture
node bin/just-vibe.mjs profile principal-engineer
node bin/just-vibe.mjs inspect --root /path/to/project
node bin/just-vibe.mjs discover --root /path/to/project
node bin/just-vibe.mjs route --root /path/to/project -- "Investigate failing GitHub checks"
node bin/just-vibe.mjs project show --root /path/to/project
node bin/just-vibe.mjs project resume checkout --root /path/to/project
node bin/just-vibe.mjs evidence github --repo owner/repo --pr 42
node bin/just-vibe.mjs hooks status --root /path/to/project
node bin/just-vibe.mjs workflow fix --root /path/to/project --mode plan -- "Fix checkout; preserve the API"
node bin/just-vibe.mjs workflow auto --profile machine-learning-engineer --stdin
```

`route` suggests candidates for the host agent; it does not execute them or call a model. `workflow` creates a JSON context record on stdout. Use `--stdin` or `--brief-file` to preserve multiline context verbatim. The CLI inventories the shipped payload; native host enablement still applies. It never treats a CLI on PATH as proof of authenticated access.

External capabilities stay unknown until the host observes relevant access or supplied evidence. Explicit capability reports expire after 15 minutes and are bound to a project. The [runtime interface](plugins/just-vibe/references/runtime.md) documents their format and `session create/start/amend/supersede/profile/record/finish/resume`. These utilities validate bookkeeping; they do not sandbox host tools or independently prove the agent's evidence.

Plain `tools` shows a starter selection; `tools --all` lists everything. `route` explains a few candidates; use `--json` for structured context. Project writes require explicit operations and revision-aware JSON input. Evidence collectors have their own prerequisites and do not automatically grant capability status. See [examples and schemas](plugins/just-vibe/references/daily-workflows.md).

## Quick install

You need **Node.js 22+** and **Codex CLI** or **Claude Code** with native plugin support on your `PATH`. See [compatibility and known limits](docs/compatibility.md).

Install the public `just-vibe` package from npm with your preferred package manager:

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

For development builds, users with repository access can fetch the package from GitHub and still use the bundled installer:

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

The included skills and plugin manifests can be installed directly. Node.js 22+ is still required for all bundled CLI helpers, including installation, discovery, sessions, quizzes and the intent workflows.

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

Edit `plugins/just-vibe/catalog/commands.json` for command contracts and the single canonical procedure, `catalog/packs.json` for pack requirements/input policies, and `references/packs/` plus `references/examples/` for operational guidance. Profile contributions live in `catalog/profiles.json`. Run `npm run build:skills` to regenerate skills, the command reference, technical coverage inventory, and evaluation scenarios. `npm run validate` rejects drift. Neither generation nor the installed runtime depends on the ignored local plan.

Every workflow has normal, edge and missing-evidence cases in [evals/scenarios.json](evals/scenarios.json). The [independent behavioral harness](evals/README.md) additionally prepares and grades 21 raw-artifact tasks, including code repairs and report judgments. Catalog structure, runtime utility coverage and observed agent behavior have separate validation fields. These are not claims that all commands have been run against live services or evaluated across models. See the [v0.4 observed results](evals/releases/0.4.0.md) and [evaluation guidance](evals/README.md) for the tested scope.

The [conversation harness](evals/conversation/README.md) records review, selected repairs and later corrections with separate scope and behavior checks. Its [development record](evals/releases/prompt-improvements.md) describes observed results and limitations.

The [v0.6 results](evals/releases/0.6.0.md) record 32 controlled implementation trials and eight revised-command development trials. All passed their bounded checks; this does not rank overall output quality or convenience. The tasks supplied detailed contracts and did not measure user effort or preference. The [command-depth review](docs/command-quality.md#focused-depth-review) explains 27 focused revisions, and the [contextual review guide](docs/command-quality.md#output-quality-and-convenience) covers judgment, clarity, discovery and correction burden. [Benchmark protocol and supporting metrics](evals/benchmark/README.md) remain available for reproduction. External integration, browser and deployment checks require the relevant task environment.

The [technical-guidance validation record](evals/releases/0.8.0-technical-guidance.md) covers the v0.8.0 command expansion and security controls. The earlier [v0.8 validation record](evals/releases/0.8.0.md) covers the new intent helpers, real browser reports, installation checks and the pending Windows confirmation. GitHub CI remains blocked by account billing. The [v0.10.0 release record](evals/releases/0.10.0.md) records the local checks and release-specific waiver; Windows validation remains pending.

### Repository layout

| Path | Purpose |
|---|---|
| `bin/just-vibe.mjs` | npm-executable entry point |
| `plugins/just-vibe/scripts/installer.mjs` | Self-contained installer, also shipped inside the plugin |
| `plugins/just-vibe/scripts/toolkit.mjs` | Discovery, routing, sessions, quizzes and persistent intent workflow CLI |
| `plugins/just-vibe/scripts/lib/` | Catalog, capability, session, quiz, memory, guard, task, lab, proof, practice, experiment and decision modules |
| `plugins/just-vibe/catalog/` | Canonical command contracts, 112 role profiles, examples, prerequisites and pack metadata |
| `plugins/just-vibe/skills/` | 220 source skill names, including three aliases, goal, orchestration, plan review and setup |
| `plugins/just-vibe/references/` | Shared execution rules, runtime interface, domain guidance and command index |
| `.agents/plugins/marketplace.json` | Codex marketplace |
| `.claude-plugin/marketplace.json` | Claude Code marketplace |
| `scripts/` and `tests/` | Validation and lifecycle tests |
| `evals/` | Behavior scenarios and isolated project/data fixtures |

The installer has no runtime npm dependencies or lifecycle install scripts. Automatic routing hooks use native host trust and keep personal task records. Optional project check/formatter hooks still do no work until separately configured and trusted. The source plugin adds a local MCP server with scoped access controls. Language rule packs are optional; no host permissions are granted. Provider/check commands use argument arrays rather than interpolating user input into a shell. Host CLIs own installation state and caches. Local planning and naming documents are excluded from both Git and the npm archive.

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
