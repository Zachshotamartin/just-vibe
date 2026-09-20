---
name: map
description: "Produce an architecture or dependency map Use for module dependencies inside a repository; arch-map covers deployed services and stores."
---

# map

Produce an architecture or dependency map

## Choose this workflow

Use for module dependencies inside a repository; arch-map covers deployed services and stores.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; repository/subsystem and desired map depth. Requires source and manifests.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Existing modules and dependencies; deeper distributed architecture questions belong to `arch-map`.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Identify nodes and imports, trace representative relationships, separate declared from observed dependencies, and select a readable level of detail.
2. Identify public entry points and dependency direction; collapse generated/vendor code and distinguish imports, calls and data sharing.
## Technical method

- **Inspect:** Inspect imports, composition roots, schemas, network clients and deployment metadata.
- **Method:** Choose a diagram level that answers the request and label source coupling separately from runtime topology.
- **Avoid misdiagnosis:** A large unlabeled graph hides ownership and can imply nonexistent deployed services.
- **Check the result:** Validate representative edges and data owners against source evidence; flag inferred external components.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When static analysis cannot resolve dynamic loading:** Mark the edge inferred and inspect registration/configuration sites instead of inventing a dependency.

## Deliver and verify

- Diagram or adjacency table with a legend, entry points, evidence links, and uncertain edges.
- Diagram legend, representative dependency paths, cycles and unresolved dynamic edges.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Detects a real dependency cycle; generated/vendor directories do not overwhelm the map.

## Stop and recover

- Cap graph expansion at the requested boundary and summarize external nodes. Do not present the diagram as an approved future architecture.

## Example requests

- **Normal (inspect):** Map dependencies between the billing modules; include cycles.
- **edge (inspect):** Map modules including a plugin loaded from configuration.
- **blocked (inspect):** Map this partial source snapshot without claiming complete dependency coverage.
