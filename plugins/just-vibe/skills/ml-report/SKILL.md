---
name: ml-report
description: "Document data, results, limitations, and intended use"
---

# ml-report

Document data, results, limitations, and intended use

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; task, dataset/model manifests, evaluation results, intended use, and audience.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Accurate model documentation and release assessment; no invented experiments or approval.

None by default. Plan artifacts may be saved when requested.

## Execute

- Reconcile evidence, describe training/evaluation conditions, summarize baseline and slice results, document limitations and excluded uses, and identify missing release evidence.

## Deliver and verify

- Model report/card with provenance, metrics, operating assumptions, and open risks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Every numerical claim traces to an actual run; missing cohort evidence is disclosed rather than generalized away.

## Stop and recover

- Do not present a report as deployment authorization or claim suitability for untested populations.

## Example request

Write a model report using these actual runs and identify unsupported uses.
