---
name: fix
description: "Reproduce a bug, identify its cause, and verify the fix"
---

# fix

Reproduce a bug, identify its cause, and verify the fix

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; symptom, expected behavior, and reproduction context. Requires source and a reproducible case or reliable failure evidence.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Correct the demonstrated cause and nearby necessary behavior; no broad cleanup.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Establish the failure, trace its cause, apply the smallest sound fix, add a meaningful regression check when warranted, and verify related behavior.

## Deliver and verify

- Cause explanation, patch, before/after evidence, and unresolved risks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The original failure no longer occurs; a neighboring valid case stays correct.

## Stop and recover

- If reproduction is unavailable, label hypotheses and investigate without presenting a speculative patch as a verified fix.

## Example request

An expired discount crashes checkout. Reproduce and preserve the error format.
