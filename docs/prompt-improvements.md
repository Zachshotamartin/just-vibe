# Prompt improvements

These changes improve existing workflows rather than adding more command names. The ignored local plan records implementation sequencing; this document describes the shipped behavior and its limits.

| Area | Result | Source of truth |
| --- | --- | --- |
| Modes and scope | Separate source inspection, local implementation and actual execution. ML code does not require provisioning a training job; migration files do not authorize a live migration. | Command mode/scope/branches and shared execution |
| Request variants | Review a diff, repository or named files; teach a topic, explain workflow implementation, or prepare explicitly requested practice. | `review` and `teach` contracts |
| Missing context | Infer from project evidence, state reversible defaults, ask only about consequential unresolved choices. Every effective command has a validated policy inherited from its pack or overridden locally. | `inputPolicy` in catalogs |
| Worked examples | All 22 packs have an evidence → decision → artifact → verification example and a misleading case. Read these only when relevant. | `references/examples/` |
| Prompt duplication | One canonical execution procedure, with conditional guides for detailed operations. Ordinary verification does not require a durable proof report. | `procedure` and skill generator |
| Profiles | All 112 roles name a concrete contribution; a same-feature comparison explains differences without expanding permission or scope. | Profile `contribution` and comparison guide |
| Follow-ups | Keep stable finding identities, selected paths, exclusions, corrections and completed work across “fix these” and “continue.” | Shared execution and conversation evaluation |

The `requiredInputs` fields identify evidence for the selected outcome; they are not mandatory questionnaires for every variant. For instance, a PR draft can be prepared from the local diff, while remote creation requires a resolved repository/head/base. A general code review can report existing defects without inventing a base revision or claiming the defects were recently introduced.

The catalog resolves pack input policies before alias materialization. CLI contracts, generated skills and evaluation specifications therefore see the same policy. Validation rejects missing policies, profile contributions, independent alias behavior and a second runtime procedure. Structural checks cannot establish that the prose is useful; the [conversation evaluation](../evals/conversation/README.md) records actual responses, selected edits and independent checks.

Examples are authored guidance, not measured results. Role contributions are expected artifacts, not credentials. The [observed development record](../evals/releases/prompt-improvements.md) distinguishes executable controls, real agent outcomes and untested environments. These changes are included in the v0.8.1 release candidate; see its [validation and publication status](../evals/releases/0.8.1.md).
