---
name: ml-dataset-version
description: "Record dataset identity, transformations, and provenance Use to identify reproducible data/splits; data-lineage explains transformations."
---

# ml-dataset-version

Record dataset identity, transformations, and provenance

## Choose this workflow

Use to identify reproducible data/splits; data-lineage explains transformations.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; dataset snapshot, transforms, source identifiers, and approved manifest location.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

- **Infer from evidence:** Read prediction moment, label horizon, entity/time keys, split policy and dataset provenance from the task and manifests.
- **Reasonable default:** Use explicit synthetic examples for design when raw data is unavailable; do not infer missing labels or fit preprocessing across held-out boundaries.
- **Ask only when needed:** Ask when unresolved label timing, grouping or target semantics would change the split/features; do not demand a full dataset to explain the method.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Reproducible identity/provenance metadata; no automatic copying or committing of raw data.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Record immutable references or hashes where feasible, schema, transformation/code versions, split identity, and creation parameters; verify referential accessibility.
2. Record source snapshot or content identity, transformation revision, schema, split membership and immutable access references without storing secrets or raw private data.
## Technical method

- **Inspect:** Inventory source snapshot IDs, transforms, schema, split membership and label-version policy.
- **Method:** Create a manifest that identifies exact inputs and processing without embedding confidential rows; state mutable external sources explicitly.
- **Avoid misdiagnosis:** A filename, seed or hash of only a sample cannot identify the full dataset.
- **Check the result:** Reconstruct membership from the manifest or record inaccessible components; changed upstream revisions must change or qualify dataset identity.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML data worked example](../../references/examples/ml-data.md).


## Decision branches

- **When only a mutable source URL exists:** Mark identity provisional and define the snapshot/hash mechanism needed for reproducibility.

## Deliver and verify

- Dataset manifest with lineage, reconstruction instructions, and known reproducibility limits.
- Version manifest, provenance chain, accessibility check and mutable boundaries.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Changed source content changes identity or is detected; a mutable URL alone is not presented as an immutable version.

## Stop and recover

- Avoid expensive full hashing without a budget. Do not place confidential data or credentials in Git/manifests.

## Example requests

- **Normal (apply):** Write a provenance manifest for the identified dataset without copying raw records.
- **edge (apply):** Version a dataset whose remote contents can change at the same path.
- **blocked (inspect):** Plan versioning without permission for a full expensive hash scan.
