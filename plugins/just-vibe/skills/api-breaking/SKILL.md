---
name: api-breaking
description: "Identify backward-incompatible API changes Use to assess consumer impact of a change; api-design creates the intended contract."
---

# api-breaking

Identify backward-incompatible API changes

## Choose this workflow

Use to assess consumer impact of a change; api-design creates the intended contract.

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
- Compare field presence/types, enum values, validation, defaults, error/status behavior, pagination and timing guarantees against identified consumers.

## Decision branches

- **When a syntactically additive change affects strict decoders or behavior:** Classify its actual consumer impact and propose rollout/deprecation evidence.

## Deliver and verify

- Breaking-change report with examples and migration options.
- Change/consumer/impact matrix with compatibility bridge and unknown consumers.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Narrowed validation is recognized as potentially breaking; an additive field is evaluated against actual strict-client behavior.

## Stop and recover

- Missing consumer information prevents universal compatibility claims. Do not equate schema compatibility with semantic compatibility.

## Example requests

- **Normal (inspect):** Compare these API versions for validation and response-contract breaks.
- **edge (inspect):** Review a new enum value and a stricter validation rule for old clients.
- **blocked (inspect):** Assess compatibility without consumer source; avoid declaring universal backward compatibility.
