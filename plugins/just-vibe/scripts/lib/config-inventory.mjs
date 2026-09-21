import { existsSync, lstatSync, renameSync, readFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { runtimeStore, object, cleanText, requireId, timestamp } from './runtime-store.mjs';
import { within, digest } from './storage.mjs';
import { parseJsonc } from './configuration-values.mjs';
import { boundedText, walkFiles, checkedLocation, safeUrl, boundedList } from './capability-io.mjs';
import { redact } from './process.mjs';
import { PROJECT_HOST_PATHS } from './host-paths.mjs';

const DEFAULT_PATHS = PROJECT_HOST_PATHS;
const CONFIG_NAMES =
  /(?:^|\/)(?:[^/]*settings[^/]*|config|opencode|hooks|mcp|\.mcp|\.lsp|\.claude|[^/]*plugin)\.(?:json|jsonc|toml)$/i;
function stripComment(line) {
  let quote = null,
    escaped = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote === '"' && c === '\\') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '#') return line.slice(0, i);
  }
  return line;
}
function tomlKey(text) {
  const parts = text.match(/"(?:\\.|[^"\\])*"|'[^']*'|[A-Za-z0-9_-]+/g) || [];
  if (parts.join('.') !== text.trim()) throw Error('Unsupported TOML key syntax.');
  return parts.map((p) =>
    p.startsWith('"') ? JSON.parse(p) : p.startsWith("'") ? p.slice(1, -1) : p,
  );
}
export function parseConfiguration(source, extension) {
  if (extension !== '.toml') return { value: parseJsonc(source), partial: false, unsupported: [] };
  const value = Object.create(null),
    unsupported = [];
  let table = value;
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    let line = stripComment(lines[i]).trim();
    if (!line) continue;
    try {
      if (line.startsWith('[')) {
        if (!/^\[[^\n]+\]$/.test(line) || line.startsWith('[[')) throw Error('table');
        table = value;
        for (const key of tomlKey(line.slice(1, -1))) {
          if (!Object.hasOwn(table, key)) table[key] = Object.create(null);
          if (!table[key] || typeof table[key] !== 'object' || Array.isArray(table[key]))
            throw Error('conflicting table');
          table = table[key];
        }
        continue;
      }
      const m = line.match(
        /^((?:"(?:\\.|[^"\\])*"|'[^']*'|[\w-]+)(?:\.(?:"(?:\\.|[^"\\])*"|'[^']*'|[\w-]+))*)\s*=\s*(.*)$/,
      );
      if (!m) throw Error('assignment');
      let raw = m[2];
      // Common literal arrays may span lines; full TOML expressions stay unknown.
      if (raw.startsWith('[')) {
        for (let n = 0; n < 80; n++) {
          try {
            JSON.parse(raw.replace(/,\s*\]$/, ']'));
            break;
          } catch {}
          if (++i >= lines.length) throw Error('array');
          raw += '\n' + stripComment(lines[i]);
        }
      }
      let parsed;
      if (/^'[^']*'$/.test(raw)) parsed = raw.slice(1, -1);
      else parsed = JSON.parse(raw.replace(/,\s*\]$/, ']'));
      const keys = tomlKey(m[1]);
      let target = table;
      for (const key of keys.slice(0, -1)) {
        if (!Object.hasOwn(target, key)) target[key] = Object.create(null);
        if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key]))
          throw Error('conflict');
        target = target[key];
      }
      if (Object.hasOwn(target, keys.at(-1))) throw Error('duplicate');
      target[keys.at(-1)] = parsed;
    } catch {
      unsupported.push(i + 1);
      table = Object.create(null);
    }
  }
  return { value, partial: unsupported.length > 0, unsupported };
}
function serverEntries(value) {
  return Object.entries(value?.mcpServers || value?.mcp_servers || value?.mcp || {}).filter(
    ([, s]) => s && typeof s === 'object' && !Array.isArray(s),
  );
}
function normalizeServer(name, server, source) {
  const command = Array.isArray(server.command)
    ? server.command
    : [server.command, ...(server.args || [])];
  const env = server.env || server.environment || {},
    endpoint = safeUrl(server.url || '');
  const transport = endpoint ? 'http' : command[0] ? 'stdio' : 'unknown';
  return {
    key: digest(`${source.root}:${source.path}:${name}`).slice(0, 24),
    name: redact(name),
    host: source.host,
    scope: source.scope,
    source: source.path,
    location: source.root,
    transport,
    executable: command[0] ? basename(String(command[0])).slice(0, 200) : null,
    argumentCount: Math.max(0, command.length - 1),
    endpoint,
    envKeys: Object.keys(env).sort().slice(0, 100),
    headerKeys: Object.keys(server.headers || {})
      .sort()
      .slice(0, 100),
    enabled: server.enabled !== false && server.disabled !== true,
    configHash: digest(JSON.stringify(server)),
    identity: digest(
      JSON.stringify({ transport, endpoint, command, envKeys: Object.keys(env).sort() }),
    ),
    authenticated: 'unknown',
  };
}
export function configurationInventory(root, payload = {}, options = {}) {
  object(payload, ['locations']);
  const locations = boundedList(
    payload.locations || [{ root, host: 'project', paths: DEFAULT_PATHS }],
    'locations',
    12,
  ).map((item) => checkedLocation(root, item, options));
  const configurations = [],
    servers = [],
    skills = [],
    hooks = [],
    permissions = [],
    lsp = [],
    plugins = [],
    issues = [];
  let partial = false;
  for (const location of locations) {
    const scan = walkFiles(location.root, {
      paths:
        location.paths ||
        (location.scope === 'user'
          ? [
              'settings.json',
              'settings.local.json',
              'config.toml',
              'skills',
              'hooks',
              'plugins',
              'cache',
            ]
          : DEFAULT_PATHS),
    });
    partial ||= scan.partial;
    issues.push(...scan.skipped.map((s) => ({ ...s, location: location.root })));
    for (const file of scan.files) {
      const source = { ...location, path: file.path };
      if (file.path.endsWith('/SKILL.md') || file.path === 'SKILL.md') {
        try {
          const text = boundedText(location.root, file.path),
            front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
          const name =
            front?.[1].match(/^name:\s*(.+)$/m)?.[1]?.replace(/^['"]|['"]$/g, '') ||
            basename(resolve(file.path, '..'));
          const description = front?.[1].match(/^description:\s*(.+)$/m)?.[1] || '';
          const references = [...text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)]
            .map((m) => m[1])
            .filter((p) => !/^[a-z]+:|^\//i.test(p));
          const broken = references.filter((p) => {
            try {
              return !existsSync(within(location.root, resolve(location.root, file.path, '..', p)));
            } catch {
              return true;
            }
          });
          skills.push({
            id: digest(`${location.root}/${file.path}`).slice(0, 24),
            name: redact(name).slice(0, 200),
            description: redact(description).slice(0, 600),
            host: location.host,
            location: location.root,
            scope: location.scope,
            path: file.path,
            hash: digest(text),
            contentHash: digest(text.replace(/^---[\s\S]*?---/, '').trim()),
            bytes: file.bytes,
            modifiedAt: file.modifiedAt,
            frontmatter: !!front,
            brokenReferences: broken.slice(0, 30),
            execution: /\b(?:Bash|exec|spawn|curl|npx|pip install)\b/.test(text)
              ? 'instructions-reference-execution'
              : 'instructions',
            observedUse: 'unknown',
          });
        } catch {
          issues.push({ path: file.path, location: location.root, reason: 'unreadable-skill' });
          partial = true;
        }
      }
      if (!CONFIG_NAMES.test(file.path)) continue;
      try {
        const text = boundedText(location.root, file.path),
          parsed = parseConfiguration(text, extname(file.path));
        partial ||= parsed.partial;
        const record = {
          host: location.host,
          location: location.root,
          scope: location.scope,
          path: file.path,
          hash: digest(text),
          bytes: file.bytes,
          partial: parsed.partial,
          unsupportedLines: parsed.unsupported,
        };
        configurations.push(record);
        for (const [name, server] of serverEntries(parsed.value))
          servers.push(normalizeServer(name, server, source));
        for (const [name, config] of Object.entries(
          parsed.value.lspServers || parsed.value.lsp || {},
        ))
          lsp.push({
            name: redact(name),
            source: file.path,
            host: location.host,
            configHash: digest(JSON.stringify(config)),
          });
        const pluginValue =
          parsed.value.enabledPlugins || parsed.value.plugins || parsed.value.plugin || [];
        for (const name of Array.isArray(pluginValue) ? pluginValue : Object.keys(pluginValue))
          plugins.push({
            name: redact(String(name)).slice(0, 200),
            source: file.path,
            host: location.host,
          });
        for (const [event, entries] of Object.entries(parsed.value.hooks || {})) {
          if (!Array.isArray(entries)) continue;
          for (const entry of entries)
            for (const hook of entry.hooks || [entry]) {
              const command = typeof hook.command === 'string' ? hook.command : '';
              hooks.push({
                event,
                source: file.path,
                location: location.root,
                hash: digest(JSON.stringify(hook)),
                kind: hook.type || 'unknown',
                scriptNames: [
                  ...command.matchAll(
                    /(?:^|[\s"'])([^\s"']+\.(?:js|mjs|cjs|py|sh|ps1))(?=$|[\s"'])/g,
                  ),
                ].map((m) => basename(m[1])),
                enabled: hook.enabled !== false,
              });
            }
        }
        for (const [effect, entries] of Object.entries(parsed.value.permissions || {})) {
          if (!Array.isArray(entries)) continue;
          for (const rule of entries)
            if (typeof rule === 'string')
              permissions.push({
                effect,
                source: file.path,
                location: location.root,
                hash: digest(rule),
                tool: rule.split('(')[0].slice(0, 80),
                broad: /\*|allow-all|bypass/i.test(rule),
              });
        }
      } catch {
        issues.push({
          path: file.path,
          location: location.root,
          reason: 'malformed-or-unreadable-configuration',
        });
        partial = true;
      }
    }
  }
  const duplicates = (items, key) =>
    [...new Set(items.map((i) => i[key]))]
      .map((value) => items.filter((i) => i[key] === value))
      .filter((a) => a.length > 1);
  const serverDuplicates = duplicates(servers, 'identity').map((a) => ({
    servers: a.map((s) => s.key),
    hosts: [...new Set(a.map((s) => s.host))],
  }));
  const serverConflicts = duplicates(servers, 'name')
    .filter((a) => new Set(a.map((s) => s.identity)).size > 1)
    .map((a) => ({ name: a[0].name, servers: a.map((s) => s.key) }));
  const skillDuplicates = duplicates(skills, 'contentHash').map((a) => ({
    ids: a.map((s) => s.id),
    names: a.map((s) => s.name),
  }));
  return {
    observedAt: timestamp(),
    configurations,
    servers,
    skills,
    hooks,
    permissions,
    lsp,
    plugins,
    issues,
    partial,
    serverDuplicates,
    serverConflicts,
    skillDuplicates,
    duplicatePermissions: duplicates(permissions, 'hash').map((a) => ({
      hash: a[0].hash,
      count: a.length,
    })),
    note: 'Read-only declarations, not authentication or reachability. No configuration or skill code was executed. Private values and command arguments are not returned.',
  };
}

export function resolveInventoryServer(root, payload, options = {}) {
  const report = configurationInventory(root, { locations: payload.locations }, options),
    found = report.servers.find((s) => s.key === payload.key);
  if (!found) throw Error('Unknown server; refresh the inventory.');
  const source = boundedText(found.location, found.source),
    parsed = parseConfiguration(source, extname(found.source));
  const config = serverEntries(parsed.value).find(
    ([name]) => digest(`${found.location}:${found.source}:${name}`).slice(0, 24) === payload.key,
  )?.[1];
  if (!config || digest(JSON.stringify(config)) !== found.configHash)
    throw Error('Server configuration changed during discovery.');
  return { server: found, config };
}

export function inventory(root, operation, payload = {}, options = {}) {
  if (operation === 'scan') return configurationInventory(root, payload, options);
  const store = runtimeStore(root, options);
  if (operation === 'changes')
    return {
      changes: store
        .list(store.prefix)
        .filter((p) => p.startsWith('config-change-'))
        .map((p) => store.get(p.replace('.json', '')))
        .filter((r) => options.allowUser !== false || r.location.scope !== 'user'),
    };
  object(payload, ['id', 'revision', 'location', 'path', 'reason', 'hash']);
  const id = requireId(payload.id),
    name = `config-change-${id}`,
    previous = store.get(name);
  if (operation === 'show') {
    if (!previous) throw Error('Unknown configuration change.');
    checkedLocation(root, previous.location, options);
    return previous;
  }
  if (operation === 'preview') {
    if (previous) throw Error('Use a new change ID.');
    const location = checkedLocation(root, payload.location || { root, host: 'project' }, options);
    const path = cleanText(payload.path, 'path', 1000),
      full = within(location.root, path),
      backup = `${path}.disabled-just-vibe-${id}`;
    if (!CONFIG_NAMES.test(path) && !path.endsWith('/SKILL.md') && !/\/(hooks|cache)\//.test(path))
      throw Error('Select a configuration, skill, hook or cache file.');
    const text = boundedText(location.root, path);
    if (existsSync(within(location.root, backup)))
      throw Error('Disable destination already exists.');
    const proposal = {
      id,
      location,
      path,
      backup,
      beforeHash: digest(text),
      bytes: lstatSync(full).size,
      reason: cleanText(payload.reason, 'reason', 1000),
      status: 'preview',
      createdAt: timestamp(),
    };
    return store.put(
      name,
      { ...proposal, hash: digest(JSON.stringify(proposal)) },
      payload.revision,
    );
  }
  if (!previous || payload.revision !== previous.revision || payload.hash !== previous.hash)
    throw Error('Review the exact current configuration preview first.');
  checkedLocation(root, previous.location, options);
  const source = within(previous.location.root, previous.path),
    backup = within(previous.location.root, previous.backup);
  const hashAt = (p) => (existsSync(p) ? digest(boundedText(previous.location.root, p)) : null);
  const current = hashAt(source),
    saved = hashAt(backup);
  if (
    operation === 'recover' &&
    previous.status === 'restoring' &&
    current === null &&
    saved === previous.beforeHash
  )
    operation = 'restore';
  if (operation === 'apply' || operation === 'recover') {
    if (
      current === previous.beforeHash &&
      saved === null &&
      ['preview', 'disabling'].includes(previous.status)
    ) {
      const pending = store.put(name, { ...previous, status: 'disabling' }, previous.revision);
      if (hashAt(source) !== previous.beforeHash || existsSync(backup))
        throw Error('Configuration changed before disable.');
      renameSync(source, backup);
      return store.put(
        name,
        { ...pending, status: 'disabled', updatedAt: timestamp() },
        pending.revision,
      );
    }
    if (
      current === null &&
      saved === previous.beforeHash &&
      ['disabling', 'disabled'].includes(previous.status)
    )
      return previous.status === 'disabled'
        ? previous
        : store.put(name, { ...previous, status: 'disabled' }, previous.revision);
    if (
      operation === 'recover' &&
      previous.status === 'restoring' &&
      current === previous.beforeHash &&
      saved === null
    )
      return store.put(name, { ...previous, status: 'restored' }, previous.revision);
    throw Error('Configuration changed; preserve both versions and reconcile manually.');
  }
  if (operation === 'restore') {
    if (
      !['disabled', 'restoring'].includes(previous.status) ||
      current !== null ||
      saved !== previous.beforeHash
    )
      throw Error('Restore would overwrite an edit or the backup changed.');
    const pending = store.put(name, { ...previous, status: 'restoring' }, previous.revision);
    if (existsSync(source) || hashAt(backup) !== previous.beforeHash)
      throw Error('Configuration changed before restore.');
    renameSync(backup, source);
    return store.put(
      name,
      { ...pending, status: 'restored', updatedAt: timestamp() },
      pending.revision,
    );
  }
  throw Error('Unknown inventory operation.');
}
