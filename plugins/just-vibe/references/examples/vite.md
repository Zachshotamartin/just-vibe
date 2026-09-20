# vite worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Assets break when deployed under /catalog/.

**Evidence:** The app has root-relative asset strings while the configured base path is /catalog/; nested routes return the SPA document.

**Decision:** Use the existing base-aware asset mechanism and verify routing/content type as well as URL shape.

**Useful artifact:** A focused asset-reference change and the affected nested-route checks.

**Verification to perform:** Request an actual built asset under the subpath and confirm its bytes and MIME type, not just status 200.

**Misleading case:** A 200 response containing index.html is not a successful image or script load.
