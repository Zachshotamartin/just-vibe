# Installation methods

Resolve the bundled `scripts/installer.mjs` from this plugin, not a presumed source checkout. Honor host, source and Claude scope from the request. Use doctor for status, setup for installation, update for refresh, and uninstall only for removal.

Use the native plugin manager through the existing installer. Source/scope conflicts and unknown inventories are blockers; do not bypass them with global configuration edits or cache deletion. Dry runs show conditional steps without reading installed state; npm can still fetch/cache before launching the installer.

For Claude, setup and update also manage owned shortcut files: the `jv` skills-directory plugin (`skills/just-vibe-shortcuts`), `commands/jv.md`, `commands/just-vibe.md` and `.just-vibe/installations/claude-shortcuts.json`. They live under `~/.claude` (or `CLAUDE_CONFIG_DIR`) at user scope and in the project `.claude` folder at project or local scope, where they appear as untracked repository files; commit or ignore them deliberately. Doctor reports shortcut health as its own layer. Claude project/local operations run with the project as the working directory; `--root` applies only to editor adapters. Editor adapters take `--root <project>`, reject `--local` and `--github`, and are verified from their JSON result (installed, conflicts, missing, outdated) rather than a native inventory; restart the host afterwards.

Verify native operation results and report partial changes. Uninstall retains marketplace registration and persistent plugin data. Changed skills load in a fresh conversation; updating files does not alter skills already loaded in the current task.

The default source is a persistent copy of the npm-bundled payload under `~/.just-vibe/marketplaces/<host>` (or `JUST_VIBE_HOME`). It needs no GitHub access. `--github` preserves the old GitHub channel; `--local` registers a persistent development checkout. Never silently migrate a conflicting source.

For a new bundled version, execute the current published package, for example `pnpm dlx just-vibe@latest update --target claude`. An installer inside an already cached plugin can diagnose/remove its matching source, but cannot supply a newer npm payload. Use the matching source flag and Claude scope. A request to diagnose does not authorize downloading an update.

## Applied methods

### Lifecycle branches

A bundled package installation copies a self-contained payload into the managed source location, then uses the selected host's native marketplace/plugin operations. The original package cache may disappear afterward; the managed copy must remain usable. --local intentionally points to a development checkout; --github intentionally selects repository retrieval. Source switching must be explicit and identity-checked.

Inspect host, scope, source and version before update/removal. Repeated setup should preserve an existing stored version; update installs the selected package version. A successful wrapper exit is not enough: verify native installed/enabled state and cached payload version. Doctor must distinguish absent, disabled, conflicting source and stale cache.

### Failure recovery

If native installation fails after a valid managed copy is created, retain that copy for a supported retry. Do not replace unmanaged directories or follow symlinks into unrelated files. A stale copy lock needs evidence that its owner is no longer active before any recovery action. Uninstall removes the requested native installation while preserving unrelated host configuration and user data.

### Verification

Use temporary host configuration roots for lifecycle checks: install, repeat, doctor, update, remove, repeat, reinstall. Verify the installed cached entry point runs and exposes the catalog after removing the original package cache. A fixture CLI test checks orchestration; a real host lifecycle checks native compatibility. Neither proves every workflow's model behavior.
