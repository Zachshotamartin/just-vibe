# Context health, quality checks, editor events and shared work

These additions are Unreleased. They extend existing skills and runtime operations. Run `just-vibe <family> <operation> --root /project --stdin` with the documented JSON. In a source checkout, use `node bin/just-vibe.mjs` instead of `just-vibe`. Read-only operations do not need `--stdin` when their input is empty.

## Context health

`health status` returns monitoring settings and bounded session observations. `health configure` takes `{revision,settings}`. Settings are `enabled` (default true), `remainingPercent` (1–90, default 25), `repeatCalls` (3–20, default 5), `changedFiles` (2–200, default 20) and `cooldownCalls` (1–100, default 10).

Native hooks observe identical tool calls and edited-file identities. Warnings prompt the agent to inspect a possible loop or unintended scope growth; they do not stop authorized work or manufacture a summary. Prompts and tool arguments are not stored by this monitor: identities are hashed. It retains at most 32 sessions. A new user turn resets the turn counters. Optional worker processes do not create duplicate native-hook observations.

`health observe` accepts `{host,sessionId,tool?,arguments?,file?,files?,remainingPercent?,observedAt?}`; `files` is an optional array of up to 201 paths instead of `file`. Supported hosts are claude, codex, cursor, opencode and external. Capacity metrics require a finite percentage and ISO timestamp within two minutes. Old/out-of-order values never replace newer observations. Unknown or stale capacity stays unknown. Metric-only updates do not consume the next tool-event warning. This is a host report, not authenticated telemetry or a quality score. `health reset` takes `{host,sessionId}`.

Claude's optional status-line bridge is `scripts/context-statusline.mjs` inside the persistent installed plugin. Set the host's statusLine command to `node` followed by the correctly shell-quoted absolute path only after reviewing existing status-line configuration. If the user already has a status line, compose the input forwarding into that script instead of overwriting it. The bridge reads `context_window.remaining_percentage` from stdin and prints a plain-text line. It neither scans transcripts nor estimates costs. Other hosts can provide the documented metric input; no unsupported capacity source is invented. Native `context_health` exposes status only.

## Detected check presets and batching

`quality preview` accepts optional `{packageManager,batch,commit}`. It reads package scripts, declared dependencies, lockfiles and Ruff configuration without executing them. An explicit manager wins, then packageManager, then an unambiguous lockfile. Conflicting lockfiles produce a warning and no guessed script command. Supported managers: npm, pnpm, Yarn and Bun. Presets select available typecheck/lint script names and declared Prettier/Biome or configured Ruff. Detection is not proof the executable exists or the script is safe.

`quality configure` takes the same selection plus the current automation `revision`. It writes the proposed configuration but does not trust it. Inspect `hooks status`, review actual script bodies and binaries, then explicitly `hooks trust`. Any configuration change invalidates that local trust. Existing manually configured commands remain supported; using a detected preset is an explicit replacement of the command selection.

Optional `batch: true` accumulates edited paths and invokes each selected formatter once at Stop, passing matching files as separate argv values. The shared 20-second budget and 200-file queue are bounded. Staged/private files are skipped; failed work remains queued. No formatter changes the Git index. Presets default to batching. Formatters must support multiple input files before choosing batch mode.

Optional `commit: true` enables a before-action gate for recognized direct `git commit` shell invocations. `quality check-commit` also runs it explicitly. It reads the actual staged blobs for conflict markers and credential indicators, then runs trusted checks. When checks are configured, unstaged tracked changes prevent claiming that working-tree checks verify the staged snapshot. Index or source changes during checks invalidate success. The scanner bounds staged files, bytes and elapsed time; exceeding a bound fails verification. Stage in a separate operation first: compound commands, commit pathspecs, index-changing flags such as --all, and unknown commit options are refused because they can change the candidate after inspection. Ordinary message/file, amend, signing and related metadata flags are supported. This gate does not parse every shell language or intercept every possible Git API. It is not an OS sandbox or replacement for a repository's native precommit/CI policy.

`quality_commit_check` requires native write access and an already trusted project configuration. `quality_preview` is read-only. The CLI exits 2 for an unavailable or failed commit check and 0 only for a passing result.

## Cursor, OpenCode, Zed and Hermes

