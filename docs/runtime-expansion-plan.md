# Runtime expansion

Scope note: this round completed its ten selected additions and the goal skill. The [complete ECC audit](ecc-complete-audit.md) now records the broader source comparison and remaining work.

This plan implements the ten gaps identified against ECC and the subsequently requested goal skill, while retaining just-vibe's existing workflows, installer, explicit feedback and evidence records. Implementation does not imply publication or universal host parity.

| Capability | Implementation | Acceptance evidence |
| --- | --- | --- |
| Independent specialists | Canonical agent definitions, Claude agents and project Codex agents; bounded briefs and fresh review context | Generated definitions validate; read-only review launch arguments are enforced |
| Before-action checks | Opt-in project policy, native PreToolUse adapter, exact-action temporary exceptions | Protected configuration and dangerous Git cases block; legitimate actions remain available |
| Configuration scanner | Bounded static analysis of instruction, hook, permission, agent and MCP configuration | Fixtures for unsafe config, malformed JSON, secret redaction, symlinks and coverage limits |
| Repeated-activity learning | Optional metadata observation, repeated-pattern candidates, provenance and explicit promotion | Observation alone never changes instructions; revision conflicts and rollback tested |
| Sharing and Git conventions | Versioned export/import of learned preferences, pending review on import; bounded history extraction | Round trip, secret rejection, duplicate handling and no automatic activation |
| Memory tools | Project/user/team vault, lexical search, revisions, structured handoffs; stdio MCP interface | Root and scope isolation, schema validation, MCP protocol lifecycle and write controls |
| Multiple workers | Bounded local CLI workers in owned Git worktrees, status/logs/cancel/cleanup, independent review | Real subprocess fixtures, cancellation, failed startup, dirty worktree preservation |
| Activity and health | Local HTML activity report with workflow reasons, observations, feedback, failures and versions | Escaped output, meaningful aggregation, browser inspection; no invented quality scores |
| Selective installs and rules | Dependency-complete selection profiles and language rule packs | Install/update/uninstall preserves selections and unrelated user files |
| More editors | Project adapters for Cursor, OpenCode, Copilot and Gemini; explicit capability matrix | Owned-file lifecycle tests and generated references resolve; unsupported hooks are disclosed |
| Persistent goals | A goal skill, CLI/MCP state operations, resumable objectives, criteria and evidence; native host integration when available | Premature completion, changed artifacts, reopened goals and scope revisions require current verification; resume preserves constraints |

## Sequence

1. Shared bounded storage and input validation; vault, observations, scanner and policy.
2. Agents and owned worker lifecycle; MCP tools and hook integration.
3. Selective payloads, language rules and editor adapters.
4. Activity report, canonical skill integration, installation and website documentation.
5. Adversarial regression tests, complete existing checks, package and browser verification.

## Constraints

- Preserve all existing behavior by default. Observation, blocking policy and worker launching are opt-in. MCP has a read-only default and separately enabled writes/user scope.
- Never execute imported configurations or observations. Imports are untrusted candidates. No silent promotion, transcript scraping, hidden network services, or rewriting shipped skills.
- Hook guards cover recognized tool inputs and are not an operating-system sandbox. Scanner findings are static indicators, not proof of vulnerability or safety.
- Worker success means the process finished, not that its changes are correct. Never automatically merge, commit, publish or delete dirty worktrees. Keep model selection at the user's host defaults.
- Every stored mutation has bounded inputs and revisions. Keep local personal data outside repositories; team data is explicitly selected and reviewable in Git.
- Keep the private working plan ignored; ship the public acceptance matrix and documentation. Keep dependencies minimal and all changes owned by the user.

## Status

Implemented in the source checkout, including the goal skill. No release, Git push, website deployment or change to the user's installed host configuration was performed in this round. The published npm version remains 0.9.0.

Validation completed:

- `npm run release:check`: 229 tests, 228 passed and one Windows-only skip on macOS; metadata, MIT notices, 641 archive files, shipped links and credential-pattern checks passed.
- `npm run test:package-managers`: local archive execution passed with npm, pnpm 10, pnpm 12 and Yarn, including both host setup previews and an installed payload that survives package-cache deletion.
- `npm run test:hosts`: both native Codex and Claude setup/update/doctor/uninstall/reinstall lifecycles passed in isolated configurations. These checks validate installation, not model adherence.
- Runtime browser checks: desktop/mobile filtering, empty states, evidence disclosure and scrolling, reduced motion, zero horizontal overflow, zero axe violations and no page errors. The first browser pass found heading-order and keyboard-scrolling defects; both were corrected.
- Website: 348 pages built; all four catalog, output, internal-link and metadata tests passed. New goal and runtime guides disclose that the features are unreleased.
- Regression fixtures cover goal scope changes/reopening, current versus historical evidence, approved cross-project preference continuity, opt-in observation, worker process lifecycle, dirty-worktree preservation, managed-file journal recovery and path protection.

Runtime functionality and adversarial fixtures are verified locally. Live model behavior in each editor, universal prompt adherence and production publication are not established by these checks.
