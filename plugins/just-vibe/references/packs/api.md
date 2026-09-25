# API methods

Identify actual producers, consumers, versions, authentication and published contracts. Derive response/error shapes from serializers and handlers, not only documentation. Preserve external field/error semantics unless the requested change includes migration.

Specify validation, missing/null behavior, status/error codes, idempotency, ordering and compatibility. Schema-only checks miss changes to validation strictness, authorization, timing and business meaning. Test representative real provider/consumer exchanges in isolation; mock compatibility is not proof of provider behavior.

Pagination needs deterministic tie-breakers, filter/tenant-bound cursors and deliberate consistency under inserts/deletes. Webhooks need provider-specific signature verification over the correct bytes, durable receipt/deduplication, reordered-event semantics and observable retries. Never use real business events as casual test data.

Typed clients need runtime validation where appropriate, credential isolation, useful errors, timeout/cancellation and safe retry rules. OpenAPI work respects the source-of-truth/generator convention; validate examples and references and flag mismatches rather than silently redefining runtime behavior.

## Applied methods

### Contract examples before implementation

For each operation, write a valid request/response, invalid input, unauthorized request and dependency failure. Define omitted versus null fields and stable error meanings. Identify actual consumers before classifying a change as compatible: a new enum value may break an exhaustive decoder even if the schema change appears additive.

OpenAPI work follows the source of truth: route annotations, schema code or handwritten contract. Validate examples against schemas and compare schemas with actual serializers. A generated file should be regenerated from its source. A mocked provider passing its own schema does not prove a deployed provider conforms.

### Pagination example

For a timeline sorted by created_at, add a unique tie-breaker such as an immutable ID. A cursor carries or identifies the ordering position and relevant filter/scope; validate it against the active query and tenant. Test equal timestamps, insertion, deletion, invalid cursors and the last page. Define whether traversal is live or snapshot-based; stable ordering alone does not create snapshot consistency.

### Webhook and client failure paths

Signature checks must use the provider's required raw representation and verified version-specific rules, compare digests in constant time (`crypto.timingSafeEqual`, `hmac.compare_digest`) and accept the current and previous secret during a bounded rotation window so in-flight deliveries survive a key change. A valid signature authenticates delivery, not permission to duplicate the business effect. Persist receipt identity, acknowledge according to the provider contract and process with durable deduplication. Test concurrent duplicates and out-of-order updates.

Client wrappers separate transport errors, malformed output, provider refusal and valid domain errors. Keep useful request IDs and retry timing while redacting credentials. A timed-out mutation may already have succeeded; use stable operation identity and reconciliation before another attempt.
