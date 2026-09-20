---
name: api-contract-test
description: "Verify provider and consumer expectations Use to implement consumer/provider contract checks; test-integration exercises broader dependency behavior."
---

# api-contract-test

Verify provider and consumer expectations

## Choose this workflow

Use to implement consumer/provider contract checks; test-integration exercises broader dependency behavior.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; provider/consumer expectations, versions, fixtures, and test environment.

interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Observable cross-boundary contracts; no reliance on live production state.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Identify important assumptions, build provider/consumer assertions, control fixtures, verify valid and invalid exchanges, and integrate with relevant checks.
- Derive assertions from actual consumer assumptions, control fixture identity and verify the real provider boundary when a safe environment exists.

## Technical method

- **Inspect:** Identify independently owned provider/consumer expectations and representative boundary fixtures.
- **Apply:** Exercise real serialization and decoding with valid, absent, null, unknown-field and error cases; keep mocks scoped to what they establish.
- **Avoid misdiagnosis:** A provider-generated mock validating itself is circular evidence of compatibility.
- **Check the result:** Run a known incompatible response through the consumer and a valid control; record which real boundary and version were exercised.

## Decision branches

- **When only mocks can run:** Report consumer behavior and mocked assumptions separately from provider conformance.

## Deliver and verify

- Contract tests, fixture provenance, and execution results.
- Contract cases, schema/semantic assertions and provider verification coverage.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Removing a required response field fails; implementation changes preserving the contract remain valid.

## Stop and recover

- Do not make mocks the sole evidence that the real provider conforms. Missing provider execution is a stated coverage gap.

## Example requests

- **Normal (apply):** Test invoice producer and consumer contracts against isolated fixtures.
- **edge (apply):** Test an API returning an optional field as null versus omitting it.
- **blocked (inspect):** Design contract checks with no provider runtime; do not equate a mock pass with compatibility.
