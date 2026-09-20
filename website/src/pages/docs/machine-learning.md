---
layout: ../../layouts/Doc.astro
title: Machine learning workflows
description: Bring the data, evaluation protocol, and compute constraints into the conversation.
---

## Work across the lifecycle

The command catalog separates [ML data](/commands/?pack=ml-data), [experimentation](/commands/?pack=ml-experiments), [evaluation](/commands/?pack=ml-evaluation), and [deployment](/commands/?pack=ml-deployment). There are also [LLM and retrieval workflows](/commands/?pack=llm).

Choose a [machine learning engineer profile](/profiles/machine-learning-engineer/) for the task, then select the specific workflow. Profiles guide what to inspect and verify; commands define how to approach the job.

## Plan compute explicitly

```text
/just-vibe:ml-train Plan checkpointed training on one GPU for at most
six hours. Preserve the sample order when resuming. Do not provision compute.
```

Supply the model, data version, hardware constraints, budget, checkpoint policy, and objective when known. The agent should recover configuration from the repository where possible. Missing compute authorization is a limit on launching a run, not a reason to invent a budget.

## Compare the evidence, not just the score

```text
/just-vibe:ml-evaluate Compare these MLflow exports, including weak
segments. Check that splits and evaluation protocols are comparable.
```

Experiment helpers import supplied local exports. They can expose missing lineage, slice differences, and incompatible comparisons. They cannot establish causality from a collection of run metrics.

## Keep the important questions visible

- Could labels, preprocessing, or temporal splits leak information?
- Are baselines and candidate models evaluated under the same conditions?
- Do aggregate scores hide weak or poorly represented segments?
- Can another run reproduce the relevant data and configuration?
- What happens to latency, drift, rollback, and cost after deployment?

These are workflow priorities, not a guarantee that a model is ready for production. Open a command page for its specific technical method, scope, and stopping conditions.
