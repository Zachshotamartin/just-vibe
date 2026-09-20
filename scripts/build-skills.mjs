import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, pluginRoot } from '../plugins/just-vibe/scripts/lib/catalog.mjs';

export function renderSkill(command, pack) {
  const list = values => values.map(value => `- ${value}`).join('\n');
  const steps = command.runtimeSteps?.length ? command.runtimeSteps.map((s, i) => `${i + 1}. ${s}`).join('\n') : list(command.procedure);
  const alias = command.aliasOf ? `\nThis is an alias. Read [${command.aliasOf}](../${command.aliasOf}/SKILL.md) and use its implementation and run counters.\n` : '';
  return `---
name: ${command.id}
description: ${JSON.stringify(command.summary + (command.aliasOf ? ` Alias for ${command.aliasOf}.` : ''))}
---

# ${command.id}

${command.summary}
${alias}
Read [shared execution](../../references/execution.md) for context/mode/authority handling and [${pack.name} methods](../../references/packs/${pack.id}.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **${command.defaultMode}**. ${command.modePolicy}

${pack.prerequisites}

${command.capabilities.length ? `Declared evidence requirements: ${command.capabilities.map(c => `\`${c}\``).join(', ')}. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.` : 'Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.'}

## Scope

${command.readScope}

${command.writeScope}

## Execute

${steps}
${command.runtimeSteps?.length ? `\nTask-specific method: ${command.procedure.join(' ')}\n` : ''}
## Deliver and verify

${list(command.outputs)}

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

${list(command.verification)}

## Stop and recover

${list(command.stopConditions)}

## Example request

${command.examples[0].brief}
`;
}

export function generate({ check = false } = {}) {
  const catalog = loadCatalog();
  const outputs = new Map();
  for (const command of catalog.commands) {
    const pack = catalog.packs.find(p => p.id === command.pack);
    outputs.set(resolve(pluginRoot, command.skillPath), renderSkill(command, pack));
  }
  outputs.set(resolve(pluginRoot, 'references/command-reference.md'), `# Command reference\n\n${catalog.commands.length} shipped skill names (${catalog.commands.length - 1} workflow names including the do alias, plus setup). Commands run in the active host agent. Availability depends on task evidence and host permissions.\n\n` + catalog.packs.map(pack => `## ${pack.name}\n\n| Command | Default | Purpose |\n|---|---|---|\n` + catalog.commands.filter(c => c.pack === pack.id).map(c => `| [${c.id}](../${c.skillPath}) | ${c.defaultMode} | ${c.summary} |`).join('\n')).join('\n\n') + '\n');
  const repo = fileURLToPath(new URL('../', import.meta.url));
  outputs.set(resolve(repo, 'evals/scenarios.json'), JSON.stringify({ schemaVersion: 1,
    note: 'Evaluation specifications, not claims of completed model runs. Use isolated permitted artifacts and the documented harness.',
    scenarios: catalog.commands.map(c => ({ id: c.id, pack: c.pack, brief: c.examples[0].brief, mode: c.defaultMode,
      requiredEvidence: c.requiredInputs, rubric: c.verification, stopBehavior: c.stopConditions,
      invariants: ['Preserve appended constraints and scope.', 'Report unavailable evidence without fabricating success.', 'Do not add unrequested external side effects.'] })) }, null, 2) + '\n');
  for (const [path, content] of outputs) {
    if (check) {
      let existing;
      try { existing = readFileSync(path, 'utf8'); } catch { throw new Error(`Missing generated artifact: ${path}`); }
      if (existing !== content) throw new Error(`Generated artifact drift: ${path}. Run npm run build:skills.`);
    } else { mkdirSync(resolve(path, '..'), { recursive: true }); writeFileSync(path, content); }
  }
  return outputs.size;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  console.log(`${check ? 'Checked' : 'Generated'} ${generate({ check })} skill/reference/evaluation files from the canonical catalog.`);
}
