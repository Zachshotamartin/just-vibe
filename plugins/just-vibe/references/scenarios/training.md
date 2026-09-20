# Training scenarios

Distinguish implementing a training pipeline from executing a training job. A request to implement code can be completed using local bounded checks; it does not require waiting for permission to provision a GPU. Conversely, code availability does not authorize a long or paid run. Keep the chosen dataset, split, objective and limits explicit.

## Classical estimators

Fit transformations inside the training fold or pipeline. A cross-validation split must respect entities, time and label availability. Persist the fitted preprocessing with the estimator and its feature/schema contract. Choose the baseline and decision threshold using allowed validation data. Test inference with reordered columns, missing categories and out-of-range numeric values according to the contract; do not silently refit on serving input.

## Iterative tensor training

Before a large run, use a small batch to check input/target shapes, dtype/device, loss semantics, finite outputs/gradients, optimizer updates and train/eval transitions. A tiny-batch overfit probe can reveal plumbing defects. Check gradient accumulation, clipping order, scheduler step timing and mixed-precision scaler state if used. Record which process aggregates validation metrics; averaging batch averages can misweight uneven batches.

## Distributed or resumable execution

Identify what the framework automatically checkpoints. Include optimizer, scheduler, scaler, progress, RNG and sampler position when needed. Choose an explicit checkpoint boundary; exact mid-accumulation continuation requires more state than resuming after a completed optimizer step. Write through a temporary artifact and atomic replacement appropriate to the storage backend. Do not let every distributed worker race to replace one file.

Distributed sampling must account for ranks and epoch changes; validation must not double-count padding or repeated examples. Changing worker count, sharding or nondeterministic kernels may invalidate exact continuation claims. Reproduce a short interruption and compare with an uninterrupted run under declared tolerances. See [PyTorch distributed data parallel](https://docs.pytorch.org/docs/stable/notes/ddp.html).

## Failure and results

Stop on persistent nonfinite loss, violated resource limits or unusable artifacts. Preserve failed runs and the last valid checkpoint. Report code/data/config identity, completed steps, metrics and what was actually resumed. Never call a weights-only restart an exact resume or infer production model quality from a local smoke test.
