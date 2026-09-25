#!/usr/bin/env node
import { dashboardMain } from './dashboard.mjs';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { isDirectRun } from './lib/entrypoint.mjs';
import { loadCatalog, getCommand, invocation, HOSTS, MODES } from './lib/catalog.mjs';
import { inspectProject } from './lib/project.mjs';
import { discoverCapabilities, readCapabilityReport, listTools, recommend } from './lib/discovery.mjs';
import { createRun, startStage, recordStage, finishRun, resumeRun, amendStage, supersedeStage, setRunProfiles } from './lib/run.mjs';
import { loadProfiles, getProfile, searchProfiles } from './lib/profiles.mjs';
import { createQuiz, presentQuestion, answerQuestion, reviewFreeText, quizReport } from './lib/teaching.mjs';
import { main as installerMain, HELP as INSTALLER_HELP } from './installer.mjs';
import { routeContext, starterIds } from './lib/routing.mjs';
import { continuity } from './lib/continuity.mjs';
import { collectEvidence } from './lib/evidence.mjs';
import { manageHooks } from './lib/automation.mjs';
import { INTENT_OPERATIONS, validateIntentArgs, intentRuntime } from './lib/intent-runtime.mjs';
import { operationHelp } from './lib/cli-help.mjs';
import { ADAPTERS } from './lib/editor-adapters.mjs';
import { assistantRuntime } from './lib/assistant-runtime.mjs';
import { PLATFORM_OPERATIONS, platformRuntime } from './lib/platform-runtime.mjs';
import { mcpMain } from './mcp.mjs';
import { guidedSetup } from './lib/guided-setup.mjs';

export const HELP = `${INSTALLER_HELP}
Workflow utilities:
  diagnose status       Observed hook, workflow and tool delivery stages
  dashboard             Open local UI [--root PATH] [--no-open] [--demo]
  preferences <op>      Inspect, preview, edit, toggle and restore learned instructions
  qa <operation>        Request-linked browser acceptance plans, runs and reports
  inventory / portfolio / sessions / behavior / mcp-health / runners
                        Configuration, skill maintenance, history, rules and trusted execution
  atlas / graph / usage / council / jobs / canary / evaluation
                        Tours, recall, accounting, reviews, bounded work, monitoring and receipts
  methods / telemetry / connectors / updater
  operator / services / ioc / git-hooks
                        Local coordination, owned processes, dependency indicators and Git gates
                        Each family accepts an operation and --stdin JSON. See runtime-expansion.md.
  health <operation>   Context capacity, repeated-call and scope monitoring
  quality <operation>  Preview/configure detected checks; verify staged commits
  epic <operation>     GitHub issue coordination: sync/plan/publish/recover
  audit <operation>    Native reports and an explicitly trusted AgentShield runner
  integration <op>     Guided choices: status/preview/configure/recover
  context <operation>   Explicit backup/preview/import/transfer/recover/status
  orchestrate <op>      Dependent worker assignments and reviewed acceptance
  canvas <operation>    Private local artifact review and version-bound feedback
  goal <operation>      Persistent objectives, criteria, progress and evidence
  vault <operation>     Scoped memory search/read/save/handoff/retire/forget
  learn <operation>     Observe patterns, review candidates, import/export lessons
  policy <operation>    Optional before-action checks and exact-action exceptions
  scan config           Static agent-configuration security scan
  agents list|show      Independent specialist definitions
  workers <operation>   Opt-in model workers: configure/start/status/logs/result/verify/apply/stop/cleanup
  activity show|health|report
                        Recorded activity and a local interactive HTML report
  adapters <operation>  Project editor/agent adapters: list/install/update/doctor/uninstall
  rules list|show       Language and framework rule packs
  mcp --root <path>     Native tools over stdio; saved project access or read-only defaults
                        Optional --allow-write, --allow-user, --allow-workers
                        Runtime operations accept --stdin JSON; see references/runtime-platform.md
  assist <operation>    Automatic routing, workflow loading, evidence and learning
                        status, route, start, select, load, evidence, report,
                        feedback, history, rollback, retire, forget, configure, prune, recover
                        Agent operations use --stdin JSON; see references/adaptive.md
  tools [query]          Browse/search shipped workflows and prerequisites
  show <workflow>        Read a workflow's full instructions
  profiles [query]       Browse engineering profiles (not capability grants)
  profile <id>           Read a role's priorities, decisions and verification
  inspect               Inspect project manifests and Git identity
  discover              Report local capabilities; never log in or call services
  route <goal>           Suggest candidates for the host agent, not execute them
  workflow <id> <brief>  Produce a context/run record for the host agent
  session <operation>   Transform a run record from JSON on stdin
                        Operations: create, start, amend, supersede, profile,
                        record, finish, resume
  quiz <operation>      Native-dialog quiz state from JSON on stdin
                        Operations: create, present, answer, review, report
  project <operation>   Explicit project preferences, notes and checkpoints
                        init, show, configure, remember, forget, checkpoint,
                        resume, list; writes use JSON on stdin
  evidence <collector>  github, vercel, browser, migrations
  hooks <operation>     status, configure, trust, untrust, disable, recover
                        Inactive until configured and explicitly trusted
  memory <op> [name]    save, retire, recover, inspect: instruction provenance
  guard <op> <name>     create, check, show: validated correction checks
  task <op> <name>      begin, capture, preview, undo, recover, show
  lab <op> <name>       create, check, preview, stop, select, recover, cleanup, show, report
  proof <op> <name>     create, run, collect, attach, show, report
  practice <op> <name>  create, validate, submit, hint, cleanup, show
  experiment <op> <id>  import, compare, show: local ML exports and predictions
  decision <op> <name>  save, revisit, show: assumptions and evidence
  workbench list       List project work records, checkpoints and notes (handoffs:
                        vault list; goals: goal list); recover removes a dead owner's lock
                        Writes/check execution use --stdin JSON with revision.
                        Read references/intent-workflows.md for schemas.

Options:
  --root <directory>    Project to inspect (default: current directory)
  --target <host>       Invocation format: codex or claude (default claude); tools,
                        show and route also accept an editor adapter id. setup,
                        doctor, update and uninstall take their own --target.
  --pack <id>           Filter tools by pack
  --available          Show only workflows with verified prerequisites
  --all                Also include uninstalled/planned/unsupported entries
  --json               Machine-readable output
  --limit <number>     Bound tools/route results (route defaults to 3)
  --capabilities <file> Host-observed capability report, valid for 15 minutes
  --mode inspect|plan|apply
  --scope <path>        Restrict workflow scope within the project
  --profile <id>        workflow: pin the user's task role (setup uses --profile
                        for an install profile)
  --brief-file <file>   Preserve a UTF-8 brief verbatim (max 1 MiB)
  --stdin              Read the brief or session/quiz JSON from stdin
  -- <brief>           Treat all remaining arguments as context, not flags
  --help, -h           After any operation: its operations, JSON fields and reference

Evidence options: --repo owner/name --pr NUMBER; --deployment ID/URL
  --team TEAM; --url URL --steps FILE; --directory DIR --applied FILE
Project checkpoint/resume takes a name after the operation. JSON updates
include the current revision (0 to create). Project writes go in .just-vibe.
Browser steps may interact with the chosen site; other collectors only read.

Domain workflows execute as skills in the active host. Only an explicitly
enabled workers start operation launches an additional model process.
`;

