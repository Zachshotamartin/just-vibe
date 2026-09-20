# General workflow methods

For orientation/mapping, run the bundled inspector, read the actual package scripts and representative entry points, and trace a concrete path. The inspector reports script names, not successful execution. Include ancestor project instructions even when outside the selected subtree.

For fixing/building/refactoring, inspect relevant tests and callers first. Reproduce or characterize behavior, change the smallest coherent boundary, then execute the checks justified by that boundary. Do not run install/deploy scripts merely because their names look like verification. Check changed files again before summarizing; preserve unrelated work.

For research and decisions, establish hard requirements and evidence dates before comparing. Cite primary sources for versioned claims, preserve uncertainty, and propose a discriminating experiment when evidence cannot choose a winner. Planning is complete when dependencies, target files/components, success conditions and unresolved choices are explicit.

For visual work, use actual renders at controlled sizes/states. Test keyboard and error/recovery behavior as relevant. If browser access is missing, distinguish code changes from visually verified results; do not fabricate screenshots.

For continuity, record the objective, exact revision/files, constraints, observed results, blockers and next action. Keep checkpoint facts separate from permanent rules. Resume rechecks current state and remote actions before replay. `remember` records only the requested convention at the requested scope; `learn` proposes a bounded lesson without adopting it.

For review, read the change and its surrounding behavior, not only modified lines. Findings need an actual trigger, impact, evidence and actionable location. For delivery, prepare accurate summaries from the tested/pushed revision; a local diff is not proof a remote PR or deployment contains it.
