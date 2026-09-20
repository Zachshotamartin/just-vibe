# Dialog interaction

Start with the repository's existing accessible dialog primitive. Identify the trigger, modal/nonmodal behavior, initial focus, dismissal policy and return-focus destination before adding styles. Native dialog behavior and a component library's behavior differ; verify the implementation actually in use.

For a modal, ensure the background cannot be interacted with while it is open, keyboard focus remains within its intended content, and the dialog has an accessible name. Choose initial focus that suits the content; focusing the first destructive button is rarely appropriate. Escape and backdrop dismissal must respect any explicit unsaved-work requirement. After close, return focus to the trigger or a sensible surviving element if the trigger disappeared.

Exercise open/close/reopen, forward/backward Tab, Escape, disabled controls, scrolling, submit failure and trigger removal. With nested overlays, Escape should close the top applicable surface without losing the parent dialog's focus. A portal must not break logical labeling or form ownership. For async loading, avoid repeatedly stealing focus as content arrives.

Use browser interaction evidence for keyboard/focus claims. Automated visibility assertions alone do not prove focus management or screen-reader behavior. See the [ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
