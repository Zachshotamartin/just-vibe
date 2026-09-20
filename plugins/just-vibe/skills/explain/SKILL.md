---
name: explain
description: "Explain code or behavior at the requested depth"
---

# explain

Explain code or behavior at the requested depth

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

## Deliver and verify

- A causal explanation with source links, a concrete example, and relevant caveats.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Explains both the normal path and a meaningful edge path; missing runtime configuration remains explicitly unknown.

## Stop and recover

- Request a target only when multiple interpretations materially change the answer. Do not invent business intent from implementation alone.

## Example request

Explain how session refresh works, including expired credentials.
