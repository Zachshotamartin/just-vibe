# Focused quality, console and documentation hooks

Use when: console cleanup, documentation hook, design quality hook, pre-push gate.

Configure bounded relevant checks that preserve partial staging and existing hook ownership.

## Inspect first

- Existing hook manager and project scripts
- Changed/staged paths and check cost
- Formatter ownership, trusted argv and failure policy

## Method

1. Start from the minimal/standard/strict preset, then inspect each enabled feature. Trust exact command identities separately from writing configuration.
2. Use extension/path-based checks to limit work. Console scanning must distinguish intentional server logging from accidental UI debug output; documentation checks should verify referenced paths and commands.
3. Run commit checks against staged content and reject claims that a dirty working-tree test certifies a different index. Compose pre-push checks through the project’s existing hook manager when present.
4. Preserve foreign hooks and support exact uninstall. A bypass should be an explicit user action with its omitted evidence reported.

## Failure cases

- A formatter stages unrelated user edits.
- A noisy debug-log rule flags legitimate observability and gets ignored.
- A hook timeout is reported as passing.

## Verification

- Invoke the native Git hook from a plain Git client.
- Test partial staging, spaces in paths, failed checks and changed hook files.
- Verify each feature can be disabled without silently disabling unrelated guards.

## Worked scenario

A staged file containing a credential indicator should block a normal Git commit even when no coding agent is involved.

## Version-sensitive primary references

- [git-scm.com](https://git-scm.com/docs/githooks) — Read the official source for the installed version before relying on a version-sensitive API.
- [pre-commit.com](https://pre-commit.com/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
