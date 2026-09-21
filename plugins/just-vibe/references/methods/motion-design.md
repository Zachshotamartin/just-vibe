# Motion, visual direction and click paths

Use when: gsap, motion design, framer motion, view transition, click path.

Implement the requested interaction or design direction after auditing the existing visual system.

## Inspect first

- Routes and layout ownership
- Animation library/version and reduced-motion rules
- Keyboard sequence and focus return targets

## Method

1. Write an interaction table: trigger, entering/exiting elements, interruption, focus and completion.
2. Choose one motion owner per property. Cancel or reverse in-flight transitions when a second interaction arrives; clean up observers and animation contexts on unmount.
3. Keep transform/opacity motion separate from layout measurement. Reserve media dimensions; delay measurement until required fonts/assets are ready.
4. Exercise page changes, back/forward, dropdown dismissal, hamburger focus, async loading and errors at narrow and wide widths. Use SVG/package icons, never unrequested emojis.

## Failure cases

- Overlapping tweens leave a menu invisible but focusable.
- Route exit animation removes the currently focused node without restoring focus.
- A reduced-motion branch omits a state change entirely.

## Verification

- Capture before/after browser states and keyboard navigation.
- Rapidly toggle and navigate during an animation, then verify final visibility, focus and scroll.
- Verify reduced-motion preserves every functional state.

## Worked scenario

A user opens then closes a menu during its entrance: cancel the entrance, close deterministically and return focus to the trigger.

## Version-sensitive primary references

- [gsap.com](https://gsap.com/docs/v3/GSAP/gsap.context()/) — Read the official source for the installed version before relying on a version-sensitive API.
- [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
