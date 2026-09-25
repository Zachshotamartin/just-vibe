# Delivery evidence

Use the [evidence collectors](../daily-workflows.md#evidence-collectors) when their CLI prerequisites are available. They gather observations and do not perform the remote action. Existing host connectors can supply equivalent evidence.

## GitHub checks and PRs

Resolve owner/repository, PR number, head SHA and base branch. Group failed, pending, canceled, skipped and successful checks. A skipped check is not proof its tests ran. An all-green list does not establish required checks, approvals or mergeability. If the head or base changes during collection, discard readiness conclusions and collect again.

For a failure, distinguish job setup, dependency install, build, test assertion and infrastructure timeout. Read the first causal error and the relevant workflow trigger/permissions. Check fork versus trusted-branch behavior before changing credentials or event triggers. Verify the fix against the same workflow and the actual pushed SHA. Preserve unrelated staged work and all human attribution; all new work belongs to the user and gets no agent credit.

## Vercel build and runtime

Resolve the immutable deployment ID, project/team, source revision, environment and framework/root directory. Build logs and runtime/request logs answer different questions. A local build may differ because of working directory, build command, package manager, Node version, file casing or environment scope. Inspect names and availability of environment variables without printing secret values.

Use build logs to identify the first meaningful error. Then reproduce the smallest matching build stage. Do not repeatedly redeploy to diagnose a deterministic build failure. For an already-built deployment with runtime errors, inspect requests/functions/edge logs and the affected route; a completed build is insufficient. The bundled Vercel collector covers build logs only. For runtime or function logs use the host Vercel connector or observability tools, or the installed CLI `vercel logs` after reading `vercel logs --help`: confirm whether that version supports a time window and which deployment it defaults to, since older releases only stream live logs briefly. Re-check the exact preview URL and source revision after repair. Production promotion requires the user's existing authorization for that target.

## SQL migrations

Inventory ordered migration files and compare their hashes with a supplied, target-specific applied-history export. Missing history means application status is unknown; absence of a local file can indicate a rewritten or missing applied migration. The static helper flags candidate destructive/locking statements, not guaranteed safety.

For a live rollout, establish engine/version, old/new readers and writers, lock tolerance, data size, backfill batching and restart policy. Separate expand, backfill, switch and contract when simultaneous compatibility requires it. Test interrupted backfills and concurrent writes. A reverse DDL script does not recover dropped data; document the actual backup/restore or forward-repair boundary. Execute only within the explicitly authorized database/environment.
