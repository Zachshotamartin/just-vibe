import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, pluginRoot } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { loadMethods } from '../plugins/just-vibe/scripts/lib/method-library.mjs';
import { loadProfiles } from '../plugins/just-vibe/scripts/lib/profiles.mjs';
import { SPECIALISTS, specialistInstructions } from '../plugins/just-vibe/scripts/lib/specialists.mjs';
import { nativeAgentInstructions } from '../plugins/just-vibe/scripts/lib/agent-instructions.mjs';

export function renderSkill(command, pack) {
  if (command.aliasOf) return `---\nname: ${command.id}\ndescription: ${JSON.stringify(`${command.summary} Alias for ${command.aliasOf}.`)}\n---\n\n# ${command.id}\n\nRead [${command.aliasOf}](../${command.aliasOf}/SKILL.md) and execute that single canonical workflow. It owns selection, inputs, mode, scope, methods, outputs, recovery, and verification. Preserve the complete appended request and original invoked name (${command.id}); use ${command.aliasOf} as the canonical command in run records. Do not add a routing stage, change permissions, or reset counters for an alias. This entry deliberately contains no independent behavioral contract.\n`;
  const list = values => values.map(value => `- ${value}`).join('\n');
  const steps = command.procedure.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const alias = command.aliasOf ? `\nThis is an alias. Read [${command.aliasOf}](../${command.aliasOf}/SKILL.md) and use its implementation and run counters.\n` : '';
  return `---
name: ${command.id}
description: ${JSON.stringify(`${command.summary} ${command.selection}`)}
---

# ${command.id}

${command.summary}
${alias}
## Choose this workflow

${command.selection}

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [${pack.name} methods](../../references/packs/${pack.id}.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **${command.defaultMode}**. ${command.modePolicy}

${pack.prerequisites}

- **Infer from evidence:** ${command.inputPolicy.infer}
- **Reasonable default:** ${command.inputPolicy.assume}
- **Ask only when needed:** ${command.inputPolicy.ask}

${command.capabilities.length ? `Declared evidence requirements: ${command.capabilities.map(c => `\`${c}\``).join(', ')}. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.` : 'Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.'}

## Scope

${command.readScope}

${command.writeScope}

## Execute

${steps}
## Technical method

- **Inspect:** ${command.technical.evidence}
- **Method:** ${command.technical.method}
- **Avoid misdiagnosis:** ${command.technical.pitfall}
- **Check the result:** ${command.technical.check}

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [${pack.name} worked example](../../${pack.workedExample}).
${(command.guides || []).map(g => `- ${g.when}: [${g.title}](../../${g.path}).`).join('\n')}

## Decision branches

${command.branches.map(b => `- **When ${b.when}:** ${b.then}`).join('\n')}

## Deliver and verify

${list(command.outputs)}

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

${list(command.verification)}

## Stop and recover

${list(command.stopConditions)}

## Example requests

${command.examples.map((example, i) => `- **${example.kind || (i ? 'Additional' : 'Normal')} (${example.mode}):** ${example.brief}`).join('\n')}
`;
}

