import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pluginRoot } from './catalog.mjs';
import { bundleFileHashes } from './bundle.mjs';
import { digest, within } from './storage.mjs';
import { managedFiles } from './managed-files.mjs';

export function gitHookRuntime(home) {
  const files = bundleFileHashes(pluginRoot);
  const sourceHash = digest(JSON.stringify(files));
  return { sourceHash, path: join(home, 'git-hook-runtimes', sourceHash, 'plugin'), files };
}

export function stageGitHookRuntime(home, runtime) {
  // Hashes form part of the previewed command's destination. Check every source
  // read and the complete listing before publishing an executable hook.
  const prefix = `git-hook-runtimes/${runtime.sourceHash}/plugin`;
  const files = new Map(Object.entries(runtime.files).map(([path, hash]) => {
    const bytes = readFileSync(within(pluginRoot, path));
    if (digest(bytes) !== hash) throw Error('Git hook runtime source changed after preview.');
    return [`${prefix}/${path}`, bytes];
  }));
  if (JSON.stringify(bundleFileHashes(pluginRoot)) !== JSON.stringify(runtime.files))
    throw Error('Git hook runtime source changed after preview.');
  mkdirSync(home, { recursive: true, mode: 0o700 });
  const destination = within(home, prefix);
  if (existsSync(destination)) {
    const existing = bundleFileHashes(destination);
    // Missing files can be restored by the ownership journal; edited or added
    // files must not be silently trusted as the previewed runtime.
    if (Object.entries(existing).some(([path, hash]) => runtime.files[path] !== hash))
      throw Error('Staged Git hook runtime has edited or added files; preserve them before reinstalling.');
  }
  managedFiles(home, `git-hook-${runtime.sourceHash}`, files, 'install', {
    allowed: (path) => path.startsWith(`${prefix}/`),
  });
  if (JSON.stringify(bundleFileHashes(destination)) !== JSON.stringify(runtime.files))
    throw Error('Staged Git hook runtime differs from the reviewed source.');
}
