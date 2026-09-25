---
name: map
description: "Map module and package imports inside a repository, including cycles and dynamic edges. Use for module dependencies inside a repository; arch-map covers deployed services and stores."
---

# map

Map module and package imports inside a repository, including cycles and dynamic edges.

## Choose this workflow

Use for module dependencies inside a repository; arch-map covers deployed services and stores.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; repository/subsystem and desired map depth. Requires source and manifests.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Existing modules and dependencies; deeper distributed architecture questions belong to `arch-map`.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Identify public entry points, nodes and dependency direction; collapse generated/vendor code to keep a readable level of detail.
2. For a first pass run atlas map --root PROJECT --stdin with {paths}; treat its edges as lexical candidates, resolve specifiers, verify representative and cycle edges in source, and report partial coverage.
3. Distinguish imports, calls and data sharing, and separate declared from observed dependencies.

## Technical method

- **Inspect:** Inspect imports, composition roots, schemas, network clients and deployment metadata.
- **Method:** Choose a diagram level that answers the request and label source coupling separately from runtime topology.
- **Avoid misdiagnosis:** A large unlabeled graph hides ownership and can imply nonexistent deployed services.
- **Check the result:** Validate representative edges and data owners against source evidence; flag inferred external components.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Using atlas map for a bounded import inventory: [Extended capabilities and optional method library](../../references/runtime-expansion.md).

## Decision branches

- **When static analysis cannot resolve dynamic loading:** Mark the edge inferred and inspect registration/configuration sites instead of inventing a dependency.

## Deliver and verify

- Diagram or adjacency table with a legend, entry points, representative dependency paths, cycles, evidence links, and uncertain or unresolved dynamic edges.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Detects a real dependency cycle; generated/vendor directories do not overwhelm the map.

## Stop and recover

- Cap graph expansion at the requested boundary and summarize external nodes. Do not present the diagram as an approved future architecture.

## Example requests

- **Normal (inspect):** Map dependencies between the billing modules; include cycles.
- **Edge (inspect):** Map modules including a plugin loaded from configuration.
- **Blocked (inspect):** Map this partial source snapshot without claiming complete dependency coverage.
