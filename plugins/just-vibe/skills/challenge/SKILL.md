---
name: challenge
description: "Identify weak assumptions, complexity, and failure cases"
---

# challenge

Identify weak assumptions, complexity, and failure cases

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; proposal, plan, architecture, or hypothesis and its success criteria.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Test assumptions and failure modes; no adversarial criticism for its own sake and no implementation changes.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify critical assumptions, search for disconfirming evidence, construct plausible edge cases, and rank issues by impact and likelihood.

## Deliver and verify

- Evidence-backed challenges, questions that matter, and smaller or more robust alternatives.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A supported assumption remains accepted; a serious unsupported dependency receives a concrete validation step.

## Stop and recover

- Separate demonstrated flaws from speculative concerns. Do not demand certainty where a reversible experiment resolves the risk.

## Example request

Challenge the assumption that every notification needs a separate service.
