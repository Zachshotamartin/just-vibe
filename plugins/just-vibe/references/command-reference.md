# Command reference

216 shipped skill names; 3 aliases inherit canonical implementations. Commands run in the active host agent. Availability depends on task evidence and host permissions.

## General

| Command | Default | Purpose |
|---|---|---|
| [orient](../skills/orient/SKILL.md) | inspect | Identify stack, structure, conventions, and actual working commands |
| [explain](../skills/explain/SKILL.md) | inspect | Explain code or behavior at the requested depth |
| [teach](../skills/teach/SKILL.md) | inspect | Teach a programming topic or the concepts needed to understand and implement a just-vibe workflow. |
| [teach-test](../skills/teach-test/SKILL.md) | inspect | Quiz the user on a topic or workflow through native multiple-choice question dialogs, with feedback and adaptive practice. |
| [trace](../skills/trace/SKILL.md) | inspect | Follow a request, event, or data value through the system |
| [map](../skills/map/SKILL.md) | inspect | Produce an architecture or dependency map |
| [research](../skills/research/SKILL.md) | inspect | Investigate a technical question with sources and a recommendation |
| [compare](../skills/compare/SKILL.md) | inspect | Compare specific implementation approaches and their tradeoffs |
| [brainstorm](../skills/brainstorm/SKILL.md) | plan | Generate distinct approaches and explain their tradeoffs |
| [spec](../skills/spec/SKILL.md) | plan | Produce requirements, acceptance criteria, and edge cases |
| [plan](../skills/plan/SKILL.md) | plan | Inspect the project and produce a concrete implementation plan |
| [scope](../skills/scope/SKILL.md) | plan | Separate the essential release from optional work |
| [challenge](../skills/challenge/SKILL.md) | inspect | Identify weak assumptions, complexity, and failure cases |
| [tasks](../skills/tasks/SKILL.md) | plan | Convert a brief or plan into ordered, verifiable tasks |
| [build](../skills/build/SKILL.md) | apply | Implement a feature through appropriate verification |
| [fix](../skills/fix/SKILL.md) | apply | Reproduce a bug, identify its cause, and verify the fix |
| [debug](../skills/debug/SKILL.md) | inspect | Investigate and explain a failure before changing code |
| [refactor](../skills/refactor/SKILL.md) | apply | Improve structure while preserving behavior |
| [integrate](../skills/integrate/SKILL.md) | apply | Connect an API, library, or external service |
| [migrate](../skills/migrate/SKILL.md) | plan | Plan and apply a version, schema, or implementation migration |
| [automate](../skills/automate/SKILL.md) | apply | Turn a repetitive process into a script or workflow |
| [cleanup](../skills/cleanup/SKILL.md) | apply | Remove verified dead code and unnecessary complexity |
| [design](../skills/design/SKILL.md) | apply | Develop a visual direction and implement the requested interface |
| [polish](../skills/polish/SKILL.md) | apply | Refine hierarchy, spacing, typography, and interaction details |
| [responsive](../skills/responsive/SKILL.md) | apply | Fix layouts across screen sizes and input methods (alias of ui-responsive) |
| [a11y](../skills/a11y/SKILL.md) | inspect | Inspect semantics, keyboard access, focus, contrast, and announcements (alias of ui-accessibility) |
| [match](../skills/match/SKILL.md) | apply | Compare an implementation against a visual reference and close gaps |
| [copy](../skills/copy/SKILL.md) | apply | Improve interface wording and product messaging |
| [review](../skills/review/SKILL.md) | inspect | Review a change, selected files, or an entire repository for actionable defects |
| [test](../skills/test/SKILL.md) | apply | Add meaningful coverage for specified behavior |
| [verify](../skills/verify/SKILL.md) | apply | Run relevant checks and report supporting evidence |
| [security](../skills/security/SKILL.md) | inspect | Examine concrete security risks in a defined scope |
| [perf](../skills/perf/SKILL.md) | apply | Measure a performance problem and improve its cause |
| [repro](../skills/repro/SKILL.md) | apply | Create a minimal, reliable reproduction of a problem |
| [coverage](../skills/coverage/SKILL.md) | inspect | Identify important untested behaviors and prioritize them |
| [pr](../skills/pr/SKILL.md) | plan | Prepare a focused diff summary, PR description, and validation notes |
| [release](../skills/release/SKILL.md) | plan | Prepare release notes and readiness checks |
| [ci](../skills/ci/SKILL.md) | inspect | Diagnose or improve continuous integration |
| [docs](../skills/docs/SKILL.md) | apply | Create or update documentation from verified behavior |
| [deps](../skills/deps/SKILL.md) | inspect | Assess dependency updates and compatibility |
| [deploy](../skills/deploy/SKILL.md) | plan | Prepare or perform deployment within the requested authorization |
| [checkpoint](../skills/checkpoint/SKILL.md) | apply | Save progress, evidence, and unresolved work |
| [undo](../skills/undo/SKILL.md) | apply | Reverse a recorded local task while preserving unrelated changes |
| [handoff](../skills/handoff/SKILL.md) | plan | Write a self-contained brief for another session or collaborator |
| [resume](../skills/resume/SKILL.md) | apply | Read a handoff, verify current state, and continue |
| [remember](../skills/remember/SKILL.md) | apply | Save project instructions, inspect their loading, and make explicit rules checkable |
| [learn](../skills/learn/SKILL.md) | plan | Extract a reusable lesson from completed work for review |
| [skill](../skills/skill/SKILL.md) | apply | Create or improve a workflow skill |
| [doctor](../skills/doctor/SKILL.md) | inspect | Diagnose installation and configuration problems |
| [help](../skills/help/SKILL.md) | inspect | Find the right command and show examples |
| [tools](../skills/tools/SKILL.md) | inspect | List and search commands and integrations, showing availability and prerequisites |
| [auto](../skills/auto/SKILL.md) | apply | Use the goal and project context to select, execute, and verify appropriate workflows |
| [do](../skills/do/SKILL.md) | apply | Use the goal and project context to select, execute, and verify appropriate workflows (alias of auto) |
| [profiles](../skills/profiles/SKILL.md) | inspect | Browse engineering role profiles and compare their priorities, boundaries and verification |
| [profile](../skills/profile/SKILL.md) | inspect | Set, inspect, automatically select or clear task-scoped engineering profiles |

