---
name: ml-package
description: "Package preprocessing, artifacts, dependencies, and interfaces Use to create a reproducible inference artifact; ml-serving implements the serving boundary."
---

# ml-package

Package preprocessing, artifacts, dependencies, and interfaces

## Choose this workflow

Use to create a reproducible inference artifact; ml-serving implements the serving boundary.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML deployment methods](../../references/packs/ml-deployment.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; model/preprocessing artifacts, runtime, interface, and output location.

versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Reproducible inference package and metadata; no registry upload or deployment implicitly.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Verify artifact provenance, bundle preprocessing and schema, pin compatible dependencies, record versions/checksums, and run known-input smoke/parity checks.
- Bundle preprocessing, feature order/schema, model identity, dependency constraints and known-input expectations; validate fresh-load parity in an isolated supported environment.

## Technical method

- **Inspect:** Inventory model/preprocessor, ordered feature schema, versions, provenance and artifact format.
- **Apply:** Package the complete inference contract with known-input expectations; inspect executable serialization and trusted origin before loading.
- **Avoid misdiagnosis:** Pickle-style loading can execute code; matching a model filename does not establish trusted provenance or preprocessing parity.
- **Check the result:** Fresh-load a trusted fixture in isolation and compare exact feature order, missing/unseen handling and expected output within tolerance.

## Read when relevant

- Uploads, filesystem paths, extraction or artifact loading are in scope: [Files and resource limits](../../references/security/files.md).

## Decision branches

- **When serialization may execute code and provenance is untrusted:** Inspect provenance and use a safe supported loading path or stop before loading.

## Deliver and verify

- Package, manifest, loading instructions, and expected-output fixtures.
- Artifact manifest, checksums, input/output schema and fresh-load fixture results.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A fresh supported environment reproduces fixture outputs within tolerance; incompatible artifact/schema versions fail clearly.

## Stop and recover

- Do not load untrusted executable serialization or bundle training data/secrets unnecessarily. Missing preprocessing prevents a complete package claim.

## Example requests

- **Normal (apply):** Package the model with preprocessing, schema, dependencies, and parity fixtures.
- **edge (apply):** Package a model whose categorical encoder and feature order were saved separately.
- **blocked (inspect):** Inspect an artifact manifest without loading untrusted executable serialization.
