# installation worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Install this toolkit for the host I am using.

**Evidence:** A native marketplace with the same name may already point at a different source; package presence does not establish enabled state.

**Decision:** Inspect source/scope first, use the bundled installer, and preserve an unrelated existing registration on conflict.

**Useful artifact:** A result naming the actual source, host scope, enabled state and observed version.

**Verification to perform:** Run the documented native inventory/read-back; distinguish a retained managed copy from successful native installation.

**Misleading case:** An installed executable or copied plugin directory alone is not a healthy native installation.
