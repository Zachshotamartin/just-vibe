---
name: react-component
description: "Build a component with its states, API, and accessibility Use to implement one component with a clear contract; ui-system defines shared primitives and tokens."
---

# react-component

Build a component with its states, API, and accessibility

## Choose this workflow

Use to implement one component with a clear contract; ui-system defines shared primitives and tokens.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; purpose, props/API, visual constraints, states, and usage context.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

- **Infer from evidence:** Read component callers, ownership of state, installed React/framework versions and existing interaction tests.
- **Reasonable default:** Retain the framework and state library; preserve intended loading/error/empty behavior while resolving the named bug.
- **Ask only when needed:** Ask when product semantics such as persistence, optimistic failure or reset behavior have conflicting evidence; missing profiler access only blocks measured performance claims.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Reusable component plus necessary integration/example; no unrelated design-system replacement.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Inspect existing primitives and the consumer contract. Choose state ownership, semantics and interaction behavior before implementing the narrow component API.
2. Select only the relevant scenario guide for dialogs, menus and other non-dialog overlays, comboboxes or date inputs; implement normal and recovery states, then verify real interactions and parent-controlled updates.
## Technical method

- **Inspect:** Read the semantic interaction contract, controlled/uncontrolled API, state variants and existing component primitive.
- **Method:** Use the relevant dialog, combobox or date scenario; prefer a native control or proven primitive when it meets requirements.
- **Avoid misdiagnosis:** ARIA labels alone do not implement keyboard behavior, focus management or controlled value semantics.
- **Check the result:** Exercise keyboard, pointer, disabled/invalid states and two instances; verify focus return and announced errors where applicable.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [React worked example](../../references/examples/react.md).
- Implementing a dialog or modal overlay: [dialog interaction](../../references/scenarios/dialog.md).
- Implementing a menu button, tabs, disclosure, tooltip or popover: [menu, tabs, disclosure, tooltip and popover interaction](../../references/scenarios/menu.md).
- Implementing selection or autocomplete: [combobox interaction](../../references/scenarios/combobox.md).
- Implementing a date or range input: [date-picker interaction](../../references/scenarios/date-picker.md).
- Creating, editing or reviewing frontend UI, copy, states or visual assets: [Frontend iconography](../../references/frontend-icons.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- The task specifically involves react testing, react race, hydration mismatch, react strictmode; load only the matching method: [React state, async and render evidence](../../references/methods/react-behavior.md).

## Decision branches

- **When the component opens a modal or non-modal dialog:** Specify initial/contained/return focus and dismissal with the dialog guide.
- **When it is a menu button, tabs, disclosure, tooltip or popover:** Apply the matching pattern from the menu guide: roving tabindex or aria-activedescendant, arrow keys and typeahead where the pattern has them, Escape returning focus to the trigger, and Tab leaving without a focus trap. Prefer native details, the popover attribute or an existing primitive.
- **When search text and selection are different states:** Use the combobox guide for ownership, keyboard/IME behavior and late search results.
- **When the value contains dates or ranges:** Resolve date-only versus instant semantics, locale, invalid input and range boundaries before choosing storage.
- **When parent state changes after mount:** Preserve a consistent controlled ownership contract and test reset and two independent instances.

## Deliver and verify

- Component, documented contract, usage, and meaningful checks.
- Component API, rendered states, keyboard behavior and consumer example.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Controlled updates behave consistently; keyboard users can perform the primary interaction.

## Stop and recover

- Avoid speculative configuration options and new libraries without need. Missing design details use established conventions rather than blocking routine work.

## Example requests

- **Normal (apply):** Build an accessible controlled date-range component using existing primitives.
- **edge (apply):** Build a reusable selector supporting controlled updates and an empty option list.
- **blocked (inspect):** Specify a component using existing primitives when design assets are unavailable.
