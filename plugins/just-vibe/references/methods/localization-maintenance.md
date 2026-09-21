# Versioned translations and learning examples

Use when: translate documentation, localization, translated setup.

Maintain translated instructions and examples against an explicit canonical source version.

## Inspect first

- Source document hash, locale and terminology glossary
- Command literals, placeholders, paths and links
- Reader prerequisites and supported host versions

## Method

1. Translate prose while preserving code, flags, identifiers and safety/authority semantics. Use a glossary for recurring technical terms.
2. Track the exact source hash and mark translations stale when the source changes; never imply an outdated translation documents a new feature.
3. Build examples from small reproducible tasks with input, expected behavior, negative case and cleanup. Keep source text and generated output separate.
4. Render localized pages and verify links, wrapping, navigation and language metadata. Human language review is distinct from structural validation.

## Failure cases

- A translated command name no longer matches the CLI.
- A negation is lost and changes permission semantics.
- A working English link becomes a broken locale-relative path.

## Verification

- Compare preserved literals and source hashes.
- Run code examples where their dependencies are available.
- Report machine-authored translations as needing human language review until reviewed.

## Worked scenario

A translated installer guide keeps --target and --root unchanged and becomes visibly stale when their supported values change.

## Version-sensitive primary references

- [www.w3.org](https://www.w3.org/International/quicktips/) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.w3.org](https://www.w3.org/International/articles/language-tags/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
