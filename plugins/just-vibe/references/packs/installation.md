# Installation methods

Resolve the bundled `scripts/installer.mjs` from this plugin, not a presumed source checkout. Honor host, source and Claude scope from the request. Use doctor for status, setup for installation, update for refresh, and uninstall only for removal.

Use the native plugin manager through the existing installer. Source/scope conflicts and unknown inventories are blockers; do not bypass them with global configuration edits or cache deletion. Dry runs show conditional steps without reading installed state; npm can still fetch/cache before launching the installer.

Verify native operation results and report partial changes. Uninstall retains marketplace registration and persistent plugin data. Changed skills load in a fresh conversation; updating files does not alter skills already loaded in the current task.
