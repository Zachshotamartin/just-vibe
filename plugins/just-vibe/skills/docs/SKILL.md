---
name: docs
description: "Create or update documentation from verified behavior. Use for README, guide and usage documentation from verified behavior; api-openapi owns OpenAPI contracts, release owns release notes, decision-adr owns decision records, and teach or explain answer in conversation."
---

# docs

Create or update documentation from verified behavior.

## Choose this workflow

Use for README, guide and usage documentation from verified behavior; api-openapi owns OpenAPI contracts, release owns release notes, decision-adr owns decision records, and teach or explain answer in conversation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; documentation target, audience, and relevant code behavior.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Accurate usage, interfaces, and maintenance guidance; no invented features or changes outside the named documentation scope.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Check documented commands, defaults and examples against the current implementation.
2. Update explanations and links in source documents rather than generated copies, keeping terminology consistent, and verify executable examples where authorized.

## Technical method

- **Inspect:** Read actual code, CLI help, examples, generated sources and supported versions.
- **Method:** Update the source of truth and cross-links around observable behavior; distinguish setup instructions from evidence of successful execution.
- **Avoid misdiagnosis:** Copying stale examples or generated output without rebuilding its source creates drift.
- **Check the result:** Exercise runnable examples where practical, validate links and ensure documented defaults match the implementation.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When examples need credentials or destructive execution:** Validate syntax or a controlled substitute and label the live example unexercised.

## Deliver and verify

- Updated documentation topics with verified examples, compatibility scope, and clear labels on unverified instructions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A documented command exists with the described behavior; deprecated behavior is not presented as current.

## Stop and recover

- Exclude secrets and private data. Flag ambiguous product policy instead of filling it with plausible prose.

## Example requests

- **Normal (apply):** Update setup instructions to match the scripts that exist today.
- **Edge (apply):** Update docs after a flag was renamed while preserving migration guidance.
- **Blocked (inspect):** Audit documentation against source with no service credentials.
