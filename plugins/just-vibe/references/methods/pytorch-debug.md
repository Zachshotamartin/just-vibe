# PyTorch autograd, device and distributed debugging

Use when: pytorch, autograd, ddp, cuda mismatch.

Reduce an ML runtime defect to a small reproducible CPU case before escalating to accelerators.

## Inspect first

- Pinned torch/CUDA/driver versions
- Tensor shapes, dtype, device, gradients and batch metadata
- Training/eval mode, checkpoint and optimizer states

## Method

1. Start with fixed tiny tensors and a known analytical result. Trace where tensors detach, change dtype/device or mutate in place.
2. Check loss reduction and accumulation scaling; zero gradients at the intended step boundary. Separate no-grad inference from training.
3. For distributed work, verify sampler partition/epoch, equal collective participation, world-size scaling and failure timeouts.
4. Save model, optimizer, scheduler, scaler, seeds and preprocessing identity for resumable training. Do not start expensive jobs merely to diagnose a shape error.

## Failure cases

- A detached intermediate prevents upstream gradients.
- Unequal collective order hangs one rank.
- Mixed-precision overflow silently invalidates a comparison.

## Verification

- Assert finite loss and expected gradient on a tiny CPU fixture.
- Compare single-process and distributed behavior under the same effective batch.
- Report GPU/distributed checks unavailable without the actual hardware.

## Worked scenario

A two-layer linear model should produce a nonzero first-layer gradient; a detach introduced between layers must fail the fixture.

## Version-sensitive primary references

- [docs.pytorch.org](https://docs.pytorch.org/docs/stable/notes/autograd.html) — Read the official source for the installed version before relying on a version-sensitive API.
- [docs.pytorch.org](https://docs.pytorch.org/docs/stable/notes/ddp.html) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
