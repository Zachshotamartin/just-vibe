import {
  existsSync,
  readFileSync,
  mkdirSync,
  unlinkSync,
  statSync,
  readdirSync,
} from 'node:fs';
import { dirname } from 'node:path';
import { within, atomicJson, digest, readJson } from './storage.mjs';
import { requireId } from './runtime-store.mjs';
import { withFileLock, atomicFile } from './file-lock.mjs';

// Own only a namespaced block or exact hook entries, never the surrounding configuration.
export function managedFragment(root, id, path, kind, desired, operation, { dryRun = false } = {}) {
  requireId(id);
  const full = within(root, path);
  if (operation === 'doctor' || dryRun)
    return manage(root, id, path, kind, desired, operation, { dryRun });
  return withFileLock(within(root, `.just-vibe/installations/shared-${digest(full)}.lock`), () => {
    // Finish another owner's journal before changing the same destination, so
    // its before/after recovery hashes remain meaningful.
    const directory = within(root, '.just-vibe/installations');
    for (const file of readdirSync(directory).filter(p => p.endsWith('-fragment-pending.json') && p !== `${id}-fragment-pending.json`)) {
      const pending = readJson(within(root, `.just-vibe/installations/${file}`), 2 * 1024 * 1024);
      if (within(root, pending.path) === full) throw Error(`Recover the interrupted shared configuration operation ${file} before changing this destination.`);
    }
    return manage(root, id, path, kind, desired, operation, { dryRun });
  });
}
function manage(root, id, path, kind, desired, operation, { dryRun }) {
  const recordPath = `.just-vibe/installations/${id}-fragment.json`,
    journalPath = `.just-vibe/installations/${id}-fragment-pending.json`;
  const read = (p) =>
    existsSync(within(root, p)) ? JSON.parse(readFileSync(within(root, p), 'utf8')) : null;
  const state = read(recordPath) || {
      revision: 0,
      fragment: kind === 'text' ? '' : {},
      created: false,
    },
    pending = read(journalPath);
  const full = within(root, path);
  if (existsSync(full) && (!statSync(full).isFile() || statSync(full).size > 1024 * 1024))
    throw Error('Shared configuration must be a bounded regular file.');
  const before = existsSync(full) ? readFileSync(full, 'utf8') : null;
  const currentHash = before === null ? null : digest(before);
  if (pending) {
    if (pending.path !== path || ![pending.beforeHash, pending.afterHash].includes(currentHash))
      throw Error(
        'Shared configuration changed during recovery; preserve it and reconcile the pending journal.',
      );
    if (operation === 'doctor' || dryRun) return { interrupted: true, path };
    if (currentHash === pending.beforeHash) write(pending.after);
    // A crash after record commit must not advance the ownership record twice.
    if (JSON.stringify(state.fragment) !== JSON.stringify(pending.next.fragment) || state.created !== pending.next.created)
      atomicJson(root, recordPath, pending.next, state.revision);
    unlinkSync(within(root, journalPath));
    return manage(root, id, path, kind, desired, operation, { dryRun });
  }
  const target = operation === 'uninstall' ? (kind === 'text' ? '' : {}) : desired;
  let after;
  if (kind === 'text') {
    const start = `<!-- just-vibe:${id}:start -->`,
      end = `<!-- just-vibe:${id}:end -->`;
    const expected = state.fragment ? `${start}\n${state.fragment}\n${end}` : '';
    let base = before || '';
    const at = base.indexOf(start),
      last = base.indexOf(end);
    if (at >= 0 || last >= 0) {
      if (
        !expected ||
        at < 0 ||
        last < at ||
        base.slice(at, last + end.length) !== expected ||
        base.indexOf(start, at + 1) >= 0
      )
        throw Error('Managed instruction block was edited or is unowned.');
      base = base.slice(0, at) + base.slice(last + end.length);
    } else if (expected && operation !== 'uninstall')
      throw Error('Managed instruction block is missing.');
    after = target
      ? `${base}${base && !base.endsWith('\n') ? '\n' : ''}${start}\n${target}\n${end}`
      : base;
    if (state.created && !after.trim()) after = null;
  } else if (kind === 'mcp') {
    const data = before ? JSON.parse(before) : {};
    if (!data || typeof data !== 'object' || Array.isArray(data))
      throw Error('Expected a JSON host configuration object.');
    for (const [section, entries] of Object.entries(state.fragment)) {
      if (!['mcpServers', 'mcp'].includes(section)) throw Error('Invalid owned MCP section.');
      for (const [name, value] of Object.entries(entries)) {
        if (JSON.stringify(data[section]?.[name]) !== JSON.stringify(value))
          throw Error('Owned MCP entry changed or was removed.');
        delete data[section][name];
      }
    }
    for (const [section, entries] of Object.entries(target)) {
      if (!['mcpServers', 'mcp'].includes(section)) throw Error('Invalid MCP section.');
      if (
        data[section] !== undefined &&
        (!data[section] || typeof data[section] !== 'object' || Array.isArray(data[section]))
      )
        throw Error('Malformed MCP section.');
      data[section] ||= {};
      for (const [name, value] of Object.entries(entries)) {
        if (!name.startsWith('just-vibe-') || Object.hasOwn(data[section], name))
          throw Error('MCP name collision; preserve the existing declaration.');
        data[section][name] = value;
      }
    }
    after = JSON.stringify(data, null, 2) + '\n';
  } else {
    const data = before ? JSON.parse(before) : { version: 1, hooks: {} };
    if (
      data.version !== 1 ||
      !data.hooks ||
      typeof data.hooks !== 'object' ||
      Array.isArray(data.hooks)
    )
      throw Error('Unsupported Cursor hooks configuration.');
    for (const [event, entries] of Object.entries(state.fragment)) {
      const current = data.hooks[event] || [];
      if (!Array.isArray(current)) throw Error('Malformed hook list.');
      for (const item of entries) {
        const found = current.filter((e) => e.command === item.command);
        if (found.length !== 1 || JSON.stringify(found[0]) !== JSON.stringify(item))
          throw Error('An owned hook was edited or removed; preserve it before updating.');
      }
      data.hooks[event] = current.filter(
        (e) => !entries.some((item) => item.command === e.command),
      );
      if (!data.hooks[event].length) delete data.hooks[event];
    }
    for (const [event, entries] of Object.entries(target)) {
      if (data.hooks[event] && !Array.isArray(data.hooks[event]))
        throw Error('Malformed hook list.');
      if ((data.hooks[event] || []).some((e) => entries.some((item) => item.command === e.command)))
        throw Error('A matching hook is not owned by this installation.');
      data.hooks[event] = [...(data.hooks[event] || []), ...entries];
    }
    after =
      state.created &&
      !Object.keys(data.hooks).length &&
      Object.keys(data).every((k) => ['version', 'hooks'].includes(k))
        ? null
        : JSON.stringify(data, null, 2) + '\n';
  }
  if (operation === 'doctor')
    return {
      path,
      installed: state.revision > 0,
      outdated: JSON.stringify(state.fragment) !== JSON.stringify(desired),
      interrupted: false,
    };
  if (dryRun) return { path, operation, changed: before !== after, dryRun: true, planHash: digest(JSON.stringify({ revision: state.revision, currentHash, after })) };
  const next = { fragment: target, created: state.revision ? state.created : before === null };
  if (before === after && JSON.stringify(state.fragment) === JSON.stringify(target))
    return { path, unchanged: true };
  atomicJson(
    root,
    journalPath,
    {
      path,
      beforeHash: currentHash,
      afterHash: after === null ? null : digest(after),
      after,
      next,
    },
    0,
    2 * 1024 * 1024,
  );
  // Recheck after journal acquisition. A concurrent manual edit is never overwritten.
  const actual = existsSync(full) ? digest(readFileSync(full)) : null;
  if (actual !== currentHash) throw Error('Shared configuration changed during preflight.');
  write(after);
  atomicJson(root, recordPath, next, state.revision);
  unlinkSync(within(root, journalPath));
  return { path, operation, changed: true };
  function write(text) {
    if (text === null) {
      if (existsSync(full)) unlinkSync(full);
      return;
    }
    mkdirSync(dirname(full), { recursive: true });
    atomicFile(full, text, existsSync(full) ? statSync(full).mode & 0o777 : 0o600);
  }
}
