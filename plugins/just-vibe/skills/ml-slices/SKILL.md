---
name: ml-slices
description: "Compare meaningful cohorts or operating conditions"
---

# ml-slices

Compare meaningful cohorts or operating conditions

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; predictions/labels, meaningful cohorts, minimum sample guidance, and operating context.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Performance across cohorts/time/conditions and coverage gaps.

None by default. Plan artifacts may be saved when requested.

## Execute

- Predefine important slices where possible, compute counts and metrics consistently, account for dependent samples, flag small groups, and distinguish exploratory comparisons.

## Deliver and verify

- Slice table, uncertainty, worst-supported conditions, and follow-up data needs.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A tiny cohort's extreme score is qualified; missing cohorts are shown as no evidence rather than zero performance.

## Stop and recover

- Avoid causal or fairness guarantees from a metric table alone. Do not expose identifying small-group records.

## Example request

Compare operating-condition cohorts and report uncertainty for small slices.
