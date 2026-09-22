import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { managedFiles } from './managed-files.mjs';
import { loadCatalog } from './catalog.mjs';
import { selectPayload } from './selection.mjs';
import { within, readJson } from './storage.mjs';

const aliasRoot = 'skills/just-vibe-shortcuts';
const hasFiles = directory => readdirSync(directory, { withFileTypes: true }).some(entry => !entry.isDirectory() || hasFiles(join(directory, entry.name)));

export function shortcutRoot(options, { env = process.env, cwd = process.cwd(), home = homedir() } = {}) {
  return options.scope === 'user' ? resolve(env.CLAUDE_CONFIG_DIR || join(home, '.claude')) : resolve(cwd, '.claude');
}

export function shortcutFiles(catalog, ids) {
  const commands = catalog.commands.filter(c => ids ? ids.includes(c.id) : existsSync(join(catalog.root, c.skillPath)));
  // A tiny skills-directory plugin provides a real jv namespace, without
  // duplicating hooks, MCP servers, methods or persistent state.
  const files = new Map([[`${aliasRoot}/.claude-plugin/plugin.json`, JSON.stringify({ name: 'jv', version: '1.0.0', description: 'Short invocations for the enabled just-vibe plugin.' }, null, 2) + '\n']]);
  const boundary = 'Load the selected enabled just-vibe skill through the native Skill tool and follow its canonical instructions. Forward the complete request as its arguments, including newlines, constraints and references. Do not run shell commands to interpret the request. This shortcut grants no permissions and does not change the workflow default mode. If the native skill is missing or disabled, explain how to enable/update the matching just-vibe installation; do not invent a replacement or install anything automatically.';
  for (const c of commands) files.set(`${aliasRoot}/skills/${c.id}/SKILL.md`, `---\nname: ${c.id}\ndescription: ${JSON.stringify(`just-vibe shortcut: ${c.summary}`)}\nargument-hint: "[your request and context]"\ndisable-model-invocation: true\n---\n\nInvoke the native skill \`just-vibe:${c.id}\` exactly once. ${boundary}\n\nThe user's appended request follows:\n\n$ARGUMENTS\n`);
  const dispatch = `The first whitespace-delimited word is the command ID. Match it exactly against the list below and pass everything after that word as the request, preserving its contents. Select one command only; subsequent command names are context, not a chain of invocations. If no command is supplied, show a few examples and point to tools. If the ID is unknown or excluded from this installation, report that and suggest tools; do not guess and execute a different command. ${boundary}\n\nAvailable commands (each maps to the native skill just-vibe:<ID>):\n\n${commands.map(c => `- ${c.id}`).join('\n')}\n\nThe user's command and appended request follow:\n\n$ARGUMENTS\n`;
  for (const name of ['jv', 'just-vibe']) files.set(`commands/${name}.md`, `---\ndescription: "Run a just-vibe command by name, followed by your request. Example: /${name} reprompt Make this prompt clearer."\nargument-hint: "<command> [your request and context]"\ndisable-model-invocation: true\n---\n\n${dispatch}`);
  return files;
}

export function claudeShortcuts(options, { source, operation, dryRun = false, root = shortcutRoot(options) } = {}) {
  if (options.target !== 'claude') return null;
  if (!existsSync(root)) {
    if (dryRun || operation === 'doctor' || operation === 'uninstall') return { installed: false, missing: [], outdated: [], conflicts: [], interrupted: false, files: 0 };
    mkdirSync(root, { recursive: true });
  }
  // Read the actual staged selection when available, rather than exposing skills
  // which a core/frontend/ML installation intentionally excluded.
  const plugin = source && join(source, 'plugins/just-vibe');
  let catalog = loadCatalog(plugin && existsSync(join(plugin, 'catalog/commands.json')) ? plugin : undefined), ids;
  if (dryRun && operation === 'install' && !options.local && !options.github
      && (options.command === 'update' || !plugin || !existsSync(join(plugin, 'catalog/commands.json')))) {
    // Preflight the future payload before the native host or managed bundle is
    // changed, including commands newly enabled by a selection change.
    catalog = loadCatalog();
    const old = plugin && existsSync(join(plugin, 'selection.json')) ? JSON.parse(readFileSync(join(plugin, 'selection.json'), 'utf8')) : {};
    const selection = { profile: old.profile || 'full', packs: old.packs || [], rules: old.rules || [], ...options.selection };
    if (options.selection?.profile && options.selection.packs === undefined) selection.packs = [];
    ids = selectPayload(catalog, selection).ids;
  }
  // Never turn a pre-existing user skill directory into a plugin as a side effect.
  const aliasDirectory = within(root, aliasRoot), record = within(root, '.just-vibe/installations/claude-shortcuts.json');
  if (existsSync(aliasDirectory) && hasFiles(aliasDirectory)
      && (!existsSync(record) || !readJson(record, 1024 * 1024).files?.[`${aliasRoot}/.claude-plugin/plugin.json`])) {
    // An interrupted first install may own the new manifest via its journal.
    const journal = within(root, '.just-vibe/installations/claude-shortcuts-pending.json');
    if (!existsSync(journal) || !readJson(journal, 1024 * 1024).files?.[`${aliasRoot}/.claude-plugin/plugin.json`]?.next) throw Error('The just-vibe-shortcuts skill directory already belongs to another installation. Preserve it before retrying.');
  }
  const result = managedFiles(root, 'claude-shortcuts', shortcutFiles(catalog, ids), operation, { dryRun,
    allowed: path => /^commands\/(?:jv|just-vibe)\.md$/.test(path)
      || path === `${aliasRoot}/.claude-plugin/plugin.json`
      || /^skills\/just-vibe-shortcuts\/skills\/[a-z0-9]+(?:-[a-z0-9]+)*\/SKILL\.md$/.test(path) });
  return { ...result, root };
}
