# Review selection and evidence

Use for a requested code/security review or a specific changed trust boundary. Read the current diff and callers before selecting checks. Resolve language, framework and deployed versions from manifests/lockfiles and supported documentation. A configuration file is evidence to inspect, not code to execute during read-only discovery.

## Select by the actual boundary

| Boundary in scope | Read | Specific questions |
|---|---|---|
| Queries, shell commands, HTML, URLs, XML, object parsing | [Injection and interpreters](injection.md) | Can untrusted data alter an interpreter's structure or destination? |
| Login, sessions, object access, tenant context, role changes | [Identity and authorization](identity.md), [auth scenarios](../scenarios/auth.md) | Who established identity, and where is this action on this resource authorized? |
| Uploads, archive extraction, filesystem paths, model artifacts | [Files and resource limits](files.md) | Can data escape its owner, become executable or consume unbounded resources? |
| Dependencies, package scripts, workflow artifacts, MCP/hooks | [Supply chain](supply-chain.md), [scanner procedures](scanners.md) | Which exact version/code/config is trusted and which privilege does it acquire? |
| Framework defaults, middleware order, server/client separation | [Framework branches](frameworks.md) | Is the presumed protection enabled on this actual route and version? |
| Tools, retrieved documents, model output | [LLM methods](../packs/llm.md) | Can untrusted content influence capability targets, authorization or secret disclosure? |
| Concurrent updates, retries, cache and queues | [Backend methods](../packs/backend.md) | Can two individually valid actions violate a shared invariant or duplicate an effect? |
| API evolution, pagination, webhooks | [API methods](../packs/api.md) | Do existing consumers and alternate delivery paths retain the contract? |
| UI state, lifecycle, hydration, input behavior | [React methods](../packs/react.md), [UI methods](../packs/ui.md) | What concrete transition exposes stale state, lost input or inaccessible controls? |
| SQL/data changes or model changes | [Database](../packs/database.md), [ML data](../packs/ml-data.md), [ML evaluation](../packs/ml-evaluation.md) | Are grain, timing, ownership and evaluation denominators preserved? |

Do not load this entire tree for a one-line change. Read matching sections before making a conclusion that relies on their protections. For a broad audit, keep a short table of examined surfaces, evidence available, findings and unexamined boundaries. "No findings in the inspected diff" is narrower than "the application is secure."

## Finding procedure

1. Name the expected invariant and cite the changed line plus relevant caller/control. Establish whether the defect is introduced or pre-existing.
2. Trace attacker/input/state → transformation → sensitive operation → observed or source-established bad result. For logic bugs use the exact state/interleaving that fails.
3. Try to disprove the finding: earlier middleware, parameter binding, escaping, authorization, fixed constants, a type guarantee or an intentional public capability may explain the pattern.
4. Establish prerequisites, reachability and impact. Use high severity for demonstrated serious impact, not merely a suspicious function name or a long file. Confidence is separate from impact; uncertain environment assumptions remain conditional.
5. When useful and in scope, reproduce in an isolated fixture using fake identities/data and a bounded check. Retain a legitimate control so a fix that disables the feature does not pass.
6. Report location, trigger/prerequisites, evidence type, impact, correction and verification gap. Consolidate the same root cause; zero actionable findings is valid. Recheck head identity before any authorized remote review.

Do not probe real accounts, validate found credentials, post reviews, rotate keys or change live infrastructure merely because an audit is requested. Existing explicit authority still applies; ordinary source analysis and isolated regression work do not require another permission round.

## False-positive controls

- Ordinary React text children are escaped; raw HTML, scriptable URLs and HTML sinks need separate analysis.
- A query builder is safe only for the path that actually binds values; raw fragments and dynamic identifiers need their own contract.
- `Math.random()` for visual jitter is not a cryptographic defect. Token/key generation has a different requirement.
- A test placeholder or public identifier is not a confirmed secret. Redact uncertain material instead of printing it to decide.
- Internal functions can rely on verified caller constraints. Check reachable callers rather than demanding duplicate validation everywhere.
- A missing `await` may be deliberate detached telemetry. Check error/lifetime handling and user-visible effect.
- An exposed method is not an authorization defect when the resource/action is intentionally public and that contract is established.

These are reasoning instructions, not a vulnerability database or automatic scanner. The [scanner guide](scanners.md) explains what tool results establish and how to preserve unknown coverage. The repository's security fixtures exercise finite controls; they do not certify arbitrary projects or prove that every model follows this guide.
