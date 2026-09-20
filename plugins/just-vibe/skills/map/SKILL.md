---
name: map
description: "Produce an architecture or dependency map"
---

# map

Produce an architecture or dependency map

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; repository/subsystem and desired map depth. Requires source and manifests.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Existing modules and dependencies; deeper distributed architecture questions belong to `arch-map`.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify nodes and imports, trace representative relationships, separate declared from observed dependencies, and select a readable level of detail.

## Deliver and verify

- Diagram or adjacency table with a legend, entry points, evidence links, and uncertain edges.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Detects a real dependency cycle; generated/vendor directories do not overwhelm the map.

## Stop and recover

- Cap graph expansion at the requested boundary and summarize external nodes. Do not present the diagram as an approved future architecture.

## Example request

Map dependencies between the billing modules; include cycles.
