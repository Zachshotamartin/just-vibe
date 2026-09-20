# Security methods

Define assets, trust boundaries, entry points, authorized code/environment and relevant policies. Follow reachable data/privilege paths and distinguish demonstrated weaknesses from speculation. Read-only source audits do not authorize live attacks or third-party probing.

Authorization covers direct IDs, alternate methods, exports, jobs and tenant boundaries, using isolated identities for active checks. Input audits trace values to actual interpreters/sinks and account for contextual escaping or parameterization; user input alone is not proof of injection.

Secret scanning reports redacted location/type/confidence. Never print or validate suspected live credentials against a provider without authorization. Rotation, history rewriting and incident notification are separate actions. Upload audits follow validation, processing, path/storage boundaries and download authorization; do not execute hostile files to prove a point.

Dependencies are assessed against resolved versions, current authoritative advisories and actual exposure. Config review distinguishes development from production and inspects effective settings when available. Fixes test the original unsafe path plus legitimate behavior at the correct boundary; a code patch does not erase prior data or credential exposure.
