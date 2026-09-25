import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCatalog } from '../../plugins/just-vibe/scripts/lib/catalog.mjs';
import { discoverCapabilities, recommend } from '../../plugins/just-vibe/scripts/lib/discovery.mjs';
import { routeContext } from '../../plugins/just-vibe/scripts/lib/routing.mjs';
import { assistantRuntime } from '../../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';

// The router never suggests these entry points; their examples are measured by explicit invocation instead.
export const UNROUTED = new Set(['auto', 'do', 'help', 'tools', 'setup']);

export function loadCorpus() {
  return JSON.parse(readFileSync(new URL('../../tests/fixtures/routing/corpus.json', import.meta.url), 'utf8')).requests;
}

export function catalogExamples(catalog) {
  return catalog.commands.filter(c => !c.aliasOf && !UNROUTED.has(c.id))
    .flatMap(c => c.examples.map(e => ({ command: c.id, kind: `example:${e.kind || 'normal'}`, request: e.brief, accept: [c.id] })));
}

// Route every request through the lexical router and the automatic-assistance gate in an
// empty, non-Git project with an empty just-vibe home, so saved preferences cannot bias results.
export function measureRouting(requests, { catalog = loadCatalog(), assist: measureAssist = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'jv-route-root-'));
  const home = mkdtempSync(join(tmpdir(), 'jv-route-home-'));
  try {
    const discovery = discoverCapabilities(root);
    const context = routeContext(root);
    const rows = requests.map(item => {
      const ids = recommend(catalog, discovery, item.request, { limit: 10, context }).recommendations.map(r => r.id);
      const assist = measureAssist ? assistantRuntime(root, 'route', { brief: item.request, host: 'claude' }, { catalog, home }) : {};
      const suggested = (assist.recommendations || []).map(r => r.id);
      return { ...item, ids, rank: ids.findIndex(id => item.accept.includes(id)) + 1,
        activates: assist.kind === 'task' && suggested.length > 0, assistRank: suggested.findIndex(id => item.accept.includes(id)) + 1 };
    });
    return { rows, summary: summarize(rows) };
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
}

export function summarize(rows) {
  const n = rows.length || 1, active = rows.filter(r => r.activates);
  const rate = count => Math.round((1000 * count) / n) / 1000;
  return { requests: rows.length, first: rate(rows.filter(r => r.rank === 1).length), top3: rate(rows.filter(r => r.rank >= 1 && r.rank <= 3).length),
    absent: rate(rows.filter(r => r.rank === 0).length), activates: rate(active.length),
    activeFirst: active.length ? Math.round((1000 * active.filter(r => r.assistRank === 1).length) / active.length) / 1000 : 0 };
}
