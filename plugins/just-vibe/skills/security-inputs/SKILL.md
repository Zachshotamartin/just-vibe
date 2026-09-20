---
name: security-inputs
description: "Audit validation and injection risks at input boundaries"
---

# security-inputs

Audit validation and injection risks at input boundaries

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

## Deliver and verify

- Evidence-backed findings or justified protections with focused remediation.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A concatenated query path is assessed end to end; safe parameterization is not flagged solely due to user input presence.

## Stop and recover

- No destructive payloads or third-party probing. Unsupported exploitability remains a risk hypothesis rather than a confirmed breach.

## Example request

Trace untrusted filters to SQL and template sinks without active remote probing.
