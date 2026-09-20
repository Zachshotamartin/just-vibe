---
name: react-forms
description: "Implement validation, submission, errors, and pending states Use for form validation/submission and recovery; backend-permissions supplies authoritative access checks."
---

# react-forms

Implement validation, submission, errors, and pending states

## Choose this workflow

Use for form validation/submission and recovery; backend-permissions supplies authoritative access checks.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; fields, validation rules, submission contract, and accessibility requirements.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Input state, validation, submission, errors, pending/success, and recovery.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Reuse form conventions, separate client convenience from server authority, preserve input after failures, prevent unintended duplicates, and verify focus/error announcements.
- Model editing, validating, submitting, rejected and successful states; preserve entered values and map server field/global errors to usable focus and announcements.

## Decision branches

- **When duplicate clicks or retries can create duplicate effects:** Coordinate UI pending state with server idempotency; disabling a button alone is insufficient.

## Deliver and verify

- Form implementation and behavior checks.
- Field/error contract, submission state machine and keyboard/server-failure checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Invalid input is actionable without losing data; server rejection and double submission have deliberate outcomes.

## Stop and recover

- Do not invent business validation or trust client validation as authorization. Real submissions use only the authorized environment.

## Example requests

- **Normal (apply):** Build invitation submission with validation, pending, server-error, and retry states.
- **edge (apply):** Fix a form that loses input after server rejection and allows repeated submission.
- **blocked (inspect):** Review a form without sending real account or payment requests.
