# AMMs, EVM arithmetic and oracle boundaries

Use when: amm, evm decimals, keccak, price oracle, prediction market, trading agent.

Review a protocol or trading integration with local/testnet fixtures and exact transaction authority.

## Inspect first

- Chain/network, contract addresses, ABI and deployed bytecode
- Token decimals, arithmetic scale, fees and rounding direction
- Oracle freshness, manipulation assumptions and authorization

## Method

1. Write economic and state invariants before inspecting arithmetic. Track units through every multiplication/division and distinguish Keccak-256 from standardized SHA3-256.
2. For AMMs, test reserve/accounting conservation, fee handling, callback/reentrancy paths, slippage and adversarial token behavior.
3. For oracles/prediction markets, verify data age, source diversity, settlement rules, dispute/finality and manipulation cost assumptions.
4. Keep private keys and signing authority outside prompts. Simulate exact calldata/value/chain first; a review request never authorizes a live trade or contract deployment.

## Failure cases

- Mixed decimal scales misprice an asset.
- An oracle value is stale but passes a nonzero check.
- A token callback reenters before accounting is finalized.

## Verification

- Use boundary, rounding, fee-on-transfer and reentrancy fixtures on a local chain.
- Compare simulated state deltas to stated invariants.
- Verify deployed identity before any separately authorized transaction.

## Worked scenario

A 6-decimal token and an 18-decimal token require explicit normalization; testing two 18-decimal tokens misses the bug.

## Version-sensitive primary references

- [docs.soliditylang.org](https://docs.soliditylang.org/en/latest/security-considerations.html) — Read the official source for the installed version before relying on a version-sensitive API.
- [docs.openzeppelin.com](https://docs.openzeppelin.com/contracts/) — Read the official source for the installed version before relying on a version-sensitive API.
- [ethereum.org](https://ethereum.org/en/developers/docs/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
