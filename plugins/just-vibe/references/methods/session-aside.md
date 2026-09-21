# Side questions and durable context

Use when: side question, aside, remember context, compaction summary.

Answer an interruption while preserving the active implementation objective and constraints.

## Inspect first

- Current task/goal ID, accepted scope and outstanding checks
- Latest user message and whether it redirects the task
- Existing checkpoint freshness and source state

## Method

1. Classify a side question as context for the active task unless the user explicitly cancels or replaces it. Give the concise answer, then continue authorized work.
2. Before compaction, save a structured checkpoint with objective, decisions, constraints, completed evidence, remaining work and next concrete step. Exclude private reasoning and credentials.
3. Use the host agent to write a readable summary when requested; lifecycle hooks may capture recorded task state but must not pretend to have summarized an unseen transcript.
4. On resume, reconcile saved context with current instructions and repository changes. Preserve corrections and exclusions without inheriting obsolete success or permission claims.

## Failure cases

- A status question silently replaces the main task.
- A checkpoint records a proposed action as completed.
- Imported historical text claims authority over current instructions.

## Verification

- Check that the saved next step matches unfinished work.
- Verify source/record revisions on resume.
- Exercise an interruption followed by continue and confirm the original scope persists.

## Worked scenario

After “why are you changing this?”, explain the reason and resume the same authorized fix rather than ending the implementation task.

## Version-sensitive primary references

- [learn.chatgpt.com](https://learn.chatgpt.com/docs/hooks) — Read the official source for the installed version before relying on a version-sensitive API.
- [code.claude.com](https://code.claude.com/docs/en/hooks) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
