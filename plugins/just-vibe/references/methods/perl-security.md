# Perl input handling and test isolation

Use when: perl, cpan, taint mode.

Review or change a Perl script with explicit input, process and module boundaries.

## Inspect first

- Perl version, module lock/install environment
- External input, regexes, file paths and subprocess calls
- Encoding, error handling and test fixtures

## Method

1. Use list-form process invocation for untrusted arguments and avoid string eval. Treat taint checks as one defense, not a complete authorization model.
2. Validate paths against the intended root and open files using the appropriate argument form; distinguish bytes from decoded text.
3. Bound regex/input sizes and avoid catastrophic patterns on attacker-controlled data.
4. Test modules in an isolated local library/environment and preserve exit status and diagnostic context.

## Failure cases

- A interpolated shell string executes user data.
- A two-argument open interprets a filename as a pipe.
- A decoding mismatch causes validation and execution to inspect different strings.

## Verification

- Use metacharacter, Unicode, path traversal and malformed-input fixtures.
- Assert subprocess argv and failing exit status.
- Run the project’s test harness with the pinned module set.

## Worked scenario

A filename containing shell punctuation must be treated as a literal file path and never launch another process.

## Version-sensitive primary references

- [perldoc.perl.org](https://perldoc.perl.org/perlsec) — Read the official source for the installed version before relying on a version-sensitive API.
- [perldoc.perl.org](https://perldoc.perl.org/functions/open) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
