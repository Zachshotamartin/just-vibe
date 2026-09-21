import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { runtimeStore, object, requireId, timestamp } from './runtime-store.mjs';
import { boundedList } from './capability-io.mjs';
import { within, digest } from './storage.mjs';
import { ADAPTERS, adapters } from './editor-adapters.mjs';
import { managedSource, inspectManaged, bundleFileHashes } from './bundle.mjs';
import { runCommand, redact } from './process.mjs';
const VERSION = JSON.parse(
  readFileSync(new URL('../../.codex-plugin/plugin.json', import.meta.url)),
).version;
async function bytes(url, limit, options) {
  const response = await (options.fetch || fetch)(url, {
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
    headers: { accept: 'application/json, application/octet-stream' },
  });
  if (!response.ok) throw Error('Registry request failed.');
  const reader = response.body.getReader(),
    chunks = [];
  let size = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > limit) throw Error('Registry artifact exceeds size bound.');
      chunks.push(Buffer.from(part.value));
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks);
}
async function metadata(version, options) {
  if (!/^(?:latest|\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?)$/.test(version))
    throw Error('Choose an exact semver or latest for checking.');
  const data = JSON.parse(
    (await bytes(`https://registry.npmjs.org/just-vibe/${version}`, 1024 * 1024, options)).toString(
      'utf8',
    ),
  );
  if (
    data.name !== 'just-vibe' ||
    !/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(data.version) ||
    (version !== 'latest' && data.version !== version) ||
    !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(data.dist?.integrity || '')
  )
    throw Error('Registry metadata identity or integrity is invalid.');
  const url = new URL(data.dist.tarball);
  if (
    url.origin !== 'https://registry.npmjs.org' ||
    !url.pathname.startsWith('/just-vibe/-/') ||
    url.search ||
    url.hash
  )
    throw Error('Unexpected tarball origin.');
  const engine = data.engines?.node;
  if (engine !== '>=22')
    throw Error(
      'New package has different runtime requirements; review compatibility and use the documented installer manually.',
    );
  return { version: data.version, tarball: url.href, integrity: data.dist.integrity, node: engine };
}
export async function updater(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  if (operation === 'check') {
    object(payload, ['version']);
    const release = await metadata(payload.version || 'latest', options);
    return {
      current: VERSION,
      release,
      different: release.version !== VERSION,
      note: 'Read-only registry metadata. Updates are explicit; no background installation.',
    };
  }
  if (operation === 'list')
    return {
      updates: store
        .list(store.prefix)
        .filter((p) => p.startsWith('update-'))
        .map((p) => store.get(p.replace('.json', ''))),
    };
  object(payload, ['id', 'revision', 'version', 'targets', 'hash', 'reason', 'scope', 'newId']);
  const id = requireId(payload.id),
    name = `update-${id}`,
    state = store.get(name);
  if (operation === 'preview') {
    if (state) throw Error('Choose a new update ID.');
    if (payload.version === 'latest' || !payload.version)
      throw Error('Preview an exact version returned by check.');
    const release = await metadata(payload.version, options),
      targets = boundedList(payload.targets, 'targets', ADAPTERS.length).map((target) => {
        if (!ADAPTERS.some((a) => a.id === target)) throw Error('Unknown target.');
        let selection, previousVersion;
        if (['codex', 'claude'].includes(target)) {
          const existing = inspectManaged(
            managedSource(target, { ...process.env, JUST_VIBE_HOME: store.home }),
          );
          if (!existing) throw Error('Native target has no managed bundled installation.');
          selection = existing.selection || { profile: 'full', packs: [], rules: [] };
          previousVersion = existing.version;
        } else {
          const path = within(root, `.just-vibe/adapters/${target}/selection.json`);
          if (!existsSync(path)) throw Error('Editor target has no recorded installation.');
          selection = JSON.parse(readFileSync(path, 'utf8'));
          previousVersion = JSON.parse(
            readFileSync(
              within(root, `.just-vibe/adapters/${target}/plugin/.codex-plugin/plugin.json`),
              'utf8',
            ),
          ).version;
        }
        return { target, selection, previousVersion };
      });
    if (!targets.length) throw Error('Select at least one recorded installation.');
    if (new Set(targets.map((t) => t.target)).size !== targets.length)
      throw Error('Choose distinct update targets.');
    if (
      targets.some((t) => t.target === 'claude') &&
      !['user', 'project', 'local'].includes(payload.scope)
    )
      throw Error('Specify the existing Claude installation scope explicitly.');
    const plan = {
      id,
      release,
      targets,
      scope: payload.scope || null,
      createdAt: timestamp(),
      status: 'preview',
      previousVersion: VERSION,
    };
    return store.put(name, { ...plan, hash: digest(JSON.stringify(plan)) }, payload.revision);
  }
  if (!state) throw Error('Unknown update.');
  if (operation === 'show') return state;
  if (payload.revision !== state.revision || payload.hash !== state.hash)
    throw Error('Review the exact current update preview.');
  if (operation === 'rollback-preview') {
    if (!['completed', 'partial', 'needs-inspection'].includes(state.status))
      throw Error('Inspect the applied update before rollback.');
    const versions = new Set(state.targets.map((t) => t.previousVersion));
    if (versions.size !== 1)
      throw Error(
        'Targets had different prior versions; create a separate exact-version preview for each target.',
      );
    return updater(
      root,
      'preview',
      {
        id: requireId(payload.newId),
        revision: 0,
        version: [...versions][0],
        targets: state.targets.map((t) => t.target),
        ...(state.scope ? { scope: state.scope } : {}),
      },
      options,
    );
  }
  if (operation === 'resolve') {
    if (state.status !== 'applying') throw Error('Only an uncertain update needs reconciliation.');
    return store.put(
      name,
      {
        ...state,
        status: 'needs-inspection',
        reason: String(
          payload.reason || 'Inspect each selected host with doctor before retrying.',
        ).slice(0, 2000),
      },
      state.revision,
    );
  }
  if (operation !== 'apply' || state.status !== 'preview')
    throw Error(
      'Only a fresh preview can be applied. Interrupted updates require host inspection, not automatic replay.',
    );
  const current = await metadata(state.release.version, options);
  if (JSON.stringify(current) !== JSON.stringify(state.release))
    throw Error('Release metadata changed.');
  // Validate ownership/current selection before downloading or executing new code.
  for (const target of state.targets) {
    if (['codex', 'claude'].includes(target.target)) {
      const existing = inspectManaged(
        managedSource(target.target, { ...process.env, JUST_VIBE_HOME: store.home }),
      );
      if (
        JSON.stringify(existing?.selection || { profile: 'full', packs: [], rules: [] }) !==
        JSON.stringify(target.selection)
      )
        throw Error('Installed selection changed.');
      if (
        existing.files &&
        JSON.stringify(existing.files) !==
          JSON.stringify(
            bundleFileHashes(
              managedSource(target.target, { ...process.env, JUST_VIBE_HOME: store.home }),
            ),
          )
      )
        throw Error('Managed native files changed; preserve user edits before updating.');
    } else {
      const path = within(root, `.just-vibe/adapters/${target.target}/selection.json`);
      if (
        JSON.stringify(JSON.parse(readFileSync(path, 'utf8'))) !== JSON.stringify(target.selection)
      )
        throw Error('Installed selection changed.');
      const health = adapters(root, 'doctor', { target: target.target });
      if (health.conflicts.length || health.interrupted)
        throw Error(
          'Managed adapter has edited files or interrupted installation; inspect doctor first.',
        );
    }
  }
  const archive = await bytes(current.tarball, 20 * 1024 * 1024, options),
    integrity = 'sha512-' + createHash('sha512').update(archive).digest('base64');
  if (integrity !== current.integrity) throw Error('Downloaded package integrity mismatch.');
  mkdirSync(store.home, { recursive: true, mode: 0o700 });
  const directory = within(store.home, `${store.prefix}/downloads`);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const path = within(
    store.home,
    `${store.prefix}/downloads/${current.version}-${digest(archive).slice(0, 16)}.tgz`,
  );
  if (existsSync(path)) {
    if (digest(readFileSync(path)) !== digest(archive))
      throw Error('Stored update archive changed.');
  } else writeFileSync(path, archive, { flag: 'wx', mode: 0o600 });
  let pending = store.put(
    name,
    { ...state, status: 'applying', archiveHash: digest(archive), results: [] },
    state.revision,
  );
  for (const { target, selection } of state.targets) {
    const args = [
      'npm',
      'exec',
      '--yes',
      '--ignore-scripts',
      `--package=${path}`,
      '--',
      'just-vibe',
      'update',
      '--target',
      target,
    ];
    if (target === 'claude') args.push('--scope', state.scope);
    if (!['codex', 'claude'].includes(target)) args.push('--root', store.root);
    if (selection.profile) args.push('--profile', selection.profile);
    if (selection.packs?.length) args.push('--packs', selection.packs.join(','));
    if (selection.rules?.length) args.push('--rules', selection.rules.join(','));
    if (selection.hooks) args.push('--editor-hooks');
    const result = await (options.runCommand || runCommand)(args, {
      cwd: store.root,
      timeoutMs: 120000,
      maxBytes: 128 * 1024,
      env: { ...process.env, JUST_VIBE_HOME: store.home },
    });
    pending = store.put(
      name,
      {
        ...pending,
        results: [
          ...pending.results,
          {
            target,
            status: result.status,
            stdout: redact(result.stdout || '').slice(0, 4000),
            stderr: redact(result.stderr || '').slice(0, 2000),
            passed: result.status === 0 && !result.error && !result.timedOut && !result.truncated,
          },
        ],
      },
      pending.revision,
    );
    if (!pending.results.at(-1).passed) break;
  }
  return store.put(
    name,
    {
      ...pending,
      status:
        pending.results.length === state.targets.length && pending.results.every((r) => r.passed)
          ? 'completed'
          : 'partial',
      finishedAt: timestamp(),
      recovery:
        'Run doctor for every target; preserve user-edited files. Reinstall the recorded previous exact version with the same selection to roll back. Host-managed backups and ownership journals remain authoritative.',
    },
    pending.revision,
  );
}
