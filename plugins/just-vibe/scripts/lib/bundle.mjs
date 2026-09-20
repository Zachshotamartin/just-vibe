import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const packageRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const marker = '.just-vibe-managed.json';
const assets = ['plugins/just-vibe', '.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json'];

export function managedSource(target, env = process.env) {
  return resolve(env.JUST_VIBE_HOME || join(homedir(), '.just-vibe'), 'marketplaces', target);
}

export function validateBundle(root) {
  for (const name of ['.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json']) {
    const manifest = JSON.parse(readFileSync(join(root, name), 'utf8'));
    const plugin = manifest.plugins?.[0];
    if (manifest.name !== 'just-vibe' || manifest.plugins.length !== 1 || plugin.name !== 'just-vibe'
        || (typeof plugin.source === 'string' ? plugin.source : plugin.source.path) !== './plugins/just-vibe') {
      throw new Error('Invalid bundled marketplace.');
    }
  }
  const versions = ['codex', 'claude'].map(host => {
    const manifest = JSON.parse(readFileSync(join(root, `plugins/just-vibe/.${host}-plugin/plugin.json`), 'utf8'));
    if (manifest.name !== 'just-vibe' || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(manifest.version)) throw new Error('Invalid bundled plugin.');
    return manifest.version;
  });
  if (versions[0] !== versions[1]) throw new Error('Bundled plugin versions disagree.');
  const catalog = JSON.parse(readFileSync(join(root, 'plugins/just-vibe/catalog/commands.json'), 'utf8'));
  for (const command of catalog.commands) {
    if (!/^[a-z0-9-]+$/.test(command.id)
        || !existsSync(join(root, `plugins/just-vibe/skills/${command.id}/SKILL.md`))) throw new Error('Incomplete bundled skills.');
  }
  if (!existsSync(join(root, 'plugins/just-vibe/scripts/toolkit.mjs'))) throw new Error('Missing bundled runtime.');
  return versions[0];
}

export function inspectManaged(root) {
  let stat;
  try { stat = lstatSync(root); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  if (stat.isSymbolicLink()) throw new Error(`Refusing to replace a symlink at ${root}.`);
  let data;
  try { data = JSON.parse(readFileSync(join(root, marker), 'utf8')); } catch {}
  if (data?.owner !== 'just-vibe' || data.schemaVersion !== 1) {
    throw new Error(`Directory is not managed by just-vibe: ${root}. Choose another JUST_VIBE_HOME; no files were replaced.`);
  }
  return data;
}

function rejectLinks(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) throw new Error(`Unsupported bundled file: ${path}`);
  if (stat.isDirectory()) for (const name of readdirSync(path)) rejectLinks(join(path, name));
}

// Only the explicit package payload is copied. A failed copy leaves the previous source intact.
// Retain a valid managed copy on host failure so the same operation can be retried.
export function stageBundle(destination, { root = packageRoot, replace = false } = {}) {
  const existing = inspectManaged(destination);
  if (existing && !replace) { validateBundle(destination); return existing.version; }
  let version;
  try { version = validateBundle(root); }
  catch (error) {
    throw new Error(`A complete npm package is needed to install/update the bundled source. Run pnpm dlx just-vibe@latest ${replace ? 'update' : 'setup'}. ${error.message}`);
  }
  for (const asset of assets) rejectLinks(join(root, asset));
  mkdirSync(dirname(destination), { recursive: true });
  const lock = `${destination}.lock`;
  try { mkdirSync(lock); }
  catch { throw new Error(`Another installation may be running (${lock}). Retry after it finishes. If it was interrupted, inspect and remove only that lock directory.`); }
  let staging;
  let backup;
  let committed = false;
  try {
    // Recheck ownership while holding the copy lock.
    inspectManaged(destination);
    staging = mkdtempSync(join(dirname(destination), '.just-vibe-stage-'));
    for (const asset of assets) {
      mkdirSync(dirname(join(staging, asset)), { recursive: true });
      cpSync(join(root, asset), join(staging, asset), { recursive: true, dereference: false });
    }
    if (existsSync(join(root, 'LICENSE'))) cpSync(join(root, 'LICENSE'), join(staging, 'LICENSE'));
    validateBundle(staging);
    writeFileSync(join(staging, marker), `${JSON.stringify({ schemaVersion: 1, owner: 'just-vibe', version })}\n`);
    if (existsSync(destination)) {
      backup = `${staging}-previous`;
      renameSync(destination, backup);
    }
    try { renameSync(staging, destination); }
    catch (error) { if (backup) { renameSync(backup, destination); backup = undefined; } throw error; }
    staging = undefined;
    committed = true;
    return version;
  } finally {
    if (staging) rmSync(staging, { recursive: true, force: true });
    // Never delete the recovery copy if restoring the old destination failed.
    if (backup && committed) rmSync(backup, { recursive: true, force: true });
    rmSync(lock, { recursive: true, force: true });
  }
}
