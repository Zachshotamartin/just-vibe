---
name: security-secrets
description: "Locate exposed credentials without printing secret values Use to locate possible exposed credentials; security-config inspects deployment settings."
---

# security-secrets

Locate exposed credentials without printing secret values

## Choose this workflow

Use to locate possible exposed credentials; security-config inspects deployment settings.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; repository/history/log scope and approved scanner capability.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Locate likely exposed secrets and identify containment needs; no implicit credential rotation or history rewrite.

None by default. Plan artifacts may be saved when requested.

## Execute

- Scan the specified sources with redacted output, distinguish placeholders from plausible secrets, map exposure surfaces, and propose owner/provider-specific remediation.
- Run approved scanners with redacted output over the requested scope, classify placeholders and locate exposure surfaces without copying values into reports.

## Decision branches

- **When a plausible credential is found:** Record location/type and rotation owner/provider steps; do not test it against a live service by default.

## Deliver and verify

- Redacted locations/types, confidence, exposure context, and containment plan.
- Redacted findings, exposure scope, uncertainty and remediation sequence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A committed credential is reported without its value; test placeholders do not inflate findings blindly.

## Stop and recover

- Never test suspected credentials against live providers without authorization. Do not copy secrets into reports, shell history, or external scanners.

## Example requests

- **Normal (inspect):** Scan the requested repository scope with redacted findings only.
- **edge (inspect):** Scan history containing both test placeholders and a plausible credential.
- **blocked (inspect):** Assess secret handling without an approved scanner; do not upload the repository.
