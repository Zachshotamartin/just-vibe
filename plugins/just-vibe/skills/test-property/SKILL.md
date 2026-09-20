---
name: test-property
description: "Check invariants across generated inputs and edge cases"
---

# test-property

Check invariants across generated inputs and edge cases

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; invariant, valid input domain, boundaries, and existing generator framework.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Generated tests for meaningful algebraic/business properties, not arbitrary random inputs.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Define preconditions and generators, implement invariants, bound execution, shrink failures, and preserve a reproducible seed/minimal counterexample.

## Deliver and verify

- Property tests, domain rationale, and results/counterexamples.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A seeded defect yields a useful reduced case; generators cover important boundaries rather than filtering nearly everything out.

## Stop and recover

- Do not assert a tautology copied from implementation or discard failing inputs simply to make the property pass.

## Example request

Test that pagination preserves ordering and uniqueness across generated inputs.
