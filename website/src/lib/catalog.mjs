import { releaseManifest } from '../../../plugins/just-vibe/scripts/lib/release-manifest.mjs';
import source from '../../../plugins/just-vibe/catalog/commands.json' with { type: 'json' };
import packSource from '../../../plugins/just-vibe/catalog/packs.json' with { type: 'json' };
import roles from '../../../plugins/just-vibe/catalog/profiles.json' with { type: 'json' };
import methodSource from '../../../plugins/just-vibe/catalog/methods.json' with { type: 'json' };
import pkg from '../../../package.json' with { type: 'json' };
import {
  capitalize,
  materializeAliases,
  validateCatalog,
} from '../../../plugins/just-vibe/scripts/lib/catalog.mjs';
import { validateProfiles } from '../../../plugins/just-vibe/scripts/lib/profiles.mjs';
import { compareVersions, publishedVersions } from '../../../scripts/lib/releases.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Canonical package data is read at build time. No filesystem or agent code
// enters the browser, and aliases retain the same contract as the CLI.
const catalog = materializeAliases({
  ...source,
  commands: source.commands.map((c) =>
    c.aliasOf
      ? c
      : {
          ...c,
          inputPolicy: c.inputPolicy ?? packSource.packs.find((p) => p.id === c.pack)?.inputPolicy,
        },
  ),
});
validateCatalog(catalog, packSource);
// Profiles use the same rules as the CLI: known canonical workflows, closed fields, unique names.
validateProfiles(roles, catalog, methodSource.methods);
export { capitalize };
export const commands = catalog.commands;
export const packs = packSource.packs;
export const profiles = roles.profiles;
export const families = roles.families;
export const release = releaseManifest(pkg, source, roles, packSource);
export const version = release.version;
// The website states the latest published version; the source version is shown only when it is
// ahead and unpublished. Builds run from website/ or the repository root, so search upward.
function repositoryRoot(start = process.cwd()) {
  for (let dir = start; ; dir = dirname(dir)) {
    const path = join(dir, 'package.json');
    if (existsSync(path) && JSON.parse(readFileSync(path, 'utf8')).name === 'just-vibe' && existsSync(join(dir, 'evals/releases'))) return dir;
    if (dirname(dir) === dir) return null;
  }
}
const repository = repositoryRoot();
export const publishedVersion = (repository && publishedVersions(repository).at(-1)) || version;
export const sourceUnreleased = compareVersions(version, publishedVersion) > 0;
export const counts = release.counts;
export const packName = (id) => packs.find((p) => p.id === id)?.name || id;
export const familyName = (id) => families.find((p) => p.id === id)?.name || id;
