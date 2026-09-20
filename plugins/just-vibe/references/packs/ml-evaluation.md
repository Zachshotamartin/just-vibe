# ML evaluation methods

Freeze model/data identity and the evaluation protocol. Validate prediction/label alignment, eligibility, missing predictions and sample dependencies. Use task-appropriate metrics, a meaningful baseline, denominators and justified uncertainty. Never silently drop failures to improve scores.

Error analysis groups failures by actionable mechanisms and compares group error frequency to group prevalence. Slice analysis marks small/absent cohorts and exploratory comparisons. Do not infer causal effects or universal fairness from a metric table.

Calibration measures probability reliability separately from ranking; fitting a calibrator needs a distinct permitted split and independent confirmation. Thresholds use explicit costs/capacity and validation data, with tie handling, volume and prevalence assumptions. Do not tune against the held-out test set.

Robustness perturbations must preserve label meaning where invariance is claimed. Explanations depend on method/background choice and correlated features; association is not causation. Model reports trace every numerical claim to a run, include unsupported uses and missing evidence, and never substitute documentation for deployment approval.

## Applied methods

### Evaluation protocol

Identify model/artifact, data snapshot, split membership, prediction/label join key, eligibility rules and metric definitions before reading headline scores. Compare predictions by stable identity rather than assuming array order. Count missing predictions, failed inference, missing labels and censored outcomes separately; do not improve scores by silently dropping failures.

### Worked operational threshold

Suppose reviewers can inspect at most a fixed number of alerts per day. On permitted validation data, show score ties, expected volume, precision/recall tradeoffs and prevalence assumptions. A threshold is a policy with workload consequences. If volume varies, define whether the contract is a threshold, top-k cap or another explicit selection rule. Reserve independent confirmation after selection.

### Uncertainty and slices

Choose uncertainty estimation compatible with independent units: rows from the same person or time window may be dependent. State the method and assumptions or leave intervals unestimated. For small cohorts, show denominators and missing classes; a perfect score on two outcomes is weak evidence. Distinguish planned slices from exploratory multiple comparisons.

Calibration assesses probability reliability, not only ranking. A calibrator must be fitted apart from final evaluation. Changing prevalence or sampling can affect transfer. Explanations depend on method/background and correlated features; they do not establish causation.

### Reporting and errors

Trace each numeric claim to a real run. Separate label defects from model mistakes, and common errors from memorable examples. Patterns discovered on held-out test data need a fresh confirmation plan before becoming tuning targets. A report should make unsupported deployment populations and incomplete release evidence visible.
