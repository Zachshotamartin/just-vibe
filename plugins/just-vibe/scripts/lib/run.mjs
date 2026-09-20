import { randomUUID } from 'node:crypto';
import { realpathSync, lstatSync, statSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { getCommand, availability, MODES } from './catalog.mjs';

const terminal = new Set(['completed', 'partial', 'blocked', 'failed', 'cancelled']);
const effects = new Set(['read', 'plan-artifact', 'local-write', 'external-write', 'destructive', 'paid']);
const clone = value => structuredClone(value);
const required = (value, name) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required.`);
  return value;
};
function positive(value, name, max) {
  if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`${name} must be an integer from 1 to ${max}.`);
  return value;
}

export function insideProject(root, path) {
  const base = realpathSync(resolve(root));
  const target = resolve(base, path);
  // Resolve the closest existing ancestor so a missing leaf cannot hide a symlink escape.
  let ancestor = target;
  while (true) {
    try { lstatSync(ancestor); break; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const next = dirname(ancestor);
    if (next === ancestor) throw new Error('Cannot resolve target path.');
    ancestor = next;
  }
  const actual = resolve(realpathSync(ancestor), relative(ancestor, target));
  const rel = relative(base, actual);
  if (rel === '..' || rel.startsWith('../') || rel.startsWith('..\\') || isAbsolute(rel)) throw new Error('Target escapes the selected project.');
  if (rel.split(/[\\/]/).includes('.git')) throw new Error('Do not modify Git internals through a workflow target.');
  return actual;
}

export function createRun(catalog, invokedAs, options, now = Date.now()) {
  const command = getCommand(catalog, invokedAs, { canonical: true });
  const brief = required(options.brief, 'Original brief');
  const root = realpathSync(resolve(options.root || process.cwd()));
  if (!statSync(root).isDirectory()) throw new Error('Run root must be a directory.');
  const mode = options.mode || command.defaultMode;
  if (!MODES.includes(mode)) throw new Error('Invalid mode.');
  const context = options.context || {};
  for (const key of ['constraints', 'references', 'successCriteria', 'assumptions', 'authorization']) {
    if (context[key] !== undefined && !Array.isArray(context[key])) throw new Error(`context.${key} must be an array.`);
  }
  const scope = options.scope ? insideProject(root, options.scope) : root;
  const budget = {
    maxStages: positive(options.budget?.maxStages ?? 8, 'maxStages', 100),
    maxAttempts: positive(options.budget?.maxAttempts ?? 3, 'maxAttempts', 20),
    maxMinutes: positive(options.budget?.maxMinutes ?? 60, 'maxMinutes', 1440),
  };
  return { schemaVersion: 1, id: randomUUID(), invokedAs, command: command.id, root, scope, mode,
    brief, context: { objective: brief, constraints: [], references: [], successCriteria: [], assumptions: [], authorization: [], ...clone(context) },
    budget, createdAt: new Date(now).toISOString(), status: 'ready', stages: [],
    note: 'This record validates workflow state. It does not sandbox the host or independently prove evidence/authorization. Host tool permissions still apply.' };
}

export function validateRun(run) {
  if (run?.schemaVersion !== 1 || !Array.isArray(run.stages) || !MODES.includes(run.mode)
      || !['ready', 'running', ...terminal].includes(run.status)) throw new Error('Invalid run record.');
  required(run.id, 'Run id'); required(run.brief, 'Original brief');
  required(run.root, 'Root'); required(run.scope, 'Scope');
  if (!run.context || !Array.isArray(run.context.authorization) || !Array.isArray(run.context.successCriteria)) throw new Error('Invalid run context.');
  for (const [name, max] of [['maxStages', 100], ['maxAttempts', 20], ['maxMinutes', 1440]]) positive(run.budget?.[name], name, max);
  if (!Number.isFinite(Date.parse(run.createdAt))) throw new Error('Invalid run timestamp.');
  return run;
}

function active(run, now) {
  validateRun(run);
  if (terminal.has(run.status)) throw new Error(`Run is ${run.status}; resume explicitly before continuing.`);
  if (now - Date.parse(run.createdAt) >= run.budget.maxMinutes * 60000) throw new Error('Run time budget exhausted.');
}

export function authorizeEffect(run, { effect, target, action }) {
  if (!effects.has(effect)) throw new Error('Unknown effect class.');
  required(target, 'Action target'); required(action, 'Action description');
  if (run.mode === 'inspect' && effect !== 'read') throw new Error('Inspect mode permits read-only stages.');
  if (run.mode === 'plan' && !['read', 'plan-artifact'].includes(effect)) throw new Error('Plan mode cannot execute changes.');
  if (['local-write', 'plan-artifact'].includes(effect)) {
    const path = insideProject(run.root, target);
    const scope = insideProject(run.root, run.scope);
    const rel = relative(scope, path);
    if (rel === '..' || rel.startsWith('../') || rel.startsWith('..\\') || isAbsolute(rel)) throw new Error('Write target escapes requested scope.');
  }
  if (['plan-artifact', 'external-write', 'destructive', 'paid'].includes(effect)) {
    const grant = run.context.authorization.find(a => {
      if (a?.effect !== effect || a.action !== action || typeof a.basis !== 'string' || !a.basis.trim()) return false;
      if (effect !== 'plan-artifact') return a.target === target;
      try { return insideProject(run.root, a.target) === insideProject(run.root, target); } catch { return false; }
    });
    if (!grant) throw new Error('Missing exact action/target authorization from the user session.');
  }
}

export function startStage(catalog, run, request, capabilities, host = 'claude', now = Date.now()) {
  active(run, now);
  if (run.stages.some(s => s.status === 'running')) throw new Error('Finish the running stage before starting another.');
  const command = getCommand(catalog, request.command, { canonical: true });
  if (command.id === 'auto') throw new Error('Recursive auto/do routing is not allowed.');
  if (availability(catalog, command, capabilities, host).status !== 'available') throw new Error(`Workflow prerequisites are not verified: ${command.id}`);
  const id = request.id || randomUUID();
  let stage = run.stages.find(s => s.id === id);
  if (stage) {
    if (!['failed', 'blocked'].includes(stage.status) || stage.command !== command.id) throw new Error('Only the same failed or blocked stage may be retried.');
    if (stage.attempts.length >= run.budget.maxAttempts) throw new Error('Stage retry budget exhausted.');
    required(request.newEvidence, 'New evidence supporting retry');
  } else if (run.stages.length >= run.budget.maxStages) throw new Error('Workflow stage budget exhausted.');
  const effect = request.effect || 'read';
  const target = request.target || run.scope;
  const action = required(request.action, 'Stage action');
  authorizeEffect(run, { effect, target, action });
  const result = clone(run);
  stage = result.stages.find(s => s.id === id);
  if (!stage) { stage = { id, command: command.id, attempts: [] }; result.stages.push(stage); }
  stage.status = 'running';
  stage.attempts.push({ effect, target, action, startedAt: new Date(now).toISOString(), newEvidence: request.newEvidence || null });
  result.status = 'running';
  return result;
}

function checkEvidence(evidence, criteria, completed) {
  if (!Array.isArray(evidence) || !Array.isArray(criteria)) throw new Error('Evidence and criteria arrays are required.');
  for (const e of evidence) {
    if (!e || !['pass', 'fail', 'unverified'].includes(e.result)) throw new Error('Invalid evidence result.');
    required(e.reference, 'Evidence reference'); required(e.detail, 'Evidence detail');
  }
  for (const c of criteria) {
    required(c.criterion, 'Criterion');
    if (!['pass', 'fail', 'unverified'].includes(c.result) || !Array.isArray(c.evidence)
        || c.evidence.some(i => !Number.isInteger(i) || !evidence[i])) throw new Error('Invalid criterion evidence linkage.');
    if (c.result === 'pass' && (!c.evidence.length || c.evidence.some(i => evidence[i].result !== 'pass'))) throw new Error('Passing criteria need passing evidence.');
  }
  if (completed && (!criteria.length || criteria.some(c => c.result !== 'pass') || evidence.some(e => e.result !== 'pass'))) throw new Error('Completion requires verified criteria; failed/unverified evidence cannot become a pass.');
}

export function recordStage(run, outcome, now = Date.now()) {
  validateRun(run);
  if (terminal.has(run.status)) throw new Error('Run is already terminal.');
  const result = clone(run);
  const stage = result.stages.find(s => s.id === outcome.id && s.status === 'running');
  if (!stage) throw new Error('No matching running stage.');
  if (!['completed', 'blocked', 'failed', 'cancelled'].includes(outcome.status)) throw new Error('Invalid stage outcome.');
  required(outcome.summary, 'Outcome summary');
  checkEvidence(outcome.evidence || [], outcome.criteria || [], outcome.status === 'completed');
  Object.assign(stage.attempts.at(-1), { finishedAt: new Date(now).toISOString(),
    status: outcome.status, summary: outcome.summary,
    evidence: clone(outcome.evidence || []), criteria: clone(outcome.criteria || []) });
  stage.status = outcome.status;
  result.status = 'ready';
  return result;
}

// Add an action to a running attempt without restarting it or losing its history.
// Multiple effects belong to the same action (e.g. external-write AND paid).
export function amendStage(run, request, now = Date.now()) {
  active(run, now);
  const stage = run.stages.find(s => s.id === request.id && s.status === 'running');
  if (!stage) throw new Error('No matching running stage.');
  if (!Array.isArray(request.effects) || !request.effects.length
      || new Set(request.effects).size !== request.effects.length) throw new Error('Distinct action effects are required.');
  for (const effect of request.effects) authorizeEffect(run, { ...request, effect });
  const result = clone(run);
  const attempt = result.stages.find(s => s.id === request.id).attempts.at(-1);
  attempt.actions ??= [];
  attempt.actions.push({ action: request.action, target: request.target, effects: [...request.effects], checkedAt: new Date(now).toISOString() });
  return result;
}

export function supersedeStage(run, resolution, now = Date.now()) {
  active(run, now);
  const source = run.stages.find(s => s.id === resolution.id);
  if (!source || !['failed', 'blocked'].includes(source.status)) throw new Error('Only a failed or blocked stage can be superseded.');
  required(resolution.reason, 'Supersession reason');
  const ids = resolution.replacements;
  if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length || ids.includes(source.id)) throw new Error('Distinct replacement stages are required.');
  const replacements = ids.map(id => run.stages.find(s => s.id === id));
  if (replacements.some(s => !s || s.status !== 'completed')) throw new Error('Replacement stages must already be completed.');
  checkEvidence(resolution.evidence, resolution.criteria, true);
  const uncertainEffects = source.attempts.some(a => ['external-write', 'destructive', 'paid'].includes(a.effect)
    || a.actions?.some(action => action.effects.some(effect => ['external-write', 'destructive', 'paid'].includes(effect))));
  if (uncertainEffects) {
    const evidence = resolution.effectReconciliation;
    if (!evidence || evidence.result !== 'pass') throw new Error('External effects need successful reconciliation evidence before supersession.');
    checkEvidence([evidence], [{ criterion: 'Prior effects reconciled', result: 'pass', evidence: [0] }], true);
  }
  const covered = new Set(replacements.flatMap(s => s.attempts.at(-1).criteria.filter(c => c.result === 'pass').map(c => c.criterion)));
  const obligations = new Set([...(source.attempts.at(-1).criteria || []).map(c => c.criterion), ...resolution.criteria.map(c => c.criterion)]);
  if ([...obligations].some(c => !covered.has(c))) throw new Error('Replacement evidence does not cover the superseded criteria.');
  const result = clone(run);
  const stage = result.stages.find(s => s.id === source.id);
  stage.status = 'superseded';
  stage.resolution = { reason: resolution.reason, replacements: [...ids], evidence: clone(resolution.evidence), criteria: clone(resolution.criteria),
    ...(resolution.effectReconciliation ? { effectReconciliation: clone(resolution.effectReconciliation) } : {}), resolvedAt: new Date(now).toISOString() };
  return result;
}

export function finishRun(run, outcome, now = Date.now()) {
  validateRun(run);
  if (terminal.has(run.status)) throw new Error('Run is already terminal.');
  if (!terminal.has(outcome.status)) throw new Error('Invalid terminal status.');
  if (run.stages.some(s => s.status === 'running')) throw new Error('Record running stage results before finishing.');
  required(outcome.summary, 'Run summary');
  checkEvidence(outcome.evidence || [], outcome.criteria || [], outcome.status === 'completed');
  if (outcome.status === 'completed') {
    if (!run.stages.length || run.stages.some(s => !['completed', 'superseded'].includes(s.status))) throw new Error('Unfinished stages prevent completion.');
    for (const stage of run.stages.filter(s => s.status === 'superseded')) {
      if (!stage.resolution?.replacements?.length || stage.resolution.replacements.some(id => id === stage.id || !run.stages.some(s => s.id === id && s.status === 'completed'))) throw new Error('Superseded stages require completed replacements.');
      checkEvidence(stage.resolution.evidence, stage.resolution.criteria, true);
    }
    const covered = new Set((outcome.criteria || []).filter(c => c.result === 'pass').map(c => c.criterion));
    if (run.context.successCriteria.some(c => !covered.has(c))) throw new Error('Original success criteria have not all been verified.');
  }
  return { ...clone(run), status: outcome.status, finishedAt: new Date(now).toISOString(), outcome: clone(outcome) };
}

export function resumeRun(run, observation, now = Date.now()) {
  validateRun(run);
  if (['completed', 'cancelled'].includes(run.status)) throw new Error('Start a new run for completed or cancelled work.');
  if (realpathSync(resolve(observation.root)) !== realpathSync(run.root)) throw new Error('Resume target differs from the original project.');
  required(observation.summary, 'Current-state revalidation');
  if (!Array.isArray(observation.evidence) || !observation.evidence.length) throw new Error('Resume requires current evidence.');
  if (run.stages.some(s => s.status === 'running')) throw new Error('Reconcile the interrupted stage before resuming; do not replay uncertain effects.');
  // Preserve consumed stages/attempts/time. A new budget requires an explicit new run.
  if (now - Date.parse(run.createdAt) >= run.budget.maxMinutes * 60000) throw new Error('Budget expired; create a new run with explicit budget and prior evidence.');
  const result = { ...clone(run), status: 'ready', resumeObservations: [...(run.resumeObservations || []), clone(observation)] };
  if (result.outcome) result.previousOutcomes = [...(result.previousOutcomes || []), { ...result.outcome, finishedAt: result.finishedAt }];
  delete result.outcome;
  delete result.finishedAt;
  return result;
}
