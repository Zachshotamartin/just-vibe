---
name: test-property
description: "Check invariants across generated inputs and edge cases Use for general invariants over generated inputs; test-regression freezes a known counterexample."
---

# test-property

Check invariants across generated inputs and edge cases

## Choose this workflow

Use for general invariants over generated inputs; test-regression freezes a known counterexample.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; invariant, valid input domain, boundaries, and existing generator framework.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Requested bounded verification may use owned isolated fixtures without authorizing product edits or live-system tests. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

- **Infer from evidence:** Read behavior contracts, existing runners and test conventions; distinguish fixture setup failure from a behavioral failure.
- **Reasonable default:** Use the smallest existing local runner and isolated synthetic fixtures that distinguish the requested behavior.
- **Ask only when needed:** Ask about an unresolved contract that changes the expected result, or the target/load limits before external testing; do not ask the user to choose a runner already configured.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Generated tests for meaningful algebraic/business properties, not arbitrary random inputs.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Define preconditions and generators, implement invariants, bound execution, shrink failures, and preserve a reproducible seed/minimal counterexample.
2. Define preconditions and generators independently of the implementation, include important boundaries and preserve shrunk failures and seeds.
## Technical method

- **Inspect:** Define an invariant from the contract, constructive valid generators and bounded trial/shrink budgets.
- **Method:** Generate meaningful edge distributions and preserve seeds/counterexamples; use an independent oracle where one exists.
- **Avoid misdiagnosis:** A round-trip property can pass when encoder and decoder share the same defect; excessive filtering hides hard inputs.
- **Check the result:** Show a known violating implementation is detected and that shrunk examples still satisfy the generator's preconditions.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Testing worked example](../../references/examples/testing.md).


## Decision branches

- **When filtering discards most generated inputs:** Improve the generator's valid-domain construction instead of hiding the difficult cases.

## Deliver and verify

- Property tests, domain rationale, and results/counterexamples.
- Property/domain rationale, generator behavior and minimal counterexample on failure.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A seeded defect yields a useful reduced case; generators cover important boundaries rather than filtering nearly everything out.

## Stop and recover

- Do not assert a tautology copied from implementation or discard failing inputs simply to make the property pass.

## Example requests

- **Normal (apply):** Test that pagination preserves ordering and uniqueness across generated inputs.
- **edge (apply):** Test serialization round trips including Unicode and empty values.
- **blocked (inspect):** Review a proposed property without adopting a new test library or claiming executed coverage.
