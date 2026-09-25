---
name: security-dependencies
description: "Assess findings against actual application exposure Use for advisory-driven dependency risk; deps covers general maintenance and compatibility, and security-fix applies a confirmed advisory remediation."
---

# security-dependencies

Assess findings against actual application exposure

## Choose this workflow

Use for advisory-driven dependency risk; deps covers general maintenance and compatibility, and security-fix applies a confirmed advisory remediation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; manifests/lockfiles, advisory evidence, deployment use, and update constraints.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

- **Infer from evidence:** Resolve the requested surface, source/runtime version, reachable callers and actual trust/access boundaries.
- **Reasonable default:** Start with source analysis and bounded owned fixtures; treat scanner output as leads and preserve legitimate controls.
- **Ask only when needed:** Ask when target authorization or necessary trust semantics are unresolved before active probing; source inspection need not wait for production access.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Dependency vulnerability relevance and remediation feasibility.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Verify resolved versions against current authoritative advisories, inspect reachable use/configuration, distinguish runtime/dev exposure, and recommend compatible updates or mitigations.
2. Match advisories to resolved versions and configurations, trace deployed/reachable usage and distinguish development-only tooling from production exposure.
## Technical method

- **Inspect:** Read resolved lockfile versions, ecosystem, installed scanner/version and current authoritative advisories.
- **Method:** Distinguish advisory match, deployed reachability and fix compatibility; record tool exit status and advisory freshness with coverage.
- **Avoid misdiagnosis:** An audit error or unsupported lockfile is unknown, not clean; a CVE match alone does not prove the vulnerable function is reachable.
- **Check the result:** Verify fixed version resolution and the affected behavior after a supported update; retain remaining findings and failed/offline checks.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Security worked example](../../references/examples/security.md).
- Dependencies, builds, secrets, hooks or privileged execution cross a trust boundary: [Dependency and execution provenance](../../references/security/supply-chain.md).
- An available scanner or dependency advisory check can answer the scoped question: [Scanner selection and evidence](../../references/security/scanners.md).
- The affected project uses Django / DRF: [Django / DRF](../../references/frameworks/django.md).
- The affected project uses FastAPI: [FastAPI](../../references/frameworks/fastapi.md).
- The affected project uses Spring Boot: [Spring Boot](../../references/frameworks/spring-boot.md).
- The task specifically involves bug bounty, authorized pentest, security proof; load only the matching method: [Authorized vulnerability research](../../references/methods/authorized-security-research.md).

## Decision branches

- **When a fix requires a breaking upgrade:** Compare supported mitigation and migration paths; do not suppress the advisory or force unrelated upgrades.

## Deliver and verify

- Prioritized findings with advisory references, exposure rationale, and remediation checks.
- Advisory/version/reachability matrix and tested remediation options.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A transitive runtime exposure is traced; an advisory mismatch or mitigated precondition is explained accurately.

## Stop and recover

- No forced major upgrades or automatic suppression. Missing advisory access means unknown coverage, not a clean security bill.

## Example requests

- **Normal (inspect):** Assess advisories against resolved versions and reachable runtime use.
- **edge (inspect):** Assess a transitive vulnerability behind an unused optional feature.
- **blocked (inspect):** Inspect the lockfile without current advisory access; report unknown coverage.
