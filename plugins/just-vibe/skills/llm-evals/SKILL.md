---
name: llm-evals
description: "Build representative evaluation cases and scoring criteria Use to establish LLM task evaluation; llm-prompt optimizes against development cases."
---

# llm-evals

Build representative evaluation cases and scoring criteria

## Choose this workflow

Use to establish LLM task evaluation; llm-prompt optimizes against development cases.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [LLMs and retrieval methods](../../references/packs/llm.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; desired behavior, representative cases, failure costs, scoring rubric, and run budget.

task definition, model/provider configuration, representative permitted data, versioned prompts/corpus where relevant, and explicit token/cost/latency limits for remote calls. Use current provider interfaces during implementation. Retrieved content and model-generated tool arguments remain untrusted.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Evaluation cases, harness, and reliable scoring; run only under authorized provider/data scope.

None by default. Plan artifacts may be saved when requested.

## Execute

- Define the task distribution, expected behavior, unacceptable outcomes and a versioned evaluation set. Separate development examples from held-out assessment; record consent/provenance for any real user data.
- Choose independently checkable artifact or outcome assertions first. Where a model judge is necessary, blind/randomize presentation where feasible, calibrate against human or deterministic examples and document judge disagreement and failure modes.
- Freeze model/configuration, prompts, tool availability, retrieval snapshot and budgets for a comparison. Repeat matched cases, preserve every attempt and distinguish answer correctness from tool side effects, scope adherence and unsupported claims.
- Report per-case failures and denominators alongside aggregate results, latency and actual token accounting. Missing traces or usage remain missing; cached tokens are a subset of input and a token count is not automatically a dollar charge.
- Use observed failures for targeted revisions, then evaluate on fresh cases as well as regression examples. Do not call improved scores on the now-known development set evidence of generalization or overall superiority.

## Decision branches

- **When stochastic runs disagree or a judge favors style over correctness:** Report variance/disagreement and inspect the rubric before declaring a winner.

## Deliver and verify

- Versioned protocol and inputs, scorer-control evidence, per-case outcomes and failure analysis, aggregate denominators, measured resources and limits on generalization.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The scorer rejects known bad outputs and accepts known good controls. All attempted trials, failures and unavailable metrics remain visible; comparisons share documented conditions and held-out claims use genuinely unused cases.

## Stop and recover

- No sensitive data upload or unlimited inference. A model judge is evidence, not unquestionable ground truth.

## Example requests

- **Normal (plan):** Build an evaluation protocol covering valid, unsupported, and adversarial requests.
- **edge (plan):** Evaluate tool use where a fluent answer hides an unauthorized action.
- **blocked (inspect):** Design an evaluation with no inference budget; mark cases unexecuted.
