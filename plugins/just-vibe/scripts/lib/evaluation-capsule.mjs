import { runtimeStore, object, requireId, cleanText, timestamp } from './runtime-store.mjs';
import { boundedList, boundedText } from './capability-io.mjs';
import { runners } from './trusted-runners.mjs';
import { digest, fingerprint, compareSnapshot } from './storage.mjs';
const identity = (value) => digest(JSON.stringify(value));
export async function evaluation(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  if (operation === 'list')
    return {
      capsules: store
        .list(store.prefix)
        .filter((p) => p.startsWith('evaluation-'))
        .map((p) => store.get(p.replace('.json', '')))
        .map(({ id, revision, status, createdAt }) => ({ id, revision, status, createdAt })),
    };
  if (operation === 'verify-receipt') {
    object(payload, ['receipt']);
    object(payload.receipt, ['capsule', 'hash']);
    return {
      intact: identity(payload.receipt.capsule) === payload.receipt.hash,
      note: 'Integrity of supplied bytes only; this self-contained hash does not establish observer authenticity, real execution, sandboxing or correctness.',
    };
  }
  object(payload, [
    'id',
    'revision',
    'objective',
    'cases',
    'artifacts',
    'reason',
    'verdict',
    'receiptHash',
    'against',
    'channel',
  ]);
  const id = requireId(payload.id),
    name = `evaluation-${id}`,
    state = store.get(name);
  if (operation === 'create') {
    if (state) throw Error('Capsule ID already exists.');
    const cases = boundedList(payload.cases, 'cases', 20).map((c) => {
      object(c, ['id', 'runner', 'hash', 'criterion']);
      return {
        id: requireId(c.id),
        runner: requireId(c.runner),
        hash: cleanText(c.hash, 'runner hash', 64),
        criterion: cleanText(c.criterion, 'acceptance criterion', 2000),
      };
    });
    if (!cases.length || new Set(cases.map((c) => c.id)).size !== cases.length)
      throw Error('Use distinct bounded evaluation cases.');
    for (const c of cases) {
      const r = (await runners(root, 'show', { id: c.runner }, options)).runner;
      if (!r.trusted || !r.current || r.hash !== c.hash)
        throw Error('Evaluation runners require current explicit trust.');
    }
    const artifacts = boundedList(payload.artifacts || [], 'artifacts', 50).map((path) => ({
      path: cleanText(path, 'artifact path', 1000),
      hash: digest(boundedText(root, path)),
    }));
    return store.put(
      name,
      {
        id,
        objective: cleanText(payload.objective, 'objective', 3000),
        cases,
        artifacts,
        source: fingerprint(root),
        status: 'prepared',
        createdAt: timestamp(),
        receipts: [],
      },
      payload.revision,
    );
  }
  if (!state) throw Error('Unknown evaluation capsule.');
  const sourceChanged = compareSnapshot(state.source, fingerprint(root)).stale,
    artifactChanged = state.artifacts.some((a) => {
      try {
        return digest(boundedText(root, a.path)) !== a.hash;
      } catch {
        return true;
      }
    });
  if (operation === 'show') return { ...state, stale: sourceChanged || artifactChanged };
  if (operation === 'export') {
    const capsule = {
      id: state.id,
      objective: state.objective,
      cases: state.cases,
      artifacts: state.artifacts,
      source: state.source,
      status: state.status,
      receipts: state.receipts,
      judgment: state.judgment || null,
    };
    return { capsule, hash: identity(capsule) };
  }
  if (operation === 'compare') {
    const other = await evaluation(root, 'show', { id: payload.against }, options);
    return {
      left: id,
      right: other.id,
      sameCases: identity(state.cases) === identity(other.cases),
      sameSource: identity(state.source) === identity(other.source),
      leftReceipts: state.receipts,
      rightReceipts: other.receipts,
      note: 'Compare discriminating acceptance outcomes and human judgments; elapsed time and token count are not quality scores.',
    };
  }
  if (payload.revision !== state.revision) throw Error('Read current capsule revision first.');
  if (operation === 'promote') {
    const receipt = await evaluation(root, 'export', { id }, options);
    if (
      state.status !== 'checks-passed' ||
      state.judgment?.verdict !== 'accept' ||
      sourceChanged ||
      artifactChanged ||
      payload.receiptHash !== receipt.hash
    )
      throw Error(
        'Promotion requires fresh passing evidence, an accepted independent judgment and the current receipt hash.',
      );
    return store.put(
      name,
      {
        ...state,
        promotion: {
          channel: requireId(payload.channel),
          receiptHash: receipt.hash,
          at: timestamp(),
          reason: cleanText(payload.reason, 'promotion evidence', 2000),
        },
      },
      state.revision,
    );
  }
  if (operation === 'run') {
    if (state.status !== 'prepared' || sourceChanged || artifactChanged || state.source.partial)
      throw Error('Only a fresh complete prepared capsule can run. Prepare a new ID to replay.');
    let reserved = store.put(name, { ...state, status: 'running' }, state.revision);
    const receipts = [];
    for (const c of state.cases) {
      let result;
      try {
        result = await runners(root, 'run', { id: c.runner, hash: c.hash }, options);
      } catch (error) {
        result = { passed: false, error: String(error.message).slice(0, 1000) };
      }
      receipts.push({
        case: c.id,
        runnerHash: c.hash,
        at: timestamp(),
        passed: !!result.passed,
        status: result.status ?? null,
        timedOut: !!result.timedOut,
        truncated: !!result.truncated,
        outputHash: identity({ stdout: result.stdout, stderr: result.stderr }),
        excerpt: ((result.stdout || '') + '\n' + (result.stderr || result.error || '')).slice(
          0,
          6000,
        ),
      });
    }
    const changed = compareSnapshot(state.source, fingerprint(root)).stale;
    return store.put(
      name,
      {
        ...reserved,
        status: changed
          ? 'inconclusive-source-changed'
          : receipts.every((r) => r.passed)
            ? 'checks-passed'
            : 'checks-failed',
        receipts,
        finishedAt: timestamp(),
        note: 'Trusted checks run with the invoking account in the configured project, not a claimed security sandbox. For hostile evaluation subjects use a separately trusted container/VM runner. Exit success is not human quality approval.',
      },
      reserved.revision,
    );
  }
  if (operation === 'judge') {
    if (!['accept', 'reject', 'inconclusive'].includes(payload.verdict))
      throw Error('Choose accept, reject or inconclusive.');
    const exported = await evaluation(root, 'export', { id }, options);
    if (
      payload.receiptHash !== exported.hash ||
      sourceChanged ||
      artifactChanged ||
      state.status === 'running' ||
      state.status === 'prepared'
    )
      throw Error('Review current completed evidence before judging.');
    return store.put(
      name,
      {
        ...state,
        judgment: {
          verdict: payload.verdict,
          reason: cleanText(payload.reason, 'independent judgment', 4000),
          receiptHash: payload.receiptHash,
          at: timestamp(),
        },
      },
      state.revision,
    );
  }
  if (operation === 'recover') {
    if (state.status !== 'running') throw Error('Only interrupted execution needs recovery.');
    return store.put(
      name,
      {
        ...state,
        status: 'inconclusive-interrupted',
        reason: cleanText(payload.reason, 'recovery evidence', 2000),
      },
      state.revision,
    );
  }
  throw Error('Unknown evaluation operation.');
}
