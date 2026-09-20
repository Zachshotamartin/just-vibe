---
name: refactor
description: "Improve structure while preserving behavior Use for structural change with preserved behavior; migrate changes a version or public compatibility boundary."
---

# refactor

Improve structure while preserving behavior

## Choose this workflow

Use for structural change with preserved behavior; migrate changes a version or public compatibility boundary.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; structural goal, target modules, and behavior/API constraints. Requires source and a baseline verification method.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Internal organization with preserved observable behavior; feature changes are separate.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Capture relevant behavior, identify seams, transform incrementally, preserve call contracts, and compare results against the baseline.
2. Identify public exports, serialization and error contracts; transform one seam at a time and compare behavior against existing consumer checks.
## Technical method

- **Inspect:** Identify public contracts, state ownership, side effects and behavior-sensitive tests.
- **Method:** Change structure in coherent steps while preserving observable semantics, including error and timing contracts.
- **Avoid misdiagnosis:** Renaming a pure helper differs from moving async ownership or transaction boundaries; both cannot use the same evidence bar.
- **Check the result:** Compare representative success/failure behavior before and after and inspect callers for changed ordering or identity semantics.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).

## Decision branches

- **When code appears unused but is registered dynamically:** Trace registration and configuration before deleting or moving it.

## Deliver and verify

- Focused structural changes, rationale, compatibility evidence, and remaining debt.
- Structural rationale, compatibility surface and checks showing preserved behavior.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Existing consumers continue to work; boundary/error behavior survives the reorganization.

## Stop and recover

- If behavior is undocumented, characterize it before changing it. Do not fold a semantic fix into the refactor without naming the scope change.

## Example requests

- **Normal (apply):** Separate validation from persistence without changing the public API.
- **edge (apply):** Extract a service without changing exception types or serialized output.
- **blocked (inspect):** Assess a refactor when integration tests cannot run; identify unverified contracts.
