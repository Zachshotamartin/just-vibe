---
layout: ../../layouts/Doc.astro
title: Checks and integrations
description: Context warnings, trusted project checks, native editor events, GitHub coordination and security reports.
---

## Availability

These additions are included starting in just-vibe 0.10.0. In a checkout, replace `just-vibe` below with `node bin/just-vibe.mjs`.

## Notice context pressure and repeated work

Native hooks can warn when identical tool calls repeat or an editing turn touches many files. Warnings ask the agent to reassess the work; they do not interrupt an authorized broad change or treat intentional polling as a failure.

```sh
just-vibe health status --root /project
```

The monitor stores hashed tool/file identities and bounded counters, not raw prompts or arguments. It keeps at most 32 sessions and resets turn counters on a new request. Defaults warn after five repeated calls or twenty edited files; settings are configurable.

Context-capacity warnings require a real host measurement. An optional Claude status-line bridge reads the host's remaining percentage and prompts a handoff below the configured threshold. Unknown or stale capacity remains unknown. The bridge must be composed with your existing status line; setup does not replace it automatically. Context capacity is not a score for output quality.

## Detect checks, then explicitly trust them

```sh
just-vibe quality preview --root /project
```

The preview reads package scripts, lockfiles, declared Prettier/Biome dependencies and Ruff configuration. It proposes checks without running or installing anything. Ambiguous package managers require a choice. Review the actual scripts and binaries before configuring the preset and granting separate local automation trust.

Optional batching gathers edited files and runs each formatter once at the end of the turn. Staged and private files are skipped, unsuccessful work remains queued, and the Git index is preserved. The formatter must support multiple file arguments.

With commit checks enabled, recognized direct Git commit commands are checked against actual staged content. Conflict markers, credential indicators, failed checks or changed evidence block verification. Working-tree checks cannot certify a partially staged commit when tracked edits remain unstaged. These checks complement repository precommit and CI policy; they cannot intercept every shell program or Git client.

## Use native editor events

```sh
just-vibe setup --target cursor --root /project --profile core --editor-hooks
just-vibe setup --target opencode --root /project --profile core --editor-hooks
just-vibe setup --target zed --root /project --profile core
just-vibe setup --target hermes --root /path/to/actual/hermes-home --profile core
```

Cursor records requests, supplies routing context, translates enabled policy denials and can ask for one bounded continuation when evidence is missing. Its owned hook entries merge into existing configuration. OpenCode receives native workflow search/loading, quality preview and scanning tools, alongside message/tool/idle/compaction events. It uses the host's plugin SDK; its experimental system-context hook may change with OpenCode versions.

Updates and removal preserve unrelated settings. Edited owned entries stop an update, and interrupted shared-configuration writes have recovery records. Restart the editor after installation. Host trust, command trust and service credentials remain separate. Zed and Hermes provide skill installation without new event hooks.

## Coordinate GitHub work

An epic binds a local identifier to an existing GitHub issue. Sync reads the issue and comments. Planning prepares a claim, release, task decomposition or progress update, with dependency checks and the actual authenticated account. It requires repository write access and preserves existing issue content.

Inspect the exact comment preview before authorized publication. Changed remote state or a changed account stops posting. An uncertain response is recovered by finding the exact operation marker, without posting again. A missing result stays uncertain until manually verified and explicitly reconciled.

Claims are advisory coordination records. GitHub comments do not provide atomic locks; concurrent or inconsistent histories require reconciliation. Native tools can read and prepare local plans. Publishing remains a separate, explicitly authorized CLI operation. There is no agent attribution on comments.

## Produce security reports

```sh
just-vibe audit report --root /project --stdin > agent-config.sarif <<'JSON'
{"format":"sarif","failOn":"high","requireComplete":false}
JSON
```

JSON, Markdown and SARIF reports include locations, severity, confidence and remedies. The CLI exits 2 when the chosen severity threshold is reached; CI can retain the report even on failure. Findings cover agent permissions, hooks, MCP configuration, possible credentials, unsafe transport, shell input interpolation and related indicators. Malformed configuration fails the default threshold. Documentation examples can trigger indicators and need contextual review.

An optional AgentShield runner requires a separately reviewed installation, exact version, entrypoint hash and explicit local trust. Configuration never installs or runs it. Entrypoint changes revoke execution; dependencies require separate provenance review. Optional model analysis may use a paid account and requires authorization. Its static report and model output are handled separately; an analysis failure cannot become a passing check merely because the vendor exits successfully. Reports redact recognizable credentials but still need review before sharing. Fixture validation does not establish third-party detection quality or a successful paid analysis.

## More specific framework guidance

Existing build, repair, review and test workflows now load focused Django, FastAPI, Spring Boot, Flutter and React Native references when relevant. They cover transaction and async boundaries, authorization, lifecycle, platform behavior, failure cases and meaningful verification. They extend existing commands rather than introducing another set to memorize.

The installed package's `references/runtime-depth.md` contains complete operation schemas, trust boundaries and recovery procedures. See also [runtime tools](/docs/runtime/) and [compatibility](/docs/compatibility/).
