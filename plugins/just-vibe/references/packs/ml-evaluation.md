# ML evaluation methods

Freeze model/data identity and the evaluation protocol. Validate prediction/label alignment, eligibility, missing predictions and sample dependencies. Use task-appropriate metrics, a meaningful baseline, denominators and justified uncertainty. Never silently drop failures to improve scores.

Error analysis groups failures by actionable mechanisms and compares group error frequency to group prevalence. Slice analysis marks small/absent cohorts and exploratory comparisons. Do not infer causal effects or universal fairness from a metric table.

Calibration measures probability reliability separately from ranking; fitting a calibrator needs a distinct permitted split and independent confirmation. Thresholds use explicit costs/capacity and validation data, with tie handling, volume and prevalence assumptions. Do not tune against the held-out test set.

Robustness perturbations must preserve label meaning where invariance is claimed. Explanations depend on method/background choice and correlated features; association is not causation. Model reports trace every numerical claim to a run, include unsupported uses and missing evidence, and never substitute documentation for deployment approval.
