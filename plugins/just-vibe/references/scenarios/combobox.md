# Combobox interaction

First decide whether this is a native select, editable autocomplete, select-only combobox or multiselect. Preserve the chosen pattern's semantics and the existing primitive. Do not use a listbox role for an arbitrary menu or treat search text and committed selection as the same state.

Define ownership of input text, active option, committed value and popup visibility. Handle controlled parent updates and resets. Use the pattern's focus model consistently: if focus stays on the input, keep active-descendant identity valid as options change. A virtualized active option must exist in the accessible tree.

Specify arrow navigation, Enter, Escape, Tab, Home/End where applicable, and typeahead for select-only controls. Preserve native text editing and IME composition in editable controls. Decide whether clearing commits an empty value and what happens when the selected option disappears or becomes disabled.

For async search, distinguish loading, empty results and failed lookup. A late response for an older query must not replace current options. Exercise duplicate labels with distinct IDs, rapid typing, keyboard selection, pointer selection, blur, retries and two independent instances. Verify the accessible label and announced expanded/active state using the actual browser and available assistive technology. See the [ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
