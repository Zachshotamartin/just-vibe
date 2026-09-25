# Vite methods

Read the installed Vite, framework and plugin versions, lockfile, build scripts and config sources. Do not execute imported config during read-only review; configuration may contain arbitrary code. Consult version-specific primary migration/configuration documentation when editing options.

Aliases must agree between TypeScript/editor resolution and runtime/build resolution. Environment loading depends on mode; client-exposed prefixes are not a place for secrets. Inspect generated assets for exposure from existing output or from a bounded local build written to an owned temporary directory (see [execution](../execution.md)), and redact values in findings.

For HMR, follow file watcher → module graph → framework refresh → browser transport. Distinguish a full reload from preserved hot state. For assets, exercise dev and production output at root, nested and requested base paths. Public files and imported hashed assets have different path semantics.

For bundles/chunks compare the same build mode and dependency versions. Trace large modules to imports, inspect duplicated modules and lazy boundaries, and measure transferred/compressed versus raw bytes explicitly. Avoid arbitrary chunking rules and blanket dependency removal. Verify deep links and lazy routes after changes.

## Applied methods

### Resolve the actual invocation

Read the package script and workspace working directory before configuration. Record command, mode, root, envDir, base, aliases and framework plugins. Config may branch on build versus serve; static inspection does not authorize running arbitrary imported configuration code.

Mode and NODE_ENV are separate inputs. Trace environment precedence against the installed Vite version and inspect names rather than values. Client-exposed variables are compiled into browser code; adding a public prefix to a secret is not a fix. Restart/rebuild requirements depend on where the value is read. [Vite environment and mode documentation](https://vite.dev/guide/env-and-mode).

### Three concrete diagnoses

1. Alias typechecks but fails at runtime: compare TypeScript paths with effective bundler resolution and the exact path/case present in the deployed filesystem.
2. Images work at / but fail at /dashboard/: distinguish imported hashed assets from public files and runtime string concatenation. Inspect the emitted URL and test direct nested navigation, not only navigation from the root.
3. HMR fails behind a proxy: trace watcher event, module invalidation, websocket connection and framework refresh boundary. Diagnose the missing boundary before relaxing host/filesystem restrictions.

### Bundle and upgrade evidence

A size comparison uses the same build conditions and distinguishes raw, compressed and transferred bytes. Map a large module to when a real route requests it. Splitting can reduce initial bytes while adding a network waterfall or changing module side-effect order; inspect route behavior after the change.

For upgrades, check the target's migration notes plus Node and framework-plugin support. Verify development refresh, production build and a representative preview path. Keep unrelated major upgrades out of the change and do not claim success if a required plugin has no compatible version.
