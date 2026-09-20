---
name: debug
description: "Investigate and explain a failure before changing code Use to identify a cause and next experiment; fix applies a requested repair."
---

# debug

Investigate and explain a failure before changing code

## Choose this workflow

Use to identify a cause and next experiment; fix applies a requested repair.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; failure evidence, environment, and expected behavior. Running a reproduction that writes requires apply mode or explicit execution authorization.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Diagnosis and narrowing; no automatic code repair.

None by default. Plan artifacts may be saved when requested.

## Execute

- Build a hypothesis list, inspect logs and code, seek evidence that distinguishes causes, and identify the smallest next experiment.
- Rank hypotheses by discriminating observations, trace the first divergence from expected behavior, and use bounded probes rather than repeated full runs.

## Decision branches

- **When logs establish symptoms but not causation:** Report competing hypotheses and the lowest-cost observation that separates them.

## Deliver and verify

- Most supported cause, supporting/contradicting evidence, and a proposed fix or reproduction step.
- Hypothesis table with supporting/contradicting evidence and the next targeted probe.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Eliminates an initially plausible false cause; insufficient evidence yields ranked hypotheses, not false certainty.

## Stop and recover

- Avoid repeated identical probes. Do not mutate production or install debugging tools implicitly.

## Example requests

- **Normal (inspect):** Investigate intermittent checkout failures from these logs; do not change files.
- **edge (inspect):** Diagnose a timeout that occurs only after a successful database write.
- **blocked (inspect):** Diagnose using redacted logs only; do not restart services or infer missing spans.
