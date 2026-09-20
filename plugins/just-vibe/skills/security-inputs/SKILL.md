---
name: security-inputs
description: "Audit validation and injection risks at input boundaries Use for injection and unsafe interpreter boundaries; llm-injection handles model instruction confusion."
---

# security-inputs

Audit validation and injection risks at input boundaries

## Choose this workflow

Use for injection and unsafe interpreter boundaries; llm-injection handles model instruction confusion.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; entry points, input formats, interpreters/sinks, and relevant source.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Injection, unsafe parsing, traversal, and validation gaps along reachable paths.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace untrusted values through transformations to sensitive sinks, assess contextual escaping/parameterization, distinguish validation from authorization, and propose safe regression cases.
- Trace source, transformations, validation and final sink; assess parameterization or contextual encoding at the actual interpreter boundary.

## Decision branches

- **When the input reaches a safe parameterized sink:** Do not flag injection solely because the input is user controlled; inspect other reachable sinks separately.

## Deliver and verify

- Evidence-backed findings or justified protections with focused remediation.
- Source-to-sink path, required conditions and safe regression fixture.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A concatenated query path is assessed end to end; safe parameterization is not flagged solely due to user input presence.

## Stop and recover

- No destructive payloads or third-party probing. Unsupported exploitability remains a risk hypothesis rather than a confirmed breach.

## Example requests

- **Normal (inspect):** Trace untrusted filters to SQL and template sinks without active remote probing.
- **edge (inspect):** Review SQL and template paths where only one uses unsafe concatenation.
- **blocked (inspect):** Inspect source without sending destructive payloads or probing third parties.
