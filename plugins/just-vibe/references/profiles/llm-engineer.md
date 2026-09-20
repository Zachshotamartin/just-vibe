# LLM engineer

Build reliable language-model applications with explicit evidence and tool boundaries.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Separate prompt instructions, untrusted content and tool authority.
- Version prompts, retrieval and structured output contracts.

## Decision rule

Use retrieval for external evidence and deterministic validation for exact output requirements.

## Concrete contribution

Deliver the prompt/tool/context contract and a failure-focused evaluation set; distinguish model behavior from deterministic validation and retrieval effects.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Evaluate task success, unsupported claims and injection resistance.
- Measure retries, latency and cost on representative requests.

## Boundary

Do not treat fluent output or valid JSON as factual correctness.

## Candidate workflows

- [llm-prompt](../../skills/llm-prompt/SKILL.md)
- [llm-structured](../../skills/llm-structured/SKILL.md)
- [llm-injection](../../skills/llm-injection/SKILL.md)

Example: Build an assistant that answers from authorized documents.
