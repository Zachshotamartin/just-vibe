import { existsSync, mkdirSync, readdirSync, lstatSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { atomicJson, digest, projectRoot, readJson, within } from './storage.mjs';
import { withFileLock, recoverFileLock } from './file-lock.mjs';

export const ADAPTIVE_DEFAULTS = Object.freeze({ enabled: true, learning: true, gate: 'bounded', retentionDays: 30 });
export const safeId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value);
export function requireId(value) { if (!safeId(value)) throw Error('Invalid adaptive record ID.'); return value; }
export function textField(value, label, max = 2000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || value.includes('\0')) throw Error(`${label} must be nonempty text up to ${max} characters.`);
  return value;
}

// Personal state stays outside repositories: a checkout cannot supply learned instructions.
export function adaptiveStore(root, { home = process.env.JUST_VIBE_HOME || join(homedir(), '.just-vibe'), allowUser = true } = {}) {
  root = projectRoot(root);
  if (existsSync(home) && lstatSync(home).isSymbolicLink()) throw Error('Adaptive home must not be a symlink.');
  let project = `adaptive/projects/${digest(root)}`;
  // Older Windows versions keyed state by the spelling of an 8.3 path.
  // Preserve that store in place instead of silently losing its history.
  if (process.platform === 'win32' && existsSync(home) && !existsSync(within(home, project))) {
    const directory = within(home, 'adaptive/projects');
    const matches = [];
    if (existsSync(directory)) {
      const projects = readdirSync(directory).filter(n => /^[a-f0-9]{64}$/.test(n));
      if (projects.length > 500) throw Error('Too many legacy project stores; migrate their path identities explicitly.');
      for (const key of projects) {
        const prefix = 'adaptive/projects/' + key;
        const candidates = ['config.json'];
        for (const group of ['runtime', 'learning', 'tasks']) {
          const folder = within(home, prefix + '/' + group);
          if (existsSync(folder)) candidates.push(...readdirSync(folder).filter(n => /^[a-z0-9-]+\.json$/.test(n)).slice(0, 1).map(n => group + '/' + n));
        }
        for (const path of candidates) {
          const full = within(home, prefix + '/' + path);
          if (!existsSync(full)) continue;
          const record = readJson(full, 1024 * 1024);
          if (typeof record.root === 'string' && digest(record.root) === key && existsSync(record.root) && projectRoot(record.root) === root) { matches.push(prefix); break; }
        }
      }
    }
    if (matches.length > 1) throw Error('Multiple historical stores refer to this project; review them before merging preferences.');
    if (matches.length === 1) project = matches[0];
  }
  const read = path => {
    if (!existsSync(home)) return null;
    const full = within(home, path);
    if (!existsSync(full)) return null;
    const record = readJson(full, 1024 * 1024);
    if (record.schemaVersion !== 1 || !Number.isInteger(record.revision) || record.revision < 1) throw Error('Invalid adaptive record.');
    if (record.root !== undefined && projectRoot(record.root) !== root) throw Error('Adaptive record belongs to another project.');
    return record;
  };
  const write = (path, value, revision = 0) => {
    mkdirSync(home, { recursive: true, mode: 0o700 });
    return atomicJson(home, path, { schemaVersion: 1, ...value }, revision, 1024 * 1024);
  };
  const list = path => {
    if (!existsSync(home)) return [];
    const full = within(home, path);
    if (!existsSync(full)) return [];
    return readdirSync(full).filter(n => /^[a-z0-9-]+\.json$/.test(n)).sort();
  };
  const remove = path => { const full = within(home, path); if (existsSync(full)) unlinkSync(full); };
  const removeIfCurrent = (path, revision, predicate) => {
    const full = within(home, path);
    try {
      return withFileLock(`${full}.lock`, () => {
        const current = read(path);
        if (!current || current.revision !== revision || !predicate(current)) return false;
        unlinkSync(full);
        return true;
      });
    } catch (error) {
      if (error.code === 'STATE_LOCKED') return false;
      throw error;
    }
  };
  const config = () => ({ ...ADAPTIVE_DEFAULTS, ...(read('adaptive/config.json')?.settings || {}), ...(read(`${project}/config.json`)?.settings || {}) });
  const taskPath = id => `${project}/tasks/${requireId(id)}.json`;
  const task = id => {
    const record = read(taskPath(id));
    if (!record || record.kind !== 'task') throw Error('Unknown task in this project.');
    return record;
  };
  return { root, home, project, allowUser, read, write, list, remove, removeIfCurrent, config, taskPath, task,
    saveTask: (value, revision = value.revision ?? 0) => write(taskPath(value.id), value, revision),
    sessionPath: (host, session) => `${project}/sessions/${digest(`${host}:${textField(session, 'session ID', 256)}`)}.json`,
  };
}

