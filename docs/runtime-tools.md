# Runtime tools, agents and persistent goals

Available starting in v0.10.0. See the [implementation plan and acceptance matrix](runtime-expansion-plan.md).

At v0.10.0 the source contained 219 skill names (216 canonical workflows), 112 engineering profiles, 24 independent specialists, 16 language/framework rule packs, and 48 MCP tools. Counts describe available surfaces, not quality or superiority over another toolkit.

## What changed

- **Persistent goals:** the `goal` skill and CLI/MCP operations preserve objectives, criteria, constraints, progress, blockers and evidence. Resume checks artifact freshness; completion refuses missing evidence and unresolved blockers. Native goal controls are used when available for an explicitly requested goal. No background scheduler or implicit budget is created.
- **Scoped memory:** project, team and user vaults offer lexical search, version-checked writes, structured handoffs, retirement and forgetting. Team memory is reviewable in Git; personal/project memory stays outside the repository.
- **Native tools:** a dependency-free stdio MCP server exposes workflow discovery/loading, memory, goals, feedback, learning review, configuration scans, specialists and workers. Root binding, write access, user-memory/history access and worker launch have separate controls. Loading a workflow retains preferences explicitly approved for all projects, without returning their source history.
- **Independent investigation:** reviewer, security, planner, architecture, frontend, backend, database, ML, testing, reliability, documentation and implementer agents carry bounded briefs. Claude has packaged definitions; Codex has a project agent adapter. Worker processes also receive their maintained canonical workflow method.
- **Worker management:** optional Codex/Claude processes run in owned Git worktrees, with concurrency/timeout limits, bounded logs, status, cancellation and conservative cleanup. Changed work is never automatically merged or discarded.
- **Before-action checks:** optional native PreToolUse policy covers known quality configuration edits and recognizable Git bypass/discard/force operations. One-use exceptions bind to the exact action and working directory. These checks are not a shell interpreter or a security sandbox.
- **Configuration scanning:** a bounded executable static scanner identifies risky agent permissions, hooks, MCP endpoints/runners, possible credentials, instruction overrides and malformed JSON without executing the configurations.
- **Learning from activity:** optional metadata observations create pending suggestions after repeated usage. User review activates a versioned project overlay; approved lessons can become local skill/agent drafts. Imports are always pending; exports are explicit and omit source quotes/session IDs. Git convention extraction reports facts rather than silently promoting conventions.
- **Activity and health:** an interactive local report shows workflow selection reasons, instruction delivery, observed tools, failures, lesson versions, candidates, policy events and goals. It reports operational counts, not a fabricated quality score.
- **Installation choices:** profile/pack selection limits native skill discovery while retaining readable methods. Language packs cover TypeScript, Python, Go, Rust, Java, Kotlin, Swift, C#, C++, Ruby, PHP, React, Vue, Angular, SQL and ML. File adapters support Cursor, OpenCode, Copilot, Gemini, Kimi, Qwen, Windsurf and Antigravity IDE, with owned-file updates and conflict detection.

## Use from a checkout

The latest expansion adds proactive context/repetition/scope warnings, reviewable check presets, batched formatting, staged commit checks, native Cursor/OpenCode events, Zed/Hermes skill installation, GitHub epic coordination and security reports. Framework recipes deepen Django, FastAPI, Spring Boot, Flutter and React Native work. Read [the detailed operation reference](../plugins/just-vibe/references/runtime-depth.md) and [the acceptance record](remaining-ecc-gaps-plan.md). The new native tools are `context_health`, `quality_preview`, `quality_commit_check`, `security_report`, `epic_read` and `epic_prepare`; mutation/execution tools still require enabled write access.

```sh
node bin/just-vibe.mjs agents list
node bin/just-vibe.mjs rules list
node bin/just-vibe.mjs scan config --root /project
node bin/just-vibe.mjs goal list --root /project
node bin/just-vibe.mjs activity report --root /project
node bin/just-vibe.mjs setup --target cursor --root /project --profile frontend --rules react,typescript
```

Once installed as a package, use the `just-vibe` executable instead of the checkout path. The [runtime reference](../plugins/just-vibe/references/runtime-platform.md) documents every operation, input shape, storage path, activation boundary and recovery procedure. The [goal skill](../plugins/just-vibe/skills/goal/SKILL.md) contains the complete agent contract.

