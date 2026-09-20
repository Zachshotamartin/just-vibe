---
name: ml-package
description: "Package preprocessing, artifacts, dependencies, and interfaces"
---

# ml-package

Package preprocessing, artifacts, dependencies, and interfaces

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

## Deliver and verify

- Package, manifest, loading instructions, and expected-output fixtures.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A fresh supported environment reproduces fixture outputs within tolerance; incompatible artifact/schema versions fail clearly.

## Stop and recover

- Do not load untrusted executable serialization or bundle training data/secrets unnecessarily. Missing preprocessing prevents a complete package claim.

## Example request

Package the model with preprocessing, schema, dependencies, and parity fixtures.
