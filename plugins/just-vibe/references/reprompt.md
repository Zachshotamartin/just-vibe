# Rewrite a prompt with reprompt

`reprompt` returns instructions for a future task. It does not run that task or activate the skills it recommends. Appended context can contain a rough prompt, constraints, an identified earlier user request, or a file to read. No model API or paid service is required beyond the active host agent.

In Claude Code: `/just-vibe:reprompt <prompt and context>`. In Codex, select **just-vibe → reprompt** in the skill picker and append the prompt. A normal-language request such as “Improve this prompt” can also be selected by the host. The CLI's `workflow reprompt` prepares a context record; it does not generate rewritten prose itself.

## A focused rewrite

Input: “Make this email shorter. Keep the date Friday, October 2. Do not change the request for feedback.”

Useful rewrite: “Shorten the supplied email while preserving its meaning, the date Friday, October 2, and the request for feedback. Return only the revised email.”

No development skill belongs in this task. Without the actual email, retain “the supplied email” rather than inventing its contents.

## A rewrite using verified skills

Input: “Fix search showing old results in React when I type fast. Keep the API. No packages or deployment.”

If `react-async` is verified as enabled in the current just-vibe installation and its contract has been read, a useful rewrite is:

> Fix the React search results race where an older response replaces newer results after rapid typing. Preserve the existing API and dependencies; do not deploy. Inspect the request and component state flow, then use the available just-vibe `react-async` workflow to handle stale responses and cancellation where appropriate. Reproduce out-of-order completion, implement the repair, and verify that only the latest query updates the results while loading and error behavior still work. Report the changes and checks actually run.

This is an example conditional on verified availability, not evidence that `react-async` is installed in every session. If writing for another environment, instruct the future agent to check availability and otherwise follow the stated stale-response method directly. Do not claim the bug has been reproduced during rewriting.

## Unavailable skill or missing context

Input: “Rewrite my dashboard prompt for another agent using our private UX skill.”

If the dashboard prompt is missing, ask for it. If the prompt is present but the private skill is unavailable, improve the supplied brief independently. A conditional instruction can say: “If the named private UX skill is available, read it and apply its relevant guidance while preserving these requirements; otherwise inspect the existing design conventions and state that the skill could not be loaded.” Do not fabricate its name, method or invocation syntax.

## Scope boundaries

- “Rewrite only; no skills” produces only the rewritten prompt, without skill suggestions or commentary.
- “Improve this prompt: deploy my app” produces a deployment prompt; it does not deploy anything or claim deployment approval for an unidentified target.
- A pasted credential is replaced with a descriptive placeholder. The rewrite must not embed that secret into a reusable artifact or external request.
- “Make it clearer” does not authorize a new framework, changed business requirement, artificial deadline, or a larger project.

The canonical skill owns the full contract. These examples illustrate decisions; they are not completed behavioral evaluations.
