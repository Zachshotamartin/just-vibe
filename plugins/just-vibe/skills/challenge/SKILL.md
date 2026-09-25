---
name: challenge
description: "Identify weak assumptions, complexity, and failure cases. Use to test a proposal's assumptions, not to manufacture objections; decision-premortem explores a future failure story."
---

# challenge

Identify weak assumptions, complexity, and failure cases.

## Choose this workflow

Use to test a proposal's assumptions, not to manufacture objections; decision-premortem explores a future failure story.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; proposal, plan, architecture, or hypothesis and its success criteria.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Test assumptions and failure modes; no adversarial criticism for its own sake and no implementation changes.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Extract the critical assumptions as falsifiable claims.
2. Seek disconfirming evidence and plausible edge cases in current code, workload and constraints.
3. Rank issues by impact and likelihood, distinguishing observed defects from speculative risks.

## Technical method

- **Inspect:** Inspect the proposal's claimed benefits, assumptions, constraints and failure/recovery model.
- **Method:** Construct concrete counterexamples and identify evidence that could falsify the key assumption.
- **Avoid misdiagnosis:** Contrarian preferences or speculative catastrophes without a mechanism add noise.
- **Check the result:** Test whether the proposal survives the strongest relevant counterexample and distinguish resolved from open objections.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When an assumption survives the available evidence:** Keep it accepted provisionally and name evidence that would reverse the conclusion.

## Deliver and verify

- Ranked challenges, each with its trigger, consequence, evidence and a discriminating experiment, plus smaller or more robust alternatives where they exist.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A supported assumption remains accepted; a serious unsupported dependency receives a concrete validation step.

## Stop and recover

- Separate demonstrated flaws from speculative concerns. Do not demand certainty where a reversible experiment resolves the risk.

## Example requests

- **Normal (inspect):** Challenge the assumption that every notification needs a separate service.
- **Edge (inspect):** Challenge a cache proposal whose stale data could affect authorization.
- **Blocked (inspect):** Challenge this proposal without traffic data; do not invent capacity limits.
