---
name: review
description: "Review a change, selected files, or an entire repository for actionable defects Use for evidence-backed code review of a diff or current source. Choose a security/domain audit when the requested scope is that specific risk surface."
---

# review

Review a change, selected files, or an entire repository for actionable defects

## Choose this workflow

Use for evidence-backed code review of a diff or current source. Choose a security/domain audit when the requested scope is that specific risk surface.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect. Select diff review for an explicit base/PR, repository review for a broad request, or file review for named paths. General source review does not require a base revision.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve diff/base for a named PR or branch comparison; otherwise use the current repository or named files and report scope. Inspect callers, contracts and current tests.
- **Reasonable default:** For “general code review,” examine current source and important integration boundaries without requiring a clean diff or inventing change attribution.
- **Ask only when needed:** Ask only if the repository or intended comparison is ambiguous. Missing runtime access limits verification; it does not block source-established findings.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Actionable defects in the requested scope. Attribute introduced regressions only when comparison evidence establishes them; label existing issues separately.

No product edits or external review submission. A code review permits bounded local reproduction with synthetic data in owned temporary fixtures; preserve the reviewed tree and existing user work. Repair requires a repair request.

## Execute

1. Select diff, repository or file review from the actual request. For diff review resolve base and head; for repository/file review map relevant entry points, persistence and effect boundaries before sampling implementations.
2. Read surrounding contracts and callers, then select only matching security/language/domain guides. Trace input through transformation, side effect and persisted/report output; check the composed behavior as well as individual helpers.
3. For each suspected defect establish the input/state trigger, reachable impact and expected invariant. Try to disprove it using existing guards or an isolated legitimate control. Reconfirm locations; distinguish source reasoning, exercised regressions and unavailable runtime evidence.
4. Report prioritized actionable findings or an honest no-findings result with coverage limits. Do not fill a quota or repair the code during review. For a follow-up repair request, retain the exact selected findings and exclusions across “continue” messages.
## Technical method

- **Inspect:** Inspect the selected diff/base, repository or file scope, surrounding contracts, callers, tests and generated artifacts.
- **Method:** Use the review guide to select relevant security, async, data and compatibility checks; require trigger, reachable impact and location.
- **Avoid misdiagnosis:** Style preferences, file length or theoretical edge cases without a trigger are not automatically defects.
- **Check the result:** Challenge each finding with an existing guard or safe control, recheck changed head identity and return zero findings when evidence supports it.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Reviewing code or security boundaries: select and read the matching technical branches before concluding: [Review selection and evidence](../../references/security/review.md).
- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).

## Decision branches

- **When the user requests a general repository review:** Inspect existing source and cross-module boundaries; no base is required. Existing defects remain reportable without claiming they were introduced by a recent patch.
- **When the user names files:** Limit findings to those files and their necessary callers/contracts; report unexamined areas rather than expanding into an unsolicited audit.
- **When the head changed while reviewing a diff:** Recheck findings against the new diff before reporting or any authorized submission.

## Deliver and verify

- Prioritized findings with locations, triggering conditions, impact, and verification gaps; explicitly state when none are found.
- Severity, location, trigger, impact, proposed correction and verification gap per finding.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A demonstrated regression includes a reproducible trigger; a pre-existing unrelated issue is not attributed to the patch.

## Stop and recover

- Missing base revisions block confident change attribution only; continue a clearly requested current-source review. Do not manufacture findings to fill a template.

## Example requests

- **Normal (inspect):** Review this branch against main for behavioral regressions.
- **edge (inspect):** Review a PR with unrelated pre-existing warnings and a recently rebased head.
- **blocked (inspect):** Review supplied diff only; mark missing surrounding source and tests as coverage limits.
- **repository (inspect):** Do a general code review of this repository; identify existing bugs and useful improvements without editing the product.
- **files (inspect):** Review the evidence recorder and its callers for output-handling defects.
