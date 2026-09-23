---
layout: ../../layouts/Doc.astro
title: Automatic assistance
description: Describe the task. Let just-vibe select the relevant workflows and adapt to explicit feedback.
---

## Availability

Automatic assistance is included starting in **just-vibe 0.9.0**. Update older installations to receive it.

Automatic assistance uses native Codex and Claude Code hooks. Install or update just-vibe, review the plugin hooks in your host, and start a new conversation. Codex exposes hook review through its `/hooks` interface. The installer cannot grant native hook trust. Older hosts and disabled hooks fall back to ordinary skill selection, with weaker activation guarantees.

## Describe what you need

“Fix the mobile menu” should bring in the relevant UI method, available browser tools and interaction checks. “Why is training unstable?” should bring in training diagnostics and inspection of the available logs and configuration. “Address this PR’s feedback” should lead the agent to retrieve the relevant comments and work through the requested changes.

The request handler offers a small shortlist. The agent resolves the actual intent using the conversation and project, then loads the relevant full instructions. It can choose a different workflow or dismiss the suggestion. Current instructions and task boundaries always take precedence. Selecting a deployment workflow does not grant permission to deploy.

Slash commands remain optional shortcuts. Automatic assistance uses the same maintained workflows as the command library.

Short follow-ups such as “again” or “another pass” preserve the preceding coding request and its constraints for routing. They do not create a task without earlier context. If a prompt is too large or malformed, routing reports that it was skipped and prevents later activity from being attached to the previous task.

## Learn from explicit feedback

Say “You forgot the browser. Always check menu interactions in the browser.” The agent can save a project-specific lesson with that source statement. Future workflow loads include the changed instructions; the lesson can also improve routing, tool preferences and required checks.

Explicit positive feedback can preserve a successful approach. Silence, passing tests and the agent’s own output are not endorsements. The agent interprets the meaning and scope; the runtime checks provenance and versioning, rather than claiming to understand every preference mechanically.

Project scope is the default. Cross-project preferences require explicit wording such as “Across projects, always…” Current instructions override historical preferences. The distributed workflow stays maintained separately from personal customizations.

You can ask “What have you learned about me?”, “Forget that preference,” or “Roll back that lesson.” The agent inspects the saved history and resolves the exact target before making the requested change.

## Check that the work happened

The runtime distinguishes delivered instructions, observed tool activity, attributed reports, attached artifacts and blockers. A browser call does not automatically prove that a UI works. Changes to source or attached evidence make previous evidence stale.

When evidence is missing, the default completion hook allows one reminder to address it or record a real blocker. It then reports unresolved work rather than looping indefinitely. An unavailable browser remains an explicit limitation; it must not become a fabricated successful check.

## Controls and storage

The agent handles routine operations. For inspection from a terminal:

```sh
just-vibe assist status
just-vibe assist history
```

Automatic assistance, feedback capture and completion reminders can be disabled independently through its configuration. Ask the agent to change those preferences normally.

Personal data lives under `~/.just-vibe/adaptive`, or the configured `JUST_VIBE_HOME`. Project records are bound to the local project path. Task text is bounded and receives best-effort credential redaction; the default retention is 30 days. Explicit learning excerpts remain until forgotten. Hooks do not read conversation transcript files or upload data.

The system adds no model service. The active host still performs interpretation and implementation. Protocol and fixture tests establish bounded behavior, not perfect workflow selection or an objective measure of output quality.
