# x402 and reputation-aware agent payments

Use when: x402, agent payment, aura reputation.

Integrate a payment/reputation protocol without granting an agent open-ended spending authority.

## Inspect first

- Exact network, asset, payee, amount and expiry
- Challenge/signature format and replay/idempotency rules
- Wallet provider, spending policy and reputation source

## Method

1. Parse payment challenges as untrusted data. Bind approval to destination, chain, asset, amount, resource and expiry; enforce a user-configured cap outside model prose.
2. Verify the installed protocol/version and simulate or use a test network. Do not sign a changed challenge with a prior approval.
3. Treat reputation signals as scoped external evidence with provenance and limitations, not proof that a transaction is safe.
4. After an uncertain response, reconcile the payment/transaction ID before retrying the paid request.

## Failure cases

- A challenge changes the recipient after review.
- A retried request pays twice.
- A reputation badge bypasses amount/network validation.

## Verification

- Test expired, replayed, modified-payee and over-budget challenges.
- Confirm no mainnet signing occurs in fixture mode.
- Record payment identity and actual settlement status separately from content delivery.

## Worked scenario

A resource returning a second 402 with a higher amount needs new exact spending authority rather than automatic escalation.

## Version-sensitive primary references

- [www.x402.org](https://www.x402.org/) — Read the official source for the installed version before relying on a version-sensitive API.
- [github.com](https://github.com/coinbase/x402) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