## Architecture

| Command | Default | Purpose |
|---|---|---|
| [arch-map](../skills/arch-map/SKILL.md) | inspect | Map services, packages, data stores, external dependencies, and relationships |
| [arch-boundaries](../skills/arch-boundaries/SKILL.md) | inspect | Find misplaced responsibilities, dependency cycles, and leaking abstractions |
| [arch-feature](../skills/arch-feature/SKILL.md) | plan | Design where a feature belongs within the existing architecture |
| [arch-contracts](../skills/arch-contracts/SKILL.md) | plan | Define interfaces and contracts between components or services |
| [arch-event-flow](../skills/arch-event-flow/SKILL.md) | plan | Design event delivery, retries, ordering, and failure handling |
| [arch-tenancy](../skills/arch-tenancy/SKILL.md) | inspect | Evaluate tenant isolation across authentication, storage, queries, and jobs |
| [arch-scale](../skills/arch-scale/SKILL.md) | plan | Identify bottlenecks for a specified workload and growth scenario |
| [arch-modernize](../skills/arch-modernize/SKILL.md) | plan | Plan an incremental transition to a target architecture |

## Decisions

| Command | Default | Purpose |
|---|---|---|
| [decide](../skills/decide/SKILL.md) | plan | Recommend an option against explicit requirements |
| [decision-matrix](../skills/decision-matrix/SKILL.md) | plan | Compare options using weighted criteria and explain the weights |
| [decision-adr](../skills/decision-adr/SKILL.md) | plan | Write a decision record with alternatives and consequences |
| [decision-premortem](../skills/decision-premortem/SKILL.md) | plan | Assume a proposal failed and identify plausible causes |
| [decision-reversible](../skills/decision-reversible/SKILL.md) | plan | Separate reversible choices from expensive commitments |
| [decision-buy-build](../skills/decision-buy-build/SKILL.md) | plan | Compare building, buying, and integrating a solution |
| [decision-spike](../skills/decision-spike/SKILL.md) | plan | Design or run a bounded experiment to resolve uncertainty |
| [decision-revisit](../skills/decision-revisit/SKILL.md) | plan | Reassess a decision using new constraints or evidence |

