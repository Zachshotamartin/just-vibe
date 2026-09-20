---
name: spec
description: "Produce requirements, acceptance criteria, and edge cases Use to define observable product behavior before implementation; plan maps an accepted specification onto code."
---

# spec

Produce requirements, acceptance criteria, and edge cases

## Choose this workflow

Use to define observable product behavior before implementation; plan maps an accepted specification onto code.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; feature brief, users, constraints, and relevant existing contracts.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Requirements and observable behavior; no code changes or invented business policy.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect current behavior, identify actors and states, define normal/error paths, record exclusions, and turn ambiguity into explicit assumptions or decisions.
- Write actors, preconditions, state transitions and observable acceptance examples; separate business decisions from implementation preferences.

## Decision branches

- **When two requirements conflict on the same transition:** Surface the concrete conflicting example and resolve that decision before specifying dependent behavior.

## Deliver and verify

- Requirements, acceptance criteria, edge cases, compatibility needs, and unresolved questions; save only when requested.
- Requirement IDs, acceptance examples, exclusions and unresolved decision owners.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Each requirement has an observable completion condition; conflicting requirements are flagged before downstream implementation.

## Stop and recover

- Do not silently choose billing, privacy, or access policy that needs the user's decision. Continue specifying independent behavior.

## Example requests

- **Normal (plan):** Specify organization invitations, including expiry and already-registered users.
- **edge (plan):** Specify account deletion with a pending subscription and recoverable failure.
- **blocked (inspect):** Draft a specification with unknown retention policy; leave that decision explicit.
