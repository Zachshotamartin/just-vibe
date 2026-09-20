# ML experiment methods

Resolve dataset/split identity, objective, metric, code/environment, hardware and time/compute budget. Record configuration and seed, but do not promise determinism from a seed alone. Keep the held-out test set untouched during model selection.

Establish a naive and simple-model baseline under the same protocol. Training begins with a small shape/data/loss smoke check, then bounded execution with checkpoints, optimizer/scheduler state and resume instructions. NaNs, exhausted budgets and partial runs have explicit terminal states.

Debug the first numerical or semantic divergence: inputs/targets, scale, loss, gradients, optimizer and update behavior. A tiny-batch overfit probe can discriminate pipeline failures from generalization problems; it is not a reason to launch a large new run.

Tuning fixes search space, trial budget, pruning and selection criteria before execution. Ablations hold data/protocol constant and distinguish noise from component contribution. Run comparison checks dataset, metric definitions and failures, not just headline scores. Reproduction uses exact artifacts or declares substitutions and tolerances. Cost analysis separates loading/compute/checkpoint time and only uses verified rates for monetary estimates.
