import { existsSync, lstatSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { runtimeStore, object, cleanText, requireId, timestamp } from './runtime-store.mjs';
import { within, digest, privateName, readJson } from './storage.mjs';

export function canvasRecord(store, id) {
  return `${store.prefix}/canvases/${requireId(id)}.json`;
}
function snapshot(root, path) {
  cleanText(path, 'artifact path', 500);
  if (!/\.(md|txt|html|json)$/i.test(path) || path.split(/[\\/]/).some(privateName))
    throw Error('Choose a non-secret Markdown, text, HTML or JSON artifact.');
  const full = within(root, path),
    stat = lstatSync(full);
  if (!stat.isFile() || stat.size > 256 * 1024)
    throw Error('Canvas artifacts must be regular files up to 256 KiB.');
  const content = readFileSync(full, 'utf8');
  cleanText(content, 'artifact', 256 * 1024);
  return { path, content, hash: digest(content), format: /\.html$/i.test(path) ? 'html' : 'text' };
}
export function inspectCanvas(store, id) {
  const record = store.read(canvasRecord(store, id));
  if (!record) throw Error('Unknown canvas.');
  let stale = true;
  try {
    stale = snapshot(store.root, record.artifact.path).hash !== record.artifact.hash;
  } catch {}
  return { ...record, stale, effectiveVerdict: stale ? null : record.verdict };
}
export function submitCanvasFeedback(store, id, payload) {
  object(payload, ['revision', 'artifactHash', 'kind', 'text', 'anchor']);
  const current = inspectCanvas(store, id);
  if (current.stale || payload.artifactHash !== current.artifact.hash)
    throw Error('Artifact changed; refresh the canvas and review the current version.');
  if (current.closed) throw Error('Canvas is closed.');
  if (!['comment', 'annotation', 'approve', 'changes'].includes(payload.kind))
    throw Error('Unknown feedback kind.');
  const message = {
    kind: payload.kind,
    text: cleanText(payload.text, 'feedback', 4000),
    at: timestamp(),
    artifactHash: current.artifact.hash,
    source: 'browser-review',
  };
  if (payload.kind === 'annotation') {
    if (
      !Number.isSafeInteger(payload.anchor) ||
      payload.anchor < 1 ||
      payload.anchor > current.artifact.content.split('\n').length
    )
      throw Error('Choose a valid artifact line.');
    message.anchor = payload.anchor;
  }
  if (current.feedback.length >= 200)
    throw Error('Feedback capacity reached; refresh or archive the review.');
  const { stale, effectiveVerdict, ...record } = current;
  return store.write(
    canvasRecord(store, id),
    {
      ...record,
      feedback: [...record.feedback, message],
      verdict: ['approve', 'changes'].includes(payload.kind)
        ? {
            kind: payload.kind,
            reason: message.text,
            at: message.at,
            artifactHash: message.artifactHash,
          }
        : current.verdict,
    },
    payload.revision,
  );
}
export async function planCanvas(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  if (operation === 'list')
    return {
      canvases: store.list(`${store.prefix}/canvases`).map((n) => n.replace(/\.json$/, '')),
    };
  object(payload, [
    'id',
    'revision',
    'title',
    'path',
    'message',
    'timeoutSeconds',
    'afterRevision',
  ]);
  const id = requireId(payload.id),
    file = canvasRecord(store, id),
    current = store.read(file);
  if (operation === 'create') {
    if (current) throw Error('Canvas already exists; show or refresh it.');
    if (store.list(`${store.prefix}/canvases`).length >= 50)
      throw Error('Canvas capacity reached; forget old closed reviews.');
    return store.write(
      file,
      {
        id,
        title: cleanText(payload.title, 'title', 200),
        artifact: snapshot(root, payload.path),
        feedback: [],
        verdict: null,
        history: [],
        closed: false,
        createdAt: timestamp(),
      },
      payload.revision,
    );
  }
  if (!current) throw Error('Unknown canvas.');
  if (operation === 'show') return inspectCanvas(store, id);
  if (operation === 'wait') {
    const seconds = payload.timeoutSeconds ?? 30;
    if (
      !Number.isInteger(seconds) ||
      seconds < 1 ||
      seconds > 60 ||
      !Number.isSafeInteger(payload.afterRevision) ||
      payload.afterRevision < 0
    )
      throw Error('Wait needs afterRevision and a 1–60 second timeout.');
    const deadline = Date.now() + seconds * 1000;
    do {
      const record = inspectCanvas(store, id);
      if (record.revision > payload.afterRevision || record.stale || record.closed) return record;
      await new Promise((ok) => setTimeout(ok, 250));
    } while (Date.now() < deadline);
    return { ...inspectCanvas(store, id), timeout: true };
  }
  if (operation === 'refresh')
    return store.write(
      file,
      {
        ...current,
        artifact: snapshot(root, current.artifact.path),
        feedback: [],
        verdict: null,
        closed: false,
        history: [
          ...current.history.slice(-4),
          {
            artifactHash: current.artifact.hash,
            feedback: current.feedback,
            verdict: current.verdict,
          },
        ],
      },
      payload.revision,
    );
  if (operation === 'message') {
    if (current.closed || current.feedback.length >= 200) throw Error('Canvas is closed or full.');
    return store.write(
      file,
      {
        ...current,
        feedback: [
          ...current.feedback,
          {
            kind: 'context',
            text: cleanText(payload.message, 'message'),
            at: timestamp(),
            artifactHash: current.artifact.hash,
          },
        ],
      },
      payload.revision,
    );
  }
  if (operation === 'close')
    return store.write(file, { ...current, closed: true }, payload.revision);
  if (operation === 'forget') {
    if (!current.closed || current.revision !== payload.revision)
      throw Error('Close the current review before forgetting it.');
    store.remove(file);
    return { forgotten: id };
  }
  if (operation !== 'open') throw Error('Unknown canvas operation.');
  if (current.closed) throw Error('Refresh this review before opening it.');
  const directory = within(store.home, `${store.prefix}/canvas-servers`);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const token = randomBytes(32).toString('hex'),
    configPath = join(directory, `${token}.json`),
    statusPath = `${configPath}.status`;
  const seconds = payload.timeoutSeconds ?? 1800;
  if (!Number.isInteger(seconds) || seconds < 10 || seconds > 3600)
    throw Error('Canvas server lifetime must be 10–3600 seconds.');
  writeFileSync(
    configPath,
    JSON.stringify({ root: store.root, home: store.home, id, token, seconds }),
    { flag: 'wx', mode: 0o600 },
  );
  const child = spawn(
    process.execPath,
    [fileURLToPath(new URL('../canvas-server.mjs', import.meta.url)), configPath],
    { detached: true, stdio: 'ignore' },
  );
  await new Promise((ok, fail) => {
    child.once('spawn', ok);
    child.once('error', fail);
  });
  child.unref();
  for (let i = 0; i < 100; i++) {
    if (existsSync(statusPath))
      return {
        id,
        ...readJson(statusPath),
        note: 'Open this private local URL. Feedback remains available through canvas show/wait. The server expires automatically.',
      };
    await new Promise((ok) => setTimeout(ok, 50));
  }
  throw Error('Canvas server did not become ready; inspect the retained review and retry.');
}