```sh
just-vibe setup --target cursor --root /project --profile core --editor-hooks --dry-run
just-vibe setup --target cursor --root /project --profile core --editor-hooks
just-vibe setup --target opencode --root /project --profile core --editor-hooks
just-vibe setup --target zed --root /project --profile core
just-vibe setup --target hermes --root /path/to/actual/hermes-home --profile core
```

The explicit `--editor-hooks` option adds Cursor or OpenCode events. Guided setup offers the same choice for those targets. It does not grant host trust, configure providers, run formatters before project trust, or permit extra work. Adapter update/uninstall remembers the selection. To remove an event adapter while retaining skills, use `adapters update --stdin` with `{target:"cursor",hooks:false}` (or opencode). Restart the editor afterward.

Cursor merges only its owned entries into `.cursor/hooks.json`, preserving other settings and hooks. Edits to an owned entry stop the update. A hash journal detects interruptions and refuses to overwrite concurrent manual changes. It also installs a small always-on discovery rule. beforeSubmitPrompt records the request; postToolUse can deliver its routing context once per task. preToolUse translates policy/commit denials. Stop can request one bounded continuation for missing evidence; aborted/error sessions are not restarted. Generic postToolUseFailure records failure without treating it as success. Native request fields are version-sensitive; use `adapters doctor` and the fixture checks when updating a host.

OpenCode discovers `.opencode/plugins/just-vibe.js` (its loader scans `.js`/`.ts`, not `.mjs`) and imports the host's `@opencode-ai/plugin` schema helper. It uses chat.message, tool.execute.before/after, session.idle/compacted and experimental.chat.system.transform. The experimental system hook is explicitly version-sensitive. Idle runs trusted queued checks without injecting a synthetic user request. Native tools expose workflow search/loading, quality preview and static scanning; canonical selection/evidence operations remain accessible through the CLI or separately configured MCP. Failures that bypass the tool-after event remain unobserved rather than successful. Its plugin requires an OpenCode installation that provides the documented plugin SDK.

Zed receives compact skill descriptions under `.agents/skills`; host worktree trust and catalog limits apply. Hermes receives `skills/just-vibe-*` under the explicitly supplied **actual Hermes home**, not an arbitrary project folder. Hermes is installed separately from the project-oriented wizard. These two targets have file lifecycle support, not new hook adapters. Neither adapter changes existing user skills or provider credentials.