## Git

| Command | Default | Purpose |
|---|---|---|
| [git-status](../skills/git-status/SKILL.md) | inspect | Explain branches, staged changes, unstaged changes, and repository state |
| [git-diff](../skills/git-diff/SKILL.md) | inspect | Summarize changes by behavior and identify unrelated edits |
| [git-commit](../skills/git-commit/SKILL.md) | apply | Prepare coherent commits with accurate messages and deliberate staging |
| [git-split](../skills/git-split/SKILL.md) | plan | Divide a mixed change into understandable commits |
| [git-conflicts](../skills/git-conflicts/SKILL.md) | apply | Resolve conflicts while preserving the intent of both changes |
| [git-bisect](../skills/git-bisect/SKILL.md) | apply | Locate a regression with a reproducible pass/fail check |
| [git-worktree](../skills/git-worktree/SKILL.md) | plan | Create or manage isolated working directories |
| [git-recover](../skills/git-recover/SKILL.md) | inspect | Investigate reflog and history to recover lost work |

## GitHub

| Command | Default | Purpose |
|---|---|---|
| [github-triage](../skills/github-triage/SKILL.md) | inspect | Classify issues, identify duplicates, and suggest priorities |
| [github-issue](../skills/github-issue/SKILL.md) | plan | Turn a report or request into an actionable issue draft |
| [github-pr](../skills/github-pr/SKILL.md) | plan | Prepare or create a PR with scope, evidence, and issue links |
| [github-review](../skills/github-review/SKILL.md) | inspect | Review a PR using its discussion, changes, and checks |
| [github-address-review](../skills/github-address-review/SKILL.md) | apply | Implement actionable review changes and explain resolutions |
| [github-fix-ci](../skills/github-fix-ci/SKILL.md) | apply | Diagnose failing Actions jobs and verify repairs |
| [github-actions](../skills/github-actions/SKILL.md) | apply | Improve workflows, caching, permissions, and job structure |
| [github-release](../skills/github-release/SKILL.md) | plan | Prepare a release from merged changes, tags, and issues |

## Vercel

| Command | Default | Purpose |
|---|---|---|
| [vercel-audit](../skills/vercel-audit/SKILL.md) | inspect | Inspect project configuration, build settings, and deployment assumptions |
| [vercel-build-fix](../skills/vercel-build-fix/SKILL.md) | apply | Reproduce and repair failed deployment builds |
| [vercel-env](../skills/vercel-env/SKILL.md) | inspect | Compare required variable names and scopes without exposing values |
| [vercel-preview](../skills/vercel-preview/SKILL.md) | plan | Prepare and validate a branch or PR preview deployment |
| [vercel-runtime](../skills/vercel-runtime/SKILL.md) | inspect | Investigate function errors, timeouts, and runtime differences |
| [vercel-routing](../skills/vercel-routing/SKILL.md) | inspect | Diagnose redirects, rewrites, headers, domains, and route behavior |
| [vercel-performance](../skills/vercel-performance/SKILL.md) | inspect | Investigate slow routes using available measurements and logs |
| [vercel-release-check](../skills/vercel-release-check/SKILL.md) | inspect | Verify a deployment and prepare promotion or rollback steps |

## Vite

