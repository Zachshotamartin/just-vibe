import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  realpathSync,
  lstatSync,
} from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { gitRead } from './project.mjs';
import { digest, within, projectRoot } from './storage.mjs';
import { runtimeStore, object, timestamp } from './runtime-store.mjs';
import { stagedQuality, quality } from './quality.mjs';
import { runners } from './trusted-runners.mjs';
import { gitHookRuntime, stageGitHookRuntime } from './git-hook-runtime.mjs';
import { withFileLock } from './file-lock.mjs';
const quote = (text) => `'${text.replaceAll("'", "'\\''")}'`;
export async function gitHooks(root, operation, payload = {}, options = {}) {
  root = projectRoot(root);
  const store = runtimeStore(root, options);
  object(payload, ['revision', 'hash', 'hook', 'runner', 'runnerHash', 'updates']);
  const hook = payload.hook || 'pre-commit';
  if (!['pre-commit', 'pre-push'].includes(hook)) throw Error('Choose pre-commit or pre-push.');
  const gitRoot = gitRead(root, ['rev-parse', '--show-toplevel']);
  if (!gitRoot || projectRoot(gitRoot) !== root) throw Error('Select the Git project root.');
  const name = hook === 'pre-commit' ? 'git-hook' : 'git-hook-push';
  const saved = store.get(name) || { revision: 0 };
  if (operation === 'check') {
    if (hook === 'pre-push') {
      const updates = String(payload.updates || '')
        .trim()
        .split('\n')
        .filter(Boolean);
      if (!updates.length) return { passed: true, scope: 'no updated references' };
      if (updates.length > 100) throw Error('Too many pushed references.');
      const head = gitRead(root, ['rev-parse', 'HEAD']);
      for (const line of updates) {
        const fields = line.trim().split(/\s+/);
        if (fields.length !== 4 || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(fields[1]))
          throw Error('Invalid pre-push update record.');
        if (!/^0+$/.test(fields[1]) && fields[1] !== head)
          throw Error(
            'Push checks cover the current HEAD only; check each different reference in its own checkout.',
          );
      }
      if (updates.every((line) => /^0+$/.test(line.trim().split(/\s+/)[1])))
        return { passed: true, scope: 'reference deletion; no source checks' };
      if (gitRead(root, ['status', '--porcelain', '--untracked-files=all']))
        throw Error('Pre-push verification requires a clean checkout matching the pushed HEAD.');
      if (!saved.runner || !saved.runnerHash)
        throw Error('Configure a reviewed pre-push verifier runner.');
      const result = await runners(
        root,
        'run',
        { id: saved.runner, hash: saved.runnerHash },
        options,
      );
      if (
        !result.passed ||
        gitRead(root, ['rev-parse', 'HEAD']) !== head ||
        gitRead(root, ['status', '--porcelain', '--untracked-files=all'])
      )
        throw Error('Push verifier failed or changed source; inspect the current checkout.');
      return result;
    }
    // Native Git can provide a temporary index for --only/--all commits.
    // Keep project-bound Git reads sanitized and admit only this repository's
    // own regular index file to the commit inspection path.
    let nativeHookIndex;
    if (process.env.GIT_INDEX_FILE) {
      const gitDirectory = gitRead(root, ['rev-parse', '--absolute-git-dir']);
      if (!gitDirectory) throw Error('Cannot identify the native hook Git directory.');
      nativeHookIndex = within(gitDirectory, resolve(root, process.env.GIT_INDEX_FILE));
      if (dirname(nativeHookIndex) !== realpathSync(gitDirectory))
        throw Error('Native hook index belongs to a different checkout or unsupported directory.');
      if (!lstatSync(nativeHookIndex).isFile()) throw Error('Native hook index must be a regular file.');
    }
    const checkOptions = { ...options, nativeHookIndex };
    const staged = stagedQuality(root, checkOptions);
    if (staged.findings.length)
      throw Error(
        'Staged secret or conflict indicators found; run quality check-commit for details.',
      );
    const result = await quality(root, 'check-commit', {}, checkOptions);
    if (result.available === false)
      return {
        ...staged,
        passed: true,
        scope: 'static staged indicators only; project commands are not enabled',
      };
    if (!result.passed)
      throw Error(`Commit checks failed: ${result.reason || 'inspect quality check-commit'}`);
    return result;
  }
  if (gitRead(root, ['config', '--get', 'core.hooksPath']))
    throw Error(
      'Existing core.hooksPath is managed elsewhere; compose just-vibe checks with that manager.',
    );
  const path = resolve(root, gitRead(root, ['rev-parse', '--git-path', `hooks/${hook}`]));
  if (!path.startsWith(resolve(root, '.git') + '/'))
    throw Error('Install from the main checkout; shared worktree hooks are not changed.');
  within(root, path);
  if (existsSync(path) && (!lstatSync(path).isFile() || lstatSync(path).size > 1024 * 1024))
    throw Error('Existing hook must be a bounded regular file; preserve it and compose manually.');
  const installedContent = existsSync(path) ? readFileSync(path) : null;
  const current = installedContent ? digest(installedContent) : null;
  const managed = !!saved.fileHash
    ? current === saved.fileHash
    : !!saved.hash && current === saved.hash;
  const mutate = (operation) => {
    mkdirSync(store.home, { recursive: true, mode: 0o700 });
    return withFileLock(within(store.home, `${store.prefix}/${name}.operation.lock`), () => {
      if ((store.get(name)?.revision || 0) !== saved.revision)
        throw Error('Hook ownership changed; read current status before retrying.');
      const latest = existsSync(path) ? digest(readFileSync(within(root, path))) : null;
      if (latest !== current) throw Error('Hook changed before mutation; preserve user edits.');
      return operation();
    });
  };
  if (operation === 'status')
    return {
      revision: saved.revision, path, currentHash: current, managed,
      hash: saved.hash || null, installedHash: saved.hash || null,
      content: installedContent?.toString('utf8') || '',
      runner: saved.runner, runnerHash: saved.runnerHash,
      runtime: saved.runtime || null,
      pending: saved.pending || null,
      available: !current || managed,
    };
  if (operation === 'uninstall') {
    if (payload.revision !== saved.revision) throw Error('Read current hook revision first.');
    if (!saved.hash || (!managed && !(saved.pending === 'uninstall' && !current)) || payload.hash !== saved.hash)
      throw Error('Managed hook changed or missing; preserve user edits.');
    return mutate(() => {
      const pending = store.put(name, { ...saved, pending: 'uninstall' }, saved.revision);
      if (current) unlinkSync(path);
      return store.put(name, { removedAt: timestamp() }, pending.revision);
    });
  }
  if (!['preview', 'install'].includes(operation)) throw Error('Unknown Git hook operation.');
  const runner = payload.runner || saved.runner,
    runnerHash = payload.runnerHash || saved.runnerHash;
  if (hook === 'pre-push' && ['preview', 'install'].includes(operation)) {
    const r = (await runners(root, 'show', { id: runner }, options)).runner;
    if (!r.trusted || !r.current || r.hash !== runnerHash)
      throw Error('Trust the exact pre-push verifier runner first.');
  }
  const script =
    hook === 'pre-commit' ? `git-hooks check --root ${quote(root)}` : `--root ${quote(root)}`;
  const source = gitHookRuntime(store.home);
  const runtime = { sourceHash: source.sourceHash, path: source.path };
  const entry = join(runtime.path, 'scripts', hook === 'pre-commit' ? 'toolkit.mjs' : 'pre-push.mjs');
  const content = `#!/bin/sh\n# just-vibe managed ${hook}\nJUST_VIBE_HOME=${quote(store.home)} exec ${quote(realpathSync(process.execPath))} ${quote(entry)} ${script}\n`;
  const hash = digest(
    content + (hook === 'pre-push' ? JSON.stringify({ runner, runnerHash }) : ''),
  );
  if (operation === 'preview')
    return {
      revision: saved.revision,
      path,
      currentHash: current,
      managed,
      hash,
      installedHash: saved.hash || null,
      content,
      runtime,
      runner,
      runnerHash,
      available: !current || current === (saved.fileHash || saved.hash),
    };
  if (payload.revision !== saved.revision) throw Error('Read current hook revision first.');
  if (operation === 'install') {
    if (payload.hash !== hash) throw Error('Review current hook preview.');
    if (current && current !== (saved.fileHash || saved.hash))
      throw Error('Existing hook is foreign or edited; preserve it and compose manually.');
    if (current && current !== digest(content))
      throw Error('Remove the unchanged managed hook before replacing its command.');
    stageGitHookRuntime(store.home, source);
    return mutate(() => {
      // Publish ownership before changing the executable hook. A failed final
      // state write leaves an exact, reviewable reservation that a retry can finish.
      const pending = store.put(name, {
        hash, fileHash: digest(content), path, runtime, pending: 'install',
        ...(hook === 'pre-push' ? { runner, runnerHash } : {}),
      }, saved.revision);
      if (!current) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, content, { flag: 'wx', mode: 0o755 });
      }
      return store.put(
        name,
        {
          hash,
          fileHash: digest(content),
          path,
          runtime,
          ...(hook === 'pre-push' ? { runner, runnerHash } : {}),
          installedAt: timestamp(),
        },
        pending.revision,
      );
    });
  }
  throw Error('Unknown Git hook operation.');
}
