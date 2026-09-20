# Changelog

## 0.3.0

- Install the plugin files bundled in the package into a persistent local marketplace. Default installation no longer fetches the private GitHub repository or depends on a temporary package-manager cache.
- Add explicit `--github` for the previous GitHub installation channel; retain `--local` for persistent development checkouts. Existing GitHub users must pass `--github` or deliberately migrate their marketplace.
- Preserve managed copies on repeated setup and host failures; replace them on explicit update. Refuse unmanaged destinations, symlinks and conflicting marketplace sources.
- Add the MIT license, package-content and release-metadata checks, clean npm/pnpm/Yarn execution tests, and a guarded trusted-publishing workflow.
- Add Windows CI coverage and support resolving executable extensions and standard npm Node command shims without evaluating shell arguments.
- Keep the 213 skills and documented v0.2 behavioral limitations. This release changes delivery, not the underlying model capabilities.

## 0.2.0

- Add 212 workflow names plus setup, catalog discovery, bounded run records, teaching and native quiz adapters.
- Validate native Codex/Claude installation lifecycles and record representative agent trials and remaining limitations.
