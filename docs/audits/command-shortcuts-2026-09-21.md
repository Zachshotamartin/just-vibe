# Command shortcut verification — 2026-09-21

This records checks of the unreleased source changes, not an npm release or a general model-quality evaluation.

- Node 24: full validation and test suite, 400 tests total, 399 passed, one Windows-only skip.
- Native bundled installation lifecycles passed in isolated Codex 0.152.0 and Claude Code 2.1.258 configuration directories: setup, repeated setup, doctor, update, uninstall, repeated uninstall and reinstall.
- Claude Code 2.1.258 live startup listed all 220 canonical namespaced commands and all 220 jv aliases, plus the jv and just-vibe dispatchers.
- Four separate live Claude requests using /jv reprompt, /just-vibe reprompt, /jv:reprompt and /just-vibe:reprompt successfully returned rewritten prompts. The three forwarding forms called the canonical just-vibe:reprompt skill with the complete argument string. The canonical form loaded directly. The embedded explanatory task was not executed.
- Fixtures cover every catalog ID through all four parsers, multiline context preservation, unknown IDs, explicit routing over incidental task keywords, selected installations, ownership conflicts, selection expansion, edited files and uninstall preservation.
- Website production build generated 355 pages; four static catalog/link/metadata checks passed. The guide was inspected in the browser at desktop and 390px widths, with no document overflow. Its link is available from docs navigation and every command page.

Limits: live checks exercised a simple rewrite, not every command's behavior or every host/version. Prompt quality, implied assumptions and skill selection still require case-specific judgment. Codex uses its native skill picker; parser recognition does not add custom slash entries to another host's input box. New catalog behavior remains marked not-evaluated in the formal behavioral evaluation system.
