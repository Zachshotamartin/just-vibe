# Releasing just-vibe

Releases use the public `just-vibe` package on npm. A prepared archive is not a published package: verify the exact version and archive integrity in the registry after publication.

## Check and package

Use Node.js 24 and npm. From a clean checkout:

```sh
npm ci --ignore-scripts
npm run release:check
npm run release:prepare
```

`release:check` runs catalog/manifests/generated-file validation, unit and packaging tests, version/license/changelog checks, archive allowlisting, relative-link checks, and common credential-pattern checks. These checks cannot prove the absence of every secret or software defect; review the file list and diff too.

`release:prepare` performs those checks, creates `dist/just-vibe-VERSION.tgz`, executes that exact archive through npm, pnpm 10/12 and Yarn 4 in temporary projects, checks persistence after cache removal, and writes a SHA-256 checksum plus a source-commit release record. It does not publish. Test helpers download pinned package-manager executables into temporary directories and do not replace your global tools.

For installer changes, also run `npm run test:hosts`. This uses the real installed Codex and Claude CLIs with temporary configuration and managed-copy directories. It does not use your normal plugin configuration or call a model. Run `npm run test:hosts -- --local` for the development channel, and `-- --github` only after pushing the same version (private Git access required).

The `prepublishOnly` hook runs `release:check` for directory-based `npm publish`. Publishing a tarball or using `--ignore-scripts` bypasses that hook. The release workflow separately validates the archive before using either.

## First publication

1. Create/sign into the npm account that will own `just-vibe` and enable 2FA. Check name availability again immediately before publishing.
2. Review the MIT license and release notes, commit the release, and wait for every CI job at that commit to pass. Native host validation is recorded separately; CI does not log in to agent accounts.
3. Run `npm login`, then `npm whoami`. Do not paste tokens into the repository or chat.
4. Run `npm run release:prepare`, review the archive, and run `npm run release:publish -- --check`. This checks the clean source commit, prepared archive, completed CI and npm login. Then run `npm run release:publish -- --publish` and complete npm's authentication prompt. The command verifies registry integrity and exact-version execution; it reconciles an uncertain response without automatically retrying publication.
5. Verify the exact version using `npm exec --yes --package=just-vibe@VERSION -- just-vibe --version`; test setup in a clean host profile, then create the matching `vVERSION` Git tag.

Only publish code/assets you have the rights to distribute. Retain third-party notices if third-party code is added later. The current npm package has no runtime dependencies. All included code and workflow documents are covered by the included MIT notice unless a file states otherwise.

## Subsequent GitHub releases with trusted publishing

After the package exists, configure its npm **Settings → Trusted publishing**:

- GitHub owner: `Zachshotamartin`
- Repository: `just-vibe`
- Workflow filename: `publish.yml`
- Environment: leave blank (the workflow does not declare one)
- Allow direct `npm publish` for this workflow.

The workflow uses Node 24 and npm 12 with OIDC. It needs no long-lived npm token. Private GitHub repositories can publish public packages; npm provenance is disabled for private repositories because npm cannot generate it from private source. The workflow enables provenance automatically if the repository is later made public.

Update `package.json`, both plugin manifests, the lockfile, and `CHANGELOG.md` together. Follow semantic versioning; during 0.x development, document breaking changes explicitly and increment the minor version. Published versions cannot be reused.

Push the release commit and matching `vVERSION` tag. Run **Publish npm package** from that tag with **publish** checked. All six platform/Node checks must pass; the release job then builds and tests the exact archive, checks its checksum and tag, and publishes it. Leaving **publish** unchecked performs a rehearsal without publishing. Ordinary pushes and PRs never publish.

If publication fails, check whether that exact version already exists before retrying. A successful upload followed by a failed verification still consumes the version. If a bad release is already live, publish a corrected new version and deprecate the affected one with a clear explanation.

Official references: [npm publishing](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/), [trusted publishing](https://docs.npmjs.com/trusted-publishers/), [semantic versioning](https://docs.npmjs.com/about-semantic-versioning/).

## Maintainer exception for unavailable CI

The default publisher still requires successful CI. An explicit maintainer instruction can waive unavailable CI for a specific release without recording a fictitious pass or disabling Actions globally. Keep the local checks and exact-archive verification: match the clean source commit, package/manifests, SHA-256 release record and tested tarball; check whether that version already exists before publication. Publish only those verified bytes, complete npm account verification, then compare registry integrity and execute the exact version from a fresh temporary directory/cache outside the source checkout. `npm exec` inside the package checkout can select the local package and fail to resolve its bin.

Record the reason, maintainer authorization, source commit, artifact hashes, local checks and outstanding platform coverage. Tag the actual published source revision. Never overwrite a published version or weaken the normal CI check for future releases. The [0.8.0 publication record](../evals/releases/0.8.0-publication.json), [0.8.1 publication record](../evals/releases/0.8.1-publication.json) and [0.9.0 publication record](../evals/releases/0.9.0-publication.json) document separately authorized release-specific exceptions.
