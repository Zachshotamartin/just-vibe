#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPOSITORY = 'Zachshotamartin/just-vibe';
export const MARKETPLACE = 'just-vibe';
export const PLUGIN = 'just-vibe@just-vibe';
const VERSION = JSON.parse(readFileSync(new URL('../.codex-plugin/plugin.json', import.meta.url))).version;
const COMMANDS = new Set(['setup', 'update', 'uninstall', 'doctor', 'help']);
const SCOPES = new Set(['user', 'project', 'local']);

export const HELP = `just-vibe ${VERSION}

Usage: just-vibe <command> [options]

Commands:
  setup       Install through the selected host's native plugin manager
  update      Refresh this marketplace and update its installed plugin
  uninstall   Remove this plugin; keep its marketplace and persistent data
  doctor      Check prerequisites, marketplace source, and installation
  help        Show this help

Options:
  --target codex|claude   Host to configure (default: codex)
  --scope user|project|local
                         Claude installation scope (default: user)
  --local                Use this repository checkout instead of GitHub
  --dry-run              Print steps without running any host commands
  --version              Print the package version
  --help                 Show this help

Examples:
  npx github:${REPOSITORY} setup
  npx github:${REPOSITORY} setup --target claude
  node bin/just-vibe.mjs setup --local --dry-run

Requires Node.js 22+, Git, and the selected host CLI with plugin support.
Private repositories require Git access. No npm publication is required.
`;

export function parseArgs(args) {
  const options = { command: 'help', target: 'codex', scope: 'user', local: false, dryRun: false };
  let commandSeen = false;
  let scopeSeen = false;
  const flags = new Set();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') return { ...options, command: 'help' };
    if (arg === '--version') return { ...options, command: 'version' };
    if (['--target', '--scope', '--local', '--dry-run'].includes(arg)) {
      if (flags.has(arg)) throw new Error(`Duplicate option: ${arg}`);
      flags.add(arg);
      if (arg === '--local') options.local = true;
      else if (arg === '--dry-run') options.dryRun = true;
      else {
        const value = args[++i];
        if (!value || value.startsWith('-')) throw new Error(`${arg} requires a value.`);
        options[arg.slice(2)] = value;
        if (arg === '--scope') scopeSeen = true;
      }
    } else if (!arg.startsWith('-') && !commandSeen) {
      if (!COMMANDS.has(arg)) throw new Error(`Unknown command: ${arg}. Run just-vibe help.`);
      options.command = arg;
      commandSeen = true;
    } else throw new Error(`Unexpected argument: ${arg}`);
  }
  if (!['codex', 'claude'].includes(options.target)) throw new Error('--target must be codex or claude.');
  if (!SCOPES.has(options.scope)) throw new Error('--scope must be user, project, or local.');
  if (scopeSeen && options.target !== 'claude') throw new Error('--scope applies only to Claude Code.');
  return options;
}

