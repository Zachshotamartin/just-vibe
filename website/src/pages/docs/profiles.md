---
layout: ../../layouts/Doc.astro
title: Engineering profiles
description: Give the agent a useful professional perspective without changing the scope of your request.
---

## Pick the role the task needs

The [profile library](/profiles/) includes application engineering, interfaces, platform infrastructure, data, machine learning, security, architecture and technical leadership, quality and developer relations, and specialized systems. Every profile includes priorities, a decision principle, verification guidance, boundaries, and a concrete contribution.

```text
/just-vibe:profile Set machine-learning-engineer for this implementation,
with mlops-engineer as a secondary focus.
```

In Codex, select **profile** from just-vibe and provide the role and task. Use [profiles](/commands/profiles/) to discover roles from the current work.

## What actually changes

A frontend profile pays attention to state ownership, accessibility, and failed interactions. A machine learning profile looks for split integrity, leakage, reproducibility, and meaningful evaluation. A principal engineer examines boundaries and tradeoffs before proposing wider changes.

Profiles should produce useful task artifacts and relevant checks, not merely change the tone of the response. They do not install credentials, modify a host-global preference, create additional agents, or authorize infrastructure changes.

## Pins and automatic selection

You can explicitly select or pin a profile. The agent may propose a better fit when the task changes, but it should preserve your pin unless you ask to change it. A secondary role adds a relevant lens without turning every task into a committee.

```text
/just-vibe:profile Use principal-engineer to review this design,
but keep the change local and do not redesign the platform.
```

Profiles are task context. For durable project decisions, use [remember](/docs/memory/).
