---
name: ml-frame
description: "Define target, prediction moment, unit of analysis, and objective"
---

# ml-frame

Define target, prediction moment, unit of analysis, and objective

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; decision to support, population, available data, prediction timing, and operational objective.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Define the modeling problem before selecting algorithms.

None by default. Plan artifacts may be saved when requested.

## Execute

- Specify unit of analysis, target/label horizon, information available at prediction time, action taken from predictions, baseline, and costs of errors.

## Deliver and verify

- Modeling brief with success metrics, eligibility/exclusions, deployment assumptions, and unresolved policy choices.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Target and prediction time are unambiguous; a proxy label's mismatch with the real objective is explicit.

## Stop and recover

- Do not force an ML solution when deterministic rules suffice or invent business error costs without input.

## Example request

Frame churn prediction 30 days before cancellation, including unit and label horizon.
