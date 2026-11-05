import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { workQueue } from '../plugins/just-vibe/scripts/lib/work-queue.mjs';
import { orchestrate } from '../plugins/just-vibe/scripts/lib/orchestration.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
import { findCycle, listCycles } from '../plugins/just-vibe/scripts/lib/graph.mjs';

const moduleUrl = new URL('../plugins/just-vibe/scripts/lib/work-queue.mjs', import.meta.url).href;

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'jv-queue-')), root = join(dir, 'project');
  mkdirSync(root);
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const options = { home: join(dir, 'home') };
  return { dir, root, options, q: (operation, payload = {}) => workQueue(root, operation, payload, options) };
}
const file = (f, id, scope = '.just-vibe/queue') => join(f.root, scope, `${id}.json`);
function rewrite(f, id, change) {
  const item = JSON.parse(readFileSync(file(f, id), 'utf8'));
  writeFileSync(file(f, id), JSON.stringify(change(item), null, 2) + '\n');
}

test('graph helpers find and report dependency cycles', () => {
  assert.equal(findCycle({ a: ['b'], b: ['c'], c: [] }), null);
  assert.deepEqual(findCycle({ a: ['b'], b: ['a'] }), ['a', 'b', 'a']);
  assert.deepEqual(listCycles({ c: ['a'], a: ['b'], b: ['c'], d: ['d'] }), [['a', 'b', 'c', 'a'], ['d', 'd']]);
});

test('ready orders open unblocked items by priority then age and hides active claims', async (t) => {
  const f = fixture(t);
  const low = await f.q('create', { title: 'Low priority', priority: 3 });
  const first = await f.q('create', { title: 'Urgent first', priority: 0 });
  const second = await f.q('create', { title: 'Urgent second', priority: 0 });
  const blocked = await f.q('create', { title: 'Needs first', links: [{ type: 'blocks', target: first.id }] });
  // Back-to-back creates can share a millisecond, and equal ages fall back to the random ID.
  [low, first, second].forEach((item, index) => rewrite(f, item.id, current => ({ ...current, createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString() })));
  assert.match(first.id, /^jv-[a-f0-9]{8}$/);
  let ready = await f.q('ready');
  assert.deepEqual(ready.items.map(i => i.id), [first.id, second.id, low.id]);
  assert.deepEqual((await f.q('show', { id: blocked.id })).waitingOn, [first.id]);
  assert.deepEqual((await f.q('show', { id: first.id })).blocking, [blocked.id]);
  const claim = await f.q('claim', { id: second.id, owner: 'agent-a' });
  ready = await f.q('ready');
  assert.ok(!ready.items.some(i => i.id === second.id));
  await assert.rejects(f.q('claim', { id: blocked.id, owner: 'agent-b' }), /blocked by/);
  const closing = await f.q('claim', { id: first.id, owner: 'agent-b' });
  await assert.rejects(f.q('close', { id: first.id, revision: closing.revision, reason: 'done' }), /claim token/);
  await f.q('close', { id: first.id, token: closing.token, reason: 'Shipped' });
  ready = await f.q('ready');
  assert.deepEqual(ready.items.map(i => i.id), [blocked.id, low.id]);
  assert.equal((await f.q('release', { id: second.id, token: claim.token, note: 'Handing off' })).status, 'open');
  const reopened = await f.q('reopen', { id: first.id, revision: (await f.q('show', { id: first.id })).revision, reason: 'Regression' });
  assert.equal(reopened.status, 'open');
  assert.equal(reopened.closeReason, undefined);
  assert.match(reopened.notes.at(-1).text, /Reopened: Regression/);
});

