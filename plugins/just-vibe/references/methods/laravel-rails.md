# Laravel and Rails persistence, policies and jobs

Use when: laravel, rails, eloquent, active record.

Change the requested web/job behavior using framework-native authorization and transaction conventions.

## Inspect first

- Framework/runtime and package/plugin versions
- Mass-assignment allowlists, policies and tenant scopes
- Job serialization, after-commit behavior and retry rules

## Method

1. Authorize the object and tenant in the service/request path; do not trust a hidden form field or a route ID as ownership proof.
2. Use explicit permitted attributes and scoped relationship lookups. Inspect ORM-generated queries and eager loading before changing performance behavior.
3. Queue work after committed data is visible, and make external effects idempotent across retries. Keep long network waits outside database transactions.
4. Use expand/backfill/contract migrations compatible with old and new application instances; verify rollback assumptions.

## Failure cases

- Mass assignment allows an owner/role field to change.
- A global model lookup bypasses tenant scope.
- A queued job sees an uncommitted or deleted record.

## Verification

- Test cross-tenant IDs, forbidden attributes and duplicate jobs.
- Inspect SQL and assert pagination behavior.
- Run old/new schema compatibility checks on representative records.

## Worked scenario

A user may edit an invoice description but cannot assign the invoice to a different organization through an extra JSON property.

## Version-sensitive primary references

- [laravel.com](https://laravel.com/docs/authorization) — Read the official source for the installed version before relying on a version-sensitive API.
- [guides.rubyonrails.org](https://guides.rubyonrails.org/security.html) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
