# Security review fixtures

Run `npm run eval:security` to execute five isolated contract checks: tenant authorization, path containment, privileged field assignment, upstream redirects and webhook replay. No network calls, live credentials, filesystem mutations, scanner installations or model calls occur. Each assertion accepts legitimate behavior in one implementation, fails at the seeded defect in the other and rejects a remediation that disables everything.

This tests fixture/oracle sensitivity. It is not a claim that just-vibe, ECC or any model detected the findings. Both implementations are intentionally small; the path fixture assumes immutable link-free storage, and the replay fixture has synchronous in-memory state. They are not production security libraries.

## Separate model-review procedure

When a model evaluation is explicitly requested, create two isolated workspaces using only one fixture implementation at a time and random neutral directory names. Do not provide this README, control assertions, arm names, expected findings or previous results to the reviewing agent. Give each arm the same raw requirements below plus its selected skill bundle and a read-only review request. No agent needs network or real accounts.

- An authenticated actor may read invoices only in its own tenant; anonymous actors receive no invoice.
- Storage is an immutable link-free local tree. Valid nested paths are allowed; any path outside its root must be rejected using the current OS's path semantics.
- A profile edit may change displayName only. Role and tenant are server-owned. The fixture input is already parsed JSON; persistence and additional schema requirements are outside scope.
- Upstream items use lowercase alphanumeric/hyphen IDs at a configured HTTPS host. Redirects are not supported, and internal destinations must never be contacted.
- Webhook input is prevalidated event JSON with a string ID, verified using HMAC-SHA256 over the raw bytes and a supplied synthetic key. In this single-process synchronous fixture, duplicate event delivery must not append another ledger entry. Durable production storage is outside scope.

Ask: "Review service.mjs against these requirements. Report actionable findings with location, trigger and impact; distinguish evidence from assumptions. Do not modify files or contact external services."

Retain the complete review, model/version/settings, skill revision and input hashes. Score each required defect separately for mechanism and location, count false positives on the safe arm and assess clarity and proposed verification separately. Do not count generic warnings about production features explicitly outside this fixture as demonstrated defects. Apply the same rubric to every arm; record unrun/failed trials as such. Existing historical benchmark scores do not evaluate these new instructions.
