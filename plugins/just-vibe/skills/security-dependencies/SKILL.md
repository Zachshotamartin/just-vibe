---
name: security-dependencies
description: "Assess findings against actual application exposure"
---

# security-dependencies

Assess findings against actual application exposure

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; manifests/lockfiles, advisory evidence, deployment use, and update constraints.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Dependency vulnerability relevance and remediation feasibility.

None by default. Plan artifacts may be saved when requested.

## Execute

- Verify resolved versions against current authoritative advisories, inspect reachable use/configuration, distinguish runtime/dev exposure, and recommend compatible updates or mitigations.

## Deliver and verify

- Prioritized findings with advisory references, exposure rationale, and remediation checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A transitive runtime exposure is traced; an advisory mismatch or mitigated precondition is explained accurately.

## Stop and recover

- No forced major upgrades or automatic suppression. Missing advisory access means unknown coverage, not a clean security bill.

## Example request

Assess advisories against resolved versions and reachable runtime use.
