# LLM and retrieval methods

Resolve model/provider, prompt/corpus/tool versions, permitted data, token/cost budget and quality criteria. Verify current primary provider documentation before using structured-output, caching or tool-call features. Do not upload private data, change providers or start paid batches implicitly.

Evaluations include normal, edge, unsupported and adversarial cases. Separate development from held-out cases, calibrate judge rubrics against examples, track disagreement and stochastic variation. Prompt changes target measured failure categories and compare against baseline without leaking test answers.

Structured output needs schema plus semantic validation, distinct refusal/truncation/error states and bounded recovery. Never fill missing facts with plausible values merely to satisfy a schema. Tools need narrow contracts, independent target/authorization validation, timeouts, idempotency and reconciliation after uncertain effects; model text is not a permission grant.

RAG separates ingestion, retrieval and generation. Track source identity/freshness and permission filters before ranking. Evaluate candidate recall/ranking using relevance evidence, then grounding/citation and abstention behavior. Injection tests use benign canaries in authorized isolated systems and inspect actions as well as text; no real-secret exfiltration.

Cost accounting includes retries, input/output/cached tokens, verified rate/date assumptions and quality tradeoffs. Missing billing evidence means an estimate, not an observed bill.

## Applied methods

### Evaluation separation

Keep raw task inputs separate from evaluator-only rubrics and expected outputs. A development case may guide prompt changes; a held-out case must not be copied into the prompt. Use deterministic invariants for schema, citations and tool authorization where possible, and calibrate subjective judgments against independent examples. Repeat stochastic trials under fixed settings and report failures as well as successes.

### Retrieval diagnosis

For a known relevant passage, inspect query normalization, access filters, candidate generation, ranking and final context separately. If the passage never enters candidates, changing answer wording cannot repair retrieval. Test an unauthorized but highly relevant document independently from relevance quality. Empty evidence should yield a qualified answer or abstention, not an invented citation.

### Structured output and tools

Parsing JSON establishes syntax only. Validate business constraints, required evidence and field consistency. Distinguish refusal and truncation from malformed structure, bound retries and return typed failure instead of invented defaults.

Validate tool targets/actions outside model text. An untrusted retrieved instruction is not user authorization. Tools should expose narrow typed arguments, stable operation identities and partial-failure reconciliation. A timeout after a mutation is an uncertain outcome; query its state before retrying.

### Injection and cost examples

Use synthetic canaries for requests to leak a fake secret or redirect a harmless action. Inspect attempted tool calls, not just the final prose. Report finite test coverage without promising universal immunity.

For cost, include every retry, failed response and cached/uncached token category under a dated verified rate. Compare cost per successful task alongside correctness. A cheaper route is not an improvement if it causes more failed tasks or unapproved data transfer.