const operations = new Set(['assist', 'tools', 'show', 'profiles', 'profile', 'inspect', 'discover', 'route', 'workflow', 'session', 'quiz', 'project', 'evidence', 'hooks', ...Object.keys(INTENT_OPERATIONS), ...Object.keys(PLATFORM_OPERATIONS)]);
const booleans = new Set(['--json', '--available', '--all', '--stdin']);
const values = new Set(['--root', '--target', '--pack', '--capabilities', '--mode', '--scope', '--profile', '--brief-file', '--limit', '--repo', '--pr', '--deployment', '--team', '--url', '--steps', '--directory', '--applied']);

export function parseToolkitArgs(args) {
  const [operation, ...rest] = args;
  if (!operations.has(operation)) throw new Error(`Unknown utility: ${operation}`);
  const flags = rest.includes('--') ? rest.slice(0, rest.indexOf('--')) : rest;
  if (flags.some(arg => arg === '--help' || arg === '-h')) return { operation, help: true };
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
  // Editor adapters install skills named just-vibe-<id>; listing operations can show that syntax.
  const adapterTarget = ADAPTERS.some(a => a.skills && a.id === options.target) && ['tools', 'show', 'route'].includes(operation);
  if (!HOSTS.includes(options.target) && !adapterTarget) throw new Error(`target must be codex or claude${['tools', 'show', 'route'].includes(operation) ? ', or an editor adapter id' : ` for ${operation}; editor adapter ids apply to tools, show and route`}.`);
  if (options.mode && !MODES.includes(options.mode)) throw new Error('mode must be inspect, plan, or apply.');
  if (options.stdin && options['brief-file']) throw new Error('Use only one brief source.');
  if (seen.has('--root') && !existsSync(options.root)) throw new Error(`Project root not found: ${options.root}`);
  if (options.limit !== undefined) { options.limit = Number(options.limit); if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > 1000) throw Error('limit must be between 1 and 1000.'); }
  const allowed = {
    ...Object.fromEntries(Object.keys(PLATFORM_OPERATIONS).map(op => [op, ['json', 'root', 'stdin']])),
    assist: ['json', 'root', 'stdin'],
    tools: ['json', 'available', 'all', 'root', 'target', 'pack', 'capabilities', 'limit'],
    show: ['json', 'target', 'root'], inspect: ['json', 'root'], discover: ['json', 'root', 'capabilities'],
    // The shared execution guide passes --root to every call; role lookup ignores it.
    profiles: ['json', 'limit', 'root'], profile: ['json', 'root'],
    route: ['json', 'root', 'target', 'capabilities', 'stdin', 'brief-file', 'limit'],
    workflow: ['json', 'root', 'target', 'mode', 'scope', 'profile', 'stdin', 'brief-file'], session: ['json', 'target', 'stdin', 'root'], quiz: ['json', 'stdin', 'root'],
    project: ['json', 'root', 'stdin'], hooks: ['json', 'root', 'stdin'],
    evidence: ['json', 'root', 'repo', 'pr', 'deployment', 'team', 'url', 'steps', 'directory', 'applied'],
    ...Object.fromEntries(Object.keys(INTENT_OPERATIONS).map(op => [op, ['json', 'root', 'stdin']])),
  };
  for (const flag of seen) if (!allowed[operation].includes(flag.slice(2))) throw new Error(`${flag} does not apply to ${operation}.`);
  if (['inspect', 'discover'].includes(operation) && options.positionals.length) throw new Error(`${operation} takes no positional arguments.`);
  if (['show', 'profile', 'session', 'quiz'].includes(operation) && options.positionals.length !== 1) throw new Error(`${operation} requires exactly one name.`);
  if (['hooks', 'evidence'].includes(operation) && options.positionals.length !== 1) throw Error(`${operation} requires exactly one operation.`);
  if (operation === 'project' && options.positionals.length !== (['checkpoint', 'resume'].includes(options.positionals[0]) ? 2 : 1)) throw Error('project checkpoint/resume requires a name; other project operations take one operation.');
  if (operation === 'evidence') {
    const valid = { github: ['repo', 'pr'], vercel: ['deployment', 'team'], browser: ['url', 'steps'], migrations: ['directory', 'applied'] }[options.positionals[0]];
    if (!valid || [...seen].some(flag => !['root', 'json', ...valid].includes(flag.slice(2)))) throw Error('Invalid collector or options for this collector.');
  }
  if (['project', 'hooks'].includes(operation)) {
    const writes = operation === 'project' ? ['init', 'configure', 'remember', 'forget', 'checkpoint'] : ['configure'];
    if (writes.includes(options.positionals[0]) && !options.stdin) throw Error('This operation requires --stdin JSON.');
    if (!writes.includes(options.positionals[0]) && options.stdin) throw Error('--stdin does not apply to this operation.');
  }
  if (Object.hasOwn(INTENT_OPERATIONS, operation)) validateIntentArgs(options);
  if (Object.hasOwn(PLATFORM_OPERATIONS, operation) && (options.positionals.length !== 1 || !PLATFORM_OPERATIONS[operation].includes(options.positionals[0]))) throw Error(`Choose a ${operation} operation: ${PLATFORM_OPERATIONS[operation].join(', ')}.`);
  if (operation === 'assist') {
    const op = options.positionals[0];
    if (options.positionals.length !== 1 || !['status', 'route', 'start', 'select', 'load', 'evidence', 'report', 'feedback', 'history', 'rollback', 'retire', 'forget', 'configure', 'prune', 'recover'].includes(op)) throw Error('Choose a supported assist operation.');
    if (!['status', 'history', 'prune'].includes(op) && !options.stdin) throw Error('This assist operation requires --stdin JSON.');
    if (['status', 'prune'].includes(op) && options.stdin) throw Error('--stdin does not apply to this assist operation.');
  }
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
  return [result.note, '', ...result.tools.map(c => `${c.id} [${c.pack}; ${c.status}; ${c.defaultMode}]${c.aliasOf ? ` → ${c.aliasOf}` : ''}\n  ${c.summary}\n  ${c.invocation}${c.invocation.startsWith('/') ? ' ' : ': '}${c.example.brief}${c.reasons.length ? `\n  Needs: ${c.reasons.join('; ')}` : ''}`)].join('\n');
}

