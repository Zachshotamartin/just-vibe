---
name: ml-dataset
description: "Audit whether data can support the modeling task"
---

# ml-dataset

Audit whether data can support the modeling task

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; framed task, dataset version, collection process, and sampling budget.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Task suitability, population coverage, missingness, dependencies, and collection bias.

None by default. Plan artifacts may be saved when requested.

## Execute

- Compare available fields/outcomes with task needs, inspect cohort/time coverage, assess missing-label patterns and selection processes, and identify unsupported deployment populations.

## Deliver and verify

- Dataset readiness report with exclusions, risks, and needed collection/validation work.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A dataset missing outcome follow-up is not treated as fully labeled; a deployment cohort absent from training is flagged.

## Stop and recover

- Do not infer representativeness from sample size alone. Unsupported collection semantics remain unknown.

## Example request

Assess whether this dataset covers the intended deployment population.
