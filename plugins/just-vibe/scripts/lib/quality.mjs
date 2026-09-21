import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { manageHooks, handleHook } from './automation.mjs';
import { within, digest, fingerprint, projectRoot } from './storage.mjs';
import { object } from './runtime-store.mjs';
import { gitRead } from './project.mjs';
import { shellCommands } from './action-policy.mjs';

function read(root, file) {
  const path = within(root, file);
  if (!existsSync(path)) return null;
  if (statSync(path).size > 262144) throw Error('Manifest exceeds detection limit.');
  return JSON.parse(readFileSync(path, 'utf8'));
}
export function qualityPreset(root, payload = {}) {
  object(payload, ['packageManager', 'batch', 'commit']);
  for (const key of ['batch', 'commit'])
    if (payload[key] !== undefined && typeof payload[key] !== 'boolean')
      throw Error(`${key} must be boolean.`);
  const pkg = read(root, 'package.json'),
    warnings = [],
    checks = [],
    formatters = [];
  const locks = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
  ].filter(([file]) => existsSync(within(root, file)));
  const managers = [...new Set(locks.map(([, pm]) => pm))];
  const declared = pkg?.packageManager?.split('@')[0];
  const manager =
    payload.packageManager || declared || (managers.length === 1 ? managers[0] : null);
  if (manager && !['npm', 'pnpm', 'yarn', 'bun'].includes(manager))
    throw Error('Unsupported package manager.');
  if (managers.length > 1 && !payload.packageManager && !declared)
    warnings.push('Multiple lockfiles: choose packageManager explicitly.');
  if (pkg && !manager)
    warnings.push('No unambiguous package manager: no package scripts proposed.');
  for (const name of ['typecheck', 'lint'])
    if (manager && typeof pkg?.scripts?.[name] === 'string')
      checks.push({ name, command: [manager, 'run', name], timeoutMs: 15000, extensions: [] });
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  const formatter = deps?.['@biomejs/biome'] ? 'biome' : deps?.prettier ? 'prettier' : null;
  if (formatter && manager)
    formatters.push({
      name: formatter,
      command: [
        manager,
        manager === 'bun' ? 'run' : 'exec',
        ...(manager === 'npm' ? ['--no', '--'] : []),
        formatter,
        ...(formatter === 'biome' ? ['format', '--write'] : ['--write']),
        '{file}',
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css'],
      timeoutMs: 15000,
    });
  if (existsSync(within(root, 'pyproject.toml'))) {
    const path = within(root, 'pyproject.toml');
    if (statSync(path).size <= 262144 && /\[tool\.ruff(?:\]|\.)/.test(readFileSync(path, 'utf8'))) {
      if (checks.length < 3)
        checks.push({
          name: 'ruff',
          command: ['ruff', 'check', '.'],
          timeoutMs: 15000,
          extensions: ['.py'],
        });
      if (checks.length + formatters.length < 4)
        formatters.push({
          name: 'ruff-format',
          command: ['ruff', 'format', '{file}'],
          timeoutMs: 15000,
          extensions: ['.py'],
        });
    }
  }
  const configuration = {
    schemaVersion: 1,
    revision: 0,
    enabled: true,
    saveSummary: true,
    checks: checks.slice(0, 4 - formatters.length),
    formatters,
    batch: payload.batch ?? true,
    commit: payload.commit ?? false,
  };
  return {
    configuration,
    warnings,
    packageManager: manager,
    note: 'Discovery only. Review script bodies and installed binaries before configuring and trusting this exact configuration. No packages are installed; executable availability is verified when checks run.',
  };
}
function git(root, args, maxBuffer = 4 * 1024 * 1024) {
  const result = spawnSync(
    'git',
    [
      '--no-optional-locks',
      '--no-pager',
      '--no-replace-objects',
      '-c',
      'core.fsmonitor=false',
      '-C',
      root,
      ...args,
    ],
    {
      encoding: 'utf8',
      timeout: 1000,
      maxBuffer,
      env: Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))),
    },
  );
  if (result.status !== 0 || result.error)
    throw Error('Cannot inspect complete Git index; commit verification unavailable.');
  return result.stdout;
}
export function stagedQuality(root) {
  const deadline = Date.now() + 2000;
  const index = git(root, ['ls-files', '--stage', '-z']);
  const paths = git(root, ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'])
    .split('\0')
    .filter(Boolean);
  if (paths.length > 200)
    throw Error(
      'Staged scan exceeds 200 files; split the commit or use an independently reviewed check.',
    );
  const findings = [];
  let bytes = 0;
  for (const file of paths) {
    if (Date.now() > deadline)
      throw Error('Staged inspection time budget exhausted; no passing evidence is available.');
    const body = git(root, ['show', `:${file}`], 1024 * 1024);
    bytes += Buffer.byteLength(body);
    if (bytes > 4 * 1024 * 1024) throw Error('Staged scan exceeds 4 MiB.');
    if (/^(?:<{7}|={7}|>{7})(?: |$)/m.test(body))
      findings.push({
        file,
        rule: 'merge-conflict',
        message: 'Unresolved conflict marker in staged content.',
      });
    if (
      /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----|\b(?:gh[pousr]_|github_pat_|npm_|sk-)[A-Za-z0-9_-]{20,}/.test(
        body,
      )
    )
      findings.push({
        file,
        rule: 'staged-credential',
        message: 'Possible credential in staged content; value omitted.',
      });
  }
  return {
    indexHash: digest(index),
    files: paths,
    findings,
    unstaged: git(root, ['diff', '--name-only', '-z']).split('\0').filter(Boolean),
    note: 'Static staged-content indicators only; no secret values returned.',
  };
}
export async function quality(root, operation, payload = {}, options = {}) {
  root = projectRoot(root);
  if (operation === 'preview') return qualityPreset(root, payload);
  if (operation === 'status') return manageHooks(root, 'status', {}, options);
  if (operation === 'configure') {
    object(payload, ['revision', 'packageManager', 'batch', 'commit']);
    const { revision, ...selection } = payload;
    return manageHooks(
      root,
      'configure',
      { ...qualityPreset(root, selection).configuration, revision },
      options,
    );
  }
  if (operation !== 'check-commit') throw Error('Unknown quality operation.');
  object(payload, []);
  const status = manageHooks(root, 'status', {}, options);
  if (!status.configuration?.enabled || !status.configuration.commit || !status.trusted)
    return {
      available: false,
      reason: 'Commit checks require enabled, trusted project automation with commit: true.',
    };
  const before = stagedQuality(root);
  if (before.findings.length) return { ...before, passed: false };
  if (status.configuration.checks.length && before.unstaged.length)
    return {
      ...before,
      passed: false,
      reason:
        'Unstaged tracked edits differ from the index. Working-tree checks cannot certify this partially staged commit.',
    };
  const source = fingerprint(root);
  if (source.partial)
    return {
      ...before,
      passed: false,
      reason: 'Source snapshot coverage is incomplete; use an independently reviewed commit check.',
    };
  const checks = await handleHook(
    {
      hook_event_name: 'Stop',
      cwd: root,
      last_assistant_message: '',
      just_vibe_force_checks: true,
      just_vibe_commit_check: true,
    },
    { ...options, timeBudgetMs: 16000 },
  );
  const after = stagedQuality(root);
  const unchanged =
    before.indexHash === after.indexHash &&
    JSON.stringify(source) === JSON.stringify(fingerprint(root));
  return {
    ...after,
    checks: checks.results,
    passed:
      unchanged &&
      !after.findings.length &&
      !checks.skipped &&
      (checks.results || []).length === status.configuration.checks.length &&
      checks.results.every((c) => c.result === 'passed'),
    ...(unchanged ? {} : { reason: 'Project or index changed during verification.' }),
  };
}
export async function commitQualityHook(event, options = {}) {
  if (
    event?.hook_event_name !== 'PreToolUse' ||
    !event.cwd ||
    !/^(Bash|bash|exec_command|shell|run_command)$/.test(event.tool_name)
  )
    return {};
  const command = event.tool_input?.command ?? event.tool_input?.cmd;
  if (
    typeof command !== 'string' ||
    !/(?:^|[;&|\n])\s*git\s+(?:[^;&|\n]*\s)?commit(?:\s|$)/.test(command)
  )
    return {};
  const cwd = projectRoot(resolve(event.cwd, event.tool_input?.workdir || '.'));
  let root = options.projectRoot || cwd;
  if (!existsSync(within(root, '.just-vibe/automation.json')))
    root = gitRead(root, ['rev-parse', '--show-toplevel']) || root;
  const status = manageHooks(root, 'status', {}, options);
  if (!status.configuration?.enabled || !status.configuration.commit || !status.trusted) return {};
  let result;
  try {
    const commands = shellCommands(command);
    const words = commands[0] || [];
    if (
      commands.length !== 1 ||
      words[0] !== 'git' ||
      words[1] !== 'commit' ||
      /\$\(|`|[<>]/.test(command)
    )
      throw Error(
        'Run one direct git commit after staging; compound or indirect commands cannot be verified before execution.',
      );
    const values = new Set([
      '-m',
      '--message',
      '-F',
      '--file',
      '--author',
      '--date',
      '-c',
      '-C',
      '--reuse-message',
      '--reedit-message',
      '--fixup',
      '--squash',
      '--cleanup',
      '--trailer',
    ]);
    const flags = new Set([
      '--amend',
      '--no-edit',
      '--allow-empty',
      '--allow-empty-message',
      '--no-verify',
      '-n',
      '--signoff',
      '-s',
      '--gpg-sign',
      '-S',
      '--no-gpg-sign',
      '--reset-author',
      '-q',
      '--quiet',
      '-v',
      '--verbose',
      '--no-post-rewrite',
      '--dry-run',
      '--short',
      '--branch',
      '--porcelain',
      '--long',
      '--no-status',
      '--status',
    ]);
    for (let i = 2; i < words.length; i++) {
      const word = words[i],
        key = word.split('=')[0];
      if (values.has(word)) {
        if (++i >= words.length) throw Error('Commit option needs a value.');
        continue;
      }
      if (
        (word.includes('=') && values.has(key)) ||
        flags.has(word) ||
        /^-m.+/.test(word) ||
        /^-S.+/.test(word)
      )
        continue;
      throw Error(
        'Commit pathspecs, index-changing flags and unknown options require staging separately before a direct commit.',
      );
    }
    const commitRoot = gitRead(cwd, ['rev-parse', '--show-toplevel']);
    if (!commitRoot || projectRoot(commitRoot) !== projectRoot(root))
      throw Error('The command targets a different Git project from the configured commit gate.');
    if (/\bgit\s+[^;&|\n]*(?:-C\s|--git-dir|--work-tree)|(?:^|[;&|\n])\s*cd\s/.test(command))
      throw Error(
        'Run the commit directly from its project root so the gate can verify the correct index.',
      );
    result = await quality(root, 'check-commit', {}, options);
  } catch (error) {
    result = { passed: false, reason: error.message };
  }
  return result.passed
    ? {}
    : {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: `just-vibe commit check: ${result.reason || 'staged findings or unsuccessful checks'}. Inspect quality check-commit; no commit was made.`,
        },
      };
}
