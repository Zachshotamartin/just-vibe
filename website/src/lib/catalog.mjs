import { releaseManifest } from '../../../plugins/just-vibe/scripts/lib/release-manifest.mjs';
import source from '../../../plugins/just-vibe/catalog/commands.json' with { type: 'json' };
import packSource from '../../../plugins/just-vibe/catalog/packs.json' with { type: 'json' };
import roles from '../../../plugins/just-vibe/catalog/profiles.json' with { type: 'json' };
import pkg from '../../../package.json' with { type: 'json' };
import {
  materializeAliases,
  validateCatalog,
} from '../../../plugins/just-vibe/scripts/lib/catalog.mjs';
import { validateProfiles } from '../../../plugins/just-vibe/scripts/lib/profiles.mjs';

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
validateProfiles(roles, catalog);
export const commands = catalog.commands;
export const packs = packSource.packs;
export const profiles = roles.profiles;
export const families = roles.families;
export const release = releaseManifest(pkg, source, roles, packSource);
export const version = release.version;
export const counts = release.counts;
export const packName = (id) => packs.find((p) => p.id === id)?.name || id;
export const familyName = (id) => families.find((p) => p.id === id)?.name || id;
