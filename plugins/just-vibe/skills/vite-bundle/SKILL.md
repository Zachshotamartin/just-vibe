---
name: vite-bundle
description: "Analyze bundle composition and measured size reductions Use for bundle composition and size; vite-chunks focuses on loading boundaries."
---

# vite-bundle

Analyze bundle composition and measured size reductions

## Choose this workflow

Use for bundle composition and size; vite-chunks focuses on loading boundaries.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vite methods](../../references/packs/vite.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; saved build stats/artifacts and size/performance goal; generating a build selects authorized execution.

project manifests, lockfile, Vite/framework/plugin versions, and existing build scripts. Verify current version-specific documentation when changing configuration. Apply-mode checks may generate build/cache artifacts; inspect mode uses existing evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Bundle composition and measured reductions, not arbitrary dependency removal.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify large modules/assets, distinguish raw/compressed/transferred size, trace import paths and tree-shaking barriers, and propose or apply requested optimizations.
- Use existing stats or an authorized comparable build, trace duplicated dependencies/import chains and distinguish emitted, compressed and actually requested bytes.

## Decision branches

- **When a dependency is large but loaded only after an optional interaction:** Measure its contribution to that interaction rather than attributing it to initial load.

## Deliver and verify

- Size breakdown, cause, changes if authorized, and comparable before/after results.
- Import path, size metric, loaded route and before/after build conditions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A reported reduction uses the same build conditions; a removed dependency does not break a lazy route.

## Stop and recover

- Do not equate smaller bytes with faster UX without timing evidence. Missing stats limit numerical conclusions.

## Example requests

- **Normal (inspect):** Analyze the supplied production bundle statistics and prioritize size reductions.
- **edge (inspect):** Reduce initial bytes without breaking a lazily loaded editor.
- **blocked (inspect):** Review available bundle stats without installing an analyzer or inventing timing gains.
