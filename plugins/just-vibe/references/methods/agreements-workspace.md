# Agreements, signatures and workspace operations

Use when: esignature, agreement review, workspace operations, email operations, relationship policy.

Prepare a document or workspace operation with exact recipients, roles and authority identified.

## Inspect first

- Document version, parties, signer roles and routing
- Workspace permissions, retention and audit requirements
- Current law/policy sources when relevant

## Method

1. Compare supplied versions and identify concrete clause/field changes with source locations; avoid presenting uncertain legal implications as definitive advice.
2. For signatures, validate signer identity/order, document hash, required fields and audit trail before sending an envelope.
3. For workspace/email operations, distinguish read/draft/move from external send, sharing and deletion. Keep recipient and channel rules explicit.
4. Prepare the exact reviewable action and use operation IDs for reconciliation; an agent must not attribute user-owned messages or agreements to itself.

## Failure cases

- The wrong document revision is sent for signature.
- A share link grants broader access than intended.
- A draft is sent because a tool happened to support sending.

## Verification

- Check party names, dates, amounts, attachments and permissions.
- Use a synthetic dry run where supported.
- Record actual external IDs and status without claiming signature completion from delivery alone.

## Worked scenario

A signature envelope is sent only for the reviewed PDF hash and specified signers, with changed documents requiring a fresh review.

## Version-sensitive primary references

- [www.docusign.com](https://www.docusign.com/products/electronic-signature) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.nist.gov](https://www.nist.gov/privacy-framework) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