function formatRoute(result) {
  if (!result.recommendations.length) return 'No clear workflow match. Describe the outcome or use tools to browse.';
  return [`Suggested path: ${result.strategy.suggested}. ${result.strategy.reasons.join('; ')}.`,
    result.confidence === 'ambiguous' ? 'Several workflows fit; choose using the scope below.' : 'Best matching candidates:',
    ...result.recommendations.map(c => `\n${c.id} [${c.status}] — ${c.summary}\n  ${c.selectionReasons.join('; ')}\n  ${c.invocation}`),
    '\nSuggestions only. Preserve the complete request and verify task-specific access before execution. Use --json for full context.'].join('\n');
}

// Name the missing field instead of letting a TypeError surface from deep inside the run code.
const SESSION_FIELDS = { create: ['command', 'brief'], start: ['run', 'stage'], amend: ['run', 'action'], supersede: ['run', 'resolution'],
  profile: ['run', 'selection'], record: ['run', 'outcome'], finish: ['run', 'outcome'], resume: ['run', 'observation'] };
function sessionPayload(op, payload) {
  if (!SESSION_FIELDS[op]) throw new Error(`Unknown session operation: ${op}. Operations: ${Object.keys(SESSION_FIELDS).join(', ')}.`);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error(`session ${op} reads a JSON object on stdin.`);
  const missing = SESSION_FIELDS[op].filter(key => payload[key] === undefined || payload[key] === null);
  if (missing.length) throw new Error(`session ${op} needs ${missing.join(' and ')} in its JSON input; see references/runtime.md (Session operations).`);
  if (op === 'create' && typeof payload.command !== 'string') throw new Error('session create command must be a workflow id such as "fix".');
  if (op !== 'create' && (typeof payload.run !== 'object' || typeof payload.run.root !== 'string')) throw new Error(`session ${op} needs the complete run record returned by the previous session call.`);
}

