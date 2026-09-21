import { runtimeStore, object, requireId, cleanText, timestamp } from './runtime-store.mjs';
import { boundedList } from './capability-io.mjs';
import { orchestrate } from './orchestration.mjs';
import { workers } from './workers.mjs';
import { specialist } from './specialists.mjs';
import { fingerprint, compareSnapshot, digest } from './storage.mjs';
export async function council(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  if (operation === 'list')
    return {
      councils: store
        .list(store.prefix)
        .filter((p) => p.startsWith('council-'))
        .map((p) => store.get(p.replace('.json', ''))),
    };
  object(payload, [
    'id',
    'revision',
    'objective',
    'host',
    'reviewers',
    'verdicts',
    'synthesis',
    'reason',
  ]);
  const id = requireId(payload.id),
    name = `council-${id}`,
    state = store.get(name);
  if (operation === 'create') {
    if (state) throw Error('Council already exists.');
    const objective = cleanText(payload.objective, 'objective', 3000),
      reviewers = boundedList(
        payload.reviewers || ['reviewer', 'security-reviewer'],
        'reviewers',
        4,
      ).map((r) => {
        const reviewer = typeof r === 'string' ? { agent: r, host: payload.host } : r;
        object(reviewer, ['agent', 'host']);
        if (!['codex', 'claude'].includes(reviewer.host))
          throw Error('Choose a host for each reviewer.');
        return { agent: specialist(reviewer.agent).id, host: reviewer.host };
      });
    if (
      reviewers.length < 2 ||
      new Set(reviewers.map((r) => `${r.host}:${r.agent}`)).size !== reviewers.length
    )
      throw Error('Choose 2–4 distinct independent reviewers.');
    for (const reviewer of reviewers)
      if (specialist(reviewer.agent).mode !== 'inspect')
        throw Error('Councils use inspect-only reviewers.');
    if (payload.revision !== 0) throw Error('A new council requires revision 0.');
    const orchestration = await orchestrate(root, 'list', {}, options);
    const source = fingerprint(root);
    if (source.partial) throw Error('Council source inspection is incomplete.');
    const reserved = store.put(
      name,
      {
        id,
        objective,
        orchestration: `council-${id}`,
        reviewers,
        source,
        createdAt: timestamp(),
        status: 'preparing',
      },
      0,
    );
    const saved = await orchestrate(
      root,
      'create',
      {
        id: `council-${id}`,
        revision: orchestration.revision,
        host: payload.host || reviewers[0].host,
        maxAttempts: 2,
        objective,
        items: reviewers.map(({ agent, host }, i) => ({
          id: `review-${i + 1}`,
          agent,
          host,
          dependsOn: [],
          brief: `Independently inspect: ${objective}\nDo not read other council conclusions. Establish concrete evidence and challenge plausible alternatives. Report supported findings, counterevidence, unresolved questions and verification limits. Do not modify source or self-certify acceptance.`,
        })),
      },
      options,
    );
    return store.put(
      name,
      {
        id,
        objective,
        orchestration: `council-${id}`,
        reviewers,
        source,
        createdAt: timestamp(),
        status: 'reviewing',
      },
      reserved.revision,
    );
  }
  if (!state) throw Error('Unknown council.');
  if (state.status === 'preparing' && operation === 'recover') {
    if (payload.revision !== state.revision) throw Error('Read current council revision first.');
    const record = (await orchestrate(root, 'list', {}, options)).runs.find(
      (r) => r.id === state.orchestration,
    );
    return store.put(
      name,
      {
        ...state,
        status: record ? 'reviewing' : 'inconclusive-preparation',
        reason: cleanText(payload.reason, 'recovery evidence', 2000),
      },
      state.revision,
    );
  }
  if (state.status === 'preparing' || state.status === 'inconclusive-preparation') {
    if (operation === 'show') return state;
    throw Error('Council preparation is incomplete; inspect orchestration state and recover.');
  }
  const run = (await orchestrate(root, 'show', { id: state.orchestration }, options)).run;
  if (operation === 'show')
    return { ...state, run, stale: compareSnapshot(state.source, fingerprint(root)).stale };
  if (operation === 'dispatch' || operation === 'collect' || operation === 'cancel') {
    if (payload.revision !== state.revision) throw Error('Read current council revision first.');
    const current = await orchestrate(root, 'list', {}, options);
    await orchestrate(
      root,
      operation,
      {
        id: state.orchestration,
        revision: current.revision,
        ...(operation === 'cancel' ? { reason: cleanText(payload.reason, 'reason', 1000) } : {}),
      },
      options,
    );
    return council(root, 'show', { id }, options);
  }
  if (operation === 'conclude') {
    if (compareSnapshot(state.source, fingerprint(root)).stale)
      throw Error('Source changed; independent reviews are stale.');
    const verdicts = boundedList(payload.verdicts, 'verdicts', 4);
    if (verdicts.length !== run.items.length)
      throw Error('Include every independent reviewer verdict.');
    const checked = [];
    for (const item of run.items) {
      if (!['review', 'accepted'].includes(item.state))
        throw Error('Every reviewer must have completed before synthesis.');
      const verdict = verdicts.find((v) => v.item === item.id);
      object(verdict, ['item', 'resultHash', 'verdict', 'evidence']);
      if (!['support', 'concern', 'inconclusive'].includes(verdict.verdict))
        throw Error('Use support, concern or inconclusive.');
      const result = await workers(root, 'result', { id: item.attempts.at(-1).worker }, options);
      if (result.resultHash !== verdict.resultHash) throw Error('Review current worker artifacts.');
      checked.push({ ...verdict, evidence: cleanText(verdict.evidence, 'review evidence', 3000) });
    }
    return store.put(
      name,
      {
        ...state,
        status: checked.every((v) => v.verdict === 'support') ? 'converged' : 'unresolved',
        verdicts: checked,
        synthesis: cleanText(payload.synthesis, 'synthesis', 6000),
        concludedAt: timestamp(),
        note: 'Recorded reviewer judgments, not objective correctness. Concerns cannot be averaged away; repairs require a fresh source-bound council.',
      },
      payload.revision,
    );
  }
  throw Error('Unknown council operation.');
}
