# Logistics, procurement and operations records

Use when: carrier billing, customs, procurement, inventory operations, production planning, returns operations, energy billing.

Reconcile or prepare operations changes using the actual system of record and reviewable transaction identities.

## Inspect first

- System/account, record IDs, units, currency and time zone
- Order, shipment, invoice, stock and exception relationships
- Approval rules, idempotency keys and audit history

## Method

1. Map the process and the owner of each authoritative field. Normalize units/currency/dates without silently changing source values.
2. Reconcile line items and totals using stable IDs; distinguish timing differences, duplicate records, fees and actual discrepancies.
3. For inventory/production/returns, model reservations, lead times, substitutions, defects and reversal paths. For customs/energy/carrier work, verify current jurisdiction/provider rules from authoritative sources.
4. Prepare a dry-run change set with affected IDs, before/after values and reversals. Apply only requested operations through the connected system and reconcile uncertain writes before retrying.

## Failure cases

- A unit conversion multiplies quantities incorrectly.
- A repeated API call creates a second purchase order or refund.
- A delayed shipment is confused with missing inventory.

## Verification

- Use synthetic discrepancy, duplicate and partial-failure fixtures.
- Check quantity/value conservation and transaction status after an authorized write.
- Keep legal/customs/tariff conclusions distinct from arithmetic reconciliation.

## Worked scenario

An invoice discrepancy report separates duplicate line IDs from a legitimate fuel surcharge and a currency conversion difference.

## Version-sensitive primary references

- [www.cbp.gov](https://www.cbp.gov/trade/basic-import-export) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.gs1.org](https://www.gs1.org/standards) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
