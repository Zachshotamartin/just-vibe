# Documents, slides and translation artifacts

Use when: document conversion, slide deck, pdf form, document translation.

Create or transform an artifact while preserving semantic structure, layout and editability.

## Inspect first

- Source format, tracked changes/forms and fonts
- Requested editable/export formats and page sizes
- Available document/presentation tools and localization requirements

## Method

1. Inspect the source structure and render before changing it. Preserve tables, headings, links, alt text, fields and intentional page breaks.
2. Use format-aware libraries or host tools rather than treating a document as plain text. Keep source and exported artifacts separate.
3. For translation, maintain a glossary, placeholders, numbers, dates and command literals. Flag ambiguous legal/technical terms for review instead of inventing certainty.
4. Render every changed page/slide, inspect overflow and reading order, and verify the final deliverable opens in the intended application.

## Failure cases

- A conversion flattens an editable form without disclosure.
- Text expansion overlaps a table or slide footer.
- A translated command flag no longer works.

## Verification

- Compare page count, links, form fields and key numbers.
- Inspect all rendered pages and representative accessibility structure.
- Provide actual editable and export files with known limitations.

## Worked scenario

A translated setup guide preserves shell commands byte-for-byte while adapting explanatory prose and checking longer headings for overflow.

## Version-sensitive primary references

- [python-docx.readthedocs.io](https://python-docx.readthedocs.io/en/latest/) — Read the official source for the installed version before relying on a version-sensitive API.
- [python-pptx.readthedocs.io](https://python-pptx.readthedocs.io/en/latest/) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.w3.org](https://www.w3.org/WAI/tutorials/page-structure/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
