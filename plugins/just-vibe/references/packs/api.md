# API methods

Identify actual producers, consumers, versions, authentication and published contracts. Derive response/error shapes from serializers and handlers, not only documentation. Preserve external field/error semantics unless the requested change includes migration.

Specify validation, missing/null behavior, status/error codes, idempotency, ordering and compatibility. Schema-only checks miss changes to validation strictness, authorization, timing and business meaning. Test representative real provider/consumer exchanges in isolation; mock compatibility is not proof of provider behavior.

Pagination needs deterministic tie-breakers, filter/tenant-bound cursors and deliberate consistency under inserts/deletes. Webhooks need provider-specific signature verification over the correct bytes, durable receipt/deduplication, reordered-event semantics and observable retries. Never use real business events as casual test data.

Typed clients need runtime validation where appropriate, credential isolation, useful errors, timeout/cancellation and safe retry rules. OpenAPI work respects the source-of-truth/generator convention; validate examples and references and flag mismatches rather than silently redefining runtime behavior.
