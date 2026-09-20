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

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Relevant tests, builds, type checks, and runtime validation; no automatic repairs.

Run checks when verification is requested, using existing tooling and owned isolated fixtures. They may create disposable local test/build artifacts. Do not modify product source, install dependencies or contact live systems unless that scope is separately authorized.

## Execute

1. Read the relevant package scripts and changed behavior before choosing checks. Identify scripts that install, deploy, seed shared databases or make external calls before running them.
2. Execute the relevant bounded checks with the active host tool and capture actual exit code, revision, output summary and any generated artifacts. Use existing evidence in inspect mode; checks requiring fixture writes need a scoped apply verification. Do not repair failures unless the user requested repair.
3. Keep failed, blocked and unrun checks separate from passes; identify pre-existing failures only with evidence. Stop repeating a passing check unless a new change or unresolved concern justifies it.
4. Only when an evidence report or durable acceptance tracking is requested, read the proofs guide and use its criterion, collection and report procedure. Preserve full relevant source/test/configuration identity, actual observations and evidence freshness. A deployed URL needs independent revision identity; local hashes alone cannot establish it. Separate human review from automated assertions and never invent user acceptance.
5. Report the checks actually completed and remaining limitations. If a proof report was created, recompute its freshness before opening it and include failed, stale, missing and human-pending criteria; ordinary verification requires no saved proof.
## Technical method

- **Inspect:** Map requested outcomes to artifact identities and available checks, including any human acceptance.
- **Method:** Execute the relevant checks, record actual status/output and preserve requirement-linked evidence without replacing missing observations with assertions.
- **Avoid misdiagnosis:** A green command on another revision or a screenshot of one state cannot establish all acceptance criteria.
- **Check the result:** Check evidence freshness against files/revisions and report incomplete, blocked or human-accepted criteria distinctly.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
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
