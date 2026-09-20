# Vercel methods

Resolve the exact team, project, deployment ID, environment and Git revision before diagnosing or mutating. Use available project/deployment metadata and logs via a connector or installed CLI; verify its supported read commands. Do not relink a project or create `.vercel` configuration just to inspect it.

Compare repository root, framework, build command, output path, runtime/package-manager versions and variable **names/scopes** with deployment settings. A preview can differ from production and local builds. Locate the first failing build or runtime boundary rather than patching symptoms.

Inspect redirect/rewrite precedence and framework routing together. Test read-only URLs only within the requested scope; preserve API routes and nested asset paths. Separate cold/warm/cache-hit/cache-miss timing before making performance claims.

Environment reports contain names, required presence and target scope, never values. Avoid commands that download secrets as an incidental audit step. Preview creation, production promotion, DNS/alias changes and rollback are different actions. For releases verify deployed revision, health, schema compatibility and previous known-good target; reverting a deployment may not revert data.