| Command | Default | Purpose |
|---|---|---|
| [vite-setup](../skills/vite-setup/SKILL.md) | apply | Configure Vite for the framework and project requirements |
| [vite-config](../skills/vite-config/SKILL.md) | inspect | Audit aliases, plugins, build options, and environment handling |
| [vite-hmr](../skills/vite-hmr/SKILL.md) | inspect | Diagnose broken, slow, or inconsistent hot-module updates |
| [vite-env](../skills/vite-env/SKILL.md) | inspect | Check environment loading and exposure of server-only values |
| [vite-bundle](../skills/vite-bundle/SKILL.md) | inspect | Analyze bundle composition and measured size reductions |
| [vite-chunks](../skills/vite-chunks/SKILL.md) | inspect | Investigate loading boundaries, duplicated modules, and chunks |
| [vite-assets](../skills/vite-assets/SKILL.md) | apply | Fix asset paths, public files, base paths, and deployment paths |
| [vite-upgrade](../skills/vite-upgrade/SKILL.md) | apply | Upgrade Vite and plugins with compatibility and build checks |

## React

| Command | Default | Purpose |
|---|---|---|
| [react-audit](../skills/react-audit/SKILL.md) | inspect | Review components, hooks, state ownership, and behavioral risks |
| [react-rerenders](../skills/react-rerenders/SKILL.md) | inspect | Measure unnecessary rendering and identify its causes |
| [react-effects](../skills/react-effects/SKILL.md) | apply | Investigate effect loops, stale closures, races, and missing cleanup |
| [react-state](../skills/react-state/SKILL.md) | plan | Simplify state ownership, derived state, and synchronization |
| [react-component](../skills/react-component/SKILL.md) | apply | Build a component with its states, API, and accessibility |
| [react-forms](../skills/react-forms/SKILL.md) | apply | Implement validation, submission, errors, and pending states |
| [react-async](../skills/react-async/SKILL.md) | apply | Fix loading races, cancellation, stale responses, and async behavior |
| [react-hydration](../skills/react-hydration/SKILL.md) | apply | Diagnose server/client rendering mismatches where applicable |

## UI and frontend

| Command | Default | Purpose |
|---|---|---|
| [ui-audit](../skills/ui-audit/SKILL.md) | inspect | Inspect hierarchy, consistency, usability, and visual clarity |
| [ui-system](../skills/ui-system/SKILL.md) | plan | Establish typography, spacing, colors, tokens, and component conventions |
| [ui-states](../skills/ui-states/SKILL.md) | apply | Add loading, empty, error, partial-data, disabled, and success states |
| [ui-responsive](../skills/ui-responsive/SKILL.md) | apply | Fix layouts across screen sizes and input methods |
| [ui-accessibility](../skills/ui-accessibility/SKILL.md) | inspect | Inspect semantics, keyboard access, focus, contrast, and announcements |
| [ui-motion](../skills/ui-motion/SKILL.md) | apply | Add purposeful transitions with reduced-motion behavior |
| [ui-visual-diff](../skills/ui-visual-diff/SKILL.md) | inspect | Compare screenshots against an accepted reference |
| [ui-flow](../skills/ui-flow/SKILL.md) | plan | Improve a complete user journey, including error recovery |

## Backend

| Command | Default | Purpose |
|---|---|---|
| [backend-service](../skills/backend-service/SKILL.md) | apply | Implement a service with clear boundaries and validation |
| [backend-auth](../skills/backend-auth/SKILL.md) | inspect | Build or audit authentication and session behavior |
| [backend-permissions](../skills/backend-permissions/SKILL.md) | plan | Define and test authorization for roles, resources, and ownership |
| [backend-jobs](../skills/backend-jobs/SKILL.md) | apply | Implement background processing, scheduling, and recovery |
| [backend-idempotency](../skills/backend-idempotency/SKILL.md) | apply | Prevent duplicate effects from retries and repeated requests |
| [backend-concurrency](../skills/backend-concurrency/SKILL.md) | inspect | Investigate races, locking, and competing updates |
| [backend-cache](../skills/backend-cache/SKILL.md) | plan | Design cache keys, invalidation, expiration, and fallback |
| [backend-resilience](../skills/backend-resilience/SKILL.md) | apply | Add appropriate timeouts, bounded retries, and failure handling |

