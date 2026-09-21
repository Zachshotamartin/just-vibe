# Compatibility and support

The runtime requires Node.js 22 or newer. The CI matrix is configured to exercise Node 22 and 24 on Linux, macOS and Windows, including an extracted npm archive. npm, pnpm 10.14.0/12.5.1 and Yarn 4.18.0 execution checks run on Node 24. Node 26 is also used for local development checks.

Real native Codex/Claude plugin lifecycle checks are performed separately on macOS. Windows and Linux CI checks validate the toolkit and packaging; they do not establish native agent-host support. On Windows, use a host CLI that supports native plugins. Native executables and standard npm-generated Node `.cmd` shims are supported; other batch wrappers are rejected with guidance rather than interpreted as shell code. WSL can use the Linux setup path when the selected host supports it. Host and operating-system support remain subject to the host's own requirements.

The default install copies bundled files into `~/.just-vibe/marketplaces/codex` or `~/.just-vibe/marketplaces/claude`. Set `JUST_VIBE_HOME` to use another persistent base directory and retain that setting for future commands. Setup does not require GitHub access. Git is needed for the optional `--github` source and workflows that use Git.

A project-scoped Claude installation still uses a per-user marketplace source; each teammate runs setup on their own machine. No machine-specific path is written into shared project settings by just-vibe itself.

Updates use the package version you execute. Use `pnpm dlx just-vibe@latest update`, `npx just-vibe@latest update`, or `yarn dlx just-vibe@latest update` to retrieve the newest published payload. `setup` preserves an existing managed version. Uninstall retains the managed source, marketplace registration and persistent plugin data.

Capabilities such as GitHub, Vercel, databases, deployment and training require the user's own tools/access. Installation does not authenticate these services. A CLI on PATH does not establish authorization or usable credentials.

`teach-test` requires a native question tool available and permitted for assessment in the current host mode. Real Claude interaction was verified in v0.2; the tested Codex mode restricted question tools to clarification/planning and correctly declined the quiz. ML findings still require review; the previous Claude leakage fixture had a partial behavioral result. See the [v0.2 validation record](../evals/releases/0.2.0.md).

The v0.4 release adds 21 passing supplied-instruction Codex fixture trials and a three-case matched comparison that tied across all arms. These results do not establish native invocation or Claude parity for those workflows. See the [v0.4 validation record](../evals/releases/0.4.0.md).

## v0.5 profile support

The profile/profile-discovery skills and all 112 role guides ship in both host payloads. Profile selection is task context: user pins are protected by the run-state utilities, and no host-global preference is installed. Native installation checks cover the 215-skill payload; they do not establish profession-specific agent behavior. See the [v0.5 validation record](../evals/releases/0.5.0.md).

## v0.7 daily workflow support

Project state and contextual routing use the bundled Node utilities on all supported runtime platforms. State is schema-versioned and bound to the selected project path. Partial snapshot coverage always requires revalidation. `tools` now shows a starter selection; use `tools --all` for the previous full inventory.

The v0.7 project check/formatter hooks use PostToolUse and Stop and ship at the native plugin hook location. They remain inactive until project configuration and separate local trust are present. Codex also requires native hook trust. Native installation on macOS is verified separately from actual hook-event delivery on every host/OS. A direct hook runner test establishes handler behavior, not host parity. Command arrays support native executables and standard npm Windows wrappers through the shared process helper.

GitHub evidence needs authenticated gh; Vercel evidence needs authenticated vercel and an explicit deployment identity. Browser evidence needs project-installed Playwright and Chromium, with authorized interactions. SQL migration evidence inspects local SQL and an optional supplied applied-history export; it does not connect to a live database. The package installs no optional provider or browser dependencies automatically. See the [daily workflow reference](../plugins/just-vibe/references/daily-workflows.md).

## v0.8 intent workflows

The new memory/guard, task, lab, proof, practice, experiment and decision helpers use the existing Node runtime without added runtime dependencies. Labs/practice/local undo require Git and a committed project root. Preview commands must run foreground loopback servers; the worker owns their process lifetime. These worktrees are not security sandboxes. Selected file and snapshot bounds can require a narrower task; incomplete coverage never grants selection/cleanup authority.

