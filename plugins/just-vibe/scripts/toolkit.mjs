#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { isDirectRun } from './lib/entrypoint.mjs';
import { loadCatalog, getCommand, skillFile, invocation, HOSTS, MODES } from './lib/catalog.mjs';
import { inspectProject } from './lib/project.mjs';
import { discoverCapabilities, readCapabilityReport, listTools, recommend } from './lib/discovery.mjs';
import { createRun, startStage, recordStage, finishRun, resumeRun } from './lib/run.mjs';
import { createQuiz, presentQuestion, answerQuestion, reviewFreeText, quizReport } from './lib/teaching.mjs';
import { main as installerMain, HELP as INSTALLER_HELP } from './installer.mjs';

export const HELP = `${INSTALLER_HELP}
Workflow utilities (read-only unless you explicitly save their output):
  tools [query]          Browse/search shipped workflows and prerequisites
  show <workflow>        Read a workflow's full instructions
  inspect               Inspect project manifests and Git identity
  discover              Report local capabilities; never log in or call services
  route <goal>           Suggest candidates for the host agent, not execute them
  workflow <id> <brief>  Produce a context/run record for the host agent
  session <operation>   Transform a run record from JSON on stdin
                        Operations: create, start, record, finish, resume
  quiz <operation>      Native-dialog quiz state from JSON on stdin
                        Operations: create, present, answer, review, report

Options:
  --root <directory>    Project to inspect (default: current directory)
  --target codex|claude Invocation format (default: claude for examples)
  --pack <id>           Filter tools by pack
  --available          Show only workflows with verified prerequisites
  --all                Also include uninstalled/planned/unsupported entries
  --json               Machine-readable output
  --capabilities <file> Host-observed capability report, valid for 15 minutes
  --mode inspect|plan|apply
  --scope <path>        Restrict workflow scope within the project
  --brief-file <file>   Preserve a UTF-8 brief verbatim (max 1 MiB)
  --stdin              Read the brief or session/quiz JSON from stdin
  -- <brief>           Treat all remaining arguments as context, not flags

Commands such as fix, React, database and ML workflows execute as skills in
the active Codex/Claude agent. This CLI does not launch a model or execute
candidate workflows. Use show to inspect a workflow and invoke it in your host.
`;

const operations = new Set(['tools', 'show', 'inspect', 'discover', 'route', 'workflow', 'session', 'quiz']);
const booleans = new Set(['--json', '--available', '--all', '--stdin']);
const values = new Set(['--root', '--target', '--pack', '--capabilities', '--mode', '--scope', '--brief-file']);

export function parseToolkitArgs(args) {
  const [operation, ...rest] = args;
  if (!operations.has(operation)) throw new Error(`Unknown utility: ${operation}`);
  const options = { operation, root: process.cwd(), target: 'claude', positionals: [] };
  const seen = new Set();
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === '--') { options.positionals.push(...rest.slice(i + 1)); break; }
    if (!arg.startsWith('--')) { options.positionals.push(arg); continue; }
    if (!booleans.has(arg) && !values.has(arg)) throw new Error(`Unknown option: ${arg}. Put literal context after --.`);
    if (seen.has(arg)) throw new Error(`Duplicate option: ${arg}`);
    seen.add(arg);
    const key = arg.slice(2);
    if (booleans.has(arg)) options[key] = true;
    else {
      const value = rest[++i];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      options[key] = value;
    }
  }
  if (!HOSTS.includes(options.target)) throw new Error('target must be codex or claude.');
  if (options.mode && !MODES.includes(options.mode)) throw new Error('mode must be inspect, plan, or apply.');
  if (options.stdin && options['brief-file']) throw new Error('Use only one brief source.');
  const allowed = {
    tools: ['json', 'available', 'all', 'root', 'target', 'pack', 'capabilities'],
    show: ['json', 'target'], inspect: ['json', 'root'], discover: ['json', 'root', 'capabilities'],
    route: ['json', 'root', 'target', 'capabilities', 'stdin', 'brief-file'],
    workflow: ['json', 'root', 'target', 'mode', 'scope', 'stdin', 'brief-file'], session: ['json', 'target', 'stdin'], quiz: ['json', 'stdin'],
  };
  for (const flag of seen) if (!allowed[operation].includes(flag.slice(2))) throw new Error(`${flag} does not apply to ${operation}.`);
  if (['inspect', 'discover'].includes(operation) && options.positionals.length) throw new Error(`${operation} takes no positional arguments.`);
  if (['show', 'session', 'quiz'].includes(operation) && options.positionals.length !== 1) throw new Error(`${operation} requires exactly one name.`);
  return options;
}

