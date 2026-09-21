# Automatic assistance implementation and validation

Included starting in version 0.9.0. User operation and JSON schemas live in the packaged [adaptive reference](../plugins/just-vibe/references/adaptive.md). The website has a matching guide.

## Implementation

| Need | Implementation | Important boundary |
| --- | --- | --- |
| Ordinary conversation activates workflows | Bundled UserPromptSubmit hook, shared assistant runtime, local request/context routing | Shortlist retrieval is heuristic; the host resolves meaning, scope and mode. |
| Only relevant methods are loaded | Compact injected entry point, select/load protocol, full canonical workflow retrieval | Existing direct skills remain available; native catalog truncation cannot remove the hook's runtime path. |
| Agents discover and use real tools | Capability-specific guidance with observed/unknown state; existing host capability-report validation; full workflow methods | The hook cannot enumerate every host connector; the active agent uses its native discovery tools. |
| Missing steps remain visible | Per-task requirements, attributed evidence, tool-event metadata, source/artifact hashes, one bounded Stop continuation | Delivery and activity do not prove model compliance; host reports remain labeled. |
| Corrections change future behavior | Project/user learning records, trigger preference/suppression, effective workflow overlays and additional requirements | Only explicit user feedback is eligible; interpretation is performed by the host. |
| Updates are explainable and reversible | Per-lesson source excerpts, revisions, version history, rollback, retirement and forgetting | User-scope learning requires explicit cross-project language. |
| Context survives compaction | SessionStart resume/compact restores the same task, selection and access to current evidence | Context does not restore authorization or assert freshness. |
| Controls remain usable without memorizing commands | Natural-language personalization routing and a shared agent guide | Ambiguous maintenance targets must be resolved first. |

All runtime code is dependency-free Node. It uses the existing atomic state, bounded reads, path protection, discovery and fingerprint utilities. Hooks never execute project scripts themselves; existing optional check/formatter automation retains its separate trust gate. No account identity or host permission settings are changed by this feature.

The packaged command bodies remain canonical. Effective instructions are assembled on load with versioned personal overrides; `show` uses the same loader. Direct skills reach that loader through shared execution guidance. This avoids writing personal preferences into installed plugin caches that are replaced during upgrades.

## Host support

The adapter uses the common `session_id`, `cwd`, `hook_event_name`, `prompt`, tool-event and Stop output shapes. Codex turn IDs also prevent late events from crossing task boundaries. Plugin hooks use `CLAUDE_PLUGIN_ROOT`, which Codex supplies for compatibility. Host hook review/trust is not bypassed by the installer.

Codex can represent a Stop continuation as another incoming prompt. The runtime recognizes its own exact emitted reminder by hash, adopts a fresh host turn ID when supplied, and preserves the existing task and retry budget. That reminder cannot become a new user-feedback source. Native host events remain distinct from manually supplied CLI inputs; local records are provenance aids, not cryptographic attestations against a process with filesystem access.

References checked during implementation: [Codex hooks](https://learn.chatgpt.com/docs/hooks), [Codex skills](https://learn.chatgpt.com/docs/build-skills), [Claude hooks](https://code.claude.com/docs/en/hooks) and [Claude plugin discovery](https://code.claude.com/docs/en/plugins-reference).

## Validation

- `tests/adaptive.test.mjs` exercises ordinary UI/ML/GitHub/backend requests, unrelated requests, negative clauses, both adapter shapes, effective command loading, tool discovery uncertainty, artifact/source freshness, scoped learning, positive feedback, rollback, user-message provenance and bounded completion.
- The test drives the real hook entry point and CLI through request, selection, load, evidence and completion in an isolated project. It checks that generated continuation prompts do not create feedback or restart retries, that new continuation turn IDs remain attached to the task, that task-only restrictions cannot be omitted from quoted feedback, and that optional project-hook failures or mutations do not suppress or prematurely certify completion.
- Existing project-automation, routing, installation, package and full-runtime regression tests cover interaction with previous features.
- `npm run test:hosts` installs, repeats, upgrades, checks, uninstalls and reinstalls through native Codex/Claude plugin managers in isolated configuration directories. It verifies the installed payload without changing the user's active installation.
- Website production build and static documentation/link checks cover the new guide and navigation.

These are deterministic/runtime and installation checks. They do not establish that every host version delivers every event, that a model always chooses the right workflow, or that users subjectively prefer every learned change. No new model-behavior score or comparison with another toolkit is claimed.

Validation run on September 20, 2026: 202 root tests passed, one Windows-only test skipped on macOS; 27 of those passing tests cover this feature. Both native lifecycles passed with Codex CLI 0.152.0 and Claude Code 2.1.258. Skill/plugin validators passed during development. The website built 345 pages and passed all four static catalog/link/metadata tests on Node 24.21.0. The new documentation page was inspected in the browser at desktop and mobile widths during development; its mobile content did not overflow the viewport. These checks used isolated state and did not update the user's active installation. See the [v0.9.0 release record](../evals/releases/0.9.0.md) for publication verification.

## Manual acceptance checks

In a host with the plugin enabled and its hooks reviewed, send an ordinary task without a workflow name. Confirm the hook context has a task ID, the agent selects and loads the relevant method, uses actual tools, and reports concrete evidence. Follow with an explicit correction; inspect its source/version, start another session, and verify the next effective workflow includes it. Roll back the lesson and verify the prior behavior returns. Repeat with a conceptual question and an unrelated conversation to assess unnecessary activation and user effort.
