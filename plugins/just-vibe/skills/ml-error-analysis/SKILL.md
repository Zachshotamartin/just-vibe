---
name: ml-error-analysis
description: "Group failures into actionable patterns and examples"
---

# ml-error-analysis

Group failures into actionable patterns and examples

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; predictions, labels, task costs, and permitted redacted examples.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Actionable failure patterns; no automatic retraining or relabeling.

None by default. Plan artifacts may be saved when requested.

## Execute

- Define errors according to task, group by meaningful factors, inspect representative cases and denominators, distinguish label problems, and propose targeted next experiments.

## Deliver and verify

- Error taxonomy, frequency/impact evidence, examples, and interventions to test.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Common groups are judged against their population size; a few vivid cases do not imply prevalence.

## Stop and recover

- Protect sensitive records. Patterns discovered on test data must not become tuning targets without a fresh evaluation plan.

## Example request

Group failures from these predictions into actionable patterns with denominators.
