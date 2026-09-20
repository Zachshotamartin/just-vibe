---
name: decision-premortem
description: "Assume a proposal failed and identify plausible causes Use to analyze plausible future failure of a proposal; ops-postmortem reconstructs an actual incident."
---

# decision-premortem

Assume a proposal failed and identify plausible causes

## Choose this workflow

Use to analyze plausible future failure of a proposal; ops-postmortem reconstructs an actual incident.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Decisions methods](../../references/packs/decisions.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; proposal, success definition, operating context, and time horizon.

the decision question, constraints, alternatives or permission to identify them, and relevant project evidence. Current vendor claims and prices require current authoritative sources during execution. Scores are decision aids, not facts.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Plausible reasons the proposal could fail and preventive actions.

None by default. Plan artifacts may be saved when requested.

## Execute

- Assume the outcome failed, trace realistic causal chains, rank impact/likelihood, identify early signals, and propose proportionate mitigations.
- Work backward from a concrete failed outcome through design choices, contributing conditions and observable warning signs.

## Technical method

- **Inspect:** Inspect dependency assumptions, operational ownership, adoption constraints and failure recovery.
- **Apply:** Build a plausible trigger-to-impact chain for each material failure, then identify an early signal and an intervention that breaks that chain.
- **Avoid misdiagnosis:** Generic risks with no mechanism or observable warning cannot guide implementation.
- **Check the result:** Test whether each mitigation addresses its stated mechanism and whether a responder could detect the signal in time.

## Decision branches

- **When a risk cannot be connected to this proposal:** Remove the generic warning and focus on mechanisms supported by context.

## Deliver and verify

- Failure scenarios, warning indicators, mitigations, and untested assumptions.
- Failure chain, early signal, mitigation, response and residual uncertainty.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Risks connect to specific proposal choices; a mitigation includes a detectable signal or concrete action.

## Stop and recover

- Do not present hypothetical failures as observed incidents or pad the report with generic catastrophes unrelated to the design.

## Example requests

- **Normal (plan):** Identify plausible ways the migration plan could fail and early warning signs.
- **edge (plan):** Premortem a rollout whose rollback cannot undo generated data.
- **blocked (inspect):** Analyze hypothetical failure without treating it as an observed incident.