test('links reject cycles, trees follow parents and hand-edited cycles are reported', async (t) => {
  const f = fixture(t);
  const epic = await f.q('create', { title: 'Epic' });
  const a = await f.q('create', { title: 'A', links: [{ type: 'parent', target: epic.id }] });
  const b = await f.q('create', { title: 'B', links: [{ type: 'parent', target: epic.id }, { type: 'blocks', target: a.id }] });
  const child = await f.q('create', { title: 'A child', links: [{ type: 'parent', target: a.id }] });
  await assert.rejects(f.q('link', { id: a.id, revision: a.revision, type: 'blocks', target: b.id }), /cycle/);
  await assert.rejects(f.q('link', { id: epic.id, revision: epic.revision, type: 'parent', target: child.id }), /cycle/);
  await assert.rejects(f.q('link', { id: a.id, revision: a.revision, type: 'blocks', target: 'jv-00000000' }), /existing items/);
  await assert.rejects(f.q('create', { title: 'Self', links: [{ type: 'blocks', target: 'jv-zz' }] }), /jv-1a2b3c4d/);
  const tree = await f.q('tree', { id: epic.id });
  assert.deepEqual(tree.children.map(c => c.title).sort(), ['A', 'B']);
  assert.deepEqual(tree.children.find(c => c.title === 'A').children.map(c => c.id), [child.id]);
  rewrite(f, a.id, item => ({ ...item, links: [{ type: 'blocks', target: b.id }] }));
  const cycles = await f.q('cycles');
  assert.equal(cycles.blocks.length, 1);
  assert.deepEqual(new Set(cycles.blocks[0]), new Set([a.id, b.id]));
  writeFileSync(file(f, 'jv-deadbeef'), '<<<<<<< conflict');
  const listed = await f.q('list');
  assert.equal(listed.items.length, 4);
  assert.deepEqual(listed.invalid.map(i => i.file), ['jv-deadbeef.json']);
  const unlinked = await f.q('unlink', { id: b.id, revision: (await f.q('show', { id: b.id })).revision, type: 'blocks', target: a.id });
  assert.ok(!unlinked.links.some(l => l.type === 'blocks'));
});

test('claim tokens stay out of queue files, and expired leases can be taken over', async (t) => {
  const f = fixture(t);
  const item = await f.q('create', { title: 'Lease me' });
  const claim = await f.q('claim', { id: item.id, owner: 'agent-a', leaseSeconds: 30 });
  const text = readFileSync(file(f, item.id), 'utf8');
  assert.ok(!text.includes(claim.token));
  assert.equal((await f.q('heartbeat', { id: item.id, token: claim.token, leaseSeconds: 60 })).claim.active, true);
  await assert.rejects(f.q('claim', { id: item.id, owner: 'agent-b' }), /claimed by agent-a/);
  rewrite(f, item.id, current => ({ ...current, claim: { ...current.claim, expiresAt: new Date(Date.now() - 1000).toISOString() } }));
  assert.deepEqual((await f.q('ready')).items.map(i => i.id), [item.id]);
  const taken = await f.q('claim', { id: item.id, owner: 'agent-b' });
  await assert.rejects(f.q('heartbeat', { id: item.id, token: claim.token }), /does not match/);
  assert.equal((await f.q('show', { id: item.id })).claim.owner, 'agent-b');
  await f.q('close', { id: item.id, token: taken.token, reason: 'Done' });
  await assert.rejects(f.q('claim', { id: item.id, owner: 'agent-c' }), /Closed items/);
});

test('concurrent claims from separate processes produce exactly one owner', async (t) => {
  const f = fixture(t);
  const item = await f.q('create', { title: 'Contended' });
  const script = `const { workQueue } = await import(${JSON.stringify(moduleUrl)});
try { const r = await workQueue(process.argv[1], 'claim', { id: process.argv[2], owner: process.argv[3] }, { home: process.argv[4] }); console.log('won ' + r.claim.owner); }
catch (error) { console.log('lost ' + error.message); }`;
  const runs = await Promise.all(Array.from({ length: 8 }, (_, n) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', script, f.root, item.id, `agent-${n}`, f.options.home], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', chunk => { out += chunk; });
    child.on('error', reject);
    child.on('close', () => resolve(out.trim()));
  })));
  const winners = runs.filter(line => line.startsWith('won '));
  assert.equal(winners.length, 1, runs.join('\n'));
  assert.ok(runs.filter(line => line.startsWith('lost ')).every(line => /claimed by|locked|busy/i.test(line)), runs.join('\n'));
  assert.equal((await f.q('show', { id: item.id })).claim.owner, winners[0].slice(4));
});

