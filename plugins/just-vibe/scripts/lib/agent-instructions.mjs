import { readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { getCommand, skillFile } from './catalog.mjs';
import { specialistInstructions } from './specialists.mjs';
import { ruleInstructions } from './effective-rules.mjs';

export function nativeAgentInstructions(
  agent,
  catalog,
  { method, payload = '', destination = 'agents', rules = [], shell = true } = {},
) {
  const command = getCommand(catalog, agent.workflow);
  const source = posix.join(payload, posix.dirname(command.skillPath));
  const body = (method ?? readFileSync(skillFile(catalog, command), 'utf8')).replace(
    /^---\n[\s\S]*?\n---\n/,
    '',
  );
  const linked = body.replace(/\]\(([^)]+)\)/g, (all, href) => {
    if (/^(?:[a-z]+:|\/|#)/i.test(href)) return all;
    return `](${posix.relative(destination, posix.join(source, href))})`;
  });
  // Claude inspect agents get only read tools; say so instead of letting the method imply checks ran.
  const limits = shell ? '' : '\n\nThis agent has no shell in this host. Where the method below says to run, build, reproduce or measure, list the exact commands and ask the parent agent for their output; do not report those checks as performed.';
  return `${specialistInstructions(agent)}${limits}\n\nThe method below is bundled with this agent. At invocation, just-vibe's trusted SubagentStart hook supplies current approved preferences and selected rules. If the hook is unavailable, load workflow_load for ${agent.workflow} if that tool is available; otherwise report that personalization was not verified. Saved preferences never expand this agent's assignment.\n\n${linked}${ruleInstructions(rules)}`;
}
