---
name: security
description: "Examine concrete security risks in a defined scope Use for a scoped security review; security-* commands investigate one specific attack surface."
---

# security

Examine concrete security risks in a defined scope

## Choose this workflow

Use for a scoped security review; security-* commands investigate one specific attack surface.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; application boundary, threat concerns, and authorized environment.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Concrete security risks in the specified system; no intrusive remote scanning or automatic remediation.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify trust boundaries, follow untrusted input and access checks, use safe evidence, and prioritize exploitable paths over generic advice.
- Identify entry points, assets and trust boundaries, then trace the complete attacker-controlled path to a sensitive effect and existing controls.

## Decision branches

- **When suspicious code is protected by an earlier verified boundary:** Explain the effective protection and avoid a confirmed-vulnerability label.

## Deliver and verify

- Findings with prerequisites, impact, evidence, and remediation options.
- Findings with attacker prerequisites, reachable path, evidence, impact and remediation.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A reachable authorization gap is explained; a suspicious function with effective protections is not automatically labeled vulnerable.

## Stop and recover

- Do not expose secrets or user records as proof. Missing environment access narrows confidence and coverage.

## Example requests

- **Normal (inspect):** Audit authorization around invoice exports using source evidence only.
- **edge (inspect):** Audit an export endpoint with tenant filtering and an alternate download route.
- **blocked (inspect):** Review source only without probing real accounts or using suspected credentials.