## Verification and limits

Automated fixtures cover storage isolation, revision conflicts, secret rejection, memory search/handoffs, goal evidence freshness, policy exceptions, static scan findings, learning approval/import/export/evolution, MCP schemas and transport, real worker subprocesses, cancellation, preservation of dirty worktrees, selective bundle updates and editor-owned-file conflicts. The final validation results are recorded in the implementation plan.

These fixtures do not establish universal agent adherence or live model behavior in every editor. Native host installation and schema validation are separate from model evaluation. Read-only MCP mode excludes memory/preference mutations and worker starts; loading a workflow with a current task ID records delivery as bookkeeping. Additional host processes may consume the user's existing model account usage when explicitly enabled. Configuration scans and lexical shell guards have documented coverage limits. No cloud service, hosted marketplace, remote memory synchronization, embeddings service or token-quality score is included.

## Protocol and host references

The implementation follows the published [MCP stdio transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports), [Claude plugin layout](https://code.claude.com/docs/en/plugins-reference), [Claude hook decision format](https://code.claude.com/docs/en/hooks), [Codex hooks](https://learn.chatgpt.com/docs/hooks), and [Codex custom agent files](https://learn.chatgpt.com/docs/agent-configuration/subagents). Editor file locations follow [Cursor skills](https://cursor.com/docs/skills), [OpenCode skills](https://opencode.ai/docs/skills/), [GitHub Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills), and [Gemini CLI skills](https://geminicli.com/docs/cli/skills/). File adapter support is intentionally narrower than native plugin support.

## Configuration, continuity and review

Start with `just-vibe setup --guided --root /project` to choose the supported hosts and runtime features in one reviewed flow. Existing settings, host trust and service permissions remain explicit. The native task tools now cover selection, complete instruction loading, evidence and reporting without shell bookkeeping. Native specialist definitions also carry complete methods, applicable selected rules and current reviewed preferences when the host delivers their start hook.

Preferences can carry conditions and exceptions, with current related guidance surfaced before approval. Negative feedback survives pruning; reconsideration is explicit. Context export/preview/import/transfer backs up project memories, goals and preferences across worktrees. It preserves collisions, imports lessons as pending, and resets goal verification; credentials and execution permissions are not transferred.

`/orchestrate` composes feature, fix, refactor and MVP phases proportionately. When delegation is authorized, dependent assignments have bounded attempts, structured results, verification, reviewed local application and undo records. `/plan-review` opens a private local browser canvas for annotations and version-bound feedback. Changed artifacts invalidate approval. These operations are documented in the [composed workflow reference](../plugins/just-vibe/references/composed-workflows.md).

Use `npm run test:canvas-browser` for the interaction/security/accessibility checks. `npm run eval:hosts -- --run` is an opt-in, bounded real-model trial of ordinary requests, explicit correction and resume; it consumes the existing host account and records observed results under ignored `.tmp/live-hosts`. It does not publish or modify the user's installed plugin settings. A Claude OAuth failure is a blocked trial, not a passing result. The [gap closure plan](gap-closure-plan.md) records the final observed results.

Additional path references: [Kimi Code skills](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html), [Qwen Code skills](https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/), [Windsurf skills](https://docs.windsurf.com/windsurf/cascade/skills), [Antigravity skills](https://antigravity.google/docs/skills). Discovery-path compatibility does not imply full event or permission parity.

## Complete frozen-backlog expansion

Read the [operation guide](../plugins/just-vibe/references/runtime-expansion.md) for all new schemas, permissions and failure handling, and the [implementation ledger](ecc-implementation-plan.md) for evidence by group. Focused methods are found with `methods search --stdin` (`{"query":"pytorch autograd"}`) and read with `methods show --stdin` (`{"id":"pytorch-debug"}`). Ordinary request routing suggests relevant methods without requiring memorized slash commands. The optional operator browser supports local search, coordination and explicitly enabled reviewed project-adapter management.

There are 43 maintained focused methods and 22 external connector recipes. Methods run through the host agent and its actual toolchain; recipes do not establish installed/authenticated services. The optional Python provider host uses separate API credentials. CPU ranking/split examples, transport fixtures, and owned-adapter lifecycle tests run independently of live provider or framework validation.