export async function main(args, { log = console.log, error = console.error, input = readStdin, catalog = loadCatalog } = {}) {
  try {
    if (['setup', 'update'].includes(args[0]) && args.includes('--guided')) { await guidedSetup(args, { log }); return 0; }
    if (args[0] === 'dashboard') { await dashboardMain(args.slice(1), { log }); return 0; }
    if (args[0] === 'mcp') return await mcpMain(args.slice(1));
    if (!args.length || ['--help', '-h'].includes(args[0]) || (args[0] === 'help' && args.length === 1)) { log(HELP); return 0; }
    if (['setup', 'doctor', 'update', 'uninstall', '--version'].includes(args[0])) return installerMain(args, { log, error });
    if (args[0] === 'help' && args.length === 2 && operations.has(args[1])) { log(operationHelp(args[1])); return 0; }
    if (args[0] === 'help') args = ['tools', ...args.slice(1)];
    const options = parseToolkitArgs(args);
    if (options.help) { log(operationHelp(options.operation)); return 0; }
    const data = catalog();
    let result;
    const discovery = () => discoverCapabilities(options.root, {
      report: options.capabilities ? readCapabilityReport(options.capabilities, options.root) : undefined,
    });
    if (Object.hasOwn(PLATFORM_OPERATIONS, options.operation)) result = await platformRuntime(options.operation, options.root, options.positionals[0], options.stdin ? JSON.parse(await input()) : {});
    else if (options.operation === 'assist') result = assistantRuntime(options.root, options.positionals[0], options.stdin ? JSON.parse(await input()) : {}, { catalog: data });
    else if (options.operation === 'tools') {
      const found = discovery();
      let tools = listTools(data, found, { query: options.positionals.join(' '), pack: options.pack,
        available: options.available, all: options.all, host: options.target });
      const starter = !options.all && !options.available && !options.pack && !options.positionals.length;
      if (starter) { const ids = starterIds(routeContext(options.root)); tools = ids.flatMap(id => tools.filter(t => t.id === id)); }
      result = { tools: tools.slice(0, options.limit || 1000), total: data.commands.length, starter, integrations: found.integrations,
        note: starter ? 'Start here, search tools <scenario>, or use tools --all for the full catalog. Status reports observed prerequisites, not executed model behavior.' : 'Shipped workflow inventory; host enablement and permissions still apply. Available means declared task prerequisites were observed, not that a model has executed the workflow.' };
    } else if (options.operation === 'show') {
      const command = getCommand(data, options.positionals[0]);
      result = { ...command, invocation: invocation(command, options.target), ...assistantRuntime(options.root, 'load', { workflow: command.id }, { catalog: data }) };
    } else if (options.operation === 'profiles') {
      const found = searchProfiles(loadProfiles(), options.positionals.join(' '));
      result = { profiles: found.slice(0, options.limit || found.length), total: found.length,
        note: found.length ? 'Role priorities for the task; search matches are candidates, not automatic selections.' : 'No matching profiles; try a role title or browse families (profiles with no query).' };
    }
    else if (options.operation === 'profile') result = getProfile(loadProfiles(), options.positionals[0]);
    else if (options.operation === 'inspect') result = inspectProject(options.root);
    else if (options.operation === 'discover') result = discovery();
    else if (options.operation === 'route') result = recommend(data, discovery(), await getBrief(options, options.positionals, input), { host: options.target, ...(options.limit ? { limit: options.limit } : {}) });
    else if (options.operation === 'project') result = continuity(options.root, options.positionals[0], options.stdin ? JSON.parse(await input()) : {}, options.positionals[1]);
    else if (options.operation === 'hooks') result = manageHooks(options.root, options.positionals[0], options.stdin ? JSON.parse(await input()) : {});
    else if (options.operation === 'evidence') result = await collectEvidence(options.positionals[0], { ...options, scope: options.team });
    else if (Object.hasOwn(INTENT_OPERATIONS, options.operation)) result = await intentRuntime(options.operation, options.root, options.positionals[0], options.positionals[1], options.stdin ? JSON.parse(await input()) : {});
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
      sessionPayload(op, payload);
      if (op === 'create' && payload.root === undefined && args.includes('--root')) payload.root = options.root;
      if (op === 'create') {
        if (typeof payload.profile === 'string') throw new Error('session create profile is a selection request {primary, selectedBy, reason}; a bare id would record a user pin. Use workflow --profile ID only for an explicit user choice.');
        result = createRun(data, payload.command, payload);
      }
      else if (op === 'start') {
        const found = discoverCapabilities(payload.run.root, { report: payload.capabilityReport });
        result = startStage(data, payload.run, payload.stage, found.capabilities, options.target);
      } else if (op === 'amend') result = amendStage(payload.run, payload.action);
      else if (op === 'supersede') result = supersedeStage(payload.run, payload.resolution);
      else if (op === 'profile') result = setRunProfiles(payload.run, payload.selection);
      else if (op === 'record') result = recordStage(payload.run, payload.outcome);
      else if (op === 'finish') result = finishRun(payload.run, payload.outcome);
      else if (op === 'resume') result = resumeRun(payload.run, payload.observation);
      else throw new Error(`Unknown session operation: ${op}`);
    }
    if (options.operation === 'tools' && !options.json) log(formatTools(result));
    else if (options.operation === 'route' && !options.json) log(formatRoute(result));
    else if (options.operation === 'profiles' && !options.json) log([result.note, ...result.profiles.map(p => `${p.id} [${p.family}]\n  ${p.summary}`)].join('\n\n'));
    else if (options.operation === 'profile' && !options.json) log(`${result.name}\n${result.summary}\n\nPriorities:\n${result.priorities.map(p => `- ${p}`).join('\n')}\n\nDecision: ${result.decision}\n\nVerify:\n${result.verification.map(p => `- ${p}`).join('\n')}\n\nBoundary: ${result.boundary}\nWorkflows: ${result.workflows.join(', ')}\nExample: ${result.example}\n\nContribution: ${result.contribution}`);
    else if (options.operation === 'show' && !options.json) log(result.instructions);
    else if (options.operation === 'audit' && ['report', 'run'].includes(options.positionals[0]) && !options.json) log(typeof result.report === 'string' ? result.report : JSON.stringify(result.report, null, 2));
    else log(JSON.stringify(result, null, 2));
    if (options.operation === 'audit' && result.exitCode !== undefined) return result.exitCode;
    if (options.operation === 'qa' && ['run', 'show', 'report'].includes(options.positionals[0])) return result.verdict === 'passed' ? 0 : 2;
    if (options.operation === 'quality' && options.positionals[0] === 'check-commit') return result.passed ? 0 : 2;
    return (options.operation === 'evidence' || Object.hasOwn(INTENT_OPERATIONS, options.operation)) && ['failed', 'stale', 'incomplete', 'drift', 'conflict', 'invalid', 'incomparable', 'unverified', 'unknown'].includes(result.result) ? 2 : 0;
  } catch (failure) { error(`just-vibe: ${failure.message}`); return 1; }
}

if (isDirectRun(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
