import pkg from '../../../package.json';
import catalog from '../../../plugins/just-vibe/catalog/commands.json';
import profiles from '../../../plugins/just-vibe/catalog/profiles.json';
import packs from '../../../plugins/just-vibe/catalog/packs.json';
import { releaseManifest } from '../../../plugins/just-vibe/scripts/lib/release-manifest.mjs';
import { publishedVersion } from '../lib/catalog.mjs';
export const GET = () => new Response(JSON.stringify(releaseManifest({ ...pkg, version: publishedVersion }, catalog, profiles, packs), null, 2), { headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' } });
