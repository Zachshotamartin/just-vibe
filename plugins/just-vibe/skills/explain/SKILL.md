---
name: explain
description: "Explain code or behavior at the requested depth Use for what existing code does and why its observed branches matter; use teach for fundamentals or trace for an entire request path."
---

# explain

Explain code or behavior at the requested depth

## Choose this workflow

Use for what existing code does and why its observed branches matter; use teach for fundamentals or trace for an entire request path.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; symbol, file, behavior, or question plus desired depth. Requires relevant source access.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Explain the selected behavior and its necessary dependencies; no refactoring or unsolicited repository-wide tutorial.

None by default. Plan artifacts may be saved when requested.

## Execute

- Locate definitions and callers, inspect important branches, distinguish static inference from observed runtime behavior, and adapt terminology to the brief.
- Locate the definition and a real caller; walk one concrete input through transformations, outputs, side effects and failure handling with file references.

## Decision branches

- **When explanation depends on configuration or external behavior not supplied:** Separate the source-established path from conditional behavior and name the missing evidence.

## Deliver and verify

- A causal explanation with source links, a concrete example, and relevant caveats.
- Input-to-output walkthrough, cited source locations, edge path, and unresolved runtime assumptions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Explains both the normal path and a meaningful edge path; missing runtime configuration remains explicitly unknown.

## Stop and recover

- Request a target only when multiple interpretations materially change the answer. Do not invent business intent from implementation alone.

## Example requests

- **Normal (inspect):** Explain how session refresh works, including expired credentials.
- **edge (inspect):** Explain how this function handles an empty array and a rejected dependency.
- **blocked (inspect):** Explain this module from source only; runtime configuration is unavailable.
