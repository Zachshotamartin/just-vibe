# just-vibe

Engineering workflows, remembered preferences, and verifiable outcomes for coding agents.

[Website](https://just-vibe-tools.vercel.app/) · [Docs](https://just-vibe-tools.vercel.app/docs/) · [Commands](https://just-vibe-tools.vercel.app/commands/) · [Profiles](https://just-vibe-tools.vercel.app/profiles/)

Describe what you want normally. With supported, trusted host hooks, just-vibe suggests relevant workflows and directs the agent to load their methods and discover the tools it needs. Explicit corrections can refine later instructions. Current requests always take precedence, and saved preferences grant no permissions.

**Release status:** npm currently has [0.11.0](https://www.npmjs.com/package/just-vibe/v/0.11.0). This branch prepares 0.12.0, including Agent QA, preference controls and live delivery diagnosis. Its source catalog has 221 skill names, 218 canonical workflows, 112 engineering profiles and 22 packs. See the [implementation and verification plan](docs/agent-qa-and-learning-plan.md). A source build is not evidence of publication.

## Install

Requires Node.js 22+ and Codex CLI or Claude Code with native plugin support on your PATH. All package managers use the same npm registry package:

```sh
npx just-vibe@latest setup
# Or: pnpm dlx just-vibe@latest setup
# Or: yarn dlx just-vibe@latest setup

# Claude Code
npx just-vibe@latest setup --target claude
```

The installer keeps the bundled plugin under `~/.just-vibe`, then registers it through the host's plugin manager. It survives package-manager cache cleanup. Start a new conversation afterward; host hook trust remains a separate host choice. Installation does not connect services or grant tool access.

Prefer an installed CLI? Use `npm install -g just-vibe`, `pnpm add -g just-vibe`, or `yarn global add just-vibe` with Yarn Classic, then run `just-vibe setup`. A project dependency also works with your package manager's executable runner. [Installation and compatibility](https://just-vibe-tools.vercel.app/docs/installation/).

## Use it

With automatic assistance enabled, ask “Fix the mobile menu,” “Investigate unstable training,” or “Address this PR's feedback.” To choose a workflow explicitly, Claude setup supports all four forms with the same trailing context:

```text
/jv reprompt Make this React bug report actionable. Keep the existing API.
/just-vibe reprompt Make this React bug report actionable. Keep the existing API.
/jv:reprompt Make this React bug report actionable. Keep the existing API.
/just-vibe:reprompt Make this React bug report actionable. Keep the existing API.
```

In Codex, choose the matching skill from the just-vibe plugin and append your request. Native invocation formats differ by host; [the shortcut guide](https://just-vibe-tools.vercel.app/docs/command-shortcuts/) explains the supported mappings.

| Need | Workflow or capability |
| --- | --- |
| Find the right method | `auto`, `tools`, `help`, ordinary-request routing |
| Improve a prompt without executing it | `reprompt` |
| Keep corrections and decisions | `remember`, scoped memory, versioned learned preferences |
| Check the requested visitor journey | `agent-qa`: assertions, screenshots, failures and bounded retests |
| Inspect and undo learned instructions | Local operator **Preferences** view; `preferences` CLI |
| Check whether integration actually ran | `diagnose status`; opt-in `diagnose trial` |
| Learn a concept or practice | `teach`, `teach-test`, isolated exercises |
| Guide a longer task | `goal`, engineering profiles, plans and checkpoints |

The command catalog covers frontend, backend, databases, architecture, decisions, Git/GitHub, Vercel, Vite, React, data, ML, LLMs, testing, security and operations. Workflows define scope, technical methods, decision branches, evidence and recovery. They execute through the active host's available tools; missing capabilities remain missing.

## Evidence and personalization

Agent QA translates the original request into observable acceptance criteria. Its optional Playwright runner checks uploads, completion text, advancing media playback, invalid input and selected mobile geometry. It preserves failed attempts after repairs and invalidates stale evidence. Without the runner, the workflow can use host-browser observations with their provenance clearly labeled. Subjective design or audio quality still needs judgment. [Agent QA schema and limits](plugins/just-vibe/references/agent-qa.md).

Learned preferences retain their explicit user source, scope and versions. The local dashboard supports editing, disabling, restoring and read-only routing previews. Neither silence nor passing tests creates a preference. [Automatic assistance](plugins/just-vibe/references/adaptive.md).

`diagnose status` distinguishes observed hook delivery, workflow selection/loading and observed tools. `diagnose trial` requires explicit `useAccount:true` and runs an isolated install → request → correction → fresh session → follow-up journey using the existing signed-in host. This consumes model usage; ordinary setup and status checks do not. [Diagnosis and preferences](https://just-vibe-tools.vercel.app/docs/preferences/).

## Maintain the installation

```sh
npx just-vibe@latest setup --dry-run
npx just-vibe@latest doctor
npx just-vibe@latest update
npx just-vibe@latest uninstall
```

Append `--target claude` for Claude. Repeated setup preserves the managed version; update uses the package version you execute. Uninstall removes the plugin registration and retains its marketplace, managed source and personal data. Conflicting or unmanaged installations are not silently overwritten. `doctor` inspects installation state, while `diagnose status` inspects recorded delivery.

For a development checkout, use `setup --local` consistently and keep the checkout in place. Switching bundled, local or GitHub sources is deliberate: uninstall the old plugin and remove its marketplace through the host before registering the new source. [Troubleshooting](https://just-vibe-tools.vercel.app/docs/updates/).

## Development and verification

```sh
npm ci --ignore-scripts
npm run build:skills
npm run check
npm run website:build
npm run website:test
```

Edit command contracts in `plugins/just-vibe/catalog/commands.json`, pack policies in `catalog/packs.json`, profiles in `catalog/profiles.json`, and supporting methods in `references/`. Generation produces host skills, the command reference, coverage inventory and scenarios; validation rejects drift. Root `PLAN.md` and `NAMING.md` are ignored and excluded from the package.

Optional checks: `test:hosts` tests isolated native install lifecycles; `test:qa-browser` exercises broken and repaired browser flows; `eval:hosts -- --run` uses real model accounts. The default suite does not call models or alter your normal host configuration.

The website generates `/release.json` from the package and canonical catalogs. Its version, counts, catalog hash and pinned installation examples can be consumed with a validated fallback. Manifest metadata alone does not prove npm publication or host compatibility.

Runtime and catalog checks, real host observations, subjective review and publication evidence are separate. There is no claim that every command works with every live service, or that a fixture score measures overall quality or convenience.

- [Runtime operations and schemas](plugins/just-vibe/references/runtime-platform.md), [expanded workbench](plugins/just-vibe/references/runtime-expansion.md).
- [Command quality contract](docs/command-quality.md), [technical coverage](docs/technical-coverage.md), [compatibility](docs/compatibility.md).
- [Behavioral evaluation](evals/README.md), [conversation evaluation](evals/conversation/README.md), [security controls](evals/security/README.md).
- [Pinned ECC comparison](docs/ecc-complete-audit.md), [implementation versus acceptance ledger](docs/ecc-implementation-plan.md).
- [0.11.0 publication evidence](evals/releases/0.11.0-publication.json), [changelog](CHANGELOG.md), [release procedure](docs/releases.md).

## License

[MIT](LICENSE), copyright 2026 Zachary Martin. Commercial use, modification and redistribution are permitted under its terms. The license ships with the npm archive and installed plugin.
