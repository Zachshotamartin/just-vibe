---
name: ml-labels
description: "Inspect label definitions, noise, disagreement, and missing outcomes Use for label construction and annotation quality; ml-leakage checks prediction-time information flow."
---

# ml-labels

Inspect label definitions, noise, disagreement, and missing outcomes

## Choose this workflow

Use for label construction and annotation quality; ml-leakage checks prediction-time information flow.

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
- Trace label source, event horizon and maturity; distinguish true negatives, unobserved outcomes, contradictory annotations and policy ambiguity.

## Technical method

- **Inspect:** Read labeling policy, event identity, annotator agreement, outcome window and availability timestamps.
- **Apply:** Separate absent, unresolved and negative labels; trace a disagreement to policy or observation error before changing it.
- **Avoid misdiagnosis:** Majority vote can erase systematic ambiguity; labels recorded after prediction may be valid outcomes but unavailable for historical fitting.
- **Check the result:** Hand-check boundary examples, censored cases and disagreement resolution; report which historical training rows were label-eligible.

## Decision branches

- **When annotators disagree on an ambiguous definition:** Preserve disagreement, clarify policy and adjudicate within scope rather than silently majority-voting it away.

## Deliver and verify

- Label audit with concrete patterns, estimated rates with denominators, and corrective options.
- Label definition, maturity/coverage checks and reproducible disagreement examples.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Unobserved outcomes are not automatically negative; conflicting annotations are tracked rather than silently overwritten.

## Stop and recover

- Relabeling requires explicit policy and scope. Avoid exposing sensitive examples or claiming a single annotator is ground truth without justification.

## Example requests

- **Normal (inspect):** Audit how missing outcome follow-up and annotation disagreement affect labels.
- **edge (inspect):** Audit labels when missing follow-up was encoded as no failure.
- **blocked (inspect):** Assess annotation policy without identifiable raw examples or relabeling permission.
