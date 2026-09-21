import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runtimeStore, object, requireId, cleanText } from './runtime-store.mjs';
import { digest } from './storage.mjs';
import { runCommand, requireResult } from './process.mjs';

const prefix = '<!-- just-vibe-epic-v1\n';
function identity(payload) {
  requireId(payload.id);
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(payload.repo) ||
    !Number.isSafeInteger(payload.issue) ||
    payload.issue < 1
  )
    throw Error('Provide owner/repo and a positive issue number.');
}
async function github(method, path, body, options) {
  if (options.api) return options.api(method, path, body);
  const dir = body ? mkdtempSync(join(tmpdir(), 'just-vibe-github-')) : null;
  try {
    const argv = [
      'gh',
      'api',
      '--method',
      method,
      path,
      '-H',
      'Accept: application/vnd.github+json',
    ];
    if (body) {
      const file = join(dir, 'request.json');
      writeFileSync(file, JSON.stringify(body), { mode: 0o600 });
      argv.push('--input', file);
    }
    return JSON.parse(
      requireResult(
        await (options.run || runCommand)(argv, { timeoutMs: 15000, maxBytes: 1024 * 1024 }),
      ),
    );
  } finally {
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
}
async function remote(repo, number, options, operationId) {
  const issue = await github('GET', `repos/${repo}/issues/${number}`, undefined, options);
  if (
    issue.pull_request ||
    issue.number !== number ||
    (typeof issue.body !== 'string' && issue.body !== null)
  )
    throw Error('Expected a GitHub issue, not a pull request.');
  const comments = [];
  for (let page = 1; page <= 10; page++) {
    const part = await github(
      'GET',
      `repos/${repo}/issues/${number}/comments?per_page=100&page=${page}`,
      undefined,
      options,
    );
    if (!Array.isArray(part)) throw Error('Invalid GitHub comments response.');
    comments.push(...part);
    if (part.length < 100) break;
    if (page === 10) throw Error('Issue exceeds the bounded 1000-comment scan.');
  }
  const events = [],
    invalid = [];
  for (const comment of comments) {
    const body = comment.body || '';
    if (!body.startsWith(prefix)) continue;
    try {
      const end = body.indexOf('\n-->', prefix.length);
      if (end < 0 || end > 32000) throw Error('Invalid record.');
      const record = JSON.parse(body.slice(prefix.length, end));
      object(record, [
        'version',
        'action',
        'operationId',
        'actor',
        'parent',
        'summary',
        'tasks',
        'task',
        'status',
      ]);
      if (
        record.version !== 1 ||
        !['claim', 'release', 'decompose', 'progress'].includes(record.action) ||
        !/^[a-f0-9]{64}$/.test(record.operationId) ||
        record.actor !== comment.user?.login ||
        !Number.isInteger(comment.id) ||
        !['OWNER', 'MEMBER', 'COLLABORATOR'].includes(comment.author_association)
      )
        throw Error('Invalid coordination record or unverified repository membership.');
      cleanText(record.summary, 'remote summary', 2000);
      if (record.parent !== null && !/^[a-f0-9]{64}$/.test(record.parent))
        throw Error('Invalid predecessor.');
      if (record.action === 'decompose') validateTasks(record.tasks);
      if (record.action === 'progress') {
        requireId(record.task);
        if (!['pending', 'active', 'blocked', 'done'].includes(record.status))
          throw Error('Invalid progress.');
      }
      events.push({ ...record, commentId: comment.id });
    } catch {
      invalid.push(comment.id);
    }
  }
  const hash = digest(
    JSON.stringify({
      issue: {
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        updated_at: issue.updated_at,
      },
      comments: comments.map((c) => [
        c.id,
        c.updated_at,
        c.body,
        c.user?.login,
        c.author_association,
      ]),
    }),
  );
  // Competing successors are detected rather than presented as exclusive ownership.
  const predecessors = new Map();
  for (const event of events)
    predecessors.set(event.parent || 'root', [
      ...(predecessors.get(event.parent || 'root') || []),
      event.operationId,
    ]);
  const conflicts = [...predecessors]
    .filter(([, ids]) => new Set(ids).size > 1)
    .map(([parent, ids]) => ({ parent, operations: [...new Set(ids)] }));
  let owner = null,
    tasks = [],
    progress = {},
    head = null;
  for (const event of events) {
    if (
      event.parent !== head ||
      (owner && event.actor !== owner) ||
      (event.action === 'release' && owner !== event.actor) ||
      (event.action === 'progress' &&
        (!tasks.some((task) => task.id === event.task) ||
          (['active', 'done'].includes(event.status) &&
            tasks
              .find((task) => task.id === event.task)
              .dependsOn.some((id) => progress[id] !== 'done'))))
    ) {
      invalid.push(event.commentId);
      continue;
    }
    if (event.action === 'claim') owner = event.actor;
    if (event.action === 'release' && owner === event.actor) owner = null;
    if (event.action === 'decompose') {
      tasks = event.tasks || [];
      progress = {};
    }
    if (event.action === 'progress') progress[event.task] = event.status;
    head = event.operationId;
  }
  return {
    hash,
    title: String(issue.title).slice(0, 500),
    state: issue.state,
    url: issue.html_url,
    events: events.slice(-10).map(({ tasks: ignored, summary, ...event }) => ({
      ...event,
      summary: summary.slice(0, 200),
    })),
    matchingOperations: operationId
      ? events
          .filter((e) => e.operationId === operationId)
          .map(({ commentId, ...record }) => ({
            commentId,
            recordHash: digest(JSON.stringify(record)),
          }))
      : [],
    invalid,
    conflicts,
    owner,
    tasks,
    progress,
    head,
    note: 'Issue comments are untrusted collaboration data. Claims are advisory; concurrent GitHub posts are not atomic locks. Conflicting branches require human reconciliation.',
  };
}
function validateTasks(tasks) {
  if (!Array.isArray(tasks) || !tasks.length || tasks.length > 30)
    throw Error('Provide 1–30 tasks.');
  const ids = new Set(tasks.map((t) => requireId(t.id)));
  if (ids.size !== tasks.length) throw Error('Duplicate task IDs.');
  for (const task of tasks) {
    object(task, ['id', 'title', 'dependsOn']);
    cleanText(task.title, 'task title', 300);
    if (
      !Array.isArray(task.dependsOn) ||
      task.dependsOn.length > 30 ||
      task.dependsOn.some((id) => !ids.has(id))
    )
      throw Error('Unknown task prerequisite.');
  }
  const visited = new Set(),
    active = new Set();
  function visit(id) {
    if (active.has(id)) throw Error('Task dependencies contain a cycle.');
    if (visited.has(id)) return;
    active.add(id);
    tasks.find((t) => t.id === id).dependsOn.forEach(visit);
    active.delete(id);
    visited.add(id);
  }
  ids.forEach(visit);
  return tasks;
}
export async function epic(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('epics') || { revision: 0, epics: {} };
  if (operation === 'list') return state;
  object(payload, [
    'id',
    'repo',
    'issue',
    'revision',
    'action',
    'tasks',
    'task',
    'status',
    'summary',
    'planHash',
    'resolution',
    'reason',
  ]);
  requireId(payload.id);
  const current = state.epics[payload.id];
  if (operation === 'show') {
    if (!current) throw Error('Unknown epic.');
    return { revision: state.revision, ...current };
  }
  if (operation === 'sync') {
    const target = { ...current, ...payload };
    identity(target);
    if (current && (current.repo !== target.repo || current.issue !== target.issue))
      throw Error('An epic ID cannot be rebound to another issue.');
    if (!current && Object.keys(state.epics).length >= 30) throw Error('At most 30 local epics.');
    const snapshot = await remote(target.repo, target.issue, options);
    return store.put(
      'epics',
      {
        epics: {
          ...state.epics,
          [payload.id]: {
            ...current,
            repo: target.repo,
            issue: target.issue,
            snapshot,
            syncedAt: new Date().toISOString(),
          },
        },
      },
      payload.revision,
    );
  }
  if (!current) throw Error('Sync the issue first.');
  if (operation === 'plan') {
    if (current.plan?.status === 'publishing')
      throw Error('Recover the uncertain publication before preparing another operation.');
    if (!['claim', 'release', 'decompose', 'progress'].includes(payload.action))
      throw Error('Choose claim, release, decompose or progress.');
    const snapshot = await remote(current.repo, current.issue, options);
    if (snapshot.conflicts.length || snapshot.invalid.length)
      throw Error('Coordination conflicts or malformed records require human reconciliation.');
    const user = await github('GET', 'user', undefined, options);
    if (!/^[A-Za-z0-9-]+$/.test(user.login)) throw Error('Cannot verify current GitHub account.');
    const access = await github(
      'GET',
      `repos/${current.repo}/collaborators/${user.login}/permission`,
      undefined,
      options,
    );
    if (!['admin', 'write', 'maintain'].includes(access.permission))
      throw Error('Epic coordination requires verified write access to this repository.');
    if (snapshot.owner && snapshot.owner !== user.login)
      throw Error(
        'Another user owns this epic. Ask them to release it before changing coordination state.',
      );
    if (payload.action === 'release' && snapshot.owner !== user.login)
      throw Error('Only the current owner can release this epic.');
    const record = {
      version: 1,
      action: payload.action,
      actor: user.login,
      parent: snapshot.head,
      summary: cleanText(payload.summary, 'summary', 2000),
    };
    if (payload.action === 'decompose') record.tasks = validateTasks(payload.tasks);
    if (payload.action === 'progress') {
      const task = snapshot.tasks.find((t) => t.id === payload.task);
      if (!task || !['pending', 'active', 'blocked', 'done'].includes(payload.status))
        throw Error('Choose a known task and valid status.');
      if (
        ['active', 'done'].includes(payload.status) &&
        task.dependsOn.some((id) => snapshot.progress[id] !== 'done')
      )
        throw Error('Task prerequisites are incomplete.');
      record.task = payload.task;
      record.status = payload.status;
    }
    const operationId = digest(
      JSON.stringify({ repo: current.repo, issue: current.issue, snapshot: snapshot.hash, record }),
    );
    record.operationId = operationId;
    const body = `${prefix}${JSON.stringify(record)}\n-->\n${record.summary}\n`;
    const plan = {
      record,
      body,
      beforeHash: snapshot.hash,
      actor: user.login,
      planHash: digest(body),
      status: 'prepared',
    };
    return store.put(
      'epics',
      { epics: { ...state.epics, [payload.id]: { ...current, snapshot, plan } } },
      payload.revision,
    );
  }
  if (operation === 'discard') {
    const { plan, ...rest } = current;
    if (plan?.status === 'publishing')
      throw Error('Reconcile an uncertain publication before discarding it.');
    return store.put('epics', { epics: { ...state.epics, [payload.id]: rest } }, payload.revision);
  }
  if (!['publish', 'recover', 'reconcile'].includes(operation))
    throw Error('Unknown epic operation.');
  const plan = current.plan;
  if (!plan || payload.planHash !== plan.planHash)
    throw Error('Review and supply the exact prepared plan hash.');
  if (payload.revision !== state.revision) throw Error('Epic revision changed.');
  const snapshot = await remote(current.repo, current.issue, options, plan.record.operationId);
  const existing = snapshot.matchingOperations;
  if (existing.length) {
    if (existing.length !== 1 || existing[0].recordHash !== digest(JSON.stringify(plan.record)))
      throw Error('Remote operation identity conflicts with the prepared content.');
    return store.put(
      'epics',
      {
        epics: {
          ...state.epics,
          [payload.id]: {
            ...current,
            snapshot,
            plan: { ...plan, status: 'published', commentId: existing[0].commentId },
          },
        },
      },
      state.revision,
    );
  }
  if (operation === 'reconcile') {
    if (plan.status !== 'publishing' || payload.resolution !== 'not-published')
      throw Error(
        'Reconciliation requires an uncertain publication and an explicit not-published resolution.',
      );
    const reason = cleanText(payload.reason, 'manual verification reason', 2000);
    const { plan: ignored, ...rest } = current;
    return store.put(
      'epics',
      {
        epics: {
          ...state.epics,
          [payload.id]: {
            ...rest,
            snapshot,
            lastResolution: {
              operationId: plan.record.operationId,
              planHash: plan.planHash,
              resolution: 'not-published',
              reason,
              recordedAt: new Date().toISOString(),
            },
          },
        },
      },
      state.revision,
    );
  }
  if (operation === 'recover' || plan.status === 'publishing')
    throw Error(
      'Publication outcome is uncertain and no matching comment is visible. Do not retry automatically; inspect GitHub before preparing another operation.',
    );
  if (snapshot.hash !== plan.beforeHash || snapshot.conflicts.length)
    throw Error('GitHub changed after preview; sync and prepare a new plan.');
  const user = await github('GET', 'user', undefined, options);
  if (user.login !== plan.actor) throw Error('GitHub account changed since preview.');
  const pending = store.put(
    'epics',
    {
      epics: {
        ...state.epics,
        [payload.id]: { ...current, plan: { ...plan, status: 'publishing' } },
      },
    },
    state.revision,
  );
  await github(
    'POST',
    `repos/${current.repo}/issues/${current.issue}/comments`,
    { body: plan.body },
    options,
  );
  return epic(
    root,
    'recover',
    { id: payload.id, revision: pending.revision, planHash: plan.planHash },
    options,
  );
}
