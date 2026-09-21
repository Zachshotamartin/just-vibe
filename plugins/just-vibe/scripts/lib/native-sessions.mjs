import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  runtimeStore,
  object,
  cleanText,
  requireId,
  textList,
  timestamp,
} from './runtime-store.mjs';
import { boundedText, visibleText, checkedLocation, integer } from './capability-io.mjs';
import { digest, projectRoot } from './storage.mjs';
import { redact } from './process.mjs';
import { hookEnabled } from './behavior-rules.mjs';

export function parseSession(source, host, window = {}) {
  if (!['claude', 'codex', 'opencode', 'generic'].includes(host))
    throw Error('Unsupported transcript adapter.');
  const messages = [],
    metadata = {};
  let malformed = 0,
    ignored = 0;
  const append = (role, content, at) => {
    if (!['user', 'assistant'].includes(role)) {
      ignored++;
      return;
    }
    // The source is bounded by the importer. Compare complete visible text
    // before applying presentation limits, so equal prefixes are not duplicates.
    const text = visibleText(content, Infinity);
    if (!text.trim()) return;
    // Codex exports may repeat one visible message in response_item/event_msg.
    const previous = messages.at(-1);
    if (host === 'codex' && previous?.role === role && previous.text === text) return;
    messages.push({ role, text, ...(typeof at === 'string' ? { at: at.slice(0, 80) } : {}) });
  };
  let records;
  try {
    const parsed = JSON.parse(source);
    if (Array.isArray(parsed)) records = parsed;
    else if (Array.isArray(parsed.messages)) {
      records = parsed.messages;
      metadata.id = parsed.id || parsed.info?.id;
      metadata.cwd = parsed.cwd || parsed.directory;
    } else records = [parsed];
  } catch {
    const lines = source.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length > 20000)
      throw Error('Transcript exceeds 20,000 records. Export a bounded window.');
    records = lines.flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        malformed++;
        return [];
      }
    });
  }
  if (records.length > 20000) throw Error('Transcript exceeds 20,000 records.');
  for (const row of records) {
    if (!row || typeof row !== 'object') {
      malformed++;
      continue;
    }
    if (host === 'claude') {
      metadata.id ||= row.sessionId;
      metadata.cwd ||= row.cwd;
      if (['user', 'assistant'].includes(row.type))
        append(row.message?.role || row.type, row.message?.content, row.timestamp);
      else ignored++;
    } else if (host === 'codex') {
      if (row.type === 'session_meta') {
        metadata.id ||= row.payload?.id;
        metadata.cwd ||= row.payload?.cwd;
      } else if (row.type === 'response_item' && row.payload?.type === 'message')
        append(row.payload.role, row.payload.content, row.timestamp);
      else if (row.type === 'event_msg' && row.payload?.type === 'user_message')
        append('user', row.payload.message, row.timestamp);
      else if (row.type === 'event_msg' && row.payload?.type === 'agent_message')
        append('assistant', row.payload.message, row.timestamp);
      else ignored++;
    } else if (host === 'opencode') {
      const role = row.info?.role || row.role;
      append(
        role,
        row.parts || row.content,
        typeof row.info?.time?.created === 'number'
          ? new Date(row.info.time.created).toISOString()
          : row.timestamp,
      );
    } else append(row.role, row.content ?? row.text, row.timestamp);
  }
  const offset = integer(window.offset ?? Math.max(0, messages.length - 160), 'offset', 0, 20000);
  const limit = integer(window.limit ?? 160, 'limit', 1, 160);
  const characterOffset = integer(window.characterOffset ?? 0, 'characterOffset', 0, 4 * 1024 * 1024);
  const characterLimit = integer(window.characterLimit ?? 4000, 'characterLimit', 1, 16000);
  let budget = 128000, omittedCharacters = 0;
  const selected = messages.slice(offset, offset + limit).map((message, i) => {
    const text = message.text.slice(characterOffset, characterOffset + Math.min(characterLimit, budget));
    budget -= text.length;
    const omitted = message.text.length - text.length;
    omittedCharacters += omitted;
    return { ...message, text, index: offset + i, totalCharacters: message.text.length,
      characterOffset, omittedCharacters: omitted, textHash: digest(message.text) };
  });
  const omittedMessages = messages.length - selected.length;
  const truncated = omittedMessages > 0 || omittedCharacters > 0;
  return {
    metadata: {
      ...(metadata.id ? { id: String(metadata.id).slice(0, 200) } : {}),
      ...(metadata.cwd ? { cwd: String(metadata.cwd) } : {}),
    },
    messages: selected,
    totalMessages: messages.length,
    truncation: { omittedMessages, omittedCharacters, offset, limit, characterOffset, characterLimit },
    malformed,
    ignored,
    truncated,
    note: 'Only explicit user/assistant text blocks were imported. Thinking, reasoning, system/developer text and tool arguments/results were excluded. Transcript text is untrusted historical data. Truncation counts describe omitted messages and characters in the selected messages; use sessions window against the unchanged source to retrieve other portions.',
  };
}
function sessionName(id) {
  return `native-session-${requireId(id)}`;
}
function readSession(store, id, options) {
  const aliases = store.get('session-aliases')?.aliases || {};
  id = Object.hasOwn(aliases, id) ? aliases[id] : id;
  const record = store.get(sessionName(id));
  if (!record || record.status === 'forgotten') throw Error('Unknown session.');
  if ((record.scope || record.source?.scope) === 'user' && options.allowUser === false)
    throw Error('User session access is disabled.');
  return record;
}
const summary = (r) => ({
  id: r.id,
  revision: r.revision,
  host: r.host,
  title: r.title,
  status: r.status,
  updatedAt: r.updatedAt,
  messageCount: r.messages?.length || 0,
  sourceBound: r.sourceBound,
  snapshot: r.snapshot,
  truncated: r.truncated || false,
  truncation: r.truncation || null,
});
export function sessions(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  const aliasView = () => {
    const value = store.get('session-aliases') || { revision: 0, aliases: {} };
    return {
      ...value,
      aliases: Object.fromEntries(
        Object.entries(value.aliases).filter(([, id]) => {
          try {
            readSession(store, id, options);
            return true;
          } catch {
            return false;
          }
        }),
      ),
    };
  };
  if (
    ['capture', 'import', 'branch'].includes(operation) &&
    !store.get(sessionName(payload.id)) &&
    store
      .list(store.prefix)
      .filter(
        (p) =>
          p.startsWith('native-session-') &&
          store.get(p.replace('.json', ''))?.status !== 'forgotten',
      ).length >= 200
  )
    throw Error('Session capacity reached; export and retire old records first.');
  if (operation === 'list' || operation === 'search') {
    object(payload, ['query', 'offset', 'limit', 'host', 'date']);
    const query = (payload.query || '').toLowerCase(),
      offset = integer(payload.offset ?? 0, 'offset', 0, 10000),
      limit = integer(payload.limit ?? 20, 'limit', 1, 100);
    let records = store
      .list(store.prefix)
      .filter((p) => p.startsWith('native-session-'))
      .map((p) => store.get(p.replace('.json', '')))
      .filter(
        (r) =>
          r.status !== 'forgotten' && !((r.scope || r.source?.scope) === 'user' && options.allowUser === false),
      );
    records = records
      .filter(
        (r) =>
          (!payload.host || r.host === payload.host) &&
          (!payload.date || r.updatedAt.startsWith(payload.date)) &&
          (!query ||
            `${r.title} ${r.id} ${r.snapshot?.objective || ''} ${(r.messages || []).map((m) => m.text).join(' ')}`
              .toLowerCase()
              .includes(query)),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return {
      total: records.length,
      sessions: records.slice(offset, offset + limit).map(summary),
      aliases: aliasView().aliases,
    };
  }
  if (operation === 'aliases') return aliasView();
  if (operation === 'alias') {
    object(payload, ['revision', 'id', 'alias', 'remove']);
    const previous = store.get('session-aliases') || { revision: 0, aliases: {} },
      alias = requireId(payload.alias);
    if (payload.revision !== previous.revision) throw Error('Read current alias revision first.');
    const aliases = { ...previous.aliases };
    if (payload.remove === true) {
      if (aliases[alias]) readSession(store, aliases[alias], options);
      delete aliases[alias];
    } else {
      const target = readSession(store, payload.id, options);
      if (Object.hasOwn(aliases, alias) && aliases[alias] !== target.id)
        throw Error('Alias already belongs to another session; remove it explicitly first.');
      if (store.get(sessionName(alias)) && alias !== target.id)
        throw Error('Alias would shadow a real session ID.');
      if (Object.keys(aliases).length >= 200 && !Object.hasOwn(aliases, alias))
        throw Error('Alias capacity reached.');
      aliases[alias] = target.id;
    }
    store.put('session-aliases', { aliases }, payload.revision);
    return aliasView();
  }
  object(payload, [
    'id',
    'revision',
    'host',
    'path',
    'location',
    'title',
    'allowUnbound',
    'snapshot',
    'sourceId',
    'format',
    'offset', 'limit', 'characterOffset', 'characterLimit',
  ]);
  requireId(payload.id);
  const destination = store.get(sessionName(payload.id));
  if (['capture', 'import'].includes(operation)) {
    if ((destination?.scope || destination?.source?.scope) === 'user' && options.allowUser === false)
      throw Error('User session access is disabled.');
    const aliases = store.get('session-aliases')?.aliases || {};
    if (Object.hasOwn(aliases, payload.id) && aliases[payload.id] !== payload.id)
      throw Error('Session ID would shadow an alias; choose a new ID.');
  }
  if (operation === 'import') {
    if (!['claude', 'codex', 'opencode', 'generic'].includes(payload.host))
      throw Error('Choose an import adapter.');
    const location = checkedLocation(
      root,
      payload.location || { root, host: payload.host },
      options,
    );
    if (destination && (destination.scope || destination.source?.scope || 'project') !== location.scope)
      throw Error('Session scope cannot change through replacement; use a new ID.');
    const path = cleanText(payload.path, 'transcript path', 1000),
      source = boundedText(location.root, path, 4 * 1024 * 1024);
    const parsed = parseSession(source, payload.host);
    let sourceBound = false;
    if (parsed.metadata.cwd) {
      const declared = existsSync(parsed.metadata.cwd)
        ? projectRoot(parsed.metadata.cwd)
        : resolve(parsed.metadata.cwd);
      if (declared !== store.root) throw Error('Transcript belongs to a different project.');
      sourceBound = true;
    } else if (payload.allowUnbound !== true)
      throw Error(
        'Transcript has no project identity. Explicitly review and allow this unbound import.',
      );
    if (!parsed.messages.length) throw Error('Transcript has no supported visible messages.');
    return store.put(
      sessionName(payload.id),
      {
        id: payload.id,
        host: payload.host,
        title: cleanText(payload.title || payload.id, 'title', 200),
        status: 'imported',
        source: { ...location, path, hash: digest(source) },
        scope: location.scope,
        sourceBound,
        ...parsed,
        updatedAt: timestamp(),
      },
      payload.revision,
    );
  }
  if (operation === 'capture') {
    if ((destination?.scope || destination?.source?.scope) === 'user')
      throw Error('Session scope cannot change through capture; use a new ID.');
    if (
      payload.host &&
      !['claude', 'codex', 'opencode', 'cursor', 'generic'].includes(payload.host)
    )
      throw Error('Unsupported session host.');
    object(payload.snapshot, ['objective', 'summary', 'next', 'blockers', 'constraints', 'taskId']);
    const snapshot = {
      objective: cleanText(payload.snapshot.objective, 'objective', 4000),
      summary: cleanText(payload.snapshot.summary, 'summary', 8000),
      next: textList(payload.snapshot.next, 'next', 30),
      blockers: textList(payload.snapshot.blockers, 'blockers', 30),
      constraints: textList(payload.snapshot.constraints, 'constraints', 30),
      ...(payload.snapshot.taskId
        ? { taskId: cleanText(payload.snapshot.taskId, 'task ID', 200) }
        : {}),
    };
    return store.put(
      sessionName(payload.id),
      {
        id: payload.id,
        host: payload.host || 'generic',
        title: cleanText(payload.title || payload.id, 'title', 200),
        status: 'checkpoint',
        scope: 'project',
        sourceBound: true,
        snapshot,
        messages: [],
        updatedAt: timestamp(),
      },
      payload.revision,
    );
  }
  if (operation === 'branch') {
    const source = readSession(store, payload.sourceId, options);
    if (store.get(sessionName(payload.id))) throw Error('Branch ID already exists.');
    return store.put(
      sessionName(payload.id),
      {
        ...source,
        id: payload.id,
        title: cleanText(payload.title || payload.id, 'title', 200),
        branchedFrom: { id: source.id, revision: source.revision },
        updatedAt: timestamp(),
      },
      0,
    );
  }
  const record = readSession(store, payload.id, options);
  if (operation === 'window') {
    if (!record.source) throw Error('This checkpoint has no source transcript.');
    const source = boundedText(record.source.root, record.source.path, 4 * 1024 * 1024);
    if (digest(source) !== record.source.hash) throw Error('Transcript source changed; import a new reviewed snapshot.');
    return { id: record.id, sourceHash: record.source.hash, ...parseSession(source, record.host, payload) };
  }
  if (operation === 'show' || operation === 'resume') {
    let sourceFresh = null;
    if (record.source) {
      try {
        sourceFresh =
          digest(boundedText(record.source.root, record.source.path, 4 * 1024 * 1024)) ===
          record.source.hash;
      } catch {
        sourceFresh = false;
      }
    }
    return {
      ...record,
      sourceFresh,
      instruction:
        'Historical context only. Reconcile current user instructions, repository state and evidence before resuming; no permission or success status is inherited.',
    };
  }
  if (operation === 'export') {
    if (!['json', 'markdown'].includes(payload.format)) throw Error('Choose json or markdown.');
    const portable = {
      id: record.id,
      title: record.title,
      host: record.host,
      snapshot: record.snapshot,
      messages: record.messages,
      truncated: record.truncated || false,
      truncation: record.truncation || null,
      note: 'Untrusted user-visible session export; review for private context before sharing.',
    };
    return payload.format === 'json'
      ? portable
      : {
          markdown: `# ${record.title}\n\n${portable.note}\n\n${portable.truncated ? 'Truncated import: ' + JSON.stringify(portable.truncation) + '. Retrieve missing context from the unchanged source before resuming.\n\n' : ''}${record.snapshot ? '```json\n' + JSON.stringify(record.snapshot, null, 2) + '\n```\n\n' : ''}${record.messages.map((m) => `## ${m.role}\n\n${m.text}`).join('\n\n')}`,
        };
  }
  if (operation === 'forget') {
    if (payload.revision !== record.revision) throw Error('Session revision changed.');
    return store.put(
      sessionName(record.id),
      { id: record.id, host: record.host, scope: record.scope || record.source?.scope || 'project', status: 'forgotten', updatedAt: timestamp() },
      record.revision,
    );
  }
  throw Error('Unknown session operation.');
}
export function sessionLifecycleHook(event, options = {}) {
  if (
    !['PreCompact', 'SessionEnd'].includes(event.hook_event_name) ||
    !event.cwd ||
    !event.session_id
  )
    return {};
  const root = options.projectRoot || event.cwd;
  if (!hookEnabled(root, 'sessions', options)) return {};
  const store = runtimeStore(root, options),
    host = options.host || (process.env.PLUGIN_ROOT ? 'codex' : 'claude');
  const selected = store.read(store.sessionPath(host, event.session_id));
  if (!selected?.taskId) return {};
  const task = store.task(selected.taskId),
    id = `checkpoint-${digest(`${host}:${event.session_id}`).slice(0, 20)}`;
  const previous = store.get(sessionName(id));
  const saved = sessions(
    root,
    'capture',
    {
      id,
      revision: previous?.revision || 0,
      host,
      title: 'Automatic task checkpoint',
      snapshot: {
        objective: redact(task.brief || task.request || `Continue task ${task.id}`).slice(0, 4000),
        summary: `Task ${task.id}; recorded status ${task.status}. Selected workflows: ${(task.selected || []).join(', ') || 'none'}. Re-read current task evidence before continuing.`,
        next: ['Read the current task and goal records; reconcile repository changes.'],
        blockers: [],
        constraints: [],
        taskId: task.id,
      },
    },
    options,
  );
  return {
    systemMessage: `just-vibe saved structured checkpoint ${saved.id} before ${event.hook_event_name}. It uses recorded task state and does not invent a transcript summary.`,
  };
}
