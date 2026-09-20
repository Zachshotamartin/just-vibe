---
name: security-fix
description: "Implement and verify remediation for an identified vulnerability"
---

# security-fix

Implement and verify remediation for an identified vulnerability

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; confirmed vulnerability, affected versions/paths, desired compatibility, and safe reproduction.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Remediation of the identified weakness and necessary regression coverage.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Verify the vulnerable path, implement the control at the correct boundary, test abuse and legitimate behavior, inspect alternate paths, and document remaining operational work.

## Deliver and verify

- Patch, safe proof of remediation, tests, and residual exposure notes.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The original attack path no longer works; valid authorized behavior remains functional.

## Stop and recover

- Credential rotation, history rewriting, production changes, and public disclosure require their explicit scope. Do not claim historical exposure was erased by a code fix.

## Example request

Fix the demonstrated authorization bypass and verify legitimate owner access.
