# ui worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Fix the dialog’s keyboard behavior without redesigning it.

**Evidence:** The opener owns focus, the modal has form fields, validation can fail, and closing removes the dialog.

**Decision:** Preserve visual tokens; define initial focus, tab containment, Escape behavior and focus return through failure states.

**Useful artifact:** A small interaction patch and a state-by-state verification report.

**Verification to perform:** Use actual keyboard interaction in a rendered UI; distinguish this from automated accessibility checks.

**Misleading case:** A focus call immediately after close may be too early if the opener has not remounted.
