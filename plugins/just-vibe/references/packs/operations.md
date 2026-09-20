# Operations methods

Resolve service/environment, incident window, revision and authorized evidence sources. Normalize timezone/clock differences and correlate request/job IDs. Separate customer impact, observed facts, hypotheses and proposed interventions. Missing telemetry is not proof of no impact.

Start with evidence-preserving diagnostics. A coincident deployment is not automatically causal. Restarts, failovers, cancellation, traffic changes and customer messages need the exact requested operational authority; do not perform them while merely writing an incident brief.

Instrumentation answers concrete questions with redacted fields and bounded cardinality/overhead. Alerts connect a meaningful signal/window to a responder action, missing-data behavior and recovery; writing a rule does not enable notifications or establish ownership.

Runbooks use verified target checks, commands, expected results, abort conditions and recovery. Container diagnosis compares build/runtime stages, paths, user permissions, entrypoints and health behavior; no privileged mounts by default. Restore exercises verify backup identity and an isolated destination, then schema/counts/integrity/application behavior and recovery timing. A readable backup is not a successful restore.

Postmortems preserve uncertainty, distinguish trigger from systemic contributors, and map each follow-up to a demonstrated failure mechanism. Do not invent impact counts, owners or consensus, or post reports/tickets without instructions.

## Applied methods

### Incident ledger

Record timestamp/time zone, observation, source, hypothesis, action, expected result and actual result. Establish customer impact and affected revision separately from correlated changes. A deployment near the failure is a hypothesis until supported. Preserve logs/state before interventions that may erase evidence.

### Logs and instrumentation

Follow stable request/job IDs across asynchronous boundaries and account for clock skew. Repeated retry errors may be symptoms of one earlier cause. Missing spans remain gaps. Query bounded time ranges and redact sensitive values.

Design telemetry around questions: which revision, tenant-safe cohort, dependency, stage and failure category? Keep arbitrary user IDs out of metric labels. Check success and failure instrumentation plus privacy and overhead on controlled requests.

### Runbook and alert example

For a queue backlog alert, define sustained age/impact, missing telemetry, recovery condition and responder action. A transient spike may need no page; absent data should not silently count as healthy. Name ownership as proposed when it is unknown.

A runbook step states exact target, precondition, action, expected observation and abort/recovery path. Mark unexercised commands clearly. Writing a runbook does not authorize executing its production steps.

### Restore and postmortem

Rehearse backups in an isolated destination with verified identity and keys. Validate schema, membership/counts, integrity and application behavior; a readable archive alone does not demonstrate recovery. Record elapsed recovery and the actual data-loss window.

Postmortems distinguish trigger, contributing conditions and detection/recovery gaps. Each action should address an observed failure mechanism with a measurable outcome. Preserve unknown root cause or impact instead of inventing a complete story.
