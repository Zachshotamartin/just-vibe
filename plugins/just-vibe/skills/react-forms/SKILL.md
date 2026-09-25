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

- **Infer from evidence:** Read component callers, ownership of state, installed React/framework versions and existing interaction tests.
- **Reasonable default:** Retain the framework and state library; preserve intended loading/error/empty behavior while resolving the named bug.
- **Ask only when needed:** Ask when product semantics such as persistence, optimistic failure or reset behavior have conflicting evidence; missing profiler access only blocks measured performance claims.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Input state, validation, submission, errors, pending/success, and recovery.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Reuse form conventions, separate client convenience from server authority, preserve input after failures, prevent unintended duplicates, and verify focus/error announcements.
2. Model editing, validating, submitting, rejected and successful states; preserve entered values and map server field/global errors to usable focus and announcements.
## Technical method

- **Inspect:** Inspect validation ownership, input types, submission identity, pending state and server error shape.
- **Method:** Preserve draft values on recoverable errors, map field/general errors and handle concurrent or uncertain submissions deliberately.
- **Avoid misdiagnosis:** A disabled button alone does not prevent retries or duplicate server effects; number parsing can turn an empty field into zero.
- **Check the result:** Test invalid, empty, zero, double-submit, delayed response and retry cases; verify labels, error associations and focus.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [React worked example](../../references/examples/react.md).
- Creating, editing or reviewing frontend UI, copy, states or visual assets: [Frontend iconography](../../references/frontend-icons.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- The task specifically involves react testing, react race, hydration mismatch, react strictmode; load only the matching method: [React state, async and render evidence](../../references/methods/react-behavior.md).

## Decision branches

- **When duplicate clicks or retries can create duplicate effects:** Coordinate UI pending state with server idempotency; disabling a button alone is insufficient.
- **When the form uses React 19 Actions (form action or useActionState):** A completed Action resets uncontrolled fields even when it returns validation errors as state. When input must survive a rejection, return the submitted values and bind defaultValue to them, use controlled inputs, or submit through onSubmit with startTransition. Use useFormStatus for pending UI, and useOptimistic only with reconciliation against the server result.

## Deliver and verify

- Form implementation and behavior checks.
- Field/error contract, submission state machine and keyboard/server-failure checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Invalid input is actionable without losing data; server rejection and double submission have deliberate outcomes.
- A server rejection under a form Action retains the entered field values.

## Stop and recover

- Do not invent business validation or trust client validation as authorization. Real submissions use only the authorized environment.

## Example requests

- **Normal (apply):** Build invitation submission with validation, pending, server-error, and retry states.
- **edge (apply):** Fix a form that loses input after server rejection and allows repeated submission.
- **blocked (inspect):** Review a form without sending real account or payment requests.
