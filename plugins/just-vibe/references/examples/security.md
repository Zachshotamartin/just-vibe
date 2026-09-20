# security worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Review object access in this endpoint.

**Evidence:** The route authenticates a user, then selects an invoice by a caller-supplied ID; tenants are separate owners.

**Decision:** Trace identity through the actual database predicate and response path before declaring an authorization defect.

**Useful artifact:** A finding with a reachable cross-tenant input, source location, impact and a proposed ownership check if missing.

**Verification to perform:** Use synthetic identities with one legitimate access and one denied cross-tenant control.

**Misleading case:** Do not report missing authorization if an earlier, reachable layer has already constrained the invoice to the authenticated tenant.
