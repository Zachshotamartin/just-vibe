# Date and date-range components

Resolve whether values are calendar dates, instants or zoned appointments. A date-only value should not change day because it was serialized through a local-midnight timestamp. Reuse the repository's date library and locale conventions. Separate display formatting, parsing and storage representation.

Define range inclusivity, minimum/maximum dates, blocked dates, incomplete ranges and whether changing the start resets or preserves the end. Distinguish an empty value from invalid typed input. Do not silently swap reversed endpoints unless the product calls for that behavior.

Prefer an existing calendar/date-input primitive. For a popup calendar, use its keyboard grid model and dialog focus behavior; provide a clear month/year label and keep only the intended grid cell in the Tab order. Preserve keyboard access to manual entry and validation errors. Test month/year boundaries, leap day, locale-specific week starts and date formats. Include daylight-saving transitions when values represent instants or local appointments.

Exercise a controlled parent reset, disabled dates inside a range, keyboard navigation across months, an empty value, invalid manual input and submission after closing the popup. Use [dialog guidance](dialog.md) when the calendar is modal. Reference the [ARIA date picker example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) for interaction decisions, not as a substitute for testing the shipped component.
