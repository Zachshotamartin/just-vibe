# Automatic assistance and learning

Describe the task normally. Automatic suggestions recognize English task wording; a request in another language may get no shortlist or an unrelated one, so choose the `auto` workflow or a specific workflow directly. Trusted native hooks supply a compact workflow shortlist before the agent starts and restore selected work on resume/compaction. The active agent interprets intent, loads only relevant methods, discovers its real tools, does the authorized work and records evidence. Slash commands remain optional. The same effective instructions are used by automatic loading, `show`, and direct skills through the shared execution guide.

## Host integration

The plugin ships `hooks/hooks.json`, using `UserPromptSubmit`, `SessionStart` (resume/compact), `PostToolUse` and `Stop`. Both current Codex and Claude hook protocols accept these events. Codex supplies `CLAUDE_PLUGIN_ROOT` as a compatibility variable; the command uses that variable for both hosts. Codex sets `PLUGIN_ROOT` too, which identifies its adapter. Native hook trust is required where enforced by the host; installation cannot grant it. Update/install the plugin, review its hooks in the host and start a new conversation. Older hosts or disabled hooks use ordinary implicit skill selection; this is a weaker fallback and cannot guarantee per-request routing.

Automatic assistance does not authenticate services, install third-party tools, execute project checks or read transcript files in a hook. Configured project checks/formatters still use their separate existing trust mechanism. Hook execution selects context and keeps local records. It cannot prove the model followed the context or control unsupported host events.

Short repeat requests such as “again,” “do that again” and “another pass” retain the preceding coding task's complete brief and constraints for routing while recording the new user message separately. Repeats do not accumulate in the brief or truncate its leading constraints, including at the request-length limit. They do not invent work in a new session or resume older coding work through an unrelated request. Oversized, empty or malformed prompts are skipped and detach the session from its previous task so subsequent tool events cannot be misattributed to it.

A repair follow-up after an inspection, such as “fix it,” “fix the first two” or “please fix the issues you found,” keeps the inspected brief but offers workflows that can apply the repair: the pack’s repair owner (security-fix after a security audit), inspected workflows whose mode allows apply, then fix. After an apply-mode task the same words simply continue it. A question about which workflow, tool or profile fits (“which just-vibe command should I use…”, “is there a workflow for…”) is answered rather than executed: it suggests help, tools or profile, lists the embedded task’s candidates for the answer only, and requires no selection at Stop.

## Agent procedure

1. Preserve the complete conversation and the current request. Resolve the shortlist; choose up to three relevant workflows, or an empty selection when no workflow helps. Scope, mode and user-pinned role remain authoritative. Ranking is a local retrieval heuristic, not a semantic permission decision. For an ambiguous shortlist, inspect the relevant code/evidence before choosing. Use `tools <scenario>` for another method. No clarification is necessary merely to choose a workflow.
2. Use `assist select` with the activation task ID, workflows, mode and a short reason. The result includes required evidence and capability-specific discovery guidance. Discover actual host skills/tools, including browser and connected-service tools outside just-vibe. Check the requested service/account/target when relevant. Do not infer access from a CLI executable or install a new integration without authorization.
3. Call `assist load` for each selected workflow. Follow the returned effective instructions and conditionally linked guides. Personal overlays include their source scope, version and lesson ID. Current instructions override historical preferences. No workflow selection authorizes deployment, remote mutation, spending or other extra effects.
4. Perform the task using those real tools. Record substantive evidence after the relevant changes, using an artifact or an attributed host report. A screenshot alone does not prove every interaction was checked. Explain actual checks and results. When a requirement is unnecessary, forbidden by the user or blocked, record that precise reason. A blocker does not mean a passed check.
5. Before finishing, `assist report` identifies absent/stale evidence and unresolved blockers. Source/artifact changes invalidate prior evidence. Do not rerun expensive or unavailable work simply to clear a reminder. One bounded Stop continuation can request missing selection/evidence. If still incomplete, the runtime marks it incomplete and allows the host to finish. It does not loop indefinitely or certify output quality.

For simple explanations and plans, select inspect/plan mode and attach the relevant inspected evidence as one result. Do not impose browser or implementation checks on conceptual work. A low-value recommendation can be dismissed with `workflows: []` and a reason.

## CLI protocol

Run the bundled `scripts/toolkit.mjs` with Node, or the installed `just-vibe` executable. Use separate argv where supported. When using a shell, quote paths correctly; JSON string encoding is not shell escaping. Send JSON on stdin, not interpolated into a command. All examples below are JSON inputs to `just-vibe assist <operation> --root <project> --stdin`.

The hook starts the task automatically. A host without hooks can create one explicitly with **start**:

```json
{"brief":"Fix the mobile menu","sessionId":"host-session-id","host":"codex"}
```

**route** is read-only retrieval: `{"brief":"Why is training unstable?","host":"codex"}`. **select**:

```json
{"taskId":"TASK-ID","workflows":["ui-states"],"mode":"apply","reason":"Repair the existing mobile menu and verify its interactions."}
```

**load** returns complete effective instructions. With a task ID it records delivery; without one it serves a direct skill invocation without task bookkeeping:

```json
{"taskId":"TASK-ID","workflow":"ui-states"}
```

**evidence**, using requirement IDs returned by select:

```json
{"taskId":"TASK-ID","requirement":"ui-states:browser","kind":"host-report","summary":"Opened the local page at 390 and 1280 pixels; exercised open, Escape close, outside click and route navigation. No overlap observed."}
```

