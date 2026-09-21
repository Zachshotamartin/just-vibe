# External compute and control bridge integration

Use when: ito compute, nasiko, insaits, compute rfq, provider bridge.

Prepare an optional vendor integration using its actually available versioned API and account.

## Inspect first

- Installed connector/package provenance and version
- Authentication identity, endpoint and service availability
- Resource/cost limits, data sent and cancellation behavior

## Method

1. Start with read-only capability discovery and authoritative documentation. A recipe, package name or sponsored upstream directory does not establish a working backend.
2. Map the requested operation onto a typed provider contract with request ID, input/artifact identity, deadline and explicit effect/cost class.
3. Use environment-held credentials and approved transport. Preview data egress, resource shape and exact purchase/deploy/RFQ effect before an authorized call.
4. Handle unavailable products as unavailable. Offer an installed provider-neutral adapter only when it can satisfy the same request; do not fabricate inference/training support.

## Failure cases

- A remote bootstrap script is executed during discovery.
- An RFQ or paid compute reservation is mistaken for a harmless health check.
- A timeout causes a second paid job.

## Verification

- Run a local contract fixture covering failure, cancellation and duplicate requests.
- Verify account and API version separately for live use.
- Report live availability and test scope honestly.

## Worked scenario

An Itô compute quote bridge can be documented independently from an unavailable managed inference endpoint; one does not imply the other exists.

## Version-sensitive primary references

- [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/latest) — Read the official source for the installed version before relying on a version-sensitive API.
- [owasp.org](https://owasp.org/www-project-api-security/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