## APIs

| Command | Default | Purpose |
|---|---|---|
| [api-design](../skills/api-design/SKILL.md) | plan | Define endpoints, resources, validation, and response contracts |
| [api-openapi](../skills/api-openapi/SKILL.md) | apply | Create or reconcile OpenAPI documentation with implementation |
| [api-breaking](../skills/api-breaking/SKILL.md) | inspect | Identify backward-incompatible API changes |
| [api-contract-test](../skills/api-contract-test/SKILL.md) | apply | Verify provider and consumer expectations |
| [api-errors](../skills/api-errors/SKILL.md) | apply | Standardize useful error responses and propagation |
| [api-pagination](../skills/api-pagination/SKILL.md) | plan | Design stable pagination, filtering, and sorting |
| [api-webhooks](../skills/api-webhooks/SKILL.md) | apply | Implement signatures, retries, replay handling, and delivery tracking |
| [api-client](../skills/api-client/SKILL.md) | apply | Build a typed client with authentication and error handling |

## Databases

| Command | Default | Purpose |
|---|---|---|
| [db-schema](../skills/db-schema/SKILL.md) | plan | Design or review tables, relationships, constraints, and types |
| [db-migrate](../skills/db-migrate/SKILL.md) | plan | Create migrations with compatibility and rollback considerations |
| [db-query](../skills/db-query/SKILL.md) | plan | Write or repair queries against the actual schema |
| [db-explain](../skills/db-explain/SKILL.md) | inspect | Interpret query plans and identify expensive operations |
| [db-index](../skills/db-index/SKILL.md) | plan | Recommend indexes based on queries, write costs, and measurements |
| [db-integrity](../skills/db-integrity/SKILL.md) | inspect | Find orphaned records, invalid relationships, and missing constraints |
| [db-locks](../skills/db-locks/SKILL.md) | inspect | Investigate blocking, deadlocks, long transactions, and contention |
| [db-access](../skills/db-access/SKILL.md) | inspect | Audit roles, tenant filtering, and row-level policies where supported |

## Data engineering

| Command | Default | Purpose |
|---|---|---|
| [data-profile](../skills/data-profile/SKILL.md) | inspect | Summarize distributions, missingness, duplicates, and suspicious values |
| [data-contract](../skills/data-contract/SKILL.md) | plan | Define schema, semantics, freshness, and quality constraints |
| [data-pipeline](../skills/data-pipeline/SKILL.md) | apply | Build ingestion or transformation with observable failures |
| [data-incremental](../skills/data-incremental/SKILL.md) | apply | Implement checkpoints, deduplication, and incremental processing |
| [data-backfill](../skills/data-backfill/SKILL.md) | plan | Plan or run resumable historical-data backfills |
| [data-reconcile](../skills/data-reconcile/SKILL.md) | inspect | Compare source and destination records and explain discrepancies |
| [data-lineage](../skills/data-lineage/SKILL.md) | inspect | Trace field origins and transformations |
| [data-quality](../skills/data-quality/SKILL.md) | inspect | Check freshness, completeness, validity, and consistency |

## ML data

| Command | Default | Purpose |
|---|---|---|
| [ml-frame](../skills/ml-frame/SKILL.md) | plan | Define target, prediction moment, unit of analysis, and objective |
| [ml-dataset](../skills/ml-dataset/SKILL.md) | inspect | Audit whether data can support the modeling task |
| [ml-labels](../skills/ml-labels/SKILL.md) | inspect | Inspect label definitions, noise, disagreement, and missing outcomes |
| [ml-split](../skills/ml-split/SKILL.md) | plan | Design splits respecting time, groups, entities, and dependencies |
| [ml-leakage](../skills/ml-leakage/SKILL.md) | inspect | Find target leakage, temporal leakage, and split contamination |
| [ml-features](../skills/ml-features/SKILL.md) | plan | Design features available at prediction time and test usefulness |
| [ml-imbalance](../skills/ml-imbalance/SKILL.md) | plan | Evaluate sampling, weighting, metrics, and thresholds for rare outcomes |
| [ml-dataset-version](../skills/ml-dataset-version/SKILL.md) | apply | Record dataset identity, transformations, and provenance |

