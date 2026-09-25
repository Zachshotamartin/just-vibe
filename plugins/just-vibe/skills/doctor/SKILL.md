---
name: doctor
description: "Diagnose installation and configuration problems. Use to diagnose installed toolkit state; setup intentionally changes installation."
---

# doctor

Diagnose installation and configuration problems.

## Choose this workflow

Use to diagnose installed toolkit state; setup intentionally changes installation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Installation methods](../../references/packs/installation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; just-vibe host, installation source, and scope. Requires host CLI discovery.

**Pack prerequisites:** Node.js 22+. Codex and Claude targets also need the host CLI with native plugin support; editor adapters need only the project directory. Git is required only for --github. Use the bundled installer; preserve marketplace and scope checks.

- **Infer from evidence:** Inspect selected host, native CLI support, existing source/scope and package version without changing global configuration.
- **Reasonable default:** Use the documented bundled source and existing host conventions unless the user selects another source.
- **Ask only when needed:** Ask only when multiple host/scope/source choices cannot be resolved from context and would change installation; report an actual missing executable instead of requesting unrelated credentials.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Installation/configuration diagnosis; repairs go through an explicitly requested setup/update operation.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Resolve the bundled installer, then run its doctor operation for the requested host, source and Claude scope. Infer the active host only when unambiguous; --local means a complete persistent source checkout.
2. Report actual prerequisite, marketplace, installation and enablement results. Do not run setup/update or edit configuration to make a status question pass. Unknown inventory formats and conflicts remain actionable blockers.
3. Separate package presence, native registration, enabled state and actual version. The installer reports every failing layer at once; recommend repairs that cover exactly the observed failing layers.
4. Claude shortcut health (commands/jv.md, commands/just-vibe.md and the jv skills plugin) is a separate layer from native registration; report it separately.

## Technical method

- **Inspect:** Inspect selected host, source/scope, native inventory, enabled state, payload version and supported CLI commands.
- **Method:** Distinguish absent, disabled, conflicting source and stale cached payload using read-only evidence.
- **Avoid misdiagnosis:** Finding an executable or directory does not prove the plugin is enabled or the current session loaded its latest skills.
- **Check the result:** Report exact observed status and a target-specific repair; diagnose must not silently become install/update or cache deletion.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Installation worked example](../../references/examples/installation.md).
- The task needs scoped memory search, a persistent goal, independent review, configuration scanning, worker control, learned-pattern review or editor installation: [Native memory, goals, specialists and runtime controls](../../references/runtime-platform.md).
- The request needs proactive context warnings, detected checks, native editor events, GitHub epic coordination or configuration audit reports: [Context health, check presets, editor events and shared work](../../references/runtime-depth.md).
- Discovering session, inventory, rule, council, scheduler, monitor, graph, evaluation, operator or domain-specific capabilities: [Extended capabilities and optional method library](../../references/runtime-expansion.md).

## Decision branches

- **When wrapper reports success but host cache is stale:** Report the mismatch and exact update/check sequence; do not call the installation healthy.
- **When installation is healthy but automatic assistance does not activate:** Run diagnose status --root <project>, then assist status, and report the first unobserved stage (hook received, workflow selected, workflow loaded, tools observed) and the host hook-trust step.
- **When the target is an editor adapter:** Run doctor with --root <project> and report the adapter JSON fields installed, conflicts, missing, outdated and interrupted instead of native plugin state.

## Deliver and verify

- Status, evidence, and exact remedy for each diagnosed problem.
- Host/scope/source/version observations and remedies with unverified states explicit.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Disabled and absent plugins are distinguished; an unexpected marketplace source blocks a healthy result.

## Stop and recover

- Unknown host output is not guessed. Never delete caches or edit global configuration as an automatic diagnostic step.

## Example requests

- **Normal (inspect):** Check the Claude project-scope just-vibe installation without changing it.
- **Edge (inspect):** Diagnose a disabled plugin with a newer payload than the native cache.
- **Blocked (inspect):** Inspect prerequisites when the host executable is missing; do not install it implicitly.
