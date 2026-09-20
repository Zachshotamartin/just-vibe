---
name: ml-frame
description: "Define target, prediction moment, unit of analysis, and objective Use to define the prediction problem; ml-baseline implements the first comparator after the task is defined."
---

# ml-frame

Define target, prediction moment, unit of analysis, and objective

## Choose this workflow

Use to define the prediction problem; ml-baseline implements the first comparator after the task is defined.

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
- State one prediction row's entity, timestamp, available information, label horizon and downstream action; compare a rule-based decision before choosing ML.

## Technical method

- **Inspect:** Establish prediction entity/time, decision being supported, available information, outcome horizon and label maturity.
- **Apply:** Translate product value into a measurable objective with a naive comparator and deployment population.
- **Avoid misdiagnosis:** Optimizing an available label can answer a different question from the real decision; missing follow-up is not a negative outcome.
- **Check the result:** Walk one positive, negative and censored example through feature availability, prediction and eventual label eligibility.

## Decision branches

- **When label timing or intervention changes the observed outcome:** Separate prediction from causal/intervention claims and identify the missing observation process.

## Deliver and verify

- Modeling brief with success metrics, eligibility/exclusions, deployment assumptions, and unresolved policy choices.
- Task card with row grain, prediction moment, outcome horizon, action and error costs.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Target and prediction time are unambiguous; a proxy label's mismatch with the real objective is explicit.

## Stop and recover

- Do not force an ML solution when deterministic rules suffice or invent business error costs without input.

## Example requests

- **Normal (plan):** Frame churn prediction 30 days before cancellation, including unit and label horizon.
- **edge (plan):** Frame failure prediction for machines with delayed maintenance labels.
- **blocked (inspect):** Define the task without business error costs; keep threshold selection undecided.
