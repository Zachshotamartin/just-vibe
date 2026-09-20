# ML experiment methods

Resolve dataset/split identity, objective, metric, code/environment, hardware and time/compute budget. Record configuration and seed, but do not promise determinism from a seed alone. Keep the held-out test set untouched during model selection.

Establish a naive and simple-model baseline under the same protocol. Training begins with a small shape/data/loss smoke check, then bounded execution with checkpoints, optimizer/scheduler state and resume instructions. NaNs, exhausted budgets and partial runs have explicit terminal states.

Debug the first numerical or semantic divergence: inputs/targets, scale, loss, gradients, optimizer and update behavior. A tiny-batch overfit probe can discriminate pipeline failures from generalization problems; it is not a reason to launch a large new run.

Tuning fixes search space, trial budget, pruning and selection criteria before execution. Ablations hold data/protocol constant and distinguish noise from component contribution. Run comparison checks dataset, metric definitions and failures, not just headline scores. Reproduction uses exact artifacts or declares substitutions and tolerances. Cost analysis separates loading/compute/checkpoint time and only uses verified rates for monetary estimates.

## Applied methods

### Framework branches

For classical estimators, preserve fitted preprocessing and the estimator together, record train/validation membership and compare a naive baseline. For iterative tensor training, inspect data/target shapes, device and dtype, loss inputs, gradient flow and optimizer updates on a small controlled batch before a longer run. Respect the repository's framework/version conventions rather than introducing a second training stack.

### Checkpoint acceptance

A PyTorch checkpoint for continuing training normally includes model and optimizer state plus progress; restoring weights alone does not reproduce optimizer history. Select train/eval mode deliberately after loading. [PyTorch checkpoint guidance](https://docs.pytorch.org/tutorials/recipes/recipes/saving_and_loading_a_general_checkpoint.html).

For the actual project, also inventory scheduler, mixed-precision scaler when used, RNG state, data/sampler position and gradient-accumulation state if resuming mid-step. Record what the framework owns automatically. A safe simpler policy may checkpoint only at defined completed-step/epoch boundaries and document the resume granularity. Write atomically, identify code/data/config, and retain the last known-good checkpoint.

Test an interrupted run against an uninterrupted short run under declared tolerances. Report nondeterministic differences rather than promising determinism from a seed. A missing continuation component means restart or approximate resume, not exact continuation.

### Debugging and selection

Locate the first divergent batch/tensor/update for NaNs or non-learning. Check objective semantics and target scale before changing model size. A tiny-batch overfit probe tests plumbing, not generalization.

Freeze tuning space, metric, trial caps and selection data first. Keep failed/pruned trials in the ledger. Compare ablations under matched data/protocol; separate noise from component contribution. Test-set feedback must not become another optimization loop. Track resource use per completed useful result, not only the best successful trial.