test('team queue files are stable, sorted and free of local paths', async (t) => {
  const f = fixture(t);
  const item = await f.q('create', { scope: 'team', title: 'Shared', labels: ['ui', 'api'], body: 'Body text' });
  const text = readFileSync(file(f, item.id, '.just-vibe-team/queue'), 'utf8');
  const keys = Object.keys(JSON.parse(text));
  assert.deepEqual(keys, [...keys].sort());
  assert.ok(text.endsWith('}\n'));
  assert.ok(!text.includes(f.root) && !text.includes(f.dir));
  assert.deepEqual(JSON.parse(text).labels, ['api', 'ui']);
  if (process.platform !== 'win32') assert.equal(statSync(file(f, item.id, '.just-vibe-team/queue')).mode & 0o777, 0o644);
  assert.equal((await f.q('list')).items.length, 0);
  assert.equal((await f.q('list', { scope: 'team' })).items.length, 1);
  await assert.rejects(f.q('list', { scope: 'user' }), /project or team/);
});

test('dispatch claims ready work into an orchestration run and sync closes or releases it', async (t) => {
  const f = fixture(t);
  const a = await f.q('create', { title: 'Build parser', body: 'Parse the config.', agent: 'implementer' });
  const b = await f.q('create', { title: 'Wire parser', links: [{ type: 'blocks', target: a.id }] });
  const elsewhere = await f.q('create', { title: 'Held elsewhere' });
  await f.q('claim', { id: elsewhere.id, owner: 'someone-else' });
  const c = await f.q('create', { title: 'Needs held item', links: [{ type: 'blocks', target: elsewhere.id }] });
  const dispatched = await f.q('dispatch', { id: 'queue-run', revision: 0, host: 'codex' });
  assert.deepEqual(dispatched.dispatched.map(d => [d.id, d.dependsOn]), [[a.id, []], [b.id, [a.id]]]);
  const run = (await orchestrate(f.root, 'show', { id: 'queue-run' }, f.options)).run;
  assert.deepEqual(run.items.map(i => [i.id, i.agent, i.dependsOn]), [[a.id, 'implementer', []], [b.id, 'implementer', [a.id]]]);
  assert.match(run.items[0].brief, /Build parser\n\nParse the config\./);
  assert.equal((await f.q('show', { id: a.id })).claim.owner, 'orchestration:queue-run');
  assert.equal((await f.q('show', { id: c.id })).status, 'open');
  await assert.rejects(f.q('dispatch', { id: 'queue-run', revision: 1, host: 'codex' }), /already has dispatched/);
  assert.deepEqual((await f.q('sync', { id: 'queue-run' })).active, [a.id, b.id]);
  const store = runtimeStore(f.root, f.options), state = store.get('orchestration');
  store.put('orchestration', { runs: state.runs.map(r => ({ ...r, items: r.items.map(i => i.id === a.id ? { ...i, state: 'accepted', review: { reason: 'Tests pass' } } : i) })) }, state.revision);
  const synced = await f.q('sync', { id: 'queue-run' });
  assert.deepEqual([synced.closed, synced.active], [[a.id], [b.id]]);
  assert.match((await f.q('show', { id: a.id })).closeReason, /Accepted in orchestration queue-run: Tests pass/);
  const current = store.get('orchestration');
  await orchestrate(f.root, 'retire', { id: 'queue-run', revision: current.revision }, f.options);
  const retired = await f.q('sync', { id: 'queue-run' });
  assert.deepEqual(retired.released, [b.id]);
  const released = await f.q('show', { id: b.id });
  assert.equal(released.status, 'open');
  assert.match(released.notes.at(-1).text, /retired before this item was accepted/);
  await assert.rejects(f.q('sync', { id: 'queue-run' }), /No queue dispatch/);
});

test('a failed orchestration create releases every claim dispatch took', async (t) => {
  const f = fixture(t);
  const a = await f.q('create', { title: 'Will be released' });
  await assert.rejects(f.q('dispatch', { id: 'bad-run', revision: 7, host: 'codex' }), /revision/);
  const shown = await f.q('show', { id: a.id });
  assert.equal(shown.status, 'open');
  assert.equal(shown.claim, null);
  assert.match(shown.notes.at(-1).text, /Dispatch bad-run failed/);
});