// Pass arguments separately: user input is never evaluated as shell code.
export function execute(binary, args) {
  const result = spawnSync(binary, args, {
    encoding: 'utf8', shell: false, timeout: 120_000, maxBuffer: 8 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error?.code === 'ENOENT') {
    throw new Error(`${binary} was not found on PATH. Install it, then open a new terminal and retry.`);
  }
  if (result.error) throw new Error(`${binary} could not finish: ${result.error.message}`);
  if (result.status !== 0) {
    throw new Error(`${binary} ${args.join(' ')} failed${result.signal ? ` (${result.signal})` : ''}.\n${(result.stderr || result.stdout || '').trim()}`);
  }
  return result.stdout.trim();
}

function json(output, label) {
  try { return JSON.parse(output); }
  catch { throw new Error(`${label} did not return valid JSON. Update the host CLI and retry.`); }
}

export function sourceFor(options) {
  if (!options.local) return REPOSITORY;
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  for (const manifest of ['.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json']) {
    try {
      if (JSON.parse(readFileSync(resolve(root, manifest))).name !== MARKETPLACE) throw new Error();
    } catch {
      throw new Error('--local requires a complete just-vibe repository checkout. Use the GitHub installation otherwise.');
    }
  }
  return root;
}

function canonicalSource(value, local) {
  if (typeof value !== 'string') return null;
  if (local) {
    try { return realpathSync(value); } catch { return resolve(value); }
  }
  return value.replace(/^git\+/, '').replace(/^https?:\/\/github\.com\//i, '')
    .replace(/^git@github\.com:/i, '').replace(/\/$/, '').replace(/\.git$/, '').toLowerCase();
}

export function marketplaceMatches(entry, options, source) {
  if (options.target === 'codex') {
    const actual = entry.marketplaceSource;
    if (!actual || actual.sourceType !== (options.local ? 'local' : 'git')) return false;
    return canonicalSource(actual.source, options.local) === canonicalSource(source, options.local);
  }
  if (options.local) {
    return ['directory', 'local'].includes(entry.source)
      && canonicalSource(entry.path || entry.installLocation, true) === canonicalSource(source, true);
  }
  return ['github', 'git'].includes(entry.source)
    && canonicalSource(entry.repo || entry.url, false) === canonicalSource(source, false);
}

function inventory(options, run) {
  const host = options.target;
  const marketplaces = json(run(host, ['plugin', 'marketplace', 'list', '--json']), `${host} marketplace list`);
  const plugins = json(run(host, ['plugin', 'list', '--json']), `${host} plugin list`);
  const marketList = host === 'codex' ? marketplaces.marketplaces : marketplaces;
  const pluginList = host === 'codex' ? plugins.installed : plugins;
  if (!Array.isArray(marketList) || !Array.isArray(pluginList)) {
    throw new Error('Unsupported host inventory format. Update just-vibe or the host CLI; no changes were made.');
  }
  const matches = marketList.filter(entry => entry.name === MARKETPLACE);
  if (matches.length > 1) throw new Error('Multiple just-vibe marketplaces found. Resolve the ambiguity in the host before retrying.');
  const installed = pluginList.filter(entry => (entry.pluginId || entry.id) === PLUGIN);
  if (host === 'claude' && installed.some(entry => entry.scope !== options.scope)) {
    throw new Error('just-vibe is also installed at another Claude scope. Use that scope or resolve it with claude plugin list before proceeding.');
  }
  return { marketplace: matches[0], installed: installed[0] };
}

function mutationSteps(options, state, source) {
  const host = options.target;
  const scope = host === 'claude' ? ['--scope', options.scope] : [];
  const steps = [];
  if (options.command === 'uninstall') {
    if (state.installed) steps.push(host === 'codex'
      ? ['plugin', 'remove', PLUGIN]
      : ['plugin', 'uninstall', PLUGIN, ...scope, '--keep-data']);
    return steps;
  }
  if (options.command === 'doctor') return steps;
  if (!state.marketplace) steps.push(['plugin', 'marketplace', 'add', source]);
  else if (options.command === 'update' && !options.local) {
    steps.push(['plugin', 'marketplace', host === 'codex' ? 'upgrade' : 'update', MARKETPLACE]);
  }
  if (!state.installed || options.command === 'update') {
    steps.push(host === 'codex' ? ['plugin', 'add', PLUGIN]
      : ['plugin', state.installed ? 'update' : 'install', PLUGIN, ...scope]);
  } else if (state.installed.enabled === false) {
    steps.push(host === 'claude' ? ['plugin', 'enable', PLUGIN, ...scope] : ['plugin', 'add', PLUGIN]);
  }
  return steps;
}

function display(host, args) {
  return [host, ...args].map(arg => /^[a-zA-Z0-9_./:@+-]+$/.test(arg) ? arg : JSON.stringify(arg)).join(' ');
}

export function install(options, { run = execute, log = console.log, source = sourceFor(options) } = {}) {
  if (options.dryRun) {
    log('Dry run — no commands executed; installed state has not been inspected.');
    log(`Target: ${options.target}${options.target === 'claude' ? ` (${options.scope} scope)` : ''}`);
    log(`Expected marketplace source: ${source}`);
    log('Preflight: Git, host CLI, native plugin subcommands, marketplace and plugin inventory.');
    if (options.command === 'doctor') log('Inspect installation and report health.');
    else if (options.command === 'uninstall') {
      for (const args of mutationSteps(options, { installed: {} }, source)) log(display(options.target, args));
      log('Only runs if installed. Marketplace and persistent plugin data are retained.');
    } else {
      log('If missing, register the marketplace and install the plugin:');
      for (const args of mutationSteps({ ...options, command: 'setup' }, {}, source)) log(display(options.target, args));
      if (options.command === 'update') {
        log('If already installed, refresh only this marketplace and update this plugin:');
        for (const args of mutationSteps(options, { marketplace: {}, installed: {} }, source)) log(display(options.target, args));
      } else log('Already installed: leave it unchanged (or enable it if disabled). Use update for a new version.');
    }
    return;
  }

  const host = options.target;
  log(run('git', ['--version']));
  log(run(host, ['--version']));
  // Complete preflight, including command support, before the first mutation.
  const state = inventory(options, run);
  if (state.marketplace && !marketplaceMatches(state.marketplace, options, source)) {
    throw new Error('A marketplace named just-vibe already points to a different or unrecognized source. No changes were made. Use --local for a local checkout, or resolve the source in the host CLI.');
  }
  if (state.installed && !state.marketplace) {
    throw new Error('just-vibe is installed without its expected marketplace. Repair its source in the host CLI before continuing.');
  }
  if (options.command === 'doctor') {
    if (!state.marketplace || !state.installed) throw new Error('just-vibe is not fully installed. Run setup for this target.');
    if (state.installed.enabled === false) throw new Error('just-vibe is installed but disabled. Run setup to enable it.');
    log(`Healthy: ${PLUGIN}${state.installed.version ? ` v${state.installed.version}` : ''}.`);
    return;
  }
  const steps = mutationSteps(options, state, source);
  for (const args of steps) run(host, [...args.slice(0, args[1] === 'marketplace' ? 3 : 2), '--help']);
  for (const args of steps) {
    log(`> ${display(host, args)}`);
    try {
      const output = run(host, args);
      if (output) log(output);
    } catch (error) {
      throw new Error(`${error.message}\nStopped at this step. Earlier native steps may have completed; no unrelated settings were changed. Fix the error and rerun the command.`);
    }
  }
  const final = inventory(options, run);
  if (options.command === 'uninstall') {
    if (final.installed) throw new Error('The host still reports just-vibe installed; inspect its plugin list.');
    log('just-vibe is uninstalled. Marketplace registration and persistent plugin data were retained.');
  } else {
    if (!final.marketplace || !marketplaceMatches(final.marketplace, options, source)
        || !final.installed || final.installed.enabled === false) {
      throw new Error('The host did not report an enabled just-vibe installation. Run doctor and inspect the host plugin list.');
    }
    log(`Ready: ${PLUGIN}. Start a new conversation to load the skills.`);
  }
}

export function main(args, dependencies = {}) {
  const log = dependencies.log || console.log;
  const error = dependencies.error || console.error;
  try {
    const options = parseArgs(args);
    if (options.command === 'help') { log(HELP); return 0; }
    if (options.command === 'version') { log(VERSION); return 0; }
    if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Node.js 22 or newer is required.');
    install(options, dependencies);
    return 0;
  } catch (failure) {
    error(`just-vibe: ${failure.message}`);
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
