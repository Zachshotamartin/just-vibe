# General workflow methods

For orientation/mapping, run the bundled inspector, read the actual package scripts and representative entry points, and trace a concrete path. The inspector reports script names, not successful execution. Include ancestor project instructions even when outside the selected subtree.

For fixing/building/refactoring, inspect relevant tests and callers first. Reproduce or characterize behavior, change the smallest coherent boundary, then execute the checks justified by that boundary. Do not run install/deploy scripts merely because their names look like verification. Check changed files again before summarizing; preserve unrelated work.

For research and decisions, establish hard requirements and evidence dates before comparing. Cite primary sources for versioned claims, preserve uncertainty, and propose a discriminating experiment when evidence cannot choose a winner. Planning is complete when dependencies, target files/components, success conditions and unresolved choices are explicit.

For visual work, use actual renders at controlled sizes/states. Test keyboard and error/recovery behavior as relevant. If browser access is missing, distinguish code changes from visually verified results; do not fabricate screenshots.

For continuity, record the objective, exact revision/files, constraints, observed results, blockers and next action. Keep checkpoint facts separate from permanent rules. Resume rechecks current state and remote actions before replay. `remember` records only the requested convention at the requested scope; `learn` proposes a bounded lesson without adopting it.

For review, read the change and its surrounding behavior, not only modified lines. Findings need an actual trigger, impact, evidence and actionable location. For delivery, prepare accurate summaries from the tested/pushed revision; a local diff is not proof a remote PR or deployment contains it.

## Applied methods

### Choosing the smallest workflow

- explain: walk existing code with a concrete input. teach: build conceptual understanding. trace: follow one execution across boundaries. A request to understand a function should not trigger a whole-repository tutorial.
- debug: establish cause. fix: repair requested behavior. test: author missing checks. verify: run relevant checks. A diagnosis request does not become a repair merely because a patch seems obvious.
- compare: factual differences. decide: recommend a choice under priorities. decision-matrix: make explicit weighted comparisons. Use simple prose when one hard requirement already determines the outcome.
- pr and release prepare local artifacts; their GitHub counterparts additionally handle requested remote actions and identities.

### Worked explanation

For a total(items, coupon) function, identify a real caller, walk two items through subtotal and discount calculations, then walk a null coupon and a zero-valued discount separately. Cite the relevant lines. Explain static behavior confidently where the source establishes it; do not invent business reasons for a discount rule. A useful explanation includes the condition under which the behavior would change.

### Repair evidence

Before editing, preserve the triggering input, original assertion and neighboring valid case. After editing, run the same assertion without changing its expectation. If an unrelated failure prevents execution, name it and keep the relevant result unverified. Existing user edits are part of the baseline, not disposable noise.

### Routed recovery

A route is a hypothesis about how to satisfy the goal. If a read stage fails, a different completed stage may satisfy the same criterion. Use session supersede to connect the abandoned stage to passing replacement criteria; keep its attempts. An uncertain external effect must be reconciled first. Use session amend for new action/effect checks inside a running attempt. Neither operation resets elapsed time or stage/attempt counts.
