import { runtimeStore, object } from './runtime-store.mjs';
import { operator } from './operator.mjs';
import { usageLedger } from './usage-ledger.mjs';
import { configurationInventory } from './config-inventory.mjs';
import { digest } from './storage.mjs';
export async function telemetry(root, operation, payload = {}, options = {}) {
  object(payload, []);
  const store = runtimeStore(root, options),
    status = await operator(root, 'status', {}, options),
    inventory = configurationInventory(root, {}, options),
    usage = usageLedger(root, 'report', {}, options);
  const records = [
    ...status.jobs.jobs.flatMap((j) =>
      j.runs.map((r) => ({
        id: r.id,
        at: r.finishedAt,
        kind: 'bounded-job',
        outcome: r.passed ? 'check-passed' : 'check-failed',
        subject: j.id,
      })),
    ),
    ...status.workers.jobs.map((j) => ({
      id: j.id,
      at: j.updatedAt || j.createdAt,
      kind: 'worker',
      outcome: j.state,
      subject: j.agent,
    })),
    ...status.dispatch.map((d) => ({
      id: d.requestId,
      at: d.updatedAt || d.at,
      kind: 'dispatch',
      outcome: d.status,
      subject: d.job,
    })),
  ]
    .filter((r) => Number.isFinite(Date.parse(r.at)))
    .map(r => ({ ...r, entityId: r.id, id: digest(JSON.stringify([r.kind, r.id, r.at, r.outcome])) }))
    .slice(-500);
  if (operation === 'status')
    return {
      observedAt: status.observedAt,
      project: digest(store.root).slice(0, 24),
      configuredServers: inventory.servers.length,
      inventoryPartial: inventory.partial,
      conflicts: status.conflicts,
      staleClaims: status.claims.filter((c) => c.stale).length,
      uncertainJobs: status.jobs.jobs.filter((j) => j.status === 'running').map((j) => j.id),
      usage: { totals: usage.totals, unpriced: usage.unpriced },
      events: records.length,
      note: 'Readiness describes recorded local state, not live authentication, objective quality or a security guarantee.',
    };
  if (operation === 'otlp')
    return {
      resourceLogs: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'just-vibe' } },
              { key: 'just_vibe.project', value: { stringValue: digest(store.root).slice(0, 24) } },
            ],
          },
          scopeLogs: [
            {
              scope: { name: 'just-vibe.runtime', version: '1' },
              logRecords: records.map((r) => ({
                timeUnixNano: String(BigInt(Date.parse(r.at)) * 1000000n),
                severityNumber: r.outcome.includes('failed') ? 17 : 9,
                body: { stringValue: r.kind },
                attributes: Object.entries(r)
                  .filter(([k]) => k !== 'at')
                  .map(([key, value]) => ({
                    key: `just_vibe.${key}`,
                    value: { stringValue: String(value) },
                  })),
              })),
            },
          ],
        },
      ],
    };
  if (operation === 'events')
    return {
      events: records,
      note: 'Latest retained observations, not a complete event stream. entityId identifies the job/request; id identifies this immutable status observation for deduplication. Repeated exports preserve IDs; observed state transitions have distinct IDs. No prompt bodies, credentials, full paths or tool arguments are exported. Export does not deliver telemetry to an external collector.',
    };
  throw Error('Unknown telemetry operation.');
}
