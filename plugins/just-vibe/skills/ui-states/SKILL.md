---
name: ui-states
description: "Add loading, empty, error, partial-data, disabled, and success states. Use to implement missing interface states; ui-flow connects states across a journey."
---

# ui-states

Add loading, empty, error, partial-data, disabled, and success states.

## Choose this workflow

Use to implement missing interface states; ui-flow connects states across a journey.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [UI and frontend methods](../../references/packs/ui.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; feature and valid loading/empty/error/partial/disabled/success conditions.

**Pack prerequisites:** Target screens/flows, existing design conventions, and runnable UI or supplied references. Visual claims require actual renders; accessibility claims distinguish automated, keyboard, and assistive-technology evidence.

- **Infer from evidence:** Inspect the target flow, existing components/tokens, actual renders or supplied references and current responsive behavior.
- **Reasonable default:** Reuse established visual conventions and preserve keyboard behavior; label unrendered changes as visually unverified.
- **Ask only when needed:** Ask about an unresolved interaction or visual direction only when plausible choices materially differ; do not make a missing screenshot block source inspection.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Missing state behavior and presentation for the selected feature.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Derive states from data and business rules, define transitions and recovery, implement accessible feedback, and exercise each state with controlled data.
2. Derive loading, empty, partial, stale, failed and success states from the data contract; define retry and back-navigation transitions before rendering them.

## Technical method

- **Inspect:** Enumerate request/data states and transitions, including partial success and stale content.
- **Method:** Preserve useful context and offer the action that can actually recover each failure; distinguish no results from unavailable data.
- **Avoid misdiagnosis:** Replacing failed data with an empty-state message misrepresents the result and can encourage destructive user action.
- **Check the result:** Trigger loading, empty, partial, failed and recovered states; verify user input, retry ownership and announcements survive transitions.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [UI and frontend worked example](../../references/examples/ui.md).
- Creating, editing or reviewing frontend UI, copy, states or visual assets: [Frontend iconography](../../references/frontend-icons.md).
- The affected project uses Flutter: [Flutter](../../references/frameworks/flutter.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- The task specifically involves gsap, motion design, framer motion, view transition, click path; load only the matching method: [Motion, visual direction and click paths](../../references/methods/motion-design.md).

## Decision branches

- **When a partial response has useful data and an error:** Preserve usable content and explain the failed portion rather than displaying a misleading empty state.

## Deliver and verify

- State-complete UI plus transition/state verification.
- State/trigger/message/action table and controlled fixture checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Empty data is distinguished from failed loading; a retry preserves relevant user input and context.

## Stop and recover

- Do not invent payment/account policies. Unspecified critical transitions become questions while independent states proceed.

## Example requests

- **Normal (apply):** Complete billing states for missing cards, failed renewal, and successful recovery.
- **Edge (apply):** Add partial failure and retry states to a dashboard without losing filters.
- **Blocked (inspect):** Design states with unknown payment policy; leave the policy-dependent transition unresolved.