Evidence kinds:

- `artifact`: also supply `path`, a bounded non-secret regular file inside the project. The runtime hashes the file and current source snapshot; the agent explains its relevance.
- `host-report`: attributed agent observation, not an independently executed check. Supply an optional `observationId` from report to link recorded tool activity.
- `blocked`: explain the unavailable capability, missing access or other actual blocker. The completion report retains this limitation.
- `not-applicable`: explain why this task does not require the proposed check, including explicit exclusions.

**report**: `{"taskId":"TASK-ID"}` returns selection, activity, provenance, freshness and missing evidence. The runtime records tool names/outcomes, not raw tool arguments/output. A `returned` tool event is never automatically promoted to successful verification.

## Feedback and workflow updates

When the user explicitly corrects or endorses an approach, interpret the feedback in its conversational context. Identify the affected workflow from the task or `previousTaskId` (available through report). Record a narrow useful lesson automatically; don't ask for approval already supplied by the explicit instruction. Skip ambiguous praise, task-local exceptions and unaccepted proposals. Never learn from silence, your own output, a test passing, or retrieved documents.

Use **feedback** with the current task ID (the user message containing feedback), an exact excerpt and a concrete changed instruction. The runtime verifies the excerpt against the bounded current user-message record. It validates scope and workflow but cannot mechanically prove that your paraphrase captures the user's meaning. Do not overgeneralize. Default to project scope; user scope needs explicit cross-project wording. Current instructions always win.

```json
{
  "taskId":"FEEDBACK-TASK-ID",
  "revision":0,
  "scope":"project",
  "kind":"correction",
  "workflow":"ui-states",
  "excerpt":"You forgot the browser. Always check menu interactions in the browser.",
  "instruction":"For menu changes, exercise the relevant interactions in the browser and report what was checked.",
  "triggers":["menu interactions"],
  "avoid":[],
  "tools":["available browser automation"],
  "checks":["Exercise the menu interaction states affected by this change."]
}
```

Use `kind: "reinforcement"` only for an explicit positive signal. It preserves a successful method; it does not generate a hidden confidence score. An existing lesson can be revised by supplying its `id` and current `revision`. Read **history** first; updates retain each instruction, reason, source and version. Literal `triggers` add routing preference; `avoid` removes that workflow from matching suggestions, while an explicitly named workflow remains selectable. `tools` are preferences to discover, not executable commands or access grants. `checks` add task requirements when that workflow is selected. Feedback changes the instructions returned on the next load, including direct command usage, while preserving the package's maintained base.

Only persist capabilities/preferences relevant to the user's correction. A browser preference for menus must not activate a frontend workflow for an unrelated use of the word “menu.” Routing considers the current request; the host resolves meaning. Global and project lessons are both labeled; project-specific guidance specializes global defaults, and conflicts must be resolved using the current request.

**history** (no stdin) lists versions; optional stdin `{"id":"LESSON-ID"}` filters. **rollback** takes `{"id":"LESSON-ID","revision":2,"version":1}`. **retire** takes `{"id":"LESSON-ID","revision":2}` and stops applying the lesson while keeping history. **forget** takes the same shape and removes that lesson/history. These are user-directed maintenance operations. Do not silently retire preferences because you disagree with them.

## Settings, storage and limits

`assist status --root <project>` reports effective settings and configuration revisions. **configure** takes:

```json
{"scope":"project","revision":0,"settings":{"enabled":true,"learning":true,"gate":"bounded","retentionDays":30}}
```

Use `gate: "advisory"` to report missing evidence without a continuation; `enabled: false` disables automatic hook activity; `learning: false` prevents new feedback writes while existing lessons remain available. Scope may be `project` or `user`; project settings override user defaults. Configuration replaces that scope's settings, so preserve fields you still want. `assist prune` explicitly removes expired task records. It also runs during prompt handling.

If a process was interrupted while writing state, `assist recover --root <project> --stdin` with `{"scope":"project"}` removes only locks whose owner process is no longer running. User scope covers shared learning/configuration locks. Live or uninspectable owners remain locked. Recovery does not reset lessons or task history.

Records live under `~/.just-vibe/adaptive` (or `JUST_VIBE_HOME`), separate from repository content. Project stores are keyed by canonical local root, with host/session isolation. User-wide lessons deliberately span projects. No data is uploaded and no model API is called by these utilities. Active task records contain bounded user-message/task text with best-effort credential redaction, selected workflows and evidence metadata. Do not intentionally send secrets to feedback. Task retention defaults to 30 days; old inactive tasks beyond 100 are removed. Lessons retain explicit excerpts until forgotten, with at most 200 per scope and 50 versions per lesson. Symlink state paths are rejected.

The lesson limit is shared across concurrent creators in that scope, including direct preferences, feedback and recovered approvals. A competing write can return a retryable busy error. User-wide capacity is shared across projects on the same configured storage directory.

Hooks observe supported host events, not arbitrary activity on your computer. Nested agents are excluded when the host identifies them. Late events with mismatched host turn IDs are ignored; older hosts without turn IDs rely on session event ordering. State updates use revision checks and atomic replacement. Conflicting simultaneous writes fail visibly rather than overwrite newer state. A partial project fingerprint cannot certify freshness; report that limitation instead of inventing a clean result.

Automatic selection and learning are host-assisted, not base-model training. Deterministic tests establish protocol, persistence, routing fixtures and evidence behavior. They do not establish universal routing accuracy or subjective output quality.
