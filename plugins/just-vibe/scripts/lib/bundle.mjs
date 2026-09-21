import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { applySelection } from './selection.mjs';
import { loadCatalog } from './catalog.mjs';

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
        || (!existsSync(join(root, `plugins/just-vibe/skills/${command.id}/SKILL.md`))
          && !existsSync(join(root, `plugins/just-vibe/skills/${command.id}/REFERENCE.md`)))) throw new Error('Incomplete bundled skills.');
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

export function bundleFileHashes(root) {
  const hashes = {}; let count = 0, bytes = 0;
  function walk(path, prefix = '') {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (!prefix && entry.name === marker) continue;
      const full = join(path, entry.name), key = prefix ? prefix + '/' + entry.name : entry.name;
      if (entry.isSymbolicLink()) throw Error('Managed bundle contains a symlink.');
      if (entry.isDirectory()) walk(full, key);
      else if (entry.isFile()) {
        if (++count > 10000 || (bytes += lstatSync(full).size) > 64 * 1024 * 1024) throw Error('Managed bundle exceeds inspection limits.');
        hashes[key] = createHash('sha256').update(readFileSync(full)).digest('hex');
      } else throw Error('Managed bundle contains a special file.');
    }
  }
  walk(root); return Object.fromEntries(Object.entries(hashes).sort(([a],[b]) => a.localeCompare(b)));
}
function rejectLinks(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) throw new Error(`Unsupported bundled file: ${path}`);
  if (stat.isDirectory()) for (const name of readdirSync(path)) rejectLinks(join(path, name));
}

// Only the explicit package payload is copied. A failed copy leaves the previous source intact.
// Retain a valid managed copy on host failure so the same operation can be retried.
export function stageBundle(destination, { root = packageRoot, replace = false, selection, target = 'codex' } = {}) {
  const existing = inspectManaged(destination);
  if (selection && existing && !replace && JSON.stringify(selection) !== JSON.stringify(existing.selection)) throw Error('Use update to change an existing installation selection.');
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
    const locked = inspectManaged(destination);
    if (locked?.files && JSON.stringify(locked.files) !== JSON.stringify(bundleFileHashes(destination))) throw Error('Managed bundle has user edits or added files; preserve them before updating.');
    staging = mkdtempSync(join(dirname(destination), '.just-vibe-stage-'));
    for (const asset of assets) {
      mkdirSync(dirname(join(staging, asset)), { recursive: true });
      cpSync(join(root, asset), join(staging, asset), { recursive: true, dereference: false });
    }
    if (existsSync(join(root, 'LICENSE'))) cpSync(join(root, 'LICENSE'), join(staging, 'LICENSE'));
    const chosen = selection ? { ...existing?.selection, ...selection } : existing?.selection;
    if (selection?.profile !== undefined && selection.packs === undefined) chosen.packs = [];
    if (chosen) applySelection(join(staging, 'plugins/just-vibe'), chosen, loadCatalog(join(root, 'plugins/just-vibe')));
    // Codex's compatibility MCP format does not expand Claude's plugin-root
    // placeholder. Pin the bundled server to this persistent managed source,
    // leaving its cwd unset so it binds to the host's actual project directory.
    if (target === 'codex') writeFileSync(join(staging, 'plugins/just-vibe/.mcp.json'), JSON.stringify({ mcpServers: { 'just-vibe': {
      command: 'node',
      args: [join(resolve(destination), 'plugins/just-vibe/scripts/mcp.mjs')],
      env_vars: ['JUST_VIBE_HOME'],
    } } }, null, 2) + '\n');
    validateBundle(staging);
    writeFileSync(join(staging, marker), `${JSON.stringify({ schemaVersion: 1, owner: 'just-vibe', version, files: bundleFileHashes(staging), ...(chosen ? { selection: chosen } : {}) })}\n`);
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
    if (backup && committed && existing?.files) rmSync(backup, { recursive: true, force: true });
    // Legacy installs lack baseline hashes. Retain their complete recovery copy.
    rmSync(lock, { recursive: true, force: true });
  }
}
