---
name: ml-threshold
description: "Choose thresholds against explicit costs or capacity limits"
---

# ml-threshold

Choose thresholds against explicit costs or capacity limits

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; scores/labels, explicit error costs or capacity, prevalence, and validation protocol.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Select an operating point or decision policy; no production activation.

None by default. Plan artifacts may be saved when requested.

## Execute

- Compare threshold tradeoffs, model workload/capacity, handle ties and uncertainty, choose using validation data, and reserve independent confirmation.

## Deliver and verify

- Threshold recommendation, confusion/workload estimates, assumptions, and sensitivity.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A daily review cap is respected under declared volume assumptions; a changed prevalence is shown to affect workload/precision.

## Stop and recover

- Do not invent business costs or optimize against the held-out test set. Unresolved priorities yield a tradeoff curve rather than a forced value.

## Example request

Choose validation thresholds when reviewers can inspect 200 transactions daily.