export function configureAdaptive(store, payload) {
  if (!payload || !['project', 'user'].includes(payload.scope) || !Number.isInteger(payload.revision) || payload.revision < 0) throw Error('Configuration needs scope and current revision.');
  const settings = payload.settings;
  if (!settings || Object.keys(settings).some(k => !Object.hasOwn(ADAPTIVE_DEFAULTS, k))
    || (settings.enabled !== undefined && typeof settings.enabled !== 'boolean')
    || (settings.learning !== undefined && typeof settings.learning !== 'boolean')
    || (settings.gate !== undefined && !['advisory', 'bounded'].includes(settings.gate))
    || (settings.retentionDays !== undefined && (!Number.isInteger(settings.retentionDays) || settings.retentionDays < 1 || settings.retentionDays > 90))) throw Error('Invalid adaptive settings.');
  const path = payload.scope === 'user' ? 'adaptive/config.json' : `${store.project}/config.json`;
  return store.write(path, { settings, ...(payload.scope === 'project' ? { root: store.root } : {}) }, payload.revision);
}

export function pruneAdaptive(store, now = Date.now()) {
  const cutoff = now - store.config().retentionDays * 86400000;
  const read = path => {
    try { return store.read(path); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  };
  const records = store.list(`${store.project}/tasks`).map(name => ({ name, value: read(`${store.project}/tasks/${name}`) })).filter(r => r.value)
    .sort((a, b) => Date.parse(b.value.updatedAt) - Date.parse(a.value.updatedAt));
  const active = new Set();
  for (const name of store.list(`${store.project}/sessions`)) {
    const path = `${store.project}/sessions/${name}`, session = read(path);
    if (!session) continue;
    if (Date.parse(session.updatedAt) < cutoff) {
      if (store.removeIfCurrent(path, session.revision, current => Date.parse(current.updatedAt) < cutoff)) continue;
      const current = read(path);
      if (current) active.add(current.taskId);
    } else active.add(session.taskId);
  }
  let removed = 0;
  for (const [index, { name, value }] of records.entries()) {
    if ((!active.has(value.id) && index >= 100) || Date.parse(value.updatedAt) < cutoff) {
      if (store.removeIfCurrent(`${store.project}/tasks/${name}`, value.revision,
        current => (!active.has(current.id) && index >= 100) || Date.parse(current.updatedAt) < cutoff)) removed++;
    }
  }
  return { removed };
}

export function recoverAdaptive(store, scope) {
  if (!['project', 'user'].includes(scope)) throw Error('Recovery needs project or user scope.');
  if (!existsSync(store.home)) return { recovered: [], active: [] };
  const start = scope === 'project' ? store.project : 'adaptive/learning';
  const locks = []; let visited = 0;
  function visit(path) {
    const full = within(store.home, path);
    if (!existsSync(full)) return;
    for (const entry of readdirSync(full, { withFileTypes: true })) {
      if (++visited > 2000) throw Error('Recovery scan exceeded its bound; inspect adaptive storage manually.');
      const next = `${path}/${entry.name}`;
      if (entry.isDirectory()) visit(next);
      else if (entry.isFile() && entry.name.endsWith('.json.lock')) locks.push(next);
    }
  }
  visit(start);
  if (scope === 'user' && existsSync(within(store.home, 'adaptive/config.json.lock'))) locks.push('adaptive/config.json.lock');
  const recovered = [], active = [];
  for (const path of locks) {
    const full = within(store.home, path);
    try {
      const result = recoverFileLock(full);
      if (result === 'recovered') recovered.push(path);
      else if (result === 'active') active.push(path);
    }
    catch (error) {
      if (error.code !== 'STATE_LOCKED') throw error;
      active.push(path);
    }
  }
  return { recovered, active };
}