## ML experimentation

| Command | Default | Purpose |
|---|---|---|
| [ml-baseline](../skills/ml-baseline/SKILL.md) | plan | Establish simple, reproducible baselines |
| [ml-train](../skills/ml-train/SKILL.md) | plan | Implement training with checkpoints and recorded configuration |
| [ml-debug-training](../skills/ml-debug-training/SKILL.md) | inspect | Investigate exploding loss, unstable gradients, NaNs, or failure to learn |
| [ml-tune](../skills/ml-tune/SKILL.md) | plan | Design a bounded hyperparameter search with a fixed evaluation protocol |
| [ml-ablation](../skills/ml-ablation/SKILL.md) | plan | Measure contributions of features or model components |
| [ml-experiments](../skills/ml-experiments/SKILL.md) | inspect | Compare runs and check that data and evaluation conditions match |
| [ml-reproduce](../skills/ml-reproduce/SKILL.md) | plan | Reproduce a result from code, data, and configuration |
| [ml-training-cost](../skills/ml-training-cost/SKILL.md) | inspect | Profile training time, memory, and resource bottlenecks |

## ML evaluation

| Command | Default | Purpose |
|---|---|---|
| [ml-evaluate](../skills/ml-evaluate/SKILL.md) | plan | Evaluate using task-appropriate metrics and baselines |
| [ml-error-analysis](../skills/ml-error-analysis/SKILL.md) | inspect | Group failures into actionable patterns and examples |
| [ml-slices](../skills/ml-slices/SKILL.md) | inspect | Compare meaningful cohorts or operating conditions |
| [ml-calibrate](../skills/ml-calibrate/SKILL.md) | inspect | Assess predicted probabilities against observed outcomes |
| [ml-threshold](../skills/ml-threshold/SKILL.md) | plan | Choose thresholds against explicit costs or capacity limits |
| [ml-robustness](../skills/ml-robustness/SKILL.md) | plan | Test missing inputs, noise, distribution changes, and boundaries |
| [ml-explain](../skills/ml-explain/SKILL.md) | inspect | Investigate behavior with appropriate explanation methods and limits |
| [ml-report](../skills/ml-report/SKILL.md) | plan | Document data, results, limitations, and intended use |

## ML deployment

| Command | Default | Purpose |
|---|---|---|
| [ml-package](../skills/ml-package/SKILL.md) | apply | Package preprocessing, artifacts, dependencies, and interfaces |
| [ml-serving](../skills/ml-serving/SKILL.md) | apply | Implement online inference with validation and observable errors |
| [ml-batch](../skills/ml-batch/SKILL.md) | apply | Build resumable batch inference and output tracking |
| [ml-parity](../skills/ml-parity/SKILL.md) | inspect | Check training preprocessing against production inference |
| [ml-inference-perf](../skills/ml-inference-perf/SKILL.md) | plan | Measure latency, throughput, memory, and optimization tradeoffs |
| [ml-drift](../skills/ml-drift/SKILL.md) | plan | Design checks for input or prediction-distribution changes |
| [ml-monitor](../skills/ml-monitor/SKILL.md) | plan | Define operational and model-quality monitoring, including delayed labels |
| [ml-rollout](../skills/ml-rollout/SKILL.md) | plan | Prepare shadow, canary, or staged deployment and rollback criteria |

## LLMs and retrieval

