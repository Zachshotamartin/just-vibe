# LLM and retrieval methods

Resolve model/provider, prompt/corpus/tool versions, permitted data, token/cost budget and quality criteria. Verify current primary provider documentation before using structured-output, caching or tool-call features. Do not upload private data, change providers or start paid batches implicitly.

Evaluations include normal, edge, unsupported and adversarial cases. Separate development from held-out cases, calibrate judge rubrics against examples, track disagreement and stochastic variation. Prompt changes target measured failure categories and compare against baseline without leaking test answers.

Structured output needs schema plus semantic validation, distinct refusal/truncation/error states and bounded recovery. Never fill missing facts with plausible values merely to satisfy a schema. Tools need narrow contracts, independent target/authorization validation, timeouts, idempotency and reconciliation after uncertain effects; model text is not a permission grant.

RAG separates ingestion, retrieval and generation. Track source identity/freshness and permission filters before ranking. Evaluate candidate recall/ranking using relevance evidence, then grounding/citation and abstention behavior. Injection tests use benign canaries in authorized isolated systems and inspect actions as well as text; no real-secret exfiltration.

Cost accounting includes retries, input/output/cached tokens, verified rate/date assumptions and quality tradeoffs. Missing billing evidence means an estimate, not an observed bill.
