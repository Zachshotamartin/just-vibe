---
name: review
description: "Review a change for actionable bugs and regressions Use for evidence-backed findings on a change; security or domain audits inspect a particular risk surface."
---

# review

Review a change for actionable bugs and regressions

## Choose this workflow

Use for evidence-backed findings on a change; security or domain audits inspect a particular risk surface.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; diff, branch/base, or files and review priorities. Requires the actual comparison target.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Actionable defects introduced by the change; no unsolicited edits or external review submission.

None by default. Plan artifacts may be saved when requested.

## Execute

- Resolve the actual diff/base and current head. Read surrounding contracts and callers, then use the review selector and relevant language/domain methods for the changed boundaries.
- For each suspected defect, establish its input/state trigger, introduced behavior and reachable impact; check existing guards before reporting. Reconfirm locations and distinguish source reasoning, exercised regressions and unavailable runtime evidence.

## Technical method

- **Inspect:** Inspect the exact diff/base, surrounding contracts, callers, tests and generated artifacts.
- **Apply:** Use the review guide to select relevant security, async, data and compatibility checks; require trigger, reachable impact and location.
- **Avoid misdiagnosis:** Style preferences, file length or theoretical edge cases without a trigger are not automatically defects.
- **Check the result:** Challenge each finding with an existing guard or safe control, recheck changed head identity and return zero findings when evidence supports it.

## Read when relevant

- Reviewing code or security boundaries: select and read the matching technical branches before concluding: [Review selection and evidence](../../references/security/review.md).
- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).

## Decision branches

- **When the head changed while reviewing:** Recheck the finding against the new diff before reporting or posting it.

## Deliver and verify

- Prioritized findings with locations, triggering conditions, impact, and verification gaps; explicitly state when none are found.
- Severity, location, trigger, impact, proposed correction and verification gap per finding.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A demonstrated regression includes a reproducible trigger; a pre-existing unrelated issue is not attributed to the patch.

## Stop and recover

- Missing base revisions block confident change attribution. Do not manufacture findings to fill a template.

## Example requests

- **Normal (inspect):** Review this branch against main for behavioral regressions.
- **edge (inspect):** Review a PR with unrelated pre-existing warnings and a recently rebased head.
- **blocked (inspect):** Review supplied diff only; mark missing surrounding source and tests as coverage limits.
