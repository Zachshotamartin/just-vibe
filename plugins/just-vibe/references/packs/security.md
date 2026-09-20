# Security methods

Define assets, trust boundaries, entry points, authorized code/environment and relevant policies. Follow reachable data/privilege paths and distinguish demonstrated weaknesses from speculation. Read-only source audits do not authorize live attacks or third-party probing.

Authorization covers direct IDs, alternate methods, exports, jobs and tenant boundaries, using isolated identities for active checks. Input audits trace values to actual interpreters/sinks and account for contextual escaping or parameterization; user input alone is not proof of injection.

Secret scanning reports redacted location/type/confidence. Never print or validate suspected live credentials against a provider without authorization. Rotation, history rewriting and incident notification are separate actions. Upload audits follow validation, processing, path/storage boundaries and download authorization; do not execute hostile files to prove a point.

Dependencies are assessed against resolved versions, current authoritative advisories and actual exposure. Config review distinguishes development from production and inspects effective settings when available. Fixes test the original unsafe path plus legitimate behavior at the correct boundary; a code patch does not erase prior data or credential exposure.

## Applied methods

### Evidence classification

For each finding record attacker capability, source, transformations, sensitive sink, existing control, triggering condition and impact. Separate confirmed reachable defects from conditional risks and unknown configuration. A suspicious function name or dependency advisory alone does not prove exploitability.

### Authorization and input examples

Build positive and negative cases for subject/action/resource/tenant. Test direct IDs, alternate methods, exports and workers with synthetic identities. An authenticated user is not necessarily authorized for the resource; UI visibility is not enforcement.

For injection, trace the final interpreter boundary. Parameterized SQL and appropriate contextual escaping can change the conclusion even when input is untrusted. Avoid destructive payloads; use controlled fixtures that demonstrate the violated invariant.

### Upload and secret lifecycle

Check upload receipt, quarantine, processing, storage and download authorization. Validate actual content and resource bounds as applicable; do not trust a filename extension or let quarantined files bypass controls through another endpoint. Keep hostile samples inert and isolated.

Secret reports contain locations/types and redacted evidence, never credential values. Distinguish test placeholders. Do not try suspected credentials against providers. A code fix does not rotate an exposed credential or erase its history; list operational follow-up separately.

### Dependency and configuration triage

Match advisories to resolved versions, deployed use and required configuration. Separate dev tooling from runtime exposure. Review effective production settings rather than labeling every development exception a live incident. Missing access means unknown coverage. Repair the owning boundary and test both abuse and legitimate behavior before claiming the requested vulnerability is fixed.
