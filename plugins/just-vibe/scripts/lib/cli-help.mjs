// Per-operation CLI help: usage, operations, JSON fields and the installed reference that governs them.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { INTENT_OPERATIONS } from './intent-runtime.mjs';
import { PLATFORM_OPERATIONS } from './platform-runtime.mjs';

const reference = name => fileURLToPath(new URL(`../../references/${name}`, import.meta.url));

const CORE = {
  session: {
    usage: 'session <operation> --stdin [--target codex|claude] [--json]',
    lines: [
      'session create    {command, brief, root, mode?, scope?, context?, budget?, profile?}; profile is a selection request {primary, selectedBy, reason}',
      'session profile   {run, selection}',
      'session start     {run, stage: {command, action, target, effect, id?, newEvidence?, effectReconciliation?}, capabilityReport?}',
      'session amend     {run, action: {id, action, target, effects}}',
      'session supersede {run, resolution: {id, replacements, reason, evidence, criteria, effectReconciliation?}}',
      'session record    {run, outcome: {id, status, summary, evidence, criteria}}',
      'session finish    {run, outcome: {status, summary, evidence, criteria}}',
      'session resume    {run, observation: {root, summary, evidence}}',
    ],
    ref: 'runtime.md',
  },
  assist: {
    usage: 'assist <operation> [--root <project>] [--stdin] [--json]',
    lines: [
      'assist status | history | prune          no payload (history accepts {id?})',
      'assist route | start                     {brief, host?, sessionId?}',
      'assist select                            {taskId, workflows: [id], mode: apply|inspect|plan, reason}',
      'assist load                              {taskId, workflow}',
      'assist evidence                          {taskId, requirement, kind: artifact|host-report|blocked|not-applicable, summary, path?}',
      'assist report                            {taskId}',
      'assist feedback                          {taskId, revision, scope, kind, workflow, excerpt, instruction, triggers?, tools?, checks?}',
      'assist rollback | retire | forget        {id, revision, ...}',
      'assist configure                         {scope, revision, settings}',
      'assist recover                           {scope}',
    ],
    ref: 'adaptive.md',
  },
  project: {
    usage: 'project <operation> [name] [--root <project>] [--stdin] [--json]',
    lines: [
      'project show | list                      no payload',
      'project init | configure                 {revision?, preferences}',
      'project remember | forget                {revision, id, text?, rationale?}',
      'project checkpoint NAME                  {revision, objective, constraints, decisions, completed, remaining, nextStep, run?}',
      'project resume NAME                      no payload; reports differences and changed files',
    ],
    ref: 'daily-workflows.md',
  },
  hooks: { usage: 'hooks <operation> [--root <project>] [--stdin] [--json]', lines: ['hooks status | trust | untrust | disable | recover', 'hooks configure --stdin {revision, ...}'], ref: 'daily-workflows.md' },
  route: { usage: 'route [--root <project>] [--target <host>] [--limit N] [--json] -- <request>  (or --stdin / --brief-file)', lines: ['Suggests candidate workflows and a quick/tracked strategy; it executes nothing.'], ref: 'daily-workflows.md' },
  tools: { usage: 'tools [scenario] [--pack <id>] [--available | --all] [--target <host>] [--limit N] [--json]', lines: ['Lists workflows; --target accepts codex, claude or an editor adapter id.'], ref: 'command-reference.md' },
  show: { usage: 'show <workflow> [--target <host>] [--json]', lines: ['Prints the workflow instructions with saved feedback.'], ref: 'command-reference.md' },
  profiles: { usage: 'profiles [query] [--limit N] [--json]', lines: ['Searches task roles; results are candidates, not selections.'], ref: 'profiles.md' },
  profile: { usage: 'profile <id or display name> [--json]', lines: ['Shows one task role, including its contribution.'], ref: 'profiles.md' },
  inspect: { usage: 'inspect [--root <project>] [--json]', lines: ['Reads bounded project manifests; writes nothing.'], ref: 'runtime.md' },
  discover: { usage: 'discover [--root <project>] [--capabilities <report.json>] [--json]', lines: ['Observes local capabilities; host reports supply remote ones.'], ref: 'runtime.md' },
  workflow: {
    usage: 'workflow <command> [--mode inspect|plan|apply] [--scope <path>] [--profile <role id>] [--root <project>] -- <brief>',
    lines: ['Creates a run record. Here --profile is a task role that the user explicitly pinned; for setup, --profile selects an install profile.'],
    ref: 'runtime.md',
  },
  quiz: { usage: 'quiz <operation> --stdin', lines: ['quiz create {topic, maxQuestions?, difficulty?, mode?} | present {quiz, question, dialog} | answer {quiz, response} | review {quiz, judgment} | report {quiz}'], ref: 'teach-test.md' },
  evidence: {
    usage: 'evidence <collector> [options] [--json]',
    lines: ['evidence github --repo OWNER/NAME --pr N', 'evidence vercel --deployment ID [--team SLUG]', 'evidence browser --url URL --steps FILE', 'evidence migrations --directory DIR [--applied FILE]'],
    ref: 'daily-workflows.md',
  },
};

// Platform families are documented across the runtime references; use the first that names the operation.
const PLATFORM_REFERENCES = ['runtime-platform.md', 'runtime-expansion.md', 'runtime-depth.md', 'agent-qa.md', 'adaptive.md'];
function platformReference(operation) {
  for (const name of PLATFORM_REFERENCES) {
    const path = reference(name);
    if (existsSync(path) && readFileSync(path, 'utf8').includes(`\`${operation} `)) return name;
  }
  return 'runtime-platform.md';
}

export const INTENT_REFERENCE = 'intent-workflows.md';
export function intentOperations(operation) {
  return Object.entries(INTENT_OPERATIONS[operation] || {}).map(([name, [named, stdin]]) => `${operation} ${name}${named ? ' NAME' : ''}${stdin === 'required' ? ' --stdin' : ''}`);
}

export function operationHelp(operation) {
  let usage, lines, ref;
  if (CORE[operation]) ({ usage, lines, ref } = CORE[operation]);
  else if (INTENT_OPERATIONS[operation]) {
    usage = `${operation} <operation> [name] [--root <project>] [--stdin] [--json]`;
    lines = [`Operations: ${Object.keys(INTENT_OPERATIONS[operation]).join(', ')}`, ...intentOperations(operation)];
    ref = INTENT_REFERENCE;
  } else if (PLATFORM_OPERATIONS[operation]) {
    usage = `${operation} <operation> [--root <project>] [--stdin] [--json]`;
    lines = [`Operations: ${PLATFORM_OPERATIONS[operation].join(', ')}`];
    ref = platformReference(operation);
  } else return null;
  return [`Usage: just-vibe ${usage}`, '', ...lines, '', `JSON schemas and rules: ${reference(ref)}`].join('\n');
}
