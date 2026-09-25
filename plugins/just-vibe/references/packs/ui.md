# UI methods

Read existing tokens/components and inspect the actual requested flow before editing. Establish viewport, theme, content, state and font conditions for comparisons. Screenshots at different conditions cannot support precise visual-difference claims.

Prioritize hierarchy, readability, primary action, recovery and content flow. Responsive work examines intrinsic widths, long text, intermediate breakpoints, zoom and input method; do not hide required content to fit a screenshot. Reuse semantic tokens rather than scatter near-duplicate hard-coded values.

Accessibility checks combine source/automated evidence with keyboard and focus behavior. Audit against a stated target (WCAG 2.2 AA unless the user names another). Thresholds: text contrast 4.5:1 (3:1 for large text), 3:1 for non-text UI components and visible focus indicators, pointer targets at least 24 by 24 CSS pixels or adequately spaced, content usable at 320 CSS pixels wide without two-dimensional scrolling, and text-spacing overrides without loss. Focused controls must not be hidden by sticky content, dragging needs a single-pointer alternative, and authentication must not depend on a cognitive test without an alternative. Menus, tabs, disclosures, tooltips and popovers follow their own patterns ([menu guide](../scenarios/menu.md)), not the dialog focus trap. Verify dialog entry/escape/return focus, error associations and dynamic announcements; label screen-reader checks unverified if not exercised. Motion needs interruption, cancellation and reduced-motion behavior that preserves all functionality.

For flows, enumerate entry, normal completion, cancellation, failure/retry and back navigation. Product policy determines transitions; do not invent billing or account rules. Report exactly which views/states were inspected and which remain unverified.

## Applied methods

### State and viewport matrix

Choose representative normal, empty, loading, error and long-content states for the actual journey. Inspect a narrow, intermediate and wide layout plus relevant zoom/input conditions. These are samples, not a claim of every device. Capture the viewport, DPR, theme, fonts and content when comparing visuals.

For a narrow settings screen, identify the intrinsic constraint causing overflow: fixed width, unbreakable content, grid minimum or an oversized child. Reflow it and verify focus and actions remain reachable. Hiding required controls is not responsive repair.

### Interaction checks

For a dialog: open by keyboard, confirm initial focus, traverse the intended focus sequence, close through supported methods and verify focus returns appropriately. For a form: activate labels, submit invalid data, inspect error association/announcement and retry while retaining input. Record the browser and assistive technology actually used. Automated scans and source review do not establish complete accessibility conformance.

For partial-data errors, keep valid content visible and identify the failed region. Empty data and failed fetching have different recovery actions. Motion must tolerate interruption and provide equivalent information with reduced motion enabled.

### Tokens and visual comparison

Use semantic tokens such as text-muted or surface-warning only when their roles remain coherent across themes and component states. Inspect representative specimens before broad adoption.

For visual diffs, match capture conditions and suppress only justified nondeterminism. A dynamic timestamp can be masked; a shifting panel cannot be dismissed merely because its content is dynamic. Report user-impacting geometry and state differences rather than blindly accepting a changed snapshot.
