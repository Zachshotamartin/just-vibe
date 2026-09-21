# Flox, containers and reproducible development

Use when: flox, uncloud, dev environment, reproducible environment.

Build a pinned local environment or reviewed deployment recipe without installing global tools implicitly.

## Inspect first

- Lockfiles, OS/architecture, runtime ABI
- Flox manifest/lock or container build stages
- Uncloud target identity, service ports, secrets and storage

## Method

1. Resolve the existing environment manager first. Pin interpreter/compiler and native library inputs; separate development tools from deployment dependencies.
2. Run a clean-shell reproduction with documented activation and explicit environment-variable names. Keep secrets outside committed manifests.
3. For deployment, inspect generated service configuration and image digest; verify health, persistent volumes, traffic handoff and a rollback image.
4. For content-hash caches, include all semantic inputs: source, flags, dependency versions and environment-sensitive settings. Write entries atomically and validate metadata on read.

## Failure cases

- Host-only libraries make a lockfile appear reproducible while builds differ.
- A cache key ignores compiler flags and returns an incompatible artifact.
- Rollback restores code but loses a required data volume.

## Verification

- Compare artifact identities from two clean local builds.
- Invalidate one semantic input and confirm a cache miss.
- Exercise startup/health/shutdown using synthetic data.

## Worked scenario

Changing a feature flag included in compilation must invalidate the cache even when source files are unchanged.

## Version-sensitive primary references

- [flox.dev](https://flox.dev/docs/) — Read the official source for the installed version before relying on a version-sensitive API.
- [uncloud.run](https://uncloud.run/docs/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
