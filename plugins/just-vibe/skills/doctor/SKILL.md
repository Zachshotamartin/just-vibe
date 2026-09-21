---
name: doctor
description: "Diagnose installation and configuration problems Use to diagnose installed toolkit state; setup intentionally changes installation."
---

# doctor

Diagnose installation and configuration problems

## Choose this workflow

Use to diagnose installed toolkit state; setup intentionally changes installation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; just-vibe host, installation source, and scope. Requires host CLI discovery.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Installation/configuration diagnosis; repairs go through an explicitly requested setup/update operation.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Resolve the bundled installer, then run its doctor operation for the requested host, source and Claude scope. Infer the active host only when unambiguous; --local means a complete persistent source checkout.
2. Report actual prerequisite, marketplace, installation and enablement results. Do not run setup/update or edit configuration to make a status question pass. Unknown inventory formats and conflicts remain actionable blockers.
3. Separate package presence, native registration, enabled state and actual version; recommend a repair for the observed failing layer only.
## Technical method

- **Inspect:** Inspect selected host, source/scope, native inventory, enabled state, payload version and supported CLI commands.
- **Method:** Distinguish absent, disabled, conflicting source and stale cached payload using read-only evidence.
- **Avoid misdiagnosis:** Finding an executable or directory does not prove the plugin is enabled or the current session loaded its latest skills.
- **Check the result:** Report exact observed status and a target-specific repair; diagnose must not silently become install/update or cache deletion.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- The task needs scoped memory search, a persistent goal, independent review, configuration scanning, worker control, learned-pattern review or editor installation: [Native memory, goals, specialists and runtime controls](../../references/runtime-platform.md).
- The request needs proactive context warnings, detected checks, native editor events, GitHub epic coordination or configuration audit reports: [Context health, check presets, editor events and shared work](../../references/runtime-depth.md).
- The task specifically involves console cleanup, documentation hook, design quality hook, pre-push gate; load only the matching method: [Focused quality, console and documentation hooks](../../references/methods/quality-hook-recipes.md).
- Discovering session, inventory, rule, council, scheduler, monitor, graph, evaluation, operator or domain-specific capabilities: [Extended capabilities and optional method library](../../references/runtime-expansion.md).

## Decision branches

- **When wrapper reports success but host cache is stale:** Report the mismatch and exact update/check sequence; do not call the installation healthy.

## Deliver and verify

- Status, evidence, and exact remedy for each diagnosed problem.
- Host/scope/source/version observations and remedies with unverified states explicit.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Disabled and absent plugins are distinguished; an unexpected marketplace source blocks a healthy result.

## Stop and recover

- Unknown host output is not guessed. Never delete caches or edit global configuration as an automatic diagnostic step.

## Example requests

- **Normal (inspect):** Check the Claude project-scope just-vibe installation without changing it.
- **edge (inspect):** Diagnose a disabled plugin with a newer payload than the native cache.
- **blocked (inspect):** Inspect prerequisites when the host executable is missing; do not install it implicitly.
