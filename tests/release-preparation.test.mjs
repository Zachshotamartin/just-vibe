import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

test('release preparation binds the source checked at start and rejects edits or commits during checks and packing', () => {
  for (const mutation of [
    'none',
    'dirty-check',
    'commit-check',
    'dirty-pack',
    'commit-pack',
    'commit-dry-run',
    'archive-smoke',
    'archive-dry-run',
    'foreign-clean',
    'foreign-dirty',
  ]) {
    const root = mkdtempSync(join(tmpdir(), 'jv-release-source-'));
    // Only fixture commits; never inherit a developer's alternate index or Git directory.
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
    );
    const git = (args) =>
      execFileSync(
        'git',
        ['-c', 'user.name=Release fixture', '-c', 'user.email=fixture@example.invalid', ...args],
        { cwd: root, env, encoding: 'utf8' },
      ).trim();
    try {
      mkdirSync(join(root, 'scripts/lib'), { recursive: true });
      copyFileSync(
        new URL('../scripts/prepare-release.mjs', import.meta.url),
        join(root, 'scripts/prepare-release.mjs'),
      );
      copyFileSync(
        new URL('../scripts/lib/git.mjs', import.meta.url),
        join(root, 'scripts/lib/git.mjs'),
      );
      writeFileSync(
        join(root, 'package.json'),
        JSON.stringify({ name: 'fixture', version: '1.0.0', type: 'module' }),
      );
      writeFileSync(join(root, '.gitignore'), 'dist\n.foreign\n');
      writeFileSync(join(root, 'code.txt'), 'checked-source');
      writeFileSync(
        join(root, 'scripts/smoke-package-managers.mjs'),
        mutation === 'archive-smoke'
          ? "import fs from 'node:fs'; fs.writeFileSync(process.argv[2], 'unchecked archive replacement');\n"
          : '// No package manager or network in this source-binding fixture.\n',
      );
      writeFileSync(
        join(root, 'scripts/lib/npm.mjs'),
        `
        import fs from 'node:fs';
        import path from 'node:path';
        import { execFileSync } from 'node:child_process';
        const mutation = ${JSON.stringify(mutation)};
        export function npm(args, { cwd } = {}) {
          const stage = args[0] === 'run' ? 'check' : args[0] === 'pack' ? 'pack' : 'dry-run';
          if (mutation === 'archive-dry-run' && stage === 'dry-run') {
            fs.writeFileSync(path.join(cwd, 'dist/fixture-1.0.0.tgz'), 'unchecked archive replacement');
            return '';
          }
          if (mutation.endsWith('-' + stage)) {
            fs.writeFileSync(path.join(cwd, 'code.txt'), 'source-changed-during-' + stage);
            if (mutation.startsWith('commit-')) for (const command of [['add', 'code.txt'], ['commit', '-qm', 'Concurrent fixture edit']])
              execFileSync('git', ['-c', 'user.name=Release fixture', '-c', 'user.email=fixture@example.invalid', ...command], { cwd });
          }
          if (stage === 'pack') {
            fs.writeFileSync(path.join(cwd, 'dist/fixture-1.0.0.tgz'), 'inert fixture archive');
            return JSON.stringify([{ filename: 'fixture-1.0.0.tgz', files: [] }]);
          }
          return '';
        }
        export function packResult(output) { return JSON.parse(output)[0]; }
      `,
      );
      git(['init', '-q']);
      git(['add', '.']);
      git(['commit', '-qm', 'Initial fixture']);
      const checkedHead = git(['rev-parse', 'HEAD']);
      let childEnv = env;
      if (mutation.startsWith('foreign-')) {
        const foreign = join(root, '.foreign');
        mkdirSync(foreign);
        git(['-C', foreign, 'init', '-q']);
        writeFileSync(join(foreign, 'foreign.txt'), 'Different repository');
        git(['-C', foreign, 'add', '.']);
        git(['-C', foreign, 'commit', '-qm', 'Foreign fixture']);
        childEnv = { ...env, GIT_DIR: join(foreign, '.git'), GIT_WORK_TREE: foreign,
          GIT_INDEX_FILE: join(foreign, '.git/index'), GIT_CONFIG_COUNT: '1',
          GIT_CONFIG_KEY_0: 'status.showUntrackedFiles', GIT_CONFIG_VALUE_0: 'no' };
        if (mutation === 'foreign-dirty') writeFileSync(join(root, 'code.txt'), 'Uncommitted source');
      }
      const result = spawnSync(process.execPath, ['scripts/prepare-release.mjs'], {
        cwd: root,
        env: childEnv,
        encoding: 'utf8',
        timeout: 15000,
      });
      const record = join(root, 'dist/fixture-1.0.0.tgz.release.json');
      if (mutation === 'none' || mutation === 'foreign-clean') {
        assert.equal(result.status, 0, result.stderr);
        assert.equal(JSON.parse(readFileSync(record, 'utf8')).sourceCommit, checkedHead);
      } else {
        assert.notEqual(result.status, 0, mutation);
        assert.match(result.stderr, mutation.startsWith('archive-') ? /Release archive changed during verification/ : /Release source changed or is uncommitted/, mutation);
        assert.equal(existsSync(record), false, `No trusted release receipt for ${mutation}`);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});
