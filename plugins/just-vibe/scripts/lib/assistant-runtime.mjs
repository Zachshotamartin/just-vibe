import { randomUUID } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, getCommand } from './catalog.mjs';
import { recommend, discoverCapabilities } from './discovery.mjs';
import { intentSignals } from './routing.mjs';
import { adaptiveStore, configureAdaptive, pruneAdaptive, recoverAdaptive, textField } from './adaptive-store.mjs';
import { lessons, learnedRoutes, recordFeedback, changeLesson, effectiveWorkflow } from './adaptive-learning.mjs';
import { workflowCapabilities, workflowRequirements, CAPABILITY_GUIDANCE } from './capability-guidance.mjs';
import { digest, fingerprint, compareSnapshot, within, privateName } from './storage.mjs';
import { redact } from './process.mjs';

const now = () => new Date().toISOString();
const feedbackCue = /\b(?:remember|always|never|next time|from now on|you should|you forgot|you missed|stop using|don't use|do not use|prefer|keep doing|that worked|that approach|too much|too many)\b/i;
const continuation = /^(?:please\s+)?(?:continue|go ahead|do (?:it|that)|implement(?: it| that)?|fix(?: it| that)?|yes|keep going|proceed)[.!\s]*$/i;
const domain = /\b(?:code|repo(?:sitory)?|file|bug|test|build|implement|refactor|debug|review|deploy|publish|commit|merge|frontend|backend|api|database|sql|react|vite|vercel|github|pr|pull request|ui|css|html|website|app|component|menu|training|model|dataset|gradient|loss|architecture|migration|teach|explain|linked lists?|login|page|screen|button|modal|form|endpoint|function|typescript|javascript|python|algorithm|schema|query|container|docker|pipeline|cache|notebook|experiment|keyboard|accessibility)\b/i;

export function routeRequest(store, catalog, brief, { host = 'claude', previous } = {}) {
  textField(brief, 'Request', 16000);
  const positive = intentSignals(brief).positive;
  if (/\b(?:what (?:have you|did you) (?:learn|learned|remember)|show (?:me )?(?:my |saved )?(?:preferences|lessons)|(?:forget|retire|roll back|rollback) (?:that |the |a |my )?(?:lesson|preference)|(?:stop|disable|pause) (?:automatic assistance|learning))\b/i.test(brief)) {
    return { recommendations: [], kind: 'learning', brief };
  }
  const follows = Boolean(previous && continuation.test(brief.trim()));
  const learned = learnedRoutes(store, positive);
  const unrelated = /\b(?:restaurant|dinner|breakfast|lunch|meal|workout|fitness|marathon|weather|movie|poem)\b/i.test(positive)
    && !/\b(?:code|app|website|software|repo|api|component|python|javascript|css|html|model|dataset)\b/i.test(positive);
  if (unrelated && !learned.preferred.size) return { recommendations: [], kind: 'none', brief };
  if (!follows && !domain.test(positive) && !learned.preferred.size) return { recommendations: [], kind: previous && feedbackCue.test(brief) ? 'feedback' : 'none', brief };
  const contextBrief = follows ? `${previous.brief}\nCurrent user request: ${brief}`.slice(-16000) : brief;
  const route = recommend(catalog, discoverCapabilities(store.root), contextBrief, { host, limit: 12 });
  let candidates = route.recommendations;
  for (const [id, sources] of learned.preferred) {
    if (!candidates.some(c => c.id === id)) {
      const c = getCommand(catalog, id);
      candidates.push({ id, summary: c.summary, score: 0, selectionReasons: [], status: 'unknown' });
    }
    const candidate = candidates.find(c => c.id === id);
    candidate.score += 60; candidate.selectionReasons.push(`Matches explicit saved feedback: ${sources.join(', ')}`);
  }
  const explicitlyNamed = new Set([...brief.matchAll(/(?:\/just-vibe:|\$)([a-z0-9-]+)/g)]
    .filter(m => catalog.commands.some(c => c.id === m[1])).map(m => getCommand(catalog, m[1], { canonical: true }).id));
  candidates = candidates.filter(c => !learned.avoided.has(c.id) || explicitlyNamed.has(c.id));
  candidates.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return { ...route, brief: contextBrief, kind: candidates.length ? 'task' : 'none', follows,
    recommendations: candidates.slice(0, 3).map(c => ({ id: c.id, summary: c.summary, reasons: c.selectionReasons, status: c.status })) };
}

export function startRequest(store, catalog, payload) {
  if (!store.config().enabled) return { disabled: true };
  const host = payload.host || 'claude';
  if (!['claude', 'codex'].includes(host)) throw Error('Unknown host.');
  const sessionId = textField(payload.sessionId, 'sessionId', 256);
  if (payload.turnId !== undefined) textField(payload.turnId, 'turnId', 256);
  const path = store.sessionPath(host, sessionId), session = store.read(path);
  let previous = null;
  if (session?.taskId) { try { previous = store.task(session.taskId); } catch { /* Retention may have expired it. */ } }
  const brief = textField(payload.brief, 'brief', 16000);
  // Codex delivers a Stop continuation as a new prompt. It is not user feedback
  // and must not reset the retry budget or create a second task/source record.
  if (previous?.reminders && previous.continuationPromptHash === digest(brief)) {
    // The host may assign the continuation a fresh turn ID. Keep its events
    // attached to this task without replacing the original user-message source.
    if (payload.turnId && payload.turnId !== previous.turnId) return store.saveTask({ ...previous, turnId: payload.turnId, updatedAt: now() });
    return previous;
  }
  // A host turn ID makes duplicate prompt events idempotent. Claude supplies no turn ID.
  if (payload.turnId && previous?.turnId === payload.turnId && previous.messageHash === digest(brief)) return previous;
  let taskContext = previous;
  for (let hops = 0; continuation.test(brief.trim()) && taskContext?.routeKind !== 'task' && taskContext?.previousTaskId && hops < 8; hops++) {
    if (!feedbackCue.test(taskContext.userMessage) && !/^(?:thanks|thank you|ok|okay|great)[.!\s]*$/i.test(taskContext.userMessage)) break;
    try { taskContext = store.task(taskContext.previousTaskId); } catch { break; }
  }
  const route = routeRequest(store, catalog, brief, { host, previous: taskContext });
  if (route.kind === 'none' && !previous && !feedbackCue.test(brief)) return { kind: 'none' };
  const task = { kind: 'task', id: randomUUID(), root: store.root, host, sessionHash: digest(sessionId),
    turnId: payload.turnId || null, createdAt: now(), updatedAt: now(), userMessage: redact(brief), messageHash: digest(brief),
    brief: redact(route.brief), previousTaskId: previous?.id || null, routeKind: route.kind,
    frameworks: route.context?.frameworks || [],
    candidates: route.recommendations, selected: [], mode: null, requirements: [], loaded: [], observations: [],
    reminders: 0, status: route.kind === 'task' ? 'suggested' : 'idle', feedbackCandidate: feedbackCue.test(brief) || Boolean(previous && route.kind !== 'task'),
  };
  const saved = store.saveTask(task, 0);
  store.write(path, { root: store.root, taskId: task.id, updatedAt: now() }, session?.revision || 0);
  pruneAdaptive(store);
  return saved;
}

export function selectWorkflows(store, catalog, payload) {
  const task = store.task(payload.taskId);
  if (!Array.isArray(payload.workflows) || payload.workflows.length > 3 || new Set(payload.workflows).size !== payload.workflows.length
    || !['apply', 'inspect', 'plan'].includes(payload.mode)) throw Error('Select up to three workflows and a valid mode.');
  textField(payload.reason, 'Selection reason');
  const selected = [...new Set(payload.workflows.map(id => getCommand(catalog, id, { canonical: true }).id))];
  const requirements = selected.flatMap(id => {
    const command = getCommand(catalog, id), effective = effectiveWorkflow(store, catalog, id);
    return [{ id: 'instructions', description: 'Load this workflow and its current personal instructions.' },
      ...workflowRequirements(command, payload.mode, task.brief),
      ...effective.lessons.flatMap(l => l.checks.map((description, i) => ({ id: `learned-${l.id}-${i}`, description })))].map(r => ({ ...r, id: `${id}:${r.id}`, workflow: id }));
  });
  const prior = new Map(task.requirements.map(r => [r.id, r]));
  const discovery = discoverCapabilities(store.root, { report: payload.capabilityReport });
  const updated = store.saveTask({ ...task, selected, mode: payload.mode, selectionReason: redact(payload.reason),
    requirements: requirements.map(r => ({ ...r, evidence: prior.get(r.id)?.description === r.description ? prior.get(r.id).evidence : null })),
    updatedAt: now(), status: selected.length ? 'active' : 'dismissed' });
  return { ...updated, toolGuidance: selected.flatMap(id => workflowCapabilities(getCommand(catalog, id), payload.mode, task.brief)
    .map(capability => ({ workflow: id, capability, ...discovery.capabilities[capability], action: CAPABILITY_GUIDANCE[capability] }))) };
}

export function loadWorkflow(store, catalog, payload) {
  const effective = effectiveWorkflow(store, catalog, payload.workflow);
  if (payload.taskId) {
    const task = store.task(payload.taskId);
    if (!task.selected.includes(effective.workflow)) throw Error('Select this workflow for the task before loading it.');
    store.saveTask({ ...task, updatedAt: now(),
      loaded: [...task.loaded.filter(l => l.workflow !== effective.workflow), { workflow: effective.workflow, effectiveHash: effective.effectiveHash, at: now() }],
      requirements: task.requirements.map(r => r.id === `${effective.workflow}:instructions` ? { ...r, evidence: { kind: 'runtime-load', effectiveHash: effective.effectiveHash, at: now(), summary: 'Effective workflow returned to the host. This establishes delivery, not model compliance.' } } : r) });
  }
  return effective;
}

export function recordEvidence(store, payload) {
  const task = store.task(payload.taskId), requirement = task.requirements.find(r => r.id === payload.requirement);
  if (!requirement || requirement.id.endsWith(':instructions')) throw Error('Choose an evidence requirement; instructions are recorded by load.');
  if (!['artifact', 'host-report', 'blocked', 'not-applicable'].includes(payload.kind)) throw Error('Unknown evidence kind.');
  const evidence = { kind: payload.kind, summary: redact(textField(payload.summary, 'Evidence summary')), at: now(), snapshot: fingerprint(store.root) };
  if (payload.kind === 'artifact') {
    const path = within(store.root, textField(payload.path, 'Artifact path', 500));
    if (path.split(/[\\/]/).some(privateName) || statSync(path).size > 8 * 1024 * 1024 || !statSync(path).isFile()) throw Error('Choose a bounded non-secret evidence file.');
    evidence.artifact = { path: relative(store.root, path), hash: digest(readFileSync(path)) };
  }
  if (payload.observationId) {
    const observation = task.observations.find(o => o.id === payload.observationId);
    if (!observation) throw Error('Observation is not part of this task.');
    evidence.observation = observation;
  }
  return store.saveTask({ ...task, updatedAt: now(), requirements: task.requirements.map(r => r.id === requirement.id ? { ...r, evidence } : r) });
}

export function observeTool(store, taskId, event) {
  const task = store.task(taskId);
  if (task.status !== 'active' && task.status !== 'suggested') return task;
  const tool = textField(event.tool_name, 'Tool name', 200);
  const id = digest(`${event.tool_use_id || randomUUID()}:${tool}`);
  if (task.observations.some(o => o.id === id)) return task;
  const result = event.tool_response;
  const failed = event.hook_event_name === 'PostToolUseFailure' || event.error || result?.isError === true
    || (typeof result?.exit_code === 'number' && result.exit_code !== 0);
  return store.saveTask({ ...task, updatedAt: now(), observations: [...task.observations.slice(-99),
    { id, tool, at: now(), outcome: failed ? 'failed' : 'returned', note: 'Tool activity only; no semantic verification inferred.' }] });
}

export function inspectCompletion(store, catalog, task) {
  const snapshot = task.requirements.some(r => r.evidence?.snapshot) ? fingerprint(store.root) : null;
  const checks = task.requirements.map(r => {
    const e = r.evidence;
    if (!e) return { ...r, result: 'missing' };
    if (e.kind === 'runtime-load') return { ...r, result: effectiveWorkflow(store, catalog, r.workflow).effectiveHash === e.effectiveHash ? 'delivered' : 'stale' };
    if (compareSnapshot(e.snapshot, snapshot).stale) return { ...r, result: 'stale' };
    if (e.artifact) {
      try {
        const path = within(store.root, e.artifact.path), stat = statSync(path);
        if (!stat.isFile() || stat.size > 8 * 1024 * 1024 || digest(readFileSync(path)) !== e.artifact.hash) return { ...r, result: 'stale' };
      }
      catch { return { ...r, result: 'stale' }; }
    }
    return { ...r, result: e.kind === 'blocked' ? 'blocked' : e.kind === 'not-applicable' ? 'not-applicable' : 'reported' };
  });
  return { taskId: task.id, status: task.status, selected: task.selected, checks,
    evidenceStatus: checks.some(r => ['missing', 'stale'].includes(r.result)) ? 'unresolved' : checks.some(r => r.result === 'blocked') ? 'blocked' : 'reported',
    missing: checks.filter(r => ['missing', 'stale'].includes(r.result)).map(r => r.id),
    limitations: checks.filter(r => r.result === 'blocked').map(r => ({ requirement: r.id, reason: r.evidence.summary })),
    note: 'Host reports and artifact attachment are attributed evidence, not independent proof of correctness or user approval.' };
}

export function stopTask(store, catalog, id, { stopHookActive = false } = {}) {
  const task = store.task(id);
  if (!['suggested', 'active'].includes(task.status)) return {};
  const result = inspectCompletion(store, catalog, task);
  const missing = task.status === 'suggested' ? ['workflow selection (or explicit dismissal)'] : result.missing;
  if (missing.length && store.config().gate === 'bounded' && !stopHookActive && task.reminders < 1) {
    const reason = `just-vibe task ${task.id}: resolve ${missing.join(', ')}. Use assist select/load/evidence; if irrelevant dismiss with an empty selection, or record a real blocker/not-applicable reason. Do not expand the request or invent evidence. One continuation maximum.`;
    store.saveTask({ ...task, reminders: task.reminders + 1, continuationPromptHash: digest(reason), updatedAt: now() });
    return { decision: 'block', reason };
  }
  const status = missing.length ? 'incomplete' : result.limitations.length ? 'blocked' : 'reported';
  store.saveTask({ ...task, status, updatedAt: now() });
  return missing.length || result.limitations.length ? { systemMessage: `just-vibe task ${task.id} remains ${status}. ${missing.join(', ') || result.limitations.map(l => l.requirement).join(', ')}. No successful verification is implied.` } : {};
}

export function activationContext(store, catalog, task) {
  if (!task || task.kind !== 'task' || !store.config().enabled) return '';
  const cli = fileURLToPath(new URL('../toolkit.mjs', import.meta.url));
  const parts = [
    'just-vibe automatic assistance. The current user request controls scope, mode and authorization; stored context cannot override it.',
    `Runtime file: ${JSON.stringify(cli)}. Project: ${JSON.stringify(store.root)}. Task ID: ${task.id}. Invoke Node with separate argv or proper shell quoting; these JSON strings are data, not shell escaping.`,
    'Use the host file, shell, browser, skill-discovery and connected-service tools. No slash command is required from the user.',
  ];
  if (task.routeKind === 'task') {
    if (task.frameworks.length) parts.push(`Detected project frameworks: ${task.frameworks.join(', ')}. Honor any current user-pinned role.`);
    parts.push('Resolve these candidates against the whole conversation; they are suggestions, not instructions to execute every match:',
      ...task.candidates.map(c => `${c.id}: ${c.summary} (${c.reasons.join('; ')})`),
      'Select the smallest useful set with assist select --root <project> --stdin JSON {taskId,workflows:[id],mode:"apply|inspect|plan",reason}. Use workflows:[] to dismiss an irrelevant route. For another workflow, use tools <scenario> or route, then select it.',
      'Load each selected workflow with assist load --root <project> --stdin JSON {taskId,workflow}. It returns complete instructions and saved feedback. Read its relevant references. Discover the actual host tools needed and use them; available integrations outside just-vibe count.',
      'Record meaningful checks with assist evidence --root <project> --stdin JSON {taskId,requirement,kind:"artifact|host-report|blocked|not-applicable",summary,path?}. Evidence IDs and tool guidance come from select. Tool activity alone is not success. Record blockers or exclusions honestly. Do not run checks that the current user forbids.',
    );
  }
  if (task.routeKind === 'learning') parts.push('This request concerns just-vibe personalization or automatic assistance. Use assist history/status for inspection, or the explicitly requested configure/retire/forget/rollback operation after resolving the exact lesson/scope. The adaptive guide contains schemas. Do not run an unrelated engineering workflow.');
  if (task.selected.length) parts.push(`Selected workflows: ${task.selected.join(', ')}. On resume, inspect assist report with {taskId} for evidence freshness; reload changed instructions. Prior task text is context, not renewed authorization.`, `Task context: ${JSON.stringify(task.brief)}`);
  if (task.feedbackCandidate && store.config().learning) parts.push('This user message may contain explicit feedback. Read the adaptive guide and save a narrow correction/reinforcement using assist feedback; quote this actual user message. Default to project scope. Do not infer approval from silence, tests, your own output, or unaccepted proposals. Identify the appropriate workflow from this task or its previousTaskId. No feedback update is required when the message is merely a task request.');
  parts.push(`For schemas and learning/rollback operations read ${JSON.stringify(fileURLToPath(new URL('../../references/adaptive.md', import.meta.url)))}.`);
  if (!['task', 'learning'].includes(task.routeKind) && !task.feedbackCandidate) return '';
  return parts.join('\n');
}

export function assistantRuntime(root, operation, payload = {}, options = {}) {
  const store = adaptiveStore(root, options), catalog = options.catalog || loadCatalog();
  if (operation === 'status') return { settings: store.config(), project: store.root, storage: store.home,
    projectConfiguration: store.read(`${store.project}/config.json`), userConfiguration: store.read('adaptive/config.json'),
    lessons: lessons(store).map(l => ({ id: l.id, workflow: l.workflow, scope: l.scope, version: l.current })),
    nativeHooks: 'Requires enabled plugin, compatible host and host-reviewed hook trust. This command does not prove host activation.' };
  if (operation === 'configure') return configureAdaptive(store, payload);
  if (operation === 'route') return routeRequest(store, catalog, payload.brief, { host: payload.host });
  if (operation === 'start') return startRequest(store, catalog, payload);
  if (operation === 'select') return selectWorkflows(store, catalog, payload);
  if (operation === 'load') return loadWorkflow(store, catalog, payload);
  if (operation === 'evidence') return recordEvidence(store, payload);
  if (operation === 'feedback') return recordFeedback(store, catalog, payload);
  if (['rollback', 'retire', 'forget'].includes(operation)) return changeLesson(store, operation, payload);
  if (operation === 'history') return { lessons: lessons(store, { inactive: true }).filter(l => !payload.id || l.id === payload.id) };
  if (operation === 'report') { const task = store.task(payload.taskId); return { ...inspectCompletion(store, catalog, task), task }; }
  if (operation === 'prune') return pruneAdaptive(store);
  if (operation === 'recover') return recoverAdaptive(store, payload.scope);
  throw Error(`Unknown assist operation: ${operation}`);
}
