# Technical guidance audit

Audit scope: all 213 canonical workflows, their three aliases, 22 pack references, conditional scenario routes, 112 profile-to-workflow links, generator, CLI exposure and packaged references. This is a bounded inventory of the shipped catalog, not a claim to cover every possible technology or vulnerability. The audit was performed on 2026-09-20 against the existing 0.8.0 source.

## Findings and implemented corrections

| Area | Gap | Correction |
|---|---|---|
| Every canonical command | Procedures often named a task without enough evidence, diagnostic distinctions or acceptance checks | An authored technical method now specifies evidence, application, a likely misdiagnosis and a discriminating check in the catalog and generated skill |
| General review and security | General security linked only general methods; specialist depth could remain unloaded | Direct security guide plus a review selector routes by actual changed boundary and stack |
| Security vulnerabilities | Limited explicit mechanisms, unsafe/corrected examples and false-positive controls | Injection, identity, files, supply chain and framework guides with bounded regression/control cases and primary references |
| Scanners | No concrete shared selection, execution and incomplete-result procedure | Available-tool recipes for dependency, source and secret analysis, explicit version/config/revision identity and partial/failure handling |
| Language-specific reviews | Shared review depended heavily on model recall | Conditional JavaScript/TypeScript, Python, Go, JVM, Rust/native and SQL review branches |
| Architecture and decisions | Shared methods did not enumerate each command's decisive checks | Ownership/contract/crash-window/scale/transition checks; sensitivity, feasibility, reversal and evidence rules for each decision workflow |
| Git and GitHub | Existing staging and delivery depth was uneven across adjacent workflows | Per-command three-tree, recovery, bisect, PR identity, CI trust and artifact provenance checks; existing user-ownership rules retained |
| Vercel and Vite | Generic build/performance guidance left configuration and measurement ambiguity | Build/runtime scope, deployment identity, asset MIME/base paths, public env exposure, HMR layer, chunk lifetime and compatible upgrade checks |
| React and UI | Existing async/component scenarios did not give every workflow its own diagnostic contract | State ownership, two-instance behavior, form errors, hydration, profiling, reduced motion, keyboard and visual-baseline controls |
| Backend/API/database/data | Detailed shared examples could be missed or applied too generally | Specific transaction/retry/claim/cursor/webhook/RLS/join-grain/watermark/backfill and reconciliation checks in every entry point |
| ML and LLM | Broad coverage lacked consistent per-command failure distinctions | Prediction/fit-time boundaries, label maturity, leakage controls, calibration/threshold denominators, parity, rollout, retrieval permission and tool-execution checks |
| Testing and operations | Some commands lacked concrete counterexamples and recovery observations | Broken/good controls, independent oracles, load bounds, failure cleanup, telemetry gaps, image layers, restore evidence and causal incident checks |
| Profiles | A role could appear to supply specialist knowledge by itself | Profile selection now explicitly routes to the selected workflow's technical method; roles remain priorities, not credentials or permission |
| Generation and packaging | Structural presence alone could allow missing technical fields or dangling deep references | Technical contract validation, reproducible generation, coverage inventory and transitive local-reference checks |

The full [coverage inventory](technical-coverage.md) lists the specific ambiguity addressed by each command and its conditional references. Existing strong authentication, Git index, ML temporal and training scenarios were retained. All changes are owned by the user; no agent authorship is introduced.

## Maintenance contract

Edit canonical `catalog/commands.json`, not generated SKILL.md files. Every canonical command supplies `technical.evidence`, `technical.method`, `technical.pitfall` and `technical.check`; aliases inherit them. These are authored behavioral instructions, not generic pack-name substitution. Keep substantial conditional examples in references and attach a route explaining when to read them. Rebuild with `npm run build:skills`.

Use installed versions and current primary documentation for unstable API/default behavior. Sources are linked in the relevant guide. The audit consulted OWASP, framework maintainers, language/runtime documentation and scanner maintainers; it did not copy ECC's instruction text or treat checklist length as evidence of better reviews. Existing Git, auth, ML and domain methods remain the basis for deeper scenario work.

## Validation and limits

The [validation record](../evals/releases/0.8.0-technical-guidance.md) records the completed local checks and their limits.

`npm run check` verifies the catalog, generated artifacts, reference graph, runtime tests and executable security fixture controls. `npm run eval:security` runs the isolated controls directly. The fixture assertions distinguish seeded defects from legitimate behavior; they do not run a model or establish a comparative ECC score. The evaluation guide explains how to perform a separate blinded model review without leaking expected findings.

Scanner recipes are host-agent procedures for tools already available and authorized. No scanner is silently installed, no registry/advisory database is bundled, and no hook or remote scan is automatically enabled. Structural validation cannot prove an agent loads every relevant guide or reasons correctly. Broad behavioral quality and current-version ecosystem coverage require ongoing real-task evaluation.

This change does not by itself publish an npm version or establish new Windows/remote-CI evidence. Release records remain authoritative for actual published artifacts and platform validation.