export function readStdin(limit = 1024 * 1024) {
  // Read in bounded chunks; do not buffer an arbitrarily large pipe before checking size.
  const chunks = []; let size = 0;
  return new Promise((done, fail) => {
    process.stdin.on('data', chunk => {
      size += chunk.length;
      if (size > limit) { process.stdin.destroy(); fail(new Error('stdin exceeds 1 MiB.')); }
      else chunks.push(chunk);
    });
    process.stdin.on('end', () => done(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', fail);
  });
}

async function getBrief(options, words, input) {
  if ((options.stdin || options['brief-file']) && words.length) throw new Error('Use context arguments or a brief source, not both.');
  if (options.stdin) return input();
  if (options['brief-file']) {
    const stat = statSync(options['brief-file']);
    if (!stat.isFile() || stat.size > 1024 * 1024) throw new Error('Brief must be a regular file up to 1 MiB.');
    return readFileSync(options['brief-file'], 'utf8');
  }
  return words.join(' ');
}

function formatTools(result) {
  if (!result.tools.length) return 'No matching workflows with the requested filters. Try tools --all or a broader scenario.';
  return [result.note, '', ...result.tools.map(c => `${c.id} [${c.pack}; ${c.status}; ${c.defaultMode}]${c.aliasOf ? ` → ${c.aliasOf}` : ''}\n  ${c.summary}\n  ${c.invocation} ${c.example.brief}${c.reasons.length ? `\n  Needs: ${c.reasons.join('; ')}` : ''}`)].join('\n');
}

export async function main(args, { log = console.log, error = console.error, input = readStdin, catalog = loadCatalog } = {}) {
  try {
    if (!args.length || ['--help', '-h'].includes(args[0]) || (args[0] === 'help' && args.length === 1)) { log(HELP); return 0; }
    if (['setup', 'doctor', 'update', 'uninstall', '--version'].includes(args[0])) return installerMain(args, { log, error });
    if (args[0] === 'help') args = ['tools', ...args.slice(1)];
    const options = parseToolkitArgs(args);
    const data = catalog();
    let result;
    const discovery = () => discoverCapabilities(options.root, {
      report: options.capabilities ? readCapabilityReport(options.capabilities, options.root) : undefined,
    });
    if (options.operation === 'tools') {
      const found = discovery();
      result = { tools: listTools(data, found, { query: options.positionals.join(' '), pack: options.pack,
        available: options.available, all: options.all, host: options.target }), integrations: found.integrations,
        note: 'Shipped workflow inventory; host enablement and permissions still apply. Available means declared task prerequisites were observed, not that a model has executed the workflow.' };
    } else if (options.operation === 'show') {
      const command = getCommand(data, options.positionals[0]);
      result = { ...command, invocation: invocation(command, options.target), instructions: readFileSync(skillFile(data, command), 'utf8') };
    } else if (options.operation === 'inspect') result = inspectProject(options.root);
    else if (options.operation === 'discover') result = discovery();
    else if (options.operation === 'route') result = recommend(data, discovery(), await getBrief(options, options.positionals, input), { host: options.target });
    else if (options.operation === 'workflow') {
      const [id, ...words] = options.positionals;
      if (!id) throw new Error('workflow requires a command ID.');
      result = createRun(data, id, { ...options, brief: await getBrief(options, words, input) });
    } else if (options.operation === 'quiz') {
      const payload = JSON.parse(await input());
      const op = options.positionals[0];
      if (op === 'create') result = createQuiz(payload);
      else if (op === 'present') result = presentQuestion(payload.quiz, payload.question, payload.dialog);
      else if (op === 'answer') result = answerQuestion(payload.quiz, payload.response);
      else if (op === 'review') result = reviewFreeText(payload.quiz, payload.judgment);
      else if (op === 'report') result = quizReport(payload.quiz);
      else throw new Error(`Unknown quiz operation: ${op}`);
    } else if (options.operation === 'session') {
      const payload = JSON.parse(await input());
      const op = options.positionals[0];
      if (op === 'create') result = createRun(data, payload.command, payload);
      else if (op === 'start') {
        const found = discoverCapabilities(payload.run.root, { report: payload.capabilityReport });
        result = startStage(data, payload.run, payload.stage, found.capabilities, options.target);
      } else if (op === 'record') result = recordStage(payload.run, payload.outcome);
      else if (op === 'finish') result = finishRun(payload.run, payload.outcome);
      else if (op === 'resume') result = resumeRun(payload.run, payload.observation);
      else throw new Error(`Unknown session operation: ${op}`);
    }
    if (options.operation === 'tools' && !options.json) log(formatTools(result));
    else if (options.operation === 'show' && !options.json) log(result.instructions);
    else log(JSON.stringify(result, null, 2));
    return 0;
  } catch (failure) { error(`just-vibe: ${failure.message}`); return 1; }
}

if (isDirectRun(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
