---
name: automate
description: "Turn a repetitive process into a script or workflow Use for a repeatable local workflow; a scheduled service requires an actual separately scoped runtime."
---

# automate

Turn a repetitive process into a script or workflow

## Choose this workflow

Use for a repeatable local workflow; a scheduled service requires an actual separately scoped runtime.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; repeated process, trigger, inputs, destinations, and error expectations.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Script or workflow implementing the process; registering schedules or enabling external triggers requires that requested action.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Observe current steps, isolate deterministic operations, validate inputs, implement failure reporting and repeat behavior, and test with controlled fixtures.
2. Define inputs, output ownership, locking and idempotency; produce meaningful exit statuses and rehearse interruption between durable steps.
## Technical method

- **Inspect:** Identify repeated inputs/actions, idempotency, scheduling need, target and partial-failure behavior.
- **Method:** Build explicit arguments and stable operation identities with bounded execution and observable results.
- **Avoid misdiagnosis:** A script that retries uncertain mutations or interpolates user text into shell source can amplify failures.
- **Check the result:** Run success, repeat and interrupted cases on safe fixtures; creating a script does not mean a recurring scheduler exists.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When a previous run left partial output:** Detect its identity and either resume or stop with a reconciliation instruction; never treat partial output as success.

## Deliver and verify

- Runnable automation, usage, required permissions, and execution evidence.
- Runnable entry point, input contract, repeat-run policy and failure/exit behavior.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Repeated execution has deliberate duplicate handling; partial failure exits clearly and preserves recoverable state.

## Stop and recover

- Do not embed credentials, create unsolicited scheduled jobs, or automate ambiguous human decisions without an explicit rule.

## Example requests

- **Normal (apply):** Create a repeatable local script to validate our release artifacts.
- **edge (apply):** Automate report generation when an earlier run left half the output.
- **blocked (inspect):** Inspect automation requirements without installing a scheduler or contacting services.
