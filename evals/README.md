# Evaluating just-vibe

The catalog generates `scenarios.json`: one realistic invocation, required evidence, success rubric and stop behavior for every shipped skill. These are evaluation definitions, not completed model runs.

The [v0.2.0 validation record](releases/0.2.0.md) contains actual agent trials, native quiz interaction, corrected defects, and explicit partial/blocked results. Catalog scenario definitions remain separate from that observed evidence.

`npm run check` runs executable checks for the shared runtime, aliases, scenario context preservation, missing capabilities, modes, target isolation, retries, evidence, package contents, and installation behavior. `npm run test:hosts` exercises both real native plugin lifecycles in isolated host configuration directories. Neither command makes model/API calls, deploys applications, trains models or uses paid integrations.

For agent behavior, use a separate authorized host session and an isolated fixture workspace. Load only the skill under evaluation, shared instructions, its pack runbook and the raw task artifacts. Give the evaluator the scenario brief without the expected conclusion. Record the host/model version, artifact identities, actions, outputs, user-visible result, rubric assessment and actual validation. Do not silently convert a structural test into a claim of model quality or host behavioral parity.

The `fixtures/checkout` project supplies a real failing behavior, a neighboring valid case and unrelated content to preserve. The `fixtures/ml` files supply temporal leakage, entity overlap and missing-label evidence for inspection without training. Run these in disposable copies; the original fixtures must retain their diagnostic conditions.

For each domain add representative authorized project/data artifacts when exercising its scenarios. Include a successful case and a blocked/negative case: unavailable integrations must remain unknown, inspect/plan modes must avoid mutations, and appended constraints must survive routing. External scenarios need exact target/action/budget authorization; do not use production records or services by default.

Unexecuted model scenarios retain `scenario-defined` validation in the catalog. `runtime-fixtures-tested` describes utility-backed checks only; it is not a model performance claim. Report observed limitations rather than inventing pass rates.