export function generate({ check = false } = {}) {
  const catalog = loadCatalog();
  const outputs = new Map();
  for (const m of loadMethods()) {
    const out = `# ${m.title}\n\nUse when: ${m.triggers.join(', ')}.\n\n${m.scope}\n\n## Inspect first\n\n${m.inspect.map(s=>'- '+s).join('\n')}\n\n## Method\n\n${m.procedure.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n\n## Failure cases\n\n${m.failureCases.map(s=>'- '+s).join('\n')}\n\n## Verification\n\n${m.verification.map(s=>'- '+s).join('\n')}\n\n## Worked scenario\n\n${m.example}\n\n## Version-sensitive primary references\n\n${m.references.map(r=>`- [${new URL(r.url).hostname}](${r.url}) — ${r.policy}`).join('\n')}\n\nThis is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.\n`;
    outputs.set(resolve(pluginRoot, `references/methods/${m.id}.md`), out);
  }
  for (const agent of SPECIALISTS) {
    const command = catalog.commands.find(c => c.id === agent.workflow);
    const method = renderSkill(command, catalog.packs.find(p => p.id === command.pack));
    outputs.set(resolve(pluginRoot, `agents/${agent.id}.md`), `---\nname: ${agent.id}\ndescription: ${JSON.stringify(agent.description)}\ntools: ${agent.mode === 'inspect' ? 'Read, Glob, Grep' : 'Read, Glob, Grep, Edit, Write, Bash'}\nmodel: inherit\n---\n\n${nativeAgentInstructions(agent, catalog, { method, shell: agent.mode !== 'inspect' }).trimEnd()}\n`);
  }
  const profiles = loadProfiles();
  const methodTitles = new Map(loadMethods().map(m => [m.id, m.title]));
  outputs.set(resolve(pluginRoot, 'references/profile-reference.md'), '# Engineering profiles\n\n' + profiles.profiles.length + ' task profiles. [Selection, scope and precedence](profiles.md). Read only the roles relevant to the request. Suggested workflows do not imply available tools or authorization.\n\n' + profiles.families.map(f => `## ${f.name}\n\n| Profile | Purpose |\n|---|---|\n` + profiles.profiles.filter(p => p.family === f.id).map(p => `| [${p.name}](profiles/${p.id}.md) | ${p.summary} |`).join('\n')).join('\n\n') + '\n');
  for (const p of profiles.profiles) {
    outputs.set(resolve(pluginRoot, `references/profiles/${p.id}.md`), `# ${p.name}\n\n${p.summary}\n\nApply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.\n\n## Priorities\n\n${p.priorities.map(v => `- ${v}`).join('\n')}\n\n## Decision rule\n\n${p.decision}\n\n## Concrete contribution\n\n${p.contribution}\n\nFor a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).\n\n## Verify when relevant\n\n${p.verification.map(v => `- ${v}`).join('\n')}\n\n## Boundary\n\n${p.boundary}\n\n## Candidate workflows\n\n${p.workflows.slice(0, 3).map(id => `- [${id}](../../skills/${id}/SKILL.md)`).join('\n')}\n${p.workflows.length > 3 ? `\nAlso relevant when the task calls for them:\n\n${p.workflows.slice(3).map(id => `- [${id}](../../skills/${id}/SKILL.md)`).join('\n')}\n` : ''}${p.methods?.length ? `\n## Specialist methods\n\n${p.methods.map(id => `- [${methodTitles.get(id)}](../methods/${id}.md)`).join('\n')}\n` : ''}\nExample: ${p.example}\n`);
  }
  for (const command of catalog.commands) {
    const pack = catalog.packs.find(p => p.id === command.pack);
    outputs.set(resolve(pluginRoot, command.skillPath), renderSkill(command, pack));
  }
  outputs.set(resolve(pluginRoot, 'references/command-reference.md'), `# Command reference\n\n${catalog.commands.length} shipped skill names; ${catalog.commands.filter(c => c.aliasOf).length} aliases inherit canonical implementations. Commands run in the active host agent. Availability depends on task evidence and host permissions.\n\n` + catalog.packs.map(pack => `## ${pack.name}\n\n| Command | Default | Purpose |\n|---|---|---|\n` + catalog.commands.filter(c => c.pack === pack.id).map(c => `| [${c.id}](../${c.skillPath}) | ${c.defaultMode} | ${c.summary}${c.aliasOf ? ` (alias of ${c.aliasOf})` : ''} |`).join('\n')).join('\n\n') + '\n');
  const repo = fileURLToPath(new URL('../', import.meta.url));
  outputs.set(resolve(repo, 'docs/technical-coverage.md'), '# Technical guidance coverage\n\nGenerated from the canonical catalog. This is an inventory of authored guidance and its routes, not evidence that an agent followed it or that a vulnerability was detected. Each canonical workflow has evidence to inspect, a method, a misdiagnosis to avoid and a discriminating check. Aliases inherit the entire contract. See [audit findings and validation](technical-audit.md).\n\n' + catalog.packs.map(pack => `## ${pack.name}\n\n| Workflow | Specific failure or ambiguity addressed | Conditional references |\n|---|---|---|\n` + catalog.commands.filter(c => c.pack === pack.id && !c.aliasOf).map(c => `| [${c.id}](../plugins/just-vibe/${c.skillPath}) | ${c.technical.pitfall.replaceAll('|', '\\|')} | ${(c.guides || []).map(g => `[${g.title}](../plugins/just-vibe/${g.path})`).join('; ') || 'Technical method and pack guide in entry point'} |`).join('\n')).join('\n\n') + '\n');
  outputs.set(resolve(repo, 'evals/scenarios.json'), JSON.stringify({ schemaVersion: 1,
    note: 'Evaluation specifications, not claims of completed model runs. Use isolated permitted artifacts and the documented harness.',
    scenarios: catalog.commands.map(c => ({ id: c.id, pack: c.pack, brief: c.examples[0].brief, mode: c.examples[0].mode,
      requiredEvidence: c.requiredInputs, inputPolicy: c.inputPolicy, rubric: [...c.verification, c.technical.check], technicalMethod: c.technical, stopBehavior: c.stopConditions, cases: c.examples,
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
