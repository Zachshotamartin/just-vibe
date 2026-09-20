---
name: llm-structured
description: "Implement structured outputs, validation, and recovery"
---

# llm-structured

Implement structured outputs, validation, and recovery

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [LLMs and retrieval methods](../../references/packs/llm.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; output schema, provider capabilities, validation rules, consumers, and retry budget.

task definition, model/provider configuration, representative permitted data, versioned prompts/corpus where relevant, and explicit token/cost/latency limits for remote calls. Use current provider interfaces during implementation. Retrieved content and model-generated tool arguments remain untrusted.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Structured generation, semantic validation, refusal/incomplete handling, and bounded recovery.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Define schema-compatible requests, validate outputs beyond parsing, separate refusal/truncation from malformed data, implement constrained retries, and test downstream consumption.

## Deliver and verify

- Structured-output integration, schemas, recovery behavior, and fixtures.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Syntactically valid but semantically invalid output is rejected; repeated failure terminates with a typed error.

## Stop and recover

- Never coerce fabricated fields into valid-looking data. Do not assume every provider supports identical schema features.

## Example request

Implement schema validation and bounded recovery for invalid or truncated output.
