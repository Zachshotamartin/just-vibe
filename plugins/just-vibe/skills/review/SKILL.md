---
name: review
description: "Review a change for actionable bugs and regressions"
---

# review

Review a change for actionable bugs and regressions

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; diff, branch/base, or files and review priorities. Requires the actual comparison target.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Actionable defects introduced by the change; no unsolicited edits or external review submission.

None by default. Plan artifacts may be saved when requested.

## Execute

- Read the diff and surrounding contracts, trace affected callers, assess severity, and suppress speculative or duplicate findings.

## Deliver and verify

- Prioritized findings with locations, triggering conditions, impact, and verification gaps; explicitly state when none are found.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A demonstrated regression includes a reproducible trigger; a pre-existing unrelated issue is not attributed to the patch.

## Stop and recover

- Missing base revisions block confident change attribution. Do not manufacture findings to fill a template.

## Example request

Review this branch against main for behavioral regressions.
