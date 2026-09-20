# Vercel methods

Resolve the exact team, project, deployment ID, environment and Git revision before diagnosing or mutating. Use available project/deployment metadata and logs via a connector or installed CLI; verify its supported read commands. Do not relink a project or create `.vercel` configuration just to inspect it.

Compare repository root, framework, build command, output path, runtime/package-manager versions and variable **names/scopes** with deployment settings. A preview can differ from production and local builds. Locate the first failing build or runtime boundary rather than patching symptoms.

Inspect redirect/rewrite precedence and framework routing together. Test read-only URLs only within the requested scope; preserve API routes and nested asset paths. Separate cold/warm/cache-hit/cache-miss timing before making performance claims.

Environment reports contain names, required presence and target scope, never values. Avoid commands that download secrets as an incidental audit step. Preview creation, production promotion, DNS/alias changes and rollback are different actions. For releases verify deployed revision, health, schema compatibility and previous known-good target; reverting a deployment may not revert data.

## Applied methods

### Configuration diagnosis

Start with exact team/project, deployment ID, Git SHA and environment. Compare project root with the package that owns the build script; inspect the monorepo install root separately. Record build command, output directory, framework preset and Node/package-manager versions from evidence. Do not relink the project just to discover its identity.

For a local-success/deployment-failure case, locate the first causal build line. Compare resolved dependencies, runtime and working directory before editing application code. A dependency accidentally supplied through local hoisting may be absent from the deployed workspace.

### Environment and runtime branches

Record variable names, consumer and environment/branch scope. Build-time client substitution differs from server runtime lookup. A changed variable may require a new deployment; existing compiled assets do not update simply because project metadata changed. Preview, production and development are distinct environments. [Vercel environments](https://vercel.com/docs/deployments/environments).

For a runtime failure, trace handler entry, validation, dependency acquisition, downstream wait and response. A build pass establishes no handler health. Compare cold/warm and cache-hit/cache-miss samples under equivalent region, payload and revision conditions before attributing latency.

### Preview and release evidence

Use supported read operations from the installed CLI/connector to locate matching deployments before creating another. After requested creation, verify SHA, URL, access protection, nested route, API path and asset content type. A protected preview may be healthy even when anonymous requests cannot inspect it.

Keep a release gate table with candidate revision, checks, health, environment requirements, observability and rollback target. Code rollback does not reverse data changes. If the previous deployment cannot read the new schema, record that recovery limit before a readiness claim.
