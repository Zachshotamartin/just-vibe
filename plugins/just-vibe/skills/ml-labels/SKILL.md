---
name: ml-labels
description: "Inspect label definitions, noise, disagreement, and missing outcomes"
---

# ml-labels

Inspect label definitions, noise, disagreement, and missing outcomes

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; label definitions, annotation/outcome sources, timing, and permitted samples.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Label consistency, noise, disagreement, censoring, and missing outcomes.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace label construction, compare annotations/outcomes, distinguish disagreement from ambiguous policy, inspect timing and coverage, and propose adjudication/quality checks.

## Deliver and verify

- Label audit with concrete patterns, estimated rates with denominators, and corrective options.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Unobserved outcomes are not automatically negative; conflicting annotations are tracked rather than silently overwritten.

## Stop and recover

- Relabeling requires explicit policy and scope. Avoid exposing sensitive examples or claiming a single annotator is ground truth without justification.

## Example request

Audit how missing outcome follow-up and annotation disagreement affect labels.
