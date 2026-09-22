import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {adaptiveStore,configureAdaptive} from '../plugins/just-vibe/scripts/lib/adaptive-store.mjs';
import {projectRoot,digest} from '../plugins/just-vibe/scripts/lib/storage.mjs';
test('Windows preserves a historical path-spelling store and refuses ambiguous history', {skip:process.platform!=='win32'}, t=>{
 const dir=mkdtempSync(join(tmpdir(),'jv-identity-')),root=join(dir,'Project'),home=join(dir,'home');mkdirSync(root);t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const canonical=projectRoot(root), legacy=canonical.toLowerCase(), other=canonical.toUpperCase();
 assert.notEqual(legacy,canonical);
 const seed=spelling=>{const path=join(home,'adaptive/projects',digest(spelling));mkdirSync(path,{recursive:true});writeFileSync(join(path,'config.json'),JSON.stringify({schemaVersion:1,revision:1,root:spelling,settings:{retentionDays:7}}));};
 seed(legacy);
 const store=adaptiveStore(root,{home});assert.equal(store.project,'adaptive/projects/'+digest(legacy));assert.equal(store.config().retentionDays,7);
 configureAdaptive(store,{scope:'project',revision:1,settings:{retentionDays:9}});assert.equal(adaptiveStore(root,{home}).config().retentionDays,9);
 // Seed another genuinely distinct historical key before the canonical path exists.
 seed(other);assert.throws(()=>adaptiveStore(root,{home}),/Multiple historical stores/);
});
