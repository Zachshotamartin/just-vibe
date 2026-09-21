import { createInterface } from 'node:readline/promises';
import { install, parseArgs, execute } from '../installer.mjs';
import { integration } from './integration.mjs';
import { ADAPTERS } from './editor-adapters.mjs';
import { INSTALL_PROFILES, selectPayload } from './selection.mjs';
import { loadCatalog } from './catalog.mjs';
import { projectRoot } from './storage.mjs';

export async function guidedSetup(
  args,
  {
    question,
    log = console.log,
    runInstall = install,
    root = process.cwd(),
    home,
    input = process.stdin,
    output = process.stdout,
  } = {},
) {
  const rest = args.filter((a) => a !== '--guided');
  const rootIndex = rest.indexOf('--root');
  if (rootIndex !== -1) {
    root = rest[rootIndex + 1];
    rest.splice(rootIndex, 2);
  }
  root = projectRoot(root);
  const initial = parseArgs(rest);
  if (!['setup', 'update'].includes(initial.command) || initial.local || initial.github)
    throw Error('Guided setup requires bundled setup or update.');
  let reader;
  if (!question) {
    if (!input.isTTY)
      throw Error(
        'Guided setup needs an interactive terminal. Use integration preview/configure --stdin and explicit setup flags for automation.',
      );
    reader = createInterface({ input, output });
    question = (text) => reader.question(text);
  }
  try {
    const choose = async (label, fallback) =>
      (await question(`${label} [${fallback}]: `)).trim() || fallback;
    const targets = (
      await choose(
        `Targets (${ADAPTERS.filter((a) => a.id !== 'hermes')
          .map((a) => a.id)
          .join(', ')})`,
        initial.target,
      )
    )
      .split(',')
      .map((v) => v.trim());
    if (
      !targets.length ||
      new Set(targets).size !== targets.length ||
      targets.some((t) => !ADAPTERS.some((a) => a.id === t))
    )
      throw Error('Choose distinct supported targets.');
    if (targets.includes('hermes'))
      throw Error(
        'Install Hermes separately with --target hermes --root pointing to its configured home.',
      );
    const profile = await choose(
      `Workflow profile (${Object.keys(INSTALL_PROFILES).join(', ')})`,
      initial.selection?.profile || 'core',
    );
    const ruleText = await choose(
      'Rule packs, comma separated; none clears rules',
      initial.selection?.rules?.join(',') || 'none',
    );
    const selection = {
      profile,
      rules: ruleText === 'none' ? [] : ruleText.split(',').map((v) => v.trim()),
    };
    selectPayload(loadCatalog(), selection);
    const yes = async (text, fallback = false) => {
      const answer = (await choose(`${text} (yes/no)`, fallback ? 'yes' : 'no')).toLowerCase();
      if (!['yes', 'no'].includes(answer)) throw Error('Answer yes or no.');
      return answer === 'yes';
    };
    const automatic = await yes('Enable ordinary-request routing', true);
    const observation = await yes(
      'Observe workflow/tool metadata for pending learning suggestions',
    );
    const allowWrite = await yes('Enable native memory, goal and learning writes for this project');
    const allowUser = await yes('Allow native access to user-wide memory and lesson history');
    const enableWorkers = await yes(
      'Enable explicitly assigned model workers (uses your host account)',
    );
    const guards = await yes('Enable before-action policy checks');
    const editorHooks = targets.some((target) => ['cursor', 'opencode'].includes(target))
      ? await yes('Install native Cursor/OpenCode events and tools (host trust remains separate)')
      : false;
    const mcp = { allowWrite, allowUser, allowWorkers: enableWorkers && allowWrite };
    const current = await integration(root, 'status', {}, { home });
    const settings = {
      revision: current.revision,
      rules: selection.rules,
      mcp,
      automatic,
      observation,
      workers: enableWorkers,
      policy: guards,
    };
    const plan = await integration(root, 'preview', settings, { home });
    log(JSON.stringify({ root, targets, selection, runtime: plan }, null, 2));
    const installs = targets.map((target) => ({
      ...initial,
      target,
      ...(['cursor', 'opencode'].includes(target) && editorHooks ? { editorHooks: true } : {}),
      selection,
      ...(!['codex', 'claude'].includes(target) ? { root } : {}),
    }));
    const execution = { log, run: (binary, args) => execute(binary, args, root) };
    for (const options of installs) runInstall({ ...options, dryRun: true }, execution);
    if (initial.dryRun) return { dryRun: true, plan };
    if (!(await yes('Apply this exact installation and runtime configuration')))
      return { cancelled: true };
    for (const options of installs) runInstall(options, execution);
    const saved = await integration(root, 'configure', settings, { home });
    log(
      'Configured. Review native hook trust in your host, then start a new conversation. Existing MCP connections need a restart.',
    );
    return { targets, settings: saved };
  } finally {
    reader?.close();
  }
}
