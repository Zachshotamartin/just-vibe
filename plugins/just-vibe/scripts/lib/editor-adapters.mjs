import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pluginRoot, loadCatalog, commandDescription } from './catalog.mjs';
import { selectPayload } from './selection.mjs';
import { RULE_PACKS, renderRule } from './rule-packs.mjs';
import { SPECIALISTS, specialistInstructions } from './specialists.mjs';
import { object } from './runtime-store.mjs';
import { managedFiles } from './managed-files.mjs';
import { within } from './storage.mjs';
import { nativeAgentInstructions } from './agent-instructions.mjs';
import { managedFragment } from './managed-fragment.mjs';

export const ADAPTERS = [
  {
    id: 'adal',
    skills: '.adal/skills',
    level:
      'Project skill files; owned install/update/uninstall fixtures; live host activation not verified',
    hooks: false,
    agents: false,
    source: 'https://docs.sylph.ai/features/plugins-and-skills/',
  },
  {
    id: 'codebuddy',
    skills: '.codebuddy/skills',
    level:
      'Project skill files; owned install/update/uninstall fixtures; live host activation not verified',
    hooks: false,
    agents: false,
    source: 'https://www.codebuddy.ai/docs/cli/skills',
  },
  {
    id: 'joycode',
    skills: '.joycode/skills',
    level:
      'Project skill files; owned install/update/uninstall fixtures; live host activation not verified',
    hooks: false,
    agents: false,
    source: 'https://joycode.jd.com/docs/functions/functions-skills/',
  },
  {
    id: 'kiro',
    skills: '.kiro/skills',
    level:
      'Project skill files; owned install/update/uninstall fixtures; live host activation not verified',
    hooks: 'opt-in',
    agents: false,
    source: 'https://kiro.dev/docs/skills/',
  },
  {
    id: 'openclaw',
    skills: '.agents/skills',
    level:
      'Project skill files; owned install/update/uninstall fixtures; live host activation not verified',
    hooks: false,
    agents: false,
    source: 'https://docs.openclaw.ai/skills',
  },
  {
    id: 'pi',
    skills: '.pi/skills',
    level:
      'Project skill files; owned install/update/uninstall fixtures; live host activation not verified',
    hooks: false,
    agents: false,
    source: 'https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md',
  },
  {
    id: 'trae',
    skills: '.trae/skills',
    level:
      'Project skill files; owned install/update/uninstall fixtures; live host activation not verified',
    hooks: false,
    agents: false,
    source: 'https://docs.trae.ai/ide/skills',
  },
  {
    id: 'zed',
    skills: '.agents/skills',
    level: 'Zed project skills; trusted worktree required; no hooks',
    hooks: false,
    agents: false,
  },
  {
    id: 'hermes',
    skills: 'skills',
    level:
      'Hermes home skills: choose the actual HERMES_HOME with --root; no hooks or provider changes',
    hooks: false,
    agents: false,
  },
  {
    id: 'kimi',
    skills: '.kimi-code/skills',
    level: 'Kimi project skills; no hook or provider changes',
    hooks: false,
    agents: false,
  },
  {
    id: 'qwen',
    skills: '.qwen/skills',
    level: 'Qwen project skills; no hook or permission changes',
    hooks: false,
    agents: false,
  },
  {
    id: 'windsurf',
    skills: '.windsurf/skills',
    level: 'Cascade workspace skills; no hook or permission changes',
    hooks: false,
    agents: false,
  },
  {
    id: 'antigravity',
    skills: '.agent/skills',
    level: 'Antigravity IDE workspace skills; no hook or permission changes',
    hooks: false,
    agents: false,
  },
  {
    id: 'cursor',
    skills: '.cursor/skills',
    level: 'project skills, scoped rules and opt-in native event bridge',
    hooks: 'opt-in',
    agents: false,
  },
  {
    id: 'opencode',
    skills: '.opencode/skills',
    level: 'project skills and opt-in OpenCode plugin events/tools',
    hooks: 'opt-in',
    agents: false,
  },
  {
    id: 'copilot',
    skills: '.github/skills',
    level: 'project Agent Skills; host/version support required',
    hooks: false,
    agents: false,
  },
  {
    id: 'gemini',
    skills: '.gemini/skills',
    level: 'project Agent Skills; host/version support required',
    hooks: false,
    agents: false,
  },
  {
    id: 'codex',
    agents: '.codex/agents',
    level: 'project specialist agents; native plugin installs workflows',
    hooks: 'native plugin',
    skills: false,
  },
  {
    id: 'claude',
    agents: '.claude/agents',
    level: 'project specialist agents; native plugin also includes agents',
    hooks: 'native plugin',
    skills: false,
  },
];
export function adapterFiles(root, target, selection = {}, { hooks = false } = {}) {
  const adapter = ADAPTERS.find((a) => a.id === target);
  if (!adapter) throw Error('Unknown editor adapter.');
  const catalog = loadCatalog(),
    chosen = selectPayload(catalog, selection),
    files = new Map();
  const payload = `.just-vibe/adapters/${target}/plugin`;
  {
    function copy(directory) {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isSymbolicLink()) throw Error('Plugin payload cannot contain symlinks.');
        if (entry.isDirectory()) copy(path);
        else if (entry.isFile())
          files.set(
            `${payload}/${relative(pluginRoot, path).replaceAll('\\', '/')}`,
            readFileSync(path),
          );
      }
    }
    copy(pluginRoot);
  }
  if (adapter.skills) {
    for (const id of chosen.ids) {
      const command = catalog.commands.find((c) => c.id === id);
      const directory = `${adapter.skills}/just-vibe-${id}`;
      const link = relative(directory, `${payload}/${command.skillPath}`).replaceAll('\\', '/');
      files.set(
        `${directory}/SKILL.md`,
        `---\nname: just-vibe-${id}\ndescription: ${JSON.stringify(target === 'zed' ? command.summary.slice(0, 200) : commandDescription(command))}\n---\n\nRead and follow [the full ${id} workflow](${link}). Resolve its supporting references from that file. Preserve all context appended to this invocation. Host permissions remain unchanged. Automatic events require the separately selected hook adapter and host trust. Use the host's available question and tool interfaces; if unavailable, report that limitation.\n`,
      );
    }
    for (const id of chosen.rules)
      files.set(
        `${adapter.skills}/just-vibe-rules-${id}/SKILL.md`,
        renderRule(RULE_PACKS.find((p) => p.id === id)),
      );
    if (target === 'cursor')
      for (const id of chosen.rules) {
        const rule = RULE_PACKS.find((p) => p.id === id);
        files.set(
          `.cursor/rules/just-vibe-${id}.mdc`,
          `---\ndescription: ${JSON.stringify(`${id} engineering checks`)}\nglobs: ${JSON.stringify(rule.files.map((p) => `**/${p}`).join(','))}\nalwaysApply: false\n---\n\n${rule.rules.map((r) => `- ${r}`).join('\n')}\n`,
        );
      }
  }
  if (adapter.agents)
    for (const agent of SPECIALISTS) {
      if (target === 'codex')
        files.set(
          `${adapter.agents}/just-vibe-${agent.id}.toml`,
          `name = "just-vibe-${agent.id}"\ndescription = ${JSON.stringify(agent.description)}\nsandbox_mode = "${agent.mode === 'inspect' ? 'read-only' : 'workspace-write'}"\ndeveloper_instructions = ${JSON.stringify(nativeAgentInstructions(agent, catalog, { payload, destination: adapter.agents, rules: RULE_PACKS.filter((r) => chosen.rules.includes(r.id)) }))}\n`,
        );
      else
        files.set(
          `${adapter.agents}/just-vibe-${agent.id}.md`,
          `---\nname: just-vibe-${agent.id}\ndescription: ${JSON.stringify(agent.description)}\ntools: ${agent.mode === 'inspect' ? 'Read, Glob, Grep' : 'Read, Glob, Grep, Edit, Write, Bash'}\nmodel: inherit\n---\n\n${nativeAgentInstructions(agent, catalog, { payload, destination: adapter.agents, shell: agent.mode !== 'inspect', rules: RULE_PACKS.filter((r) => chosen.rules.includes(r.id)) })}\n`,
        );
    }
  if (target === 'kiro')
    files.set(
      '.kiro/steering/just-vibe.md',
      '---\ninclusion: always\n---\n\nFor a relevant request, discover the smallest just-vibe workflow or focused method through the installed skills and local toolkit. Preserve the full user request and resume the active task after side questions. Tools and hooks never grant additional permissions.\n',
    );
  if (hooks && target === 'kiro')
    files.set(
      '.kiro/hooks/just-vibe.json',
      JSON.stringify(
        {
          version: 'v1',
          hooks: ['PreToolUse', 'PostToolUse', 'Stop'].map((trigger) => ({
            name: 'just-vibe-' + trigger,
            trigger,
            ...(trigger.includes('ToolUse') ? { matcher: '*' } : {}),
            action: {
              type: 'command',
              command: 'node .just-vibe/adapters/kiro/plugin/scripts/kiro-hooks.mjs',
            },
            timeout: 30,
            enabled: true,
          })),
        },
        null,
        2,
      ) + '\n',
    );
  if (hooks && target === 'opencode')
    files.set(
      '.opencode/plugins/just-vibe.js',
      `import { tool } from '@opencode-ai/plugin';\nimport { fileURLToPath } from 'node:url';\nimport { createOpenCodePlugin } from '../../${payload}/scripts/lib/opencode-plugin.mjs';\nexport default createOpenCodePlugin(tool, { projectRoot: fileURLToPath(new URL('../../', import.meta.url)) });\n`,
    );
  if (hooks && target === 'cursor')
    files.set(
      '.cursor/rules/just-vibe-runtime.mdc',
      `---\ndescription: just-vibe runtime discovery\nalwaysApply: true\n---\n\nFor a new implementation request, inspect just-vibe's current task with the local CLI before editing. Run node ${payload}/scripts/toolkit.mjs assist status --root .; use the returned task ID with assist select/load/evidence. Preserve the actual user brief. Use the relevant workflow method and its references. Hooks record requests but do not grant permission, change the model or authorize extra work.\n`,
    );
  files.set(
    `.just-vibe/adapters/${target}/selection.json`,
    JSON.stringify({ ...chosen, hooks }, null, 2) + '\n',
  );
  files.set(`${payload}/selection.json`, JSON.stringify(chosen, null, 2) + '\n');
  return { files, chosen, adapter, payload };
}
export function adapters(root, operation, payload = {}) {
  if (operation === 'list')
    return {
      adapters: ADAPTERS,
      note: 'Adapters do not grant permissions or prove live agent behavior. Cursor/OpenCode events are an explicit option; host trust is separate. Hermes root is its configured home. Restart the host after installation.',
    };
  object(payload, ['target', 'profile', 'packs', 'rules', 'dryRun', 'hooks']);
  const target = payload.target,
    adapter = ADAPTERS.find((a) => a.id === target);
  if (!adapter) throw Error('Choose a supported adapter target.');
  const selectionPath = within(root, `.just-vibe/adapters/${target}/selection.json`);
  const old = existsSync(selectionPath) ? JSON.parse(readFileSync(selectionPath, 'utf8')) : null;
  const hooks = payload.hooks ?? old?.hooks ?? false;
  if (typeof hooks !== 'boolean' || (hooks && !['cursor', 'opencode', 'kiro'].includes(target)))
    throw Error('Native editor hooks are supported for Cursor, OpenCode and Kiro v1.');
  const selection = Object.fromEntries(
    ['profile', 'packs', 'rules']
      .map((k) => [k, payload[k] ?? old?.[k]])
      .filter(([, v]) => v !== undefined),
  );
  if (payload.profile !== undefined && payload.packs === undefined) selection.packs = [];
  const { files, chosen } = adapterFiles(root, target, selection, { hooks });
  if (!['install', 'update', 'uninstall', 'doctor'].includes(operation))
    throw Error('Unknown adapter operation.');
  // Zed and OpenClaw read the same .agents/skills folder, so one installation serves both hosts.
  const owns = (id) => {
    const path = within(root, `.just-vibe/installations/adapter-${id}.json`);
    return existsSync(path) && Object.keys(JSON.parse(readFileSync(path, 'utf8')).files || {}).length > 0;
  };
  const sibling = adapter.skills && !owns(target)
    && ADAPTERS.find((a) => a.id !== target && a.skills === adapter.skills && owns(a.id));
  if (sibling) {
    const note = `${adapter.skills} is already provided by the ${sibling.id} adapter; one installation serves both hosts. Update or remove it with --target ${sibling.id}.`;
    if (operation === 'doctor') return { ...adapters(root, 'doctor', { ...payload, target: sibling.id }), target, providedBy: sibling.id, note, support: adapter.level };
    return { target, operation, providedBy: sibling.id, note, support: adapter.level };
  }
  const allowed = (path) =>
    path.startsWith(`.just-vibe/adapters/${target}/`) ||
    (adapter.skills && path.startsWith(`${adapter.skills}/just-vibe-`)) ||
    (adapter.agents && path.startsWith(`${adapter.agents}/just-vibe-`)) ||
    (target === 'cursor' && path.startsWith('.cursor/rules/just-vibe-')) ||
    (target === 'kiro' &&
      ['.kiro/steering/just-vibe.md', '.kiro/hooks/just-vibe.json'].includes(path)) ||
    (target === 'opencode' &&
      ['.opencode/plugins/just-vibe.js', '.opencode/plugins/just-vibe.mjs'].includes(path));
  const hookEntries = Object.fromEntries(
    [
      'beforeSubmitPrompt',
      'sessionStart',
      'preToolUse',
      'postToolUse',
      'postToolUseFailure',
      'stop',
    ].map((event) => [
      event,
      [
        {
          command: 'node .just-vibe/adapters/cursor/plugin/scripts/cursor-hooks.mjs',
          timeout: 30,
          ...(event === 'preToolUse' ? { failClosed: true } : {}),
          ...(event === 'stop' ? { loop_limit: 1 } : {}),
        },
      ],
    ]),
  );
  const fragment = (op, dryRun) =>
    managedFragment(
      root,
      'adapter-cursor',
      '.cursor/hooks.json',
      'hooks',
      hooks ? hookEntries : {},
      op,
      { dryRun },
    );
  const mergeHooks =
    target === 'cursor' &&
    (hooks ||
      old?.hooks ||
      existsSync(within(root, '.just-vibe/installations/adapter-cursor-fragment.json')));
  if (mergeHooks) fragment(operation, true);
  managedFiles(root, `adapter-${target}`, files, operation, { dryRun: true, allowed });
  if (mergeHooks && operation === 'uninstall' && !payload.dryRun) fragment(operation, false);
  const result = managedFiles(root, `adapter-${target}`, files, operation, {
    dryRun: payload.dryRun === true,
    allowed,
  });
  const shared =
    mergeHooks && operation !== 'uninstall'
      ? fragment(operation, payload.dryRun === true)
      : undefined;
  return {
    target,
    selection: chosen,
    ...result,
    ...(shared ? { shared } : {}),
    support: adapter.level,
  };
}
