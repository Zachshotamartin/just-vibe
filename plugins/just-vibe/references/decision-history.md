# Decisions that can be revisited

A recommendation is not adoption. Save a decision when the user asks to record it or has accepted the choice within the current task. Extract the actual rationale, rejected alternatives and the few assumptions that could reverse it. Use observable triggers rather than vague advice to reconsider later.

`decision save NAME --stdin`:

```json
{"revision":0,"decision":"Keep jobs in the existing process for now","rationale":"Current load and recovery needs fit the simpler design","alternatives":["Add a separate queue service"],"assumptions":[{"id":"traffic","statement":"Peak sustained throughput remains below 100 jobs per minute","trigger":{"metric":"jobs-per-minute","operator":"gte","value":100,"maxAgeHours":24},"files":["src/jobs.ts"]}]}
```

Each assumption needs a numeric trigger, project files to watch, or both. Operators are `gt`, `gte`, `lt`, `lte`, `eq`, `ne`; inputs must be finite numbers. A trigger describes when to reconsider, not when to declare the architecture wrong. Watched files capture identities, not semantic meaning. Changed files require review even if the change might be harmless. Do not watch unrelated generated output.

`decision show NAME` exposes current assumptions, prior decisions and recorded reviews. An update uses the current revision and preserves the superseded decision/rationale/assumptions in history. Preserve the original reasoning even when new information changes the answer.

`decision revisit NAME --stdin`:

```json
{"revision":1,"observations":[{"metric":"jobs-per-minute","value":140,"observedAt":"2026-09-20T00:00:00Z","source":"Actual staging metrics export, five-minute peak"}]}
```

Supply actual observation times, values, units and provenance. The metric key must match a declared trigger; duplicate/unknown metrics are rejected. Old/missing observations yield unknown, file changes or triggered thresholds yield reconsider, and otherwise the result is no-trigger. Numeric observations are attributed claims, not an automatic telemetry fetch. A no-trigger result establishes only that these supplied checks did not trigger, not that every architecture assumption holds.

Read the findings and explain which choice should be reviewed and why. The helper records the review; it never rewrites architecture, purchases services, schedules monitoring or changes the adopted decision itself. If implementation is separately requested, follow the appropriate architecture/backend workflow and record the revised decision after the choice is made.
