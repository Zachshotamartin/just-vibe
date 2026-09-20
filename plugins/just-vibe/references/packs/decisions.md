# Decision methods

Write the decision question, hard constraints, alternatives, evidence and uncertainty first. Remove infeasible alternatives before weighting preferences. For a matrix, define score anchors, explain weights and test whether plausible weight/score changes alter the recommendation.

For buy/build, compare integration, maintenance, support, migration and exit cost alongside current verified pricing. For reversibility, inspect persisted data and external promises: a config toggle can still create irreversible downstream effects.

A spike needs a discriminating hypothesis, observable pass/fail, isolated artifacts and a declared time/compute budget before it runs. Record inconclusive results honestly. A premortem needs plausible causal chains, early signals and actionable mitigations, not generic warnings.

An ADR records actual status; proposed choices stay proposed. A revisit preserves the previous rationale and explains which premise changed. No decision command purchases, installs, publishes or commits stakeholders to a recommendation implicitly.

## Applied methods

### Decision record template

Decision; outcome it enables; deadline; hard requirements; options including the current approach; evidence; unknowns; recommendation; consequences; reversible experiment; revisit trigger. Record adopted status only with actual adoption evidence.

### Worked matrix

Suppose an option must support offline reads. Option A lacks them, B supports them, and C's support is unknown. Exclude A before scoring. Keep C pending evidence; do not silently assign it a middle score. For B and any subsequently feasible C, define score anchors before assigning weights. A criterion such as maintenance burden needs a stated proxy or qualitative range, not a made-up numeric certainty.

Recalculate with plausible extremes for uncertain weights/scores. If the winner flips, report that sensitivity and prioritize evidence on the decisive criterion. If one option wins throughout the plausible range, explain why without claiming the weights are objective facts.

### Discriminating spike

For 'Will local indexing fit our memory budget?', specify the representative corpus, memory cap, build/query workload and rejecting observation before running anything. Preserve peak memory and failure results. A prototype that exceeds the budget resolves the hypothesis even if it is not a production implementation.

### Buy/build and reversal

Include ongoing ownership, incident response, integration and exit/export cost. Separate code rollback from consequences such as customer messages, contractual commitments or changed data. Unknown prices, effort or contracts remain bounded assumptions. Revisit a prior decision when its original conditions change; do not rewrite its history to make today's choice appear inevitable.
