# Vite methods

Read the installed Vite, framework and plugin versions, lockfile, build scripts and config sources. Do not execute imported config during read-only review; configuration may contain arbitrary code. Consult version-specific primary migration/configuration documentation when editing options.

Aliases must agree between TypeScript/editor resolution and runtime/build resolution. Environment loading depends on mode; client-exposed prefixes are not a place for secrets. Inspect generated assets for exposure only when existing or when a build is authorized, and redact values in findings.

For HMR, follow file watcher → module graph → framework refresh → browser transport. Distinguish a full reload from preserved hot state. For assets, exercise dev and production output at root, nested and requested base paths. Public files and imported hashed assets have different path semantics.

For bundles/chunks compare the same build mode and dependency versions. Trace large modules to imports, inspect duplicated modules and lazy boundaries, and measure transferred/compressed versus raw bytes explicitly. Avoid arbitrary chunking rules and blanket dependency removal. Verify deep links and lazy routes after changes.
