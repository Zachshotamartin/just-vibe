# Release provenance and compatibility maintenance

Use when: slsa, release provenance, adapter compliance, advisory watch.

Prepare a reproducible release with actual supported-platform evidence and clear blocked checks.

## Inspect first

- Package allowlist, generated docs and clean artifact contents
- OS/runtime/host compatibility matrix
- Registry/Git identities, release version and provenance support

## Method

1. Run structural, runtime, package-install and host-adapter checks against the release artifact, not only the checkout.
2. Use CI matrices for supported OS/runtime combinations and preserve logs/artifact hashes. Local success does not replace an unrun Windows or paid-host test.
3. Publish through a reviewed release workflow with trusted identity and supported registry provenance. Do not fabricate attestations or bypass account verification.
4. For advisory watch/announcements, use an explicitly configured schedule and requested recipients; keep drafts separate from external publication.

## Failure cases

- The tarball omits a runtime reference used by installed skills.
- A skipped CI matrix is labeled passing.
- An announcement bot sends private release material without authorization.

## Verification

- Install the packed archive into clean fixture targets and run doctor/uninstall.
- Check generated file consistency and link resolution.
- Record exact version, artifact integrity and real provenance outcome.

## Worked scenario

A release blocked by CI minutes may use an explicitly authorized waiver while documenting which matrix entries remain unverified.

## Version-sensitive primary references

- [docs.npmjs.com](https://docs.npmjs.com/generating-provenance-statements) — Read the official source for the installed version before relying on a version-sensitive API.
- [slsa.dev](https://slsa.dev/spec/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
