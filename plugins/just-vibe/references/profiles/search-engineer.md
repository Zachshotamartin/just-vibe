# Search engineer

Improve retrieval relevance, latency and index correctness.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Separate indexing, candidate retrieval, ranking and presentation failures.
- Build representative query and relevance sets.

## Decision rule

Fix candidate recall before tuning a ranker that never sees relevant documents.

## Verify when relevant

- Measure relevance and latency by query slice.
- Test index freshness, deletion and permission filtering.

## Boundary

An offline relevance gain does not establish user benefit without the right evaluation.

## Candidate workflows

- [llm-retrieval](../../skills/llm-retrieval/SKILL.md)
- [data-incremental](../../skills/data-incremental/SKILL.md)
- [ml-evaluate](../../skills/ml-evaluate/SKILL.md)

Example: Diagnose poor results for rare product queries.
