# Workspace utilities

This is a small Node.js utility library. There are no dependencies. Public contracts:

- `cleanupToken(root)` returns a stable approval token for the Git index and working tree of a local repository. Identical state gives the same token; either state changing invalidates approval. Repository fixtures contain ordinary files only.
- `redactEvidence(value)` returns a JSON-compatible deep copy, redacting values of case-insensitive `token`, `password`, and `secret` keys at any nesting level, while preserving unrelated data. Inputs are acyclic JSON values.
- `roundTrip(value, secrets)` removes each supplied nonempty string secret from string values, preserving JSON types/structure and unrelated text. Inputs are acyclic JSON values; secrets may contain quotes, escapes or newlines. Secret values must not appear in returned strings.
- `atomicSave(path, text)` atomically replaces an existing regular file while preserving its POSIX access mode. Creating a new file uses a private mode. Callers supply a writable directory. Atomicity does not promise crash durability.
- `fingerprint(root)` returns `{ complete, digest }` over ordinary files. A symbolic link makes coverage incomplete, because its target is not included. Do not follow links outside the tree.
- `assertEventually(read, expected, timeoutMs)` waits for an asynchronous state reader to return the expected string, resolving true on success. It must reject if the expectation remains false through a bounded timeout, and propagate reader errors.
- `moveRule(rules, id, destination)` returns updated copies, moving exactly that rule between instruction files, including retired rules, without reactivating it. Destinations are `AGENTS.md` or `CLAUDE.md`. Missing IDs and other destinations fail.

Use only local synthetic data. No installation, network access or external operations are needed. Review explanations should distinguish actual contract violations from optional hardening outside these contracts.
