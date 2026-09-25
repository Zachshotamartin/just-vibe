---
name: explain
description: "Explain code or behavior at the requested depth. Use for what existing code does and why its observed branches matter; use teach for fundamentals or trace for an entire request path."
---

# explain

Explain code or behavior at the requested depth.

## Choose this workflow

Use for what existing code does and why its observed branches matter; use teach for fundamentals or trace for an entire request path.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; symbol, file, behavior, or question plus desired depth. Requires relevant source access.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Explain the selected behavior and its necessary dependencies; no refactoring or unsolicited repository-wide tutorial.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Locate the definition and a real caller, and inspect the branches that matter for the question.
2. Walk one concrete input through transformations, outputs, side effects and failure handling with file references, at the depth and in the terminology the brief asks for; distinguish what the source shows statically from observed runtime behavior.

## Technical method

- **Inspect:** Read the target definition, at least one caller, data shapes and relevant error handling.
- **Method:** Walk one concrete input through state changes, output and side effects at the requested depth.
- **Avoid misdiagnosis:** Plausible business intent cannot be inferred solely from a function name; configuration-dependent behavior remains conditional.
- **Check the result:** Reconcile the walkthrough with source branches and show an edge path that changes the outcome.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When explanation depends on configuration or external behavior not supplied:** Separate the source-established path from conditional behavior and name the missing evidence.

## Deliver and verify

- A causal explanation that walks one concrete input to its output with cited source locations, the edge path that matters, and unresolved runtime assumptions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Explains both the normal path and a meaningful edge path; missing runtime configuration remains explicitly unknown.

## Stop and recover

- Request a target only when multiple interpretations materially change the answer. Do not invent business intent from implementation alone.

## Example requests

- **Normal (inspect):** Explain how session refresh works, including expired credentials.
- **Edge (inspect):** Explain how this function handles an empty array and a rejected dependency.
- **Blocked (inspect):** Explain this module from source only; runtime configuration is unavailable.
