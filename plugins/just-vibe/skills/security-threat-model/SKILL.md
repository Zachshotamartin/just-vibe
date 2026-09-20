---
name: security-threat-model
description: "Identify assets, trust boundaries, attack paths, and mitigations Use for systematic threats to a scoped system; security-authz or security-inputs investigates a concrete path."
---

# security-threat-model

Identify assets, trust boundaries, attack paths, and mitigations

## Choose this workflow

Use for systematic threats to a scoped system; security-authz or security-inputs investigates a concrete path.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; system architecture, assets, actors, trust boundaries, and critical outcomes.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Plausible attack paths and proportionate mitigations for this system.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace data and privilege boundaries, identify entry points, model misuse scenarios, assess existing controls, and prioritize gaps by realistic impact/exposure.
- Enumerate assets, actors, entry points and trust transitions, then connect realistic misuse chains to existing controls and observable impact.

## Technical method

- **Inspect:** Inventory assets, actors, entry points, trust transitions, deployment assumptions and existing controls.
- **Apply:** Build source-to-effect attack paths with prerequisites; route relevant paths to the vulnerability and framework guides.
- **Avoid misdiagnosis:** A generic OWASP list is not a project threat model, and a hypothetical deployment must not become an observed exposure.
- **Check the result:** Walk a high-impact misuse path and its legitimate control case; distinguish demonstrated, conditional and unknown risks.

## Read when relevant

- Reviewing code or security boundaries: select and read the matching technical branches before concluding: [Review selection and evidence](../../references/security/review.md).

## Decision branches

- **When a threat depends on an unverified deployment assumption:** State the condition and required evidence instead of declaring an incident or guaranteed exploit.

## Deliver and verify

- Threat model, assumptions, prioritized mitigations, and verification scenarios.
- Boundary diagram, threat/control/gap matrix and prioritized validation.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A sensitive export path has explicit access/data-handling controls; mitigations map to concrete threats rather than generic checklists.

## Stop and recover

- Do not claim all threats are covered or infer deployment controls without evidence. Unknown architecture remains a documented gap.

## Example requests

- **Normal (plan):** Model threats around invoice exports and background processing.
- **edge (plan):** Threat-model a tenant export service with signed download links.
- **blocked (inspect):** Model threats from partial architecture without probing live systems.
