# Installation methods

Resolve the bundled `scripts/installer.mjs` from this plugin, not a presumed source checkout. Honor host, source and Claude scope from the request. Use doctor for status, setup for installation, update for refresh, and uninstall only for removal.

Use the native plugin manager through the existing installer. Source/scope conflicts and unknown inventories are blockers; do not bypass them with global configuration edits or cache deletion. Dry runs show conditional steps without reading installed state; npm can still fetch/cache before launching the installer.

Verify native operation results and report partial changes. Uninstall retains marketplace registration and persistent plugin data. Changed skills load in a fresh conversation; updating files does not alter skills already loaded in the current task.

The default source is a persistent copy of the npm-bundled payload under `~/.just-vibe/marketplaces/<host>` (or `JUST_VIBE_HOME`). It needs no GitHub access. `--github` preserves the old GitHub channel; `--local` registers a persistent development checkout. Never silently migrate a conflicting source.

For a new bundled version, execute the current published package, for example `pnpm dlx just-vibe@latest update --target claude`. An installer inside an already cached plugin can diagnose/remove its matching source, but cannot supply a newer npm payload. Use the matching source flag and Claude scope. A request to diagnose does not authorize downloading an update.