The 216-skill payload passed isolated native Codex/Claude lifecycle checks on macOS. ML imports use supplied local exports, and browser proof screenshots use already-installed Playwright/Chromium. Native teaching questions still depend on the active host mode; exercise assessment does not fabricate question-tool availability. See the [v0.8 validation record](../evals/releases/0.8.0.md) and [workflow guides](../plugins/just-vibe/references/intent-workflows.md).

## v0.9 automatic assistance

Version 0.9.0 adds request routing, resume/compaction restoration, tool-activity records, scoped feedback overlays and bounded completion reminders. Supported hosts must deliver UserPromptSubmit, SessionStart, PostToolUse and Stop events and trust the plugin's native hooks. The installer does not grant native trust. Existing optional project checks still require their separate configuration and trust.

Codex supplies the CLAUDE_PLUGIN_ROOT compatibility variable used by the shared hook command. Both adapters are exercised with fixture events; native install/update/uninstall lifecycle checks run separately on macOS. This does not establish every event on every host/OS or perfect model adherence. Hosted tools and some specialized paths can be absent from tool-hook observations. Use actual attributed evidence rather than inferring success from missing or returned tool events.

Personal learning and task state live under ~/.just-vibe/adaptive (or JUST_VIBE_HOME), keyed by canonical project and host/session. See the [adaptive reference](../plugins/just-vibe/references/adaptive.md) and [implementation/validation record](adaptive-assistance.md).

## Runtime expansion in v0.10.0

The source checkout adds native stdio MCP tools, a persistent goal skill, project/user/team memory, reviewed pattern learning, configuration scans, targeted PreToolUse policy, independent specialists and optional local workers. Native Codex/Claude plugin integration remains the primary path. Cursor and OpenCode provide project skills plus optional native event adapters selected with `--editor-hooks`. Copilot, Gemini, Kimi, Qwen, Windsurf, Antigravity IDE and Zed provide project skills; Hermes targets the explicitly chosen Hermes home. These installers preserve host permissions and provider configuration. Codex specialist definitions use a separate project adapter. Read the [runtime feature and verification guide](runtime-tools.md), [host matrix](../plugins/just-vibe/references/runtime-platform.md) and [event schemas and limits](../plugins/just-vibe/references/runtime-depth.md).

Cursor event fixtures cover prompt routing, policy denial and owned configuration changes. OpenCode uses its host-provided plugin SDK, including the version-sensitive experimental system-context hook. Neither establishes live event delivery on every editor version. Only Claude has an included capacity status-line bridge; other hosts need real metrics through the documented observation interface. Commit checks recognize direct shell invocations and do not replace native Git/CI enforcement. AgentShield is separately installed and trusted; its optional paid analysis was not run during fixture validation.

Policy, observation and workers remain opt-in. MCP memory/preference writes, user scope and worker launch have separate enablement. Worker CLI support requires the selected host's documented flags and account access. Fixture process tests do not establish live model behavior or Windows host parity. The 0.10.0 release record covers this expansion; the older 0.9.0 publication record remains historical.

## Current backlog expansion contracts

The source adds 43 methods, 24 total specialists and 48 total MCP tools. Nineteen adapter targets are enumerated, including the Codex/Claude specialist adapters; native plugin installation remains separate. AdaL, CodeBuddy, JoyCode, OpenClaw, Pi and Trae are skill-file contracts. Kiro also has explicit v1 hook and steering support. Current local fixtures cover their owned-file install/update/uninstall and Kiro event translation; live activation in these hosts is unverified.

The operator/catalog browser was checked in Chromium at desktop/mobile widths, with keyboard interaction, reduced motion, accessibility scanning, local record actions and a reviewed fixture installation. Python provider tests use loopback HTTP and visible streaming/request fixtures; paid OpenAI/Anthropic and real Ollama requests were not run. CPU ranking/split examples do not establish CUDA/distributed behavior.

Native Git pre-commit/pre-push hooks are opt-in and preserve foreign hook managers. Pre-push requires an explicitly trusted verifier and a clean checkout matching the pushed HEAD. Service supervisors own only their child processes; stale PID recovery requires inspection. Cross-platform CI configuration is not a claim of a completed CI run, especially while GitHub Actions minutes are unavailable. Source/baseline comparisons and current evidence are tracked separately in the [frozen-backlog implementation](ecc-implementation-plan.md).
