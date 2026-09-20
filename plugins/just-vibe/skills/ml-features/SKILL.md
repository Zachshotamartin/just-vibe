---
name: ml-features
description: "Design features available at prediction time and test usefulness"
---

# ml-features

Design features available at prediction time and test usefulness

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; task, feature sources, availability timing, baseline, and evaluation protocol.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Predictable, reproducible feature engineering and controlled usefulness checks; implement/run when requested.

None by default. Plan artifacts may be saved when requested.

## Execute

- Define semantics and missing behavior, enforce point-in-time joins, fit transforms only on training data, compare against baseline, and assess inference cost.

## Deliver and verify

- Feature definitions/pipeline or experiment results with provenance and availability checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Historical features exclude future events; unseen categories/missing values behave consistently at inference.

## Stop and recover

- No test-set-driven feature selection. Unsupported availability timing blocks claims that a feature is deployable.

## Example request

Plan point-in-time customer features fitted only on training data.