| Command | Default | Purpose |
|---|---|---|
| [llm-evals](../skills/llm-evals/SKILL.md) | plan | Build representative evaluation cases and scoring criteria |
| [llm-prompt](../skills/llm-prompt/SKILL.md) | apply | Improve prompts against measured failures and explicit requirements |
| [llm-structured](../skills/llm-structured/SKILL.md) | apply | Implement structured outputs, validation, and recovery |
| [llm-rag](../skills/llm-rag/SKILL.md) | plan | Design or audit ingestion, retrieval, grounding, and generation |
| [llm-retrieval](../skills/llm-retrieval/SKILL.md) | inspect | Evaluate chunking, ranking, filters, and retrieval recall separately |
| [llm-tools](../skills/llm-tools/SKILL.md) | plan | Design tool schemas, execution contracts, and failure handling |
| [llm-injection](../skills/llm-injection/SKILL.md) | plan | Test handling of hostile instructions in untrusted content |
| [llm-cost](../skills/llm-cost/SKILL.md) | inspect | Measure token use, latency, caching opportunities, and routing tradeoffs |

## Testing

| Command | Default | Purpose |
|---|---|---|
| [test-unit](../skills/test-unit/SKILL.md) | apply | Test isolated behaviors and boundaries |
| [test-integration](../skills/test-integration/SKILL.md) | apply | Verify real component and dependency interactions |
| [test-e2e](../skills/test-e2e/SKILL.md) | apply | Exercise complete user journeys and recovery |
| [test-regression](../skills/test-regression/SKILL.md) | apply | Turn a confirmed bug into a lasting behavioral check |
| [test-flaky](../skills/test-flaky/SKILL.md) | apply | Repair nondeterminism using repeated evidence |
| [test-fixtures](../skills/test-fixtures/SKILL.md) | apply | Create representative, maintainable test data |
| [test-load](../skills/test-load/SKILL.md) | plan | Execute bounded workloads against authorized environments |
| [test-property](../skills/test-property/SKILL.md) | apply | Check invariants across generated inputs and edge cases |

## Security

| Command | Default | Purpose |
|---|---|---|
| [security-threat-model](../skills/security-threat-model/SKILL.md) | plan | Identify assets, trust boundaries, attack paths, and mitigations |
| [security-authz](../skills/security-authz/SKILL.md) | inspect | Test access decisions and cross-user or cross-tenant exposure |
| [security-secrets](../skills/security-secrets/SKILL.md) | inspect | Locate exposed credentials without printing secret values |
| [security-inputs](../skills/security-inputs/SKILL.md) | inspect | Audit validation and injection risks at input boundaries |
| [security-uploads](../skills/security-uploads/SKILL.md) | inspect | Review file validation, storage, processing, and download access |
| [security-dependencies](../skills/security-dependencies/SKILL.md) | inspect | Assess findings against actual application exposure |
| [security-config](../skills/security-config/SKILL.md) | inspect | Review application, container, and deployment configuration |
| [security-fix](../skills/security-fix/SKILL.md) | apply | Implement and verify remediation for an identified vulnerability |

## Operations

| Command | Default | Purpose |
|---|---|---|
| [ops-incident](../skills/ops-incident/SKILL.md) | inspect | Organize symptoms, evidence, impact, hypotheses, and immediate actions |
| [ops-logs](../skills/ops-logs/SKILL.md) | inspect | Correlate available logs around a specific failure |
| [ops-observability](../skills/ops-observability/SKILL.md) | apply | Add useful logs, metrics, and traces to unclear execution paths |
| [ops-alerts](../skills/ops-alerts/SKILL.md) | plan | Design actionable alerts with ownership and response guidance |
| [ops-runbook](../skills/ops-runbook/SKILL.md) | plan | Write operational procedures from verified commands and behavior |
| [ops-container](../skills/ops-container/SKILL.md) | inspect | Diagnose container builds, runtime failures, and configuration differences |
| [ops-restore](../skills/ops-restore/SKILL.md) | plan | Prepare or validate backup restoration in an appropriate environment |
| [ops-postmortem](../skills/ops-postmortem/SKILL.md) | plan | Produce evidence-based timelines and concrete follow-up work |

## Installation

| Command | Default | Purpose |
|---|---|---|
| [setup](../skills/setup/SKILL.md) | apply | Install, diagnose, update, or remove just-vibe through native host plugin management. |
