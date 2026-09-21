import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  realpathSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitRead } from './project.mjs';
import { digest, within, projectRoot } from './storage.mjs';
import { runtimeStore, object, timestamp } from './runtime-store.mjs';
import { stagedQuality, quality } from './quality.mjs';
import { runners } from './trusted-runners.mjs';
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
    const staged = stagedQuality(root);
    if (staged.findings.length)
      throw Error(
        'Staged secret or conflict indicators found; run quality check-commit for details.',
      );
    const result = await quality(root, 'check-commit', {}, options);
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
  const runner = payload.runner || saved.runner,
    runnerHash = payload.runnerHash || saved.runnerHash;
  if (hook === 'pre-push' && ['preview', 'install'].includes(operation)) {
    const r = (await runners(root, 'show', { id: runner }, options)).runner;
    if (!r.trusted || !r.current || r.hash !== runnerHash)
      throw Error('Trust the exact pre-push verifier runner first.');
  }
  const script =
    hook === 'pre-commit' ? `git-hooks check --root ${quote(root)}` : `--root ${quote(root)}`;
  const entry = fileURLToPath(
    new URL(hook === 'pre-commit' ? '../toolkit.mjs' : '../pre-push.mjs', import.meta.url),
  );
  const content = `#!/bin/sh\n# just-vibe managed ${hook}\nJUST_VIBE_HOME=${quote(store.home)} exec ${quote(realpathSync(process.execPath))} ${quote(entry)} ${script}\n`;
  const hash = digest(
    content + (hook === 'pre-push' ? JSON.stringify({ runner, runnerHash }) : ''),
  );
  const current = existsSync(path) ? digest(readFileSync(path)) : null;
  if (operation === 'status' || operation === 'preview')
    return {
      revision: saved.revision,
      path,
      currentHash: current,
      managed: !!saved.fileHash
        ? current === saved.fileHash
        : !!saved.hash && current === saved.hash,
      hash,
      content,
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
        ...(hook === 'pre-push' ? { runner, runnerHash } : {}),
        installedAt: timestamp(),
      },
      saved.revision,
    );
  }
  if (operation === 'uninstall') {
    if (!saved.hash || current !== (saved.fileHash || saved.hash) || payload.hash !== saved.hash)
      throw Error('Managed hook changed or missing; preserve user edits.');
    unlinkSync(path);
    return store.put(name, { removedAt: timestamp() }, saved.revision);
  }
  throw Error('Unknown Git hook operation.');
}
