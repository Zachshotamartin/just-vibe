# Compatibility and support

The runtime requires Node.js 22 or newer. CI exercises Node 22 and 24 on Linux, macOS and Windows, including an extracted npm archive. npm, pnpm 10.14.0/12.5.1 and Yarn 4.18.0 execution checks run on Node 24. Node 26 is also used for local development checks.

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

Optional hooks use PostToolUse and Stop and ship at the native plugin hook location. They remain inactive until project configuration and separate local trust are present. Codex also requires native hook trust. Native installation on macOS is verified separately from actual hook-event delivery on every host/OS. A direct hook runner test establishes handler behavior, not host parity. Command arrays support native executables and standard npm Windows wrappers through the shared process helper.

GitHub evidence needs authenticated gh; Vercel evidence needs authenticated vercel and an explicit deployment identity. Browser evidence needs project-installed Playwright and Chromium, with authorized interactions. SQL migration evidence inspects local SQL and an optional supplied applied-history export; it does not connect to a live database. The package installs no optional provider or browser dependencies automatically. See the [daily workflow reference](../plugins/just-vibe/references/daily-workflows.md).
