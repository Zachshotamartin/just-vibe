---
name: ml-leakage
description: "Find target leakage, temporal leakage, and split contamination"
---

# ml-leakage

Find target leakage, temporal leakage, and split contamination

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; task/prediction moment, features, preprocessing, labels, and split lineage.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Target proxies, future information, cross-split fitting, duplicates, and entity contamination.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify the prediction moment, label horizon, feature availability, split membership and intended deployment population from supplied evidence. Mark missing definitions as unknown.
- Trace suspicious features to when their values could actually have been available. Distinguish future-derived values from valid point-in-time historical features.
- Inspect preprocessing fit/transform boundaries when code or fit records exist. Their absence means unverified, not proof of correct or incorrect fitting.
- For each finding record the exact observed rows or source paths, the conclusion those observations support, and any assumptions needed for a stronger conclusion. Separate confirmed defects, conditional risks and missing evidence in the report.
- Quantify entity, interval and outcome-horizon overlap. Do not infer identical raw measurements or a shared outcome event from metadata alone. Determine group separation from whether deployment targets known entities, new entities or new groups.
- Check label maturity against the simulated model-fit and prediction times. State the historical-deployment assumption when applying temporal cutoffs or an embargo; choose gaps from actual availability and overlap instead of a universal duration.
- Before delivering, check every claim labeled proven against its cited evidence. Correct unsupported absolutes, including assertions that all scores are invalid or a split is always wrong. Identify which scores would be affected under which assumptions, and require re-evaluation after confirmed leakage is corrected.

## Deliver and verify

- An evidence-backed leakage audit separating confirmed defects, conditional risks and unknowns; each finding names the supporting rows/source, assumptions, affected evaluation and correction or missing evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Future-only features and immature training labels are flagged against the stated prediction/fit times; cross-split preprocessing fitting is detected only when source or fit history establishes it.
- Metadata-only overlap is quantified without asserting identical sensor values or a shared failure event. Group separation is conditional on the intended deployment population.
- Missing labels remain unknown outcomes, unavailable pipeline evidence remains unverified, and score invalidation is limited to affected evaluation assumptions rather than invented results.

## Stop and recover

- Do not claim absence of leakage when provenance is missing. Remediation must invalidate affected scores rather than preserve misleading results.

## Example request

Audit churn features for values unavailable 30 days before cancellation.
