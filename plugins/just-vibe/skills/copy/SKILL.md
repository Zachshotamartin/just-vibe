---
name: copy
description: "Improve interface wording and product messaging Use for interface language preserving product semantics; docs explains implementation and usage."
---

# copy

Improve interface wording and product messaging

## Choose this workflow

Use for interface language preserving product semantics; docs explains implementation and usage.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply to specified UI/docs; plan for alternatives only. Requires audience, intent, voice, and relevant product facts.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Labels, help text, error messages, and supplied marketing content; no invented guarantees or policy changes.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Identify user decisions, preserve meaning, make actions/errors specific, check space/localization constraints, and update authorized surfaces.
- Identify the decision each label or message supports; preserve legal/business meaning and test truncation, pluralization and missing-value variants.

## Decision branches

- **When improving clarity would change a product promise:** Surface that policy choice rather than quietly rewriting it.

## Deliver and verify

- Revised copy with necessary context and affected states.
- Copy changes by state, rationale, character constraints and unresolved policy wording.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A failure message gives an actionable next step; labels remain understandable without surrounding visual context.

## Stop and recover

- Flag unverifiable product claims. Preserve legal or contractual wording unless the requested scope includes changing it.

## Example requests

- **Normal (apply):** Make payment failure messages actionable and preserve the user's entered data.
- **edge (apply):** Improve payment errors while preserving a user's entered form values.
- **blocked (inspect):** Suggest copy with unknown refund policy; do not invent eligibility promises.
