import { runtimeStore, object, timestamp, cleanText } from './runtime-store.mjs';
import { randomUUID } from 'node:crypto';
import { processAlive } from './file-lock.mjs';
import { redact } from './process.mjs';
import { resolveInventoryServer } from './config-inventory.mjs';
import { httpUrl } from './capability-io.mjs';
import { runners } from './trusted-runners.mjs';

function retainServer(servers, entry) {
  const retained = servers.filter(s => s.key !== entry.key);
  while (retained.length >= 100) {
    const disposable = retained.findIndex(s => !s.attempt);
    if (disposable < 0) throw Error('MCP health capacity contains pending reconnects; complete or recover them before adding another server.');
    retained.splice(disposable, 1);
  }
  return [...retained, entry];
}

export function classifyMcpFailure(value) {
  const text = String(value).toLowerCase();
  if (/401|403|oauth|unauth|expired.*token/.test(text)) return 'authentication';
  if (/429|rate.?limit|quota/.test(text)) return 'rate-limit';
  if (/timeout|timed out|deadline/.test(text)) return 'timeout';
  if (/connection|econn|enotfound|503|502|unavailable/.test(text)) return 'transport';
  return 'tool-error';
}
export async function mcpHealth(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('mcp-health') || { revision: 0, servers: [] };
  if (operation === 'status')
    return {
      ...state,
      servers: state.servers
        .filter((s) => options.allowUser !== false || s.scope === 'project')
        .map((s) => ({ ...s, stale: Date.now() - Date.parse(s.at) > 120000 })),
    };
  object(payload, [
    'key',
    'locations',
    'revision',
    'configHash',
    'outcome',
    'failure',
    'runner',
    'runnerHash',
    'reason',
  ]);
  const { server, config } = resolveInventoryServer(root, payload, options);
  const previous = state.servers.find((s) => s.key === server.key);
  if (operation === 'observe') {
    if (!['success', 'failure'].includes(payload.outcome))
      throw Error('Use a real host-observed success or failure.');
  } else if (!['probe', 'reconnect', 'recover'].includes(operation))
    throw Error('Unknown MCP health operation.');
  if (payload.revision !== state.revision) throw Error('Read current MCP health revision first.');
  if (payload.configHash !== server.configHash)
    throw Error('Server configuration changed; inspect the current inventory.');
  if (operation === 'recover') {
    if (!previous?.attempt || previous.status !== 'reconnecting') throw Error('No interrupted reconnect to recover.');
    if (processAlive(previous.attempt.pid)) throw Error('Reconnect owner is still running; inspect it before recovery.');
    const recovered = { ...previous, status: 'reconnect-inconclusive', attempt: null,
      recoveredAttempt: previous.attempt, reason: cleanText(payload.reason, 'recovery evidence', 2000), at: timestamp() };
    return store.put('mcp-health', { ...state, servers: state.servers.map(s => s.key === server.key ? recovered : s) }, state.revision);
  }
  if (previous?.attempt) throw Error('Reconnect already reserved; inspect its result or recover a dead owner before retrying.');
  // Check capacity before starting any external work, and never evict an
  // unresolved reservation to make room for a newer observation.
  retainServer(state.servers, { key: server.key });
  if (
    operation !== 'observe' &&
    previous?.configHash === server.configHash &&
    Date.parse(previous.nextAttemptAt || 0) > Date.now()
  )
    return { revision: state.revision, server: previous, attempted: false, reason: 'backoff' };
  let status,
    category = null,
    httpStatus = null,
    runnerResult;
  let attempt;
  if (operation === 'observe') {
    status = payload.outcome === 'success' ? 'host-observed-success' : 'failed';
    category = payload.outcome === 'failure' ? classifyMcpFailure(payload.failure) : null;
  } else if (operation === 'reconnect') {
    attempt = { id: randomUUID(), pid: process.pid, at: timestamp(), runner: payload.runner, hash: payload.runnerHash };
    store.put('mcp-health', { servers: retainServer(state.servers,
      { ...previous, key: server.key, name: server.name, scope: server.scope, configHash: server.configHash,
        failures: previous?.failures || 0, at: timestamp(), status: 'reconnecting', attempt }) }, state.revision);
    try { runnerResult = await runners(
      root,
      'run',
      { id: payload.runner, hash: payload.runnerHash },
      options,
    ); } catch (error) { runnerResult = { passed: false, error: redact(String(error.message)).slice(0, 2000) }; }
    status = runnerResult.passed ? 'reconnect-command-completed' : 'failed';
    category = runnerResult.passed ? null : 'transport';
  } else if (server.transport !== 'http') {
    status = 'not-probed';
    category = 'stdio-requires-host';
  } else {
    const url = httpUrl(config.url);
    if (url.search) throw Error('Credential-bearing/query endpoints require the host MCP client.');
    try {
      const response = await (options.fetch || fetch)(url, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
        headers: { accept: 'application/json, text/event-stream' },
      });
      httpStatus = response.status;
      await response.body?.cancel();
      category = [401, 403].includes(httpStatus)
        ? 'authentication'
        : httpStatus === 429
          ? 'rate-limit'
          : httpStatus >= 500
            ? 'transport'
            : null;
      status = category ? 'reachable-requires-attention' : 'reachable';
    } catch (error) {
      status = 'failed';
      category = classifyMcpFailure(error.message);
    }
  }
  const failures =
    category && category !== 'stdio-requires-host'
      ? (previous?.configHash === server.configHash ? previous.failures : 0) + 1
      : 0;
  const entry = {
    key: server.key,
    name: server.name,
    scope: server.scope,
    configHash: server.configHash,
    at: timestamp(),
    status,
    category,
    httpStatus,
    failures,
    attempt: null,
    ...(attempt ? { completedAttempt: attempt } : {}),
    nextAttemptAt: new Date(
      Date.now() + (failures ? Math.min(600000, 30000 * 2 ** Math.min(failures - 1, 5)) : 0),
    ).toISOString(),
  };
  const current = store.get('mcp-health') || state;
  if (attempt && current.servers.find(s => s.key === server.key)?.attempt?.id !== attempt.id)
    throw Error('Reconnect reservation changed; inspect the actual effects.');
  // A different server may have completed while this reconnect was running.
  // Preserve its record, but never attach a result to a replaced same-server snapshot.
  if (!attempt && current.revision !== state.revision) throw Error('MCP health changed during observation; refresh status.');
  const saved = store.put(
    'mcp-health',
    { servers: retainServer(current.servers, entry) },
    current.revision,
  );
  return {
    revision: saved.revision,
    server: entry,
    attempted: status !== 'not-probed',
    ...(runnerResult ? { runnerResult } : {}),
    note: 'Reachability and reconnect-command exit status do not establish authenticated MCP tool availability. Probes never replay a tool call or forward configured credentials.',
  };
}
