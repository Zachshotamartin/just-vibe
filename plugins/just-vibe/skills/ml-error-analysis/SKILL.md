---
name: ml-error-analysis
description: "Group failures into actionable patterns and examples Use to inspect model mistakes; ml-slices computes cohort metrics and ml-debug-training diagnoses optimization."
---

# ml-error-analysis

Group failures into actionable patterns and examples

## Choose this workflow

Use to inspect model mistakes; ml-slices computes cohort metrics and ml-debug-training diagnoses optimization.

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
- Define the error event and denominator, group by meaningful factors and compare representative failures with matched successes and possible label problems.

## Technical method

- **Inspect:** Inspect representative failures, successes, uncertainty, labels and error severity.
- **Apply:** Group by plausible mechanism and estimate frequency before proposing a targeted data/model/product change.
- **Avoid misdiagnosis:** Anecdotal errors or explanation scores do not establish a causal pattern across the population.
- **Check the result:** Check the hypothesized group on independent examples and include correct predictions that resemble the failures.

## Decision branches

- **When the analysis uses held-out test outcomes:** Keep findings exploratory and require fresh confirmation before tuning to those patterns.

## Deliver and verify

- Error taxonomy, frequency/impact evidence, examples, and interventions to test.
- Error taxonomy, cohort counts, examples and proposed discriminating experiments.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Common groups are judged against their population size; a few vivid cases do not imply prevalence.

## Stop and recover

- Protect sensitive records. Patterns discovered on test data must not become tuning targets without a fresh evaluation plan.

## Example requests

- **Normal (inspect):** Group failures from these predictions into actionable patterns with denominators.
- **edge (inspect):** Analyze rare high-cost errors without treating vivid examples as prevalence.
- **blocked (inspect):** Analyze aggregate errors when sensitive examples cannot be inspected.