References: [Cursor event schema](https://cursor.com/docs/hooks), [OpenCode plugins](https://opencode.ai/docs/plugins/), [Zed skills](https://zed.dev/docs/ai/skills), [Hermes skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills), [Claude status line](https://code.claude.com/docs/en/statusline).

## GitHub epic coordination

This is an executable coordination layer behind the existing GitHub/task workflows. It uses the installed, authenticated `gh` CLI. It never signs in, changes accounts, edits an issue body, creates a branch, commits or merges. All visible work remains owned by the authenticated user; no agent byline is added. `epic list` and `epic show {id}` read local state.

1. `epic sync`: `{id,repo:"owner/name",issue:7,revision:0}` reads the issue and bounded comments into a local snapshot. Subsequent syncs use the global epic-state revision. Up to 30 local epics and 1,000 comments per issue are supported. IDs cannot be rebound to another issue.
2. `epic plan`: `{id,revision,action,summary,...}` re-reads remote state and verifies the current account and repository write access. `action` is claim, release, decompose or progress. Only the current owner can release a claim. Decompose also takes 1–30 `{id,title,dependsOn:[]}` tasks; duplicate IDs, unknown prerequisites and cycles are rejected. Progress takes `{task,status}` with pending/active/blocked/done. Starting or completing a task requires its prerequisites to be done. A decomposition resets progress for its new task set.
3. Inspect the exact `plan.body`, actor, repo/issue and `planHash`. This is still local preparation. Only when the user authorized publishing that update, call `epic publish` with `{id,revision,planHash}`. It refuses changed remote state or a changed account before posting one comment.
4. A publication journal is written before the request. `epic recover` with the same ID/revision/hash searches all scanned comments for the operation marker after an uncertain result. Finding the exact comment records success without posting again. If no matching comment is visible, recovery remains uncertain and automatic retry is prohibited. Only after the user independently verifies that publication did not occur, use `epic reconcile {id,revision,planHash,resolution:"not-published",reason}` to retain that explanation and clear the uncertain plan. This does not post a comment. It records a matching published operation instead if one is found. `epic discard {id,revision}` removes an unsubmitted local plan, but refuses an uncertain publication.

Coordination records live in append-only issue comments. Existing issue content and other comments remain untouched. Only records whose actor matches the comment author and whose author association is OWNER, MEMBER or COLLABORATOR are accepted. This is an association check, not a current collaborator-permission audit. Comment text remains untrusted context, and task status is reported collaboration state rather than independent proof of code correctness.

Claims are advisory. GitHub comment creation does not provide an atomic compare-and-swap lock: two simultaneous posts can branch from the same predecessor. Sync detects competing successors, orphan records, owner violations and invalid progress transitions, and blocks further publication until they are reconciled. Do not claim exclusive distributed locking. Local state is outside the repo under the runtime home, bounded to 1 MiB, with ten compact recent event summaries per epic. Native `epic_read` reads snapshots; `epic_prepare` can read GitHub and prepare local changes when native writes are enabled. Publishing is a separate CLI action and has no automatic hook.

Reference: [GitHub issue comments API](https://docs.github.com/en/rest/issues/comments).

## Security reports and optional AgentShield

`audit report` takes `{paths?,format?,failOn?,requireComplete?}`. Formats: json, markdown, sarif. Thresholds: info, low, medium, high (default), critical. Findings at/above the threshold return CLI exit 2; clean selected-file results return 0; malformed input/runtime failures return 1. `requireComplete:true` also fails on declared partial coverage. TOML/YAML remain partially parsed; a clean report is not a security guarantee.

The native scanner adds TLS-validation bypasses, public binds, privileged containers, credential-store access, upload commands, shell input interpolation, hidden Unicode controls and concealed-result instructions. Reports distinguish document indicators from configuration indicators and omit secret values. Examples in docs may legitimately trigger indicators; evaluate reachability before treating a finding as a vulnerability.

Without `--json`, audit output is the selected report itself, so it can be redirected directly. `--json` instead returns the wrapper with format, failed, exitCode and report. For CI, add a step after the existing trusted checkout/runtime setup:

```sh
node bin/just-vibe.mjs audit report --root . --stdin > agent-config.sarif <<'JSON'
{"format":"sarif","failOn":"high","requireComplete":false}
JSON
```

Retain/upload that artifact through the repository's existing CI integration, including when the scan returns 2. SARIF is machine-readable output; GitHub code-scanning upload permissions and product availability remain separate.

AgentShield remains an optional external installation. just-vibe does not download or execute an unversioned package. `audit configure` takes `{revision,binary,sha256,version,source}`: absolute executable path, SHA-256 of the reviewed entrypoint, exact semver and reviewed HTTPS source/release URL. This pins entrypoint bytes and version, **not its transitive dependency tree**; review and pin the installation's dependencies separately. Configuration does not execute the binary or grant trust.

Inspect `audit status`, then explicitly `audit trust {revision,sha256}`. `audit untrust {revision}` revokes it. `audit run {format?,failOn?,deep?}` rechecks identity, verifies --version and runs `scan --path <bound-project> --format json`. Local scan timeout is 30 seconds; `deep:true` uses --opus with a 120-second bound and may use a paid model account. Deep analysis requires the user's explicit authorization and the external tool's account prerequisites. No --fix, --deep (which also executes hooks), or online supply-chain flag is added. A changed entrypoint is refused before execution.

Deep mode uses private temporary JSON report/log files because AgentShield emits terminal model analysis separately from its static JSON. The integration returns bounded, redacted analysis text as untrusted external output and records the vendor's completion/error log; an incomplete analysis fails the gate even when the vendor exits successfully. Temporary artifacts are removed afterward. The severity threshold evaluates static findings, not a model's correctness or judgment. JSON and SARIF retain the analysis status/text; Markdown includes a quoted analysis section. Titles/remediation are redacted and static evidence snippets are omitted. Redaction recognizes common credential patterns and cannot guarantee that every arbitrary secret was detected; review reports before sharing. Interrupted scans never become a clean pass.

The integration has protocol fixtures; that does not establish the installed third-party tool's detection quality or prove that its optional model analysis ran. See [AgentShield's maintained documentation](https://github.com/affaan-m/agentshield) for its separate features and installation provenance.
