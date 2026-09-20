---
name: verify
description: "Run relevant checks and report supporting evidence Use to establish evidence for explicit completion criteria; test authors missing checks."
---

# verify

Run relevant checks and report supporting evidence

## Choose this workflow

Use to establish evidence for explicit completion criteria; test authors missing checks.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply because checks may create artifacts; target change and claimed success criteria. Inspect mode reads existing evidence only.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Relevant tests, builds, type checks, and runtime validation; no automatic repairs.

Only the requested local changes; external actions require their exact action and target in session authorization. Requested proof collection may write local .just-vibe evidence/reports and browser artifacts; it does not authorize repairs or external writes.

## Execute

1. Read the relevant package scripts and changed behavior before choosing checks. Identify scripts that install, deploy, seed shared databases or make external calls before running them.
2. Execute the relevant bounded checks with the active host tool and capture actual exit code, revision, output summary and any generated artifacts. Use read-only existing evidence in inspect mode.
3. Do not repair failures unless the user also requested repair. Keep failed, blocked and unrun checks separate from passes; identify pre-existing failures only with evidence.
4. When the user requests an evidence report or the task needs durable acceptance tracking, read the proofs guide. Translate the actual acceptance criteria into automated assertions and separate human-review criteria; include all relevant source, tests, configuration and lockfiles in each bounded declared scope.
5. Create a proof and collect actual targeted command/browser/GitHub/Vercel/migration observations as appropriate. Inspect stored commands and target identity before running them. Source mutations, timeouts, partial output and pending remote state do not pass a criterion.
6. Capture requested browser screenshots only on authorized non-sensitive targets. A deployed URL needs independent revision identity; local file hashes do not prove which source it serves. Reconcile that limitation in the report.
7. Record human acceptance only from a real attributed review of the exact file/render identities. An agent cannot fill in user approval, and an attached claim cannot pass an automated criterion. Keep subjective judgment separate from executable evidence.
8. Recompute freshness and open the generated local HTML report. Explain missing, failed, stale or human-pending criteria and uncovered dependencies; a report is not an objective overall quality score.

Task-specific method: Select checks from project scripts and changed behavior, inspect commands for side effects, run bounded checks, and associate results with the tested revision. Map every criterion to an existing check, inspected artifact or bounded interaction; inspect script side effects and record the revision and environment.

## Technical method

- **Inspect:** Map requested outcomes to artifact identities and available checks, including any human acceptance.
- **Apply:** Execute the relevant checks, record actual status/output and preserve requirement-linked evidence without replacing missing observations with assertions.
- **Avoid misdiagnosis:** A green command on another revision or a screenshot of one state cannot establish all acceptance criteria.
- **Check the result:** Check evidence freshness against files/revisions and report incomplete, blocked or human-accepted criteria distinctly.

## Read when relevant

- A task needs a reviewable acceptance report or durable evidence: [Requirement evidence](../../references/proofs.md).

## Decision branches

- **When a required check is unavailable or fails before exercising behavior:** Mark that criterion unverified and report the prerequisite separately from product failure.
- **When automated behavior is correct but a subjective criterion is unresolved:** Report the automated evidence and leave human acceptance pending rather than manufacturing a pass.

## Deliver and verify

- Check results, exit statuses, covered criteria, and blocked/unverified areas.
- Criterion/check/result matrix with commands, exit statuses, revision and gaps.
- Requirement-linked proof report with check output, optional screenshots, freshness, attributed human review and remaining gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A failing command produces a failed result; unavailable dependencies remain blocked rather than skipped into an overall pass.

## Stop and recover

- Do not run deployment scripts as verification. Separate pre-existing failures from introduced failures using evidence.

## Example requests

- **Normal (apply):** Verify this checkout change using the project checks; report blocked checks.
- **edge (apply):** Verify a fix where unit tests pass but the browser build fails.
- **blocked (inspect):** Review existing CI artifacts without running commands or treating stale results as current.
