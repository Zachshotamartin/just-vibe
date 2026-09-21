---
layout: ../../layouts/Doc.astro
title: Local workbench and focused methods
description: Use session continuity, reviewed local work and focused technical methods without memorizing commands.
---

## Availability

These features are included starting in **just-vibe 0.10.0**. Update older installations and review the host-specific activation settings.

## Describe the task

Automatic routing can suggest one of 43 focused methods in addition to the existing workflows. Examples include PyTorch autograd, recommender evaluation, React interaction tests, Kubernetes rollback, JVM persistence, Swift concurrency, network diagnosis and scientific citation checks. The agent loads only the relevant method and verifies the actual environment before relying on it.

From a checkout, discover methods with:

```sh
printf '%s' '{"query":"pytorch autograd"}' | node bin/just-vibe.mjs methods search --stdin
printf '%s' '{"id":"pytorch-debug"}' | node bin/just-vibe.mjs methods show --stdin
```

Each method supplies scope, inputs to inspect, a procedure, concrete failure cases, verification and a worked scenario. A method does not install a framework, authenticate a service or prove that its checks ran.

## Local operator and tool browser

Start the loopback interface from your checkout:

```sh
node plugins/just-vibe/scripts/operator-server.mjs --root /absolute/project
```

Open the private URL printed in the terminal. Search commands and methods, inspect workers and jobs, review overlapping ownership, and acknowledge local coordination records. The interface works with the bundled catalog. Stop its process to close it.

Finished dispatch requests can be retired from the board to free queue capacity. Their request identities remain recorded to prevent duplicate execution. Queued or active requests stay visible.

Add `--allow-install` to enable project skill-adapter management. Select a host and profile, preview the owned files, then apply the reviewed changes. Previews expire, reject intervening changes and cannot be replayed. Native user-level installation stays in the CLI. Keep the private URL out of shared logs.

## Durable context and checked execution

| Need                              | Runtime family                | Behavior                                                                                                             |
| --------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Resume visible session history    | `sessions`                    | Import visible messages, use aliases, search and capture structured checkpoints. Private reasoning is excluded.      |
| Inspect conflicting configuration | `inventory`, `portfolio`      | Inspect provenance and duplicates; review exact cleanup or amendment plans.                                          |
| Customize behavior                | `behavior`                    | Preview bounded declarative rules and toggle hook features.                                                          |
| Diagnose connectors               | `mcp-health`, `connectors`    | Separate reachability, configuration and real authenticated tool availability.                                       |
| Run bounded work                  | `runners`, `jobs`, `services` | Require explicit trust and execution authority; retain interrupted reservations and owned-process recovery.          |
| Get independent reviews           | `council`                     | Create independent inspect-only assignments, including different hosts, and retain disagreement.                     |
| Verify a candidate                | `evaluation`                  | Bind checks and judgments to fresh source/artifact identities; export receipts and record reviewed promotion.        |
| Explain the codebase              | `atlas`, `graph`              | Maintain anchored tours and provenance-aware local context.                                                          |
| Watch a deployment                | `canary`                      | Check explicit endpoints during a bounded interval and use opted-in change notifications.                            |
| Inspect operations                | `usage`, `telemetry`          | Report actual observations; unknown costs stay unknown and usage is not a quality score.                             |
| Update installations              | `updater`                     | Check, preview and apply a pinned archive while preserving selections and edited files; prepare rollback separately. |

## Recovery and evidence

Cancellation stops owned job processes and suppresses follow-up verification. A service checks stop requests and current trust immediately before launch. Stopping a canary aborts active requests and prevents later targets and notifications. Effects already completed remain part of the recorded outcome.

Session imports disclose omitted messages and characters. Use `sessions window` with message and character offsets to retrieve another slice from the unchanged original transcript. User-scope history stays protected when replacing records.

Managed installers serialize shared configuration changes, replace complete files atomically and recover journals after a confirmed dead writer. Unknown or legacy lock ownership requires inspection; foreign edits are preserved. Reconnect attempts reserve before execution and require explicit recovery after interruption.

Usage reports preserve the rates assigned to each observed delta. Deltas spanning a price change remain unpriced, and later pricing updates cannot rewrite historical estimates. Telemetry exports deduplicate unchanged observations while giving status changes distinct IDs; these exports are snapshots of retained records and can miss intermediate transitions.

## Boundaries and verification

The Node runtime has no production dependencies. An optional Python client supports separate OpenAI/Anthropic API credentials and Ollama, visible streaming and explicitly allowed fixed runner tools. Provider transport fixtures do not prove live accounts work.

Nineteen adapter targets are described, including Codex/Claude specialist adapters. Kiro, Cursor and OpenCode have opt-in event bridges. Other new targets provide owned skill files; live model behavior varies by host and version. Framework/device/cloud checks run when their actual prerequisites are available, and unavailable checks remain visible.

The implementation is compared against a frozen ECC source snapshot, with each of the 49 remaining groups mapped to source, named checks and outstanding acceptance requirements. A delivered method or a passing source-hash check does not establish full acceptance. It does not claim universal superiority, complete commercial-service availability or identical internals.
