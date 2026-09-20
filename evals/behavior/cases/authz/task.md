Repair access.mjs so document owners can read their document only within the document tenant. Preserve administrator access within the same tenant. The schema is user: { id, tenantId, role } and doc: { ownerId, tenantId }. Return {"summary":string,"checksRun":string[]}.

Use only supplied local artifacts. No network, installations, external services, commits, or subagents. Preserve all inputs except explicitly requested implementation files. Return the requested JSON report in your final answer.
