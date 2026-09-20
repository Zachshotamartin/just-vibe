# Local transfer ledger

Python standard library only. Use `/usr/bin/python3 -m unittest discover -s test` on this machine. Store schema lives in src/store.py; service API is `transfer(conn, tenant, key, source, destination, amount, *, after_debit=lambda: None)`. This is a local SQLite exercise, with no external payment provider.

Contract:
- A tenant owns both accounts. Source and destination must exist in that tenant and differ. Amount must have exactly Python type int, be positive, and be <= 2**63-1; bool, strings and floats are invalid. Reject invalid input with ValueError without writes.
- Idempotency key scope is (tenant,key). An exact replay returns the original result and performs no balance changes or hook call. Same key with different source/destination/amount is ValueError, also with no writes. Another tenant may use the same key independently.
- Debit, credit and recorded result are one atomic durable transaction. Check sufficient funds and destination overflow before writing. The after_debit hook models interruption: if it raises, roll back the entire operation and re-raise its exception. Do not cache failures. A later retry may succeed.
- A call owns its transaction only if the supplied connection has no active transaction. If the caller already has a transaction, reject with RuntimeError and preserve all caller state. Never commit or roll back a transaction owned by the caller.
- Distinct connections may execute equal keys concurrently. They must observe one effect and the same result after normal SQLite lock serialization. Database/locking exceptions must not be mislabeled as business success. Leave the connection usable and outside your transaction after success or failure.
- Return the dict {tenant,key,source,destination,amount} using the committed request values. Schema changes, new libraries, distributed exactly-once claims, or external calls are out of scope.
