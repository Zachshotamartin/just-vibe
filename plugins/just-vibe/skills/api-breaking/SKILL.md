---
name: api-breaking
description: "Identify backward-incompatible API changes"
---

# api-breaking

Identify backward-incompatible API changes

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; old/new contracts or revisions, consumer expectations, and compatibility policy.

interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Backward compatibility across schemas, semantics, authentication, errors, and timing/order guarantees.

None by default. Plan artifacts may be saved when requested.

## Execute

- Diff interfaces, inspect behavioral changes, identify affected consumers, classify compatibility impact, and propose rollout/deprecation steps.

## Deliver and verify

- Breaking-change report with examples and migration options.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Narrowed validation is recognized as potentially breaking; an additive field is evaluated against actual strict-client behavior.

## Stop and recover

- Missing consumer information prevents universal compatibility claims. Do not equate schema compatibility with semantic compatibility.

## Example request

Compare these API versions for validation and response-contract breaks.
