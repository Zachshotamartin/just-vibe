---
name: docs
description: "Create or update documentation from verified behavior"
---

# docs

Create or update documentation from verified behavior

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; documentation target, audience, and relevant code behavior.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Accurate usage, interfaces, and maintenance guidance; no invented features or changes outside the named documentation scope.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect implementation and examples, update explanations and links, keep terminology consistent, and verify executable examples where authorized.

## Deliver and verify

- Updated documentation and evidence for examples or clear unverified labels.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A documented command exists with the described behavior; deprecated behavior is not presented as current.

## Stop and recover

- Exclude secrets and private data. Flag ambiguous product policy instead of filling it with plausible prose.

## Example request

Update setup instructions to match the scripts that exist today.
