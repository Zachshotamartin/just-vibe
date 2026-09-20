---
name: api-contract-test
description: "Verify provider and consumer expectations"
---

# api-contract-test

Verify provider and consumer expectations

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

## Deliver and verify

- Contract tests, fixture provenance, and execution results.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Removing a required response field fails; implementation changes preserving the contract remain valid.

## Stop and recover

- Do not make mocks the sole evidence that the real provider conforms. Missing provider execution is a stated coverage gap.

## Example request

Test invoice producer and consumer contracts against isolated fixtures.
