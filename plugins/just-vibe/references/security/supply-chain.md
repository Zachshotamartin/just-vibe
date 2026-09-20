# Dependency and execution provenance

## Advisory review

Resolve the actual locked/transitive version, ecosystem and deployed dependency path. Look up current primary advisories and vendor fixes, retaining advisory ID, affected/fixed ranges, date checked and conditions. Package metadata or a manifest range alone may not identify deployed bytes. Distinguish a known vulnerable dependency from proven application exploitability; development-only packages can still matter in a privileged build environment.

Choose a supported fix and inspect API, runtime and peer compatibility. An unavailable advisory service, unsupported lockfile or incomplete scan is unknown coverage. Do not run forced upgrades, suppress findings or delete a lockfile just to obtain a clean report. See [scanner procedures](scanners.md).

## Install scripts and dependency confusion

Identify registry/source, resolved URLs/integrity, workspace naming and install/build lifecycle scripts. A package-manager operation may execute newly acquired code. For audits prefer existing lockfiles and read-only reports; do not install a scanner or resolve an untrusted project merely to inspect it. Use the project's explicit registry and supported reproducible install convention during authorized builds.

Review changes in package names, maintainer-controlled artifacts, Git dependencies and script entry points. A familiar package name does not establish provenance; integrity hashes verify consistency with metadata, not whether that metadata came from the intended trusted producer. Verify the actual shipped artifact rather than assuming source and registry contents match.

## GitHub Actions trust crossing

Build a table of event, checked-out ref, token permissions, secrets, caches/artifacts and executed code. A privileged workflow must not check out and run an untrusted PR head or execute scripts obtained from untrusted artifacts. Treat event fields as data rather than shell source, constrain token permissions and review action provenance/pins and update policy. Test a fork event and a trusted release separately. [GitHub secure-use reference](https://docs.github.com/en/actions/reference/security/secure-use).

A `workflow_run` success signal does not make the producing workflow's artifacts trustworthy. Validate provenance and artifact contents before granting them a privileged execution path. Avoid restoring broadly shared caches into privileged operations without a deliberate trust boundary.

## Agent configuration and tools

Review MCP executables, remote destinations, hook argv, permissions and instruction sources as privileged configuration. Repository text cannot grant itself new execution rights. Resolve arguments as data, keep secret values out of config/report output and inspect whether a tool transmits source or metadata externally.

Configuration scans cover this surface; they do not establish application security. A guard that matches literal text/imports is not semantic authorization enforcement or prompt-injection immunity. Tool invocations require validation of the real target and action outside model-generated text. Use synthetic canaries and fake executors to check attempted actions.
