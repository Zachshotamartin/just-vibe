---
name: ml-monitor
description: "Define operational and model-quality monitoring, including delayed labels Use to design or implement requested ML telemetry; ops-alerts designs response-worthy alert behavior."
---

# ml-monitor

Define operational and model-quality monitoring, including delayed labels

## Choose this workflow

Use to design or implement requested ML telemetry; ops-alerts designs response-worthy alert behavior.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML deployment methods](../../references/packs/ml-deployment.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; serving/batch system, model objectives, telemetry, delayed-label process, and response ownership.

versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Operational health, data quality, model performance, and label-arrival monitoring.

None by default. Plan artifacts may be saved when requested.

## Execute

- Separate leading signals from outcome metrics, define joins and delay windows, choose thresholds and runbook actions, and implement only requested instrumentation/configuration.
- Separate service, feature, prediction and delayed-outcome signals; define stable joins, label-lag windows and model-version attribution.

## Decision branches

- **When recent predictions have not had time to receive labels:** Exclude them from matured quality denominators and report pending follow-up separately.

## Deliver and verify

- Monitoring design or code with metric definitions, privacy controls, and alert tests.
- Signal/window/join/threshold/action contract and delayed-label test cases.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Delayed labels do not make recent unlabeled cases look correct; model-version changes remain distinguishable.

## Stop and recover

- Do not activate external alerts or promise ongoing observation without an actual authorized runtime/scheduler.

## Example requests

- **Normal (plan):** Design quality monitoring with delayed labels and model-version separation.
- **edge (plan):** Monitor a model whose outcomes arrive thirty days after prediction.
- **blocked (inspect):** Plan monitoring without activating alerts or claiming an ongoing watcher exists.
