import { existsSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runtimeStore, object, cleanText, requireId, timestamp } from './runtime-store.mjs';
import { within, readJson, fingerprint, compareSnapshot, digest, atomicJson } from './storage.mjs';
import {
  git,
  fileSet,
  changed,
  inheritMode,
  identities,
  repoIdentity,
  readRecord,
  stableJson,
} from './workbench.mjs';
import {
  baseProject,
  createWorkspace,
  initialFile,
  deltaPaths,
  validateChecks,
  runChecks,
} from './workspaces.mjs';
import { applyOwnedTask, recoverOwnedTask } from './tasks.mjs';
import { specialist, specialistInstructions } from './specialists.mjs';
import { findExecutable } from './command.mjs';
import { assistantRuntime } from './assistant-runtime.mjs';
import { pluginRoot } from './catalog.mjs';

const ended = ['completed', 'failed', 'cancelled', 'expired'];
export function workerCommand(host, agent) {
  if (host === 'codex')
    return [
      'codex',
      'exec',
      '--ephemeral',
      '--sandbox',
      agent.mode === 'inspect' ? 'read-only' : 'workspace-write',
      '-c',
      'agents.enabled=false',
      '-c',
      'mcp_servers={}',
      '-c',
      'approval_policy="never"',
      '--color',
      'never',
      '-',
    ];
  if (host === 'claude')
    return [
      'claude',
      '-p',
      '--no-session-persistence',
      '--tools',
      agent.mode === 'inspect' ? 'Read,Glob,Grep' : 'Read,Glob,Grep,Edit,Write,Bash',
      '--permission-mode',
      agent.mode === 'inspect' ? 'dontAsk' : 'acceptEdits',
      '--strict-mcp-config',
      '--mcp-config',
      '{"mcpServers":{}}',
      '--max-turns',
      '20',
    ];
  throw Error('Workers support codex or claude.');
}
function status(store, job) {
  const full = within(store.home, `${job.directory}/status.json`);
  if (!existsSync(full))
    return { ...job, state: 'starting', stale: Date.now() - Date.parse(job.createdAt) > 10000 };
  const record = readJson(full, 128 * 1024);
  if (record.token !== job.token) throw Error('Worker identity mismatch.');
  const { token, ...publicStatus } = record;
  return {
    ...job,
    ...publicStatus,
    stale: !ended.includes(record.state) && Date.now() - Date.parse(record.updatedAt) > 10000,
  };
}
function assertOwned(store, job) {
  if (
    job.path !== `.just-vibe/workspaces/worker-${job.id}` ||
    job.directory !== `${store.prefix}/workers/${job.id}`
  )
    throw Error('Worker ownership mismatch.');
  const path = within(store.root, job.path);
  if (
    realpathSync(resolve(path, git(path, ['rev-parse', '--git-common-dir']).trim())) !==
    realpathSync(resolve(store.root, git(store.root, ['rev-parse', '--git-common-dir']).trim()))
  )
    throw Error('Worker repository changed.');
  if (git(path, ['rev-parse', 'HEAD']).trim() !== job.head)
    throw Error('Worker HEAD changed; preserve its commits before manual cleanup.');
  return path;
}
export async function workers(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('workers') || {
      revision: 0,
      enabled: false,
      maxWorkers: 2,
      timeoutSeconds: 900,
      jobs: [],
    };
  if (operation === 'status' || operation === 'list')
    return {
      ...state,
      jobs: state.jobs.map((j) => {
        const { token, ...s } = status(store, j);
        return s;
      }),
      note: 'Process completion does not verify correctness. Workers may consume your host account usage. No automatic merge or publication.',
    };
  if (operation === 'configure') {
    object(payload, ['revision', 'enabled', 'maxWorkers', 'timeoutSeconds']);
    const next = { ...state, ...payload };
    if (
      typeof next.enabled !== 'boolean' ||
      !Number.isInteger(next.maxWorkers) ||
      next.maxWorkers < 1 ||
      next.maxWorkers > 4 ||
      !Number.isInteger(next.timeoutSeconds) ||
      next.timeoutSeconds < 10 ||
      next.timeoutSeconds > 3600
    )
      throw Error('Workers require boolean enabled, 1–4 workers and a 10–3600 second timeout.');
    return store.put('workers', next, payload.revision);
  }
  if (operation === 'start') {
    object(payload, ['revision', 'host', 'agent', 'brief', 'source', 'assignment']);
    if (!state.enabled)
      throw Error('Workers are disabled. Enable them explicitly before launching a model.');
    if (payload.revision !== state.revision) throw Error('Read current worker revision first.');
    if (payload.assignment) {
      const existing = state.jobs.find((j) => j.assignment === payload.assignment);
      if (existing) {
        if (
          existing.host !== payload.host ||
          existing.agent !== payload.agent ||
          existing.briefHash !== digest(cleanText(payload.brief, 'worker brief', 12000))
        )
          throw Error('Assignment key already belongs to a different worker brief.');
        const { token, ...publicJob } = status(store, existing);
        return { revision: state.revision, ...publicJob };
      }
    }
    if (
      state.jobs.filter((j) => !ended.includes(status(store, j).state)).length >= state.maxWorkers
    )
      throw Error('Worker concurrency limit reached; stop or finish an existing worker.');
    if (state.jobs.length >= 100) throw Error('Clean up old workers before starting more.');
    const agent = specialist(payload.agent),
      command = options.command || workerCommand(payload.host, agent);
    if (!options.command && !findExecutable(command[0]))
      throw Error(`${command[0]} is not installed.`);
    const brief = cleanText(payload.brief, 'worker brief', 12000),
      source = payload.source || 'working-tree';
    if (!['head', 'working-tree'].includes(source))
      throw Error('source must be head or working-tree.');
    const base = baseProject(root),
      sourceSnapshot = fingerprint(root);
    if (source === 'head') base.overlay = {};
    const id = randomUUID(),
      token = randomUUID(),
      directory = `${store.prefix}/workers/${id}`,
      path = `.just-vibe/workspaces/worker-${id}`;
    const job = {
      id,
      token,
      directory,
      path,
      head: base.repo.head,
      host: payload.host,
      agent: agent.id,
      mode: agent.mode,
      source,
      createdAt: timestamp(),
      briefHash: digest(brief),
      ...(payload.assignment
        ? { assignment: cleanText(payload.assignment, 'assignment', 200) }
        : {}),
    };
    // Reserve before creating files/processes so concurrent starts cannot exceed the cap.
    const reserved = store.put('workers', { ...state, jobs: [...state.jobs, job] }, state.revision);
    try {
      const cwd = createWorkspace(root, { base }, { path });
      const full = within(store.home, directory);
      mkdirSync(full, { recursive: true, mode: 0o700 });
      writeFileSync(join(full, 'baseline.json'), JSON.stringify({ base, sourceSnapshot }), {
        flag: 'wx',
        mode: 0o600,
      });
      const method = assistantRuntime(root, 'load', { workflow: agent.workflow }, options);
      const config = {
        token,
        cwd,
        command,
        prompt: `${specialistInstructions(agent)}\n\nAssigned brief:\n${brief}\n\nSnapshot source: ${source}. Return findings to stdout. Never commit or publish.\n\nMaintained workflow method (the specialist's narrower scope still applies):\n${method.instructions}\n\nSupporting workflow references are inside ${pluginRoot}. Report unavailable references rather than inventing their contents.`,
        timeoutSeconds: state.timeoutSeconds,
      };
      writeFileSync(join(full, 'config.json'), JSON.stringify(config), { flag: 'wx', mode: 0o600 });
      const child = spawn(
        process.execPath,
        [fileURLToPath(new URL('../agent-worker.mjs', import.meta.url)), join(full, 'config.json')],
        { detached: true, stdio: 'ignore', env: process.env },
      );
      await new Promise((ok, fail) => {
        child.once('spawn', ok);
        child.once('error', fail);
      });
      child.unref();
      return { revision: reserved.revision, id, path, source, mode: agent.mode, state: 'starting' };
    } catch (error) {
      const full = within(store.home, directory);
      mkdirSync(full, { recursive: true, mode: 0o700 });
      writeFileSync(
        join(full, 'status.json'),
        JSON.stringify({
          token,
          state: 'failed',
          updatedAt: timestamp(),
          output:
            'Worker startup failed. Inspect the retained worktree and retry with a new worker.',
        }),
        { mode: 0o600 },
      );
      throw error;
    }
  }
  object(payload, ['id', 'revision', 'checks', 'resultHash', 'reason']);
  requireId(payload.id);
  const job = state.jobs.find((j) => j.id === payload.id);
  if (!job) throw Error('Unknown worker.');
  const observed = status(store, job);
  if (['result', 'verify', 'apply'].includes(operation)) {
    if (observed.state !== 'completed')
      throw Error('Only a completed worker has an applicable result.');
    const path = assertOwned(store, job),
      baseline = readJson(within(store.home, `${job.directory}/baseline.json`), 1024 * 1024);
    const candidates = [
      ...new Set([...deltaPaths(path, job.head), ...Object.keys(baseline.base.overlay)]),
    ];
    const before = Object.fromEntries(
      candidates.map((p) => [p, initialFile(store.root, baseline, p)]),
    );
    const after = fileSet(path, candidates),
      paths = changed(before, after);
    const snapshot = fingerprint(path),
      resultHash = digest(
        stableJson({ snapshot, before: identities(before), after: identities(after) }),
      );
    const resultFile = `${job.directory}/verification.json`,
      previous = existsSync(within(store.home, resultFile))
        ? readJson(within(store.home, resultFile))
        : null;
    if (operation === 'result')
      return {
        id: job.id,
        state: observed.state,
        paths,
        resultHash,
        snapshot,
        sourceSnapshot: baseline.sourceSnapshot || null,
        changes: paths.map((p) => ({
          path: p,
          before: identities(before)[p],
          after: identities(after)[p],
        })),
        verification: previous?.resultHash === resultHash ? previous : null,
        application: job.application || null,
      };
    if (operation === 'verify') {
      validateChecks(payload.checks);
      const checks = await runChecks(path, payload.checks);
      return atomicJson(store.home, resultFile, { checks, resultHash }, previous?.revision || 0);
    }
    if (payload.revision !== state.revision) throw Error('Read current worker revision first.');
    if (job.mode !== 'apply') throw Error('Inspect-only workers cannot apply changes.');
    if (
      payload.resultHash !== resultHash ||
      previous?.resultHash !== resultHash ||
      previous.checks.result !== 'passed' ||
      compareSnapshot(previous.checks.snapshot, snapshot).stale
    )
      throw Error('Review the current result and run fresh passing checks before applying.');
    cleanText(payload.reason, 'application review reason', 1000);
    const id = `worker-${job.id}`,
      existing = readRecord(store.root, 'tasks', id, true);
    const expected = Object.fromEntries(paths.map((p) => [p, before[p]]));
    let task;
    if (existing) {
      if (
        stableJson(identities(existing.before)) !== stableJson(identities(expected)) ||
        stableJson(identities(existing.after)) !==
          stableJson(identities(Object.fromEntries(paths.map((p) => [p, after[p]]))))
      )
        throw Error('Worker application task changed; inspect it before retrying.');
      task = existing.pending ? recoverOwnedTask(store.root, existing) : existing;
      if (task.status !== 'captured')
        throw Error('Worker application was already undone or changed.');
      if (changed(task.after, fileSet(store.root, paths)).length)
        throw Error('Applied worker files changed; reconcile before retrying.');
    } else {
      const repo = repoIdentity(store.root);
      if (repo.head !== baseline.base.repo.head || repo.branch !== baseline.base.repo.branch)
        throw Error('Original branch or HEAD changed; reconcile before applying.');
      const current = fileSet(store.root, paths);
      if (!paths.length || changed(expected, current).length)
        throw Error('No worker changes or original files overlap; reconcile before applying.');
      const index = git(store.root, ['ls-files', '--stage', '-z']);
      for (const p of paths) {
        const entry = (s) =>
          s
            .split('\0')
            .filter((v) => v.endsWith(`\t${p}`))
            .join('\0');
        if (entry(index) !== entry(baseline.base.index))
          throw Error('Staged entries changed in worker scope.');
      }
      task = applyOwnedTask(
        store.root,
        id,
        `Reviewed worker ${job.id}: ${payload.reason}`,
        current,
        Object.fromEntries(paths.map((p) => [p, inheritMode(after[p], current[p])])),
      );
    }
    const saved = store.put(
      'workers',
      {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === job.id
            ? {
                ...j,
                application: { task: task.id, resultHash, reason: payload.reason, at: timestamp() },
              }
            : j,
        ),
      },
      state.revision,
    );
    return { revision: saved.revision, id: job.id, undoTask: task.id, paths };
  }
  if (operation === 'logs')
    return {
      id: job.id,
      state: observed.state,
      output: observed.output || '',
      truncated: observed.truncated === true,
      stale: observed.stale,
    };
  if (operation === 'stop') {
    if (ended.includes(observed.state)) return { id: job.id, state: observed.state };
    const file = within(store.home, `${job.directory}/stop`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, job.token, { mode: 0o600 });
    return {
      id: job.id,
      state: 'cancellation-requested',
      note: 'Wait for a terminal status before cleanup. No process is killed using a persisted PID.',
    };
  }
  if (operation === 'cleanup') {
    if (state.revision !== payload.revision) throw Error('Read current worker revision first.');
    if (!ended.includes(observed.state))
      throw Error(
        'Only a finished worker may be cleaned up. An unresponsive worker requires manual inspection.',
      );
    if (existsSync(within(root, job.path))) {
      const path = assertOwned(store, job);
      if (git(path, ['status', '--porcelain', '--untracked-files=all', '--ignored']).trim())
        throw Error(
          'Worker has changes or ignored files. Preserve or remove them explicitly before cleanup.',
        );
      git(root, ['worktree', 'remove', path]);
    }
    return store.put(
      'workers',
      { ...state, jobs: state.jobs.filter((j) => j.id !== job.id) },
      state.revision,
    );
  }
  throw Error('Unknown worker operation.');
}
