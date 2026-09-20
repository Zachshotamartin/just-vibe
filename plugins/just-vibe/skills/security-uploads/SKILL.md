---
name: security-uploads
description: "Review file validation, storage, processing, and download access"
---

# security-uploads

Review file validation, storage, processing, and download access

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; upload/download/processing paths, storage policy, file types, and access rules.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

File validation, size limits, names/paths, processing isolation, storage exposure, and download authorization.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace file lifecycle, inspect content/type trust, object ownership, parser behavior, and resource limits; define safe malicious/invalid-file fixtures.

## Deliver and verify

- Upload threat findings, remediation priorities, and isolated test scenarios.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- User-supplied filenames cannot escape storage boundaries; private files require authorization at download as well as upload.

## Stop and recover

- Do not execute hostile files or upload dangerous content to public services. Missing processor configuration limits assurance.

## Example request

Audit file validation, processing, private storage, and download access.
