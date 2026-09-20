---
name: ml-split
description: "Design splits respecting time, groups, entities, and dependencies Use to design evaluation partitions matching deployment; ml-leakage audits actual contamination evidence."
---

# ml-split

Design splits respecting time, groups, entities, and dependencies

## Choose this workflow

Use to design evaluation partitions matching deployment; ml-leakage audits actual contamination evidence.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; task, entity/group/time dependencies, deployment regime, and dataset version.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Train/validation/test membership and fitting boundaries; write manifests only when requested.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify dependent observations, choose time/group separation matching deployment, define purge/gap rules where needed, and verify overlap and label availability.
- Identify the independent unit and deployment target, compare time/group/random strategies and derive purge or embargo needs from actual feature/outcome intervals.

## Decision branches

- **When the model will serve both known and unseen entities:** Define separate evaluation questions instead of asserting one grouping rule answers both.

## Deliver and verify

- Split protocol, deterministic membership method, manifests if authorized, and contamination checks.
- Split manifest with entity/time boundaries, rationale and executable overlap assertions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Overlapping windows or linked entities do not leak across forbidden boundaries; future labels cannot enter earlier training snapshots.

## Stop and recover

- Do not use random splitting by habit or repeatedly tune the split to improve scores. Document unsupported generalization claims.

## Example requests

- **Normal (plan):** Design time/group splits for overlapping machine sensor windows.
- **edge (plan):** Split overlapping windows for forecasting on known machines and evaluate unseen machines separately.
- **blocked (inspect):** Plan a split with unknown label horizon; do not invent a universal gap duration.
