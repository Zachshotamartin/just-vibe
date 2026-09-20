---
name: security-fix
description: "Implement and verify remediation for an identified vulnerability Use to repair a confirmed scoped vulnerability; security produces findings before remediation."
---

# security-fix

Implement and verify remediation for an identified vulnerability

## Choose this workflow

Use to repair a confirmed scoped vulnerability; security produces findings before remediation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; confirmed vulnerability, affected versions/paths, desired compatibility, and safe reproduction.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

- **Infer from evidence:** Resolve the requested surface, source/runtime version, reachable callers and actual trust/access boundaries.
- **Reasonable default:** Start with source analysis and bounded owned fixtures; treat scanner output as leads and preserve legitimate controls.
- **Ask only when needed:** Ask when target authorization or necessary trust semantics are unresolved before active probing; source inspection need not wait for production access.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Remediation of the identified weakness and necessary regression coverage.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Verify the vulnerable path, implement the control at the correct boundary, test abuse and legitimate behavior, inspect alternate paths, and document remaining operational work.
2. Reproduce the affected path in a safe fixture, enforce the control at the owning boundary and test legitimate behavior plus alternate bypass routes.
## Technical method

- **Inspect:** Resolve the established attacker path, prerequisite, original behavior, affected callers and accepted compatibility requirements.
- **Method:** Repair the enforcing boundary rather than adding a pattern-specific block; retain normal behavior and check alternate encodings/entry points.
- **Avoid misdiagnosis:** Hiding a scanner warning or adding client validation can leave the server exploit path intact.
- **Check the result:** Demonstrate the original unsafe behavior with an isolated regression, then verify rejection and legitimate behavior after remediation; rerun relevant available scanners.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Security worked example](../../references/examples/security.md).
- Reviewing code or security boundaries: select and read the matching technical branches before concluding: [Review selection and evidence](../../references/security/review.md).
- Untrusted values reach queries, commands, rendering, URLs or parsers: [Injection and interpreter boundaries](../../references/security/injection.md).
- An available scanner or dependency advisory check can answer the scoped question: [Scanner selection and evidence](../../references/security/scanners.md).

## Decision branches

- **When a code fix leaves historical credential exposure or persisted bad data:** Report the remaining rotation/recovery work separately from the repaired path.

## Deliver and verify

- Patch, safe proof of remediation, tests, and residual exposure notes.
- Vulnerable trigger, boundary correction, abuse/legitimate checks and residual operational tasks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The original attack path no longer works; valid authorized behavior remains functional.

## Stop and recover

- Credential rotation, history rewriting, production changes, and public disclosure require their explicit scope. Do not claim historical exposure was erased by a code fix.

## Example requests

- **Normal (apply):** Fix the demonstrated authorization bypass and verify legitimate owner access.
- **edge (apply):** Fix an object-ownership bypass without preventing legitimate shared access.
- **blocked (inspect):** Plan remediation with no safe reproduction environment; do not claim exploitation was eliminated.
