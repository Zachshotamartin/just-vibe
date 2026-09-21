import { runtimeStore, object, cleanText, requireId, timestamp } from './runtime-store.mjs';
import { boundedList, integer, httpUrl } from './capability-io.mjs';
const categories = ['input', 'output', 'cacheRead', 'cacheWrite'];
function legacySegment(s) {
  return { from: null, at: s.at, counts: Object.fromEntries(categories.map(k => [k, s[k]])),
    pricing: null, reason: 'legacy-cumulative-history-unavailable' };
}
function priceSegment(rates, model, from, at, counts) {
  const matches = rates.filter(r => r.model === model && Date.parse(r.effectiveAt) <= (from === null ? at : Date.parse(from)) && Date.parse(r.expiresAt) > at);
  const rate = matches.length === 1 ? matches[0] : null;
  return { from, at: new Date(at).toISOString(), counts,
    pricing: rate ? { ...rate, amount: categories.reduce((sum, k) => sum + counts[k] * rate[k] / 1e6, 0) } : null,
    reason: rate ? (from === null ? 'initial-snapshot-at-observed-rate' : 'one-rate-covers-entire-interval') : 'missing-or-ambiguous-rate-interval' };
}
export function usageLedger(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('usage-ledger') || { revision: 0, rates: [], snapshots: [] };
  if (operation === 'rates') return { revision: state.revision, rates: state.rates };
  if (operation === 'pricing') {
    object(payload, ['revision', 'rates']);
    const rates = boundedList(payload.rates, 'rates', 100).map((r) => {
      object(r, [
        'model',
        'currency',
        'input',
        'output',
        'cacheRead',
        'cacheWrite',
        'effectiveAt',
        'expiresAt',
        'source',
      ]);
      for (const k of ['input', 'output', 'cacheRead', 'cacheWrite'])
        if (typeof r[k] !== 'number' || !Number.isFinite(r[k]) || r[k] < 0 || r[k] > 100000)
          throw Error('Prices must be finite nonnegative currency units per million tokens.');
      if (
        !/^[A-Z]{3}$/.test(r.currency) ||
        !Number.isFinite(Date.parse(r.effectiveAt)) ||
        !Number.isFinite(Date.parse(r.expiresAt)) ||
        Date.parse(r.expiresAt) <= Date.parse(r.effectiveAt)
      )
        throw Error('Supply currency and a valid price interval.');
      return { ...r, model: cleanText(r.model, 'model', 160), source: httpUrl(r.source).href };
    });
    for (let i = 0; i < rates.length; i++) for (let j = i + 1; j < rates.length; j++)
      if (rates[i].model === rates[j].model && Date.parse(rates[i].effectiveAt) < Date.parse(rates[j].expiresAt) && Date.parse(rates[j].effectiveAt) < Date.parse(rates[i].expiresAt))
        throw Error('Overlapping price intervals are ambiguous; use distinct half-open intervals per model.');
    return store.put('usage-ledger', { ...state, rates }, payload.revision);
  }
  if (operation === 'observe') {
    object(payload, [
      'revision',
      'session',
      'model',
      'at',
      'input',
      'output',
      'cacheRead',
      'cacheWrite',
    ]);
    const session = requireId(payload.session),
      model = cleanText(payload.model, 'model', 160),
      at = Date.parse(payload.at);
    if (!Number.isFinite(at) || at > Date.now() + 60000)
      throw Error('Invalid host usage timestamp.');
    const counts = {};
    for (const k of ['input', 'output', 'cacheRead', 'cacheWrite'])
      counts[k] = integer(payload[k] ?? 0, k, 0, 1e12);
    const previous = state.snapshots.find((s) => s.session === session && s.model === model);
    if (previous) {
      if (at < Date.parse(previous.at) || Object.keys(counts).some((k) => counts[k] < previous[k]))
        throw Error(
          'Cumulative snapshots must be monotonic; use a new session segment after a reset.',
        );
      if (at === Date.parse(previous.at)) {
        if (Object.keys(counts).some((k) => counts[k] !== previous[k]))
          throw Error('Conflicting usage snapshot timestamp.');
        return { ...state, duplicate: true };
      }
    }
    if (!previous && state.snapshots.length >= 500)
      throw Error('Usage capacity reached; export before pruning.');
    const segments = previous ? (previous.segments || [legacySegment(previous)]) : [];
    const delta = Object.fromEntries(categories.map(k => [k, counts[k] - (previous?.[k] || 0)]));
    const nextSegments = categories.some(k => delta[k] > 0)
      ? [...segments, priceSegment(state.rates, model, previous?.at || null, at, delta)] : segments;
    if (nextSegments.length > 500 || state.snapshots.filter(s => s !== previous).reduce((n, s) => n + (s.segments?.length || 1), nextSegments.length) > 2000)
      throw Error('Usage segment capacity reached; export history before starting a separate ledger.');
    return store.put(
      'usage-ledger',
      {
        ...state,
        snapshots: [
          ...state.snapshots.filter((s) => s !== previous),
          { session, model, at: new Date(at).toISOString(), ...counts, segments: nextSegments },
        ],
      },
      payload.revision,
    );
  }
  if (operation === 'report' || operation === 'export') {
    const sessions = state.snapshots.map((s) => {
      const segments = s.segments || [legacySegment(s)], totals = {};
      for (const segment of segments) if (segment.pricing)
        totals[segment.pricing.currency] = (totals[segment.pricing.currency] || 0) + segment.pricing.amount;
      const currencies = Object.keys(totals), unpricedSegments = segments.filter(s => !s.pricing).length;
      return {
        ...s,
        segments,
        unpricedSegments,
        estimate: currencies.length ? { totals, complete: unpricedSegments === 0,
          currency: currencies.length === 1 ? currencies[0] : null,
          amount: currencies.length === 1 ? totals[currencies[0]] : null } : null,
      };
    });
    const totals = {};
    for (const s of sessions)
      for (const [currency, amount] of Object.entries(s.estimate?.totals || {}))
        totals[currency] = (totals[currency] || 0) + amount;
    return {
      revision: state.revision,
      sessions,
      totals,
      unpriced: sessions.filter((s) => s.unpricedSegments > 0).length,
      note: 'Totals include known priced segments only. Initial snapshots use their observation-time rate as an explicit estimate; later deltas require one rate covering the entire interval. Boundary-spanning or legacy usage remains unpriced. Stored valuations never change when pricing is edited. Categories must be disjoint; these estimates are not billing records or output-quality measurements.',
    };
  }
  if (operation === 'advise') {
    object(payload, ['task', 'constraints']);
    return {
      task: cleanText(payload.task, 'task', 1000),
      recommendation:
        'Use a cheaper eligible model for bounded extraction or mechanical edits after a representative trial; use stronger reasoning for ambiguous architecture, security or cross-file debugging. Compare actual outcomes against the same acceptance cases before switching.',
      constraints: cleanText(
        payload.constraints || 'No automatic switching or spending authorization.',
        'constraints',
        1000,
      ),
      automaticSwitch: false,
    };
  }
  throw Error('Unknown usage operation.');
}
