import { inspectProject } from './project.mjs';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { readPreferences } from './continuity.mjs';
import { parseInvocation } from './invocation.mjs';

const starter = ['auto', 'fix', 'explain', 'reprompt', 'plan', 'review', 'test', 'teach', 'tools', 'profile', 'checkpoint', 'resume', 'help'];
// A clear outer rewrite request owns routing. Embedded workflow names and actions
// are source text, not explicit selection or authority to perform those actions.
const promptRewrite = /^(?:(?:please|can you|could you|would you)\s+)*(?:reprompt\b|(?:improve|rewrite|rephrase|clarify|strengthen)\s+(?:(?:this|that|my|the|following|previous|last|our)\s+)?prompt(?=\s*(?:$|[:.!?\n]|\b(?:for|with|using|to|so|without|and|by|in)\b)))/i;
const intents = [
  { test: /\b(?:sql injection|xss|cross.site scripting|csrf|ssrf|path traversal|insecure deserialization|vulnerabilit(?:y|ies)|security review)\b/i, ids: ['security', 'review'], reason: 'Security review with a concrete vulnerability class' },
  { test: /\b(?:docker|container)\b.*\b(?:build|fail|broken|runtime)|\b(?:broken|fail)\w*\b.*\b(?:docker|container)\b/i, ids: ['ops-container'], reason: 'Container build or runtime diagnosis' },
  { test: /\b(?:mobile menu|hamburger|navigation menu|dropdown|responsive|layout|spacing|overlap)\b/i, ids: ['ui-states', 'ui-responsive'], reason: 'UI state and viewport behavior' },
  { test: /\b(?:training|loss|gradient)\b.*\b(?:unstable|diverg|nan|explod|plateau)|\b(?:unstable|diverg|nan|explod)\w*\b.*\b(?:training|loss|gradient)\b/i, ids: ['ml-debug-training'], reason: 'Training stability diagnosis' },
  { test: /\b(?:address|resolve|fix|respond)\b.*\b(?:pr|pull request|review)\b.*\b(?:feedback|comments?|requests?)\b|\b(?:pr|pull request)\b.*\bfeedback\b/i, ids: ['github-address-review'], reason: 'Requested pull request feedback' },
  { test: /\b(?:undo|reverse)\b.*\b(?:task|recorded|later|changes)\b/i, ids: ['undo'], reason: 'Selective local task reversal' },
  { test: /\b(?:build|implement|try)\b.*\b(?:alternatives|variants|two versions|three versions)\b/i, ids: ['compare'], reason: 'Working alternatives with common requirements' },
  { test: /\b(?:exercise|practice)\b.*\b(?:project|repo|code)\b/i, ids: ['teach'], reason: 'Hands-on project learning' },
  { test: /\b(?:mlflow|wandb|w&b)\b.*\b(?:compare|export|runs?|metrics)\b|\bcompare\b.*\b(?:mlflow|wandb)\b/i, ids: ['ml-evaluate'], reason: 'Recorded ML experiment comparison' },
  { test: /\b(?:evidence report|acceptance report|requirement-linked)\b/i, ids: ['verify'], reason: 'Requirement-linked verification evidence' },
  { test: /\b(?:claude|agents)\.md\b|\b(?:save|remember|persist|preserve)\b.*\b(?:conversation|project instructions|context|decisions|corrections)\b/i, ids: ['remember'], reason: 'Durable project instructions from conversation context' },
  { test: /\b(?:ci|checks?|actions|pipeline)\b.*\b(?:fail|broken|red)|\b(?:fail|broken|red)\w*\b.*\b(?:ci|checks?|actions|pipeline)\b/i, ids: ['github-fix-ci', 'github-actions'], reason: 'Failing CI/checks' },
  { test: /\b(?:refresh|oauth|login|logout|session|password reset|authentication)\b/i, ids: ['backend-auth'], reason: 'Identity or session lifecycle' },
  { test: /\b(?:dialog|combobox|date picker|datepicker|component)\b/i, ids: ['react-component', 'ui-component'], reason: 'Component interaction contract' },
  { test: /\b(?:race|stale|out.of.order)\b.*\b(?:request|response|fetch)|\b(?:request|response|fetch)\b.*\b(?:race|stale|out.of.order)\b/i, ids: ['react-async', 'backend-concurrency'], reason: 'Request ordering and ownership' },
  { test: /\b(?:freeze|freezes|slow|rerender|re-render)\b.*\b(?:filter|grid|render|component)|\b(?:filter|grid|render|component)\b.*\b(?:freeze|freezes|slow|rerender|re-render)\b/i, ids: ['react-rerenders'], reason: 'Slow UI interaction' },
  { test: /\b(?:offline|validation)\b.*\b(?:production|serving|live)\b/i, ids: ['ml-parity', 'ml-leakage'], reason: 'Offline versus serving mismatch' },
  { test: /\b(?:leakage|future information|look.?ahead|point.in.time)\b/i, ids: ['ml-leakage', 'ml-features'], reason: 'Prediction-time information boundary' },
  { test: /\b(?:train|training)\b.*\b(?:resume|checkpoint|interrupt)|\b(?:resume|checkpoint)\b.*\b(?:train|training)\b/i, ids: ['ml-train', 'ml-reproduce'], reason: 'Training continuation state' },
  { test: /\b(?:vercel|preview|deployment)\b.*\b(?:build|fail|broken)|\bbuild\b.*\b(?:vercel|preview|deployment)\b/i, ids: ['vercel-build-fix'], reason: 'Deployment build diagnosis' },
  { test: /\b(?:migration|migrations|schema change)\b/i, ids: ['db-migrate'], reason: 'Schema rollout and recovery' },
  { test: /\b(?:partial|staged|unstaged|only these|selected files)\b.*\bcommit|\bcommit\b.*\b(?:partial|staged|unstaged|only these|selected files)\b/i, ids: ['git-commit', 'git-split'], reason: 'Commit scope and index preservation' },
  { test: /\b(?:which|compare|choose|trade.?off|decide)\b/i, ids: ['decide'], reason: 'A decision rather than immediate implementation' },
];
const stackPacks = { react: ['react', 'ui'], vite: ['vite'], next: ['react', 'ui', 'vercel'], prisma: ['database'], torch: ['ml-experiments', 'ml-data'], 'scikit-learn': ['ml-experiments', 'ml-data'], django: ['backend'], fastapi: ['backend'], postgres: ['database'] };

export function routeContext(root) {
  const project = inspectProject(root);
  const dependencies = new Set(project.packages.flatMap(p => p.dependencies));
  for (const manifest of project.manifests.filter(p => /(?:pyproject\.toml|requirements[^/]*\.txt)$/.test(p))) {
    const path = join(project.root, manifest);
    if (statSync(path).size <= 256 * 1024) {
      const source = readFileSync(path, 'utf8');
      for (const dependency of ['torch', 'scikit-learn', 'django', 'fastapi']) if (new RegExp(`(?:^|[\\s"'\\[,])${dependency}(?=[\\s"'\\]<>=!~;]|$)`, 'mi').test(source)) dependencies.add(dependency);
    }
  }
  // Parse bounded manifest text only; never import framework configuration.
  const frameworks = Object.keys(stackPacks).filter(key => dependencies.has(key) || (key === 'prisma' && dependencies.has('@prisma/client')));
  let preferences = null, preferenceError = null;
  try { preferences = readPreferences(root)?.preferences || null; } catch (error) { preferenceError = error.message; }
  return { frameworks, packs: [...new Set(frameworks.flatMap(f => stackPacks[f]))], manifests: project.manifests, packages: project.packages.map(p => p.path), truncated: project.truncated,
    preferences, preferenceError, preferencePolicy: 'Saved context only. The host must resolve conflicts with the current request; a saved profile is not an active pin or permission.' };
}

export function intentSignals(brief) {
  // Ignore ordinary negative clauses for ranking only. The full brief is returned unchanged.
  const excluded = [...brief.matchAll(/\b(?:do not|don't|never|without)\s+([^.;\n]+)/gi)].map(m => m[0]);
  const explicit = parseInvocation(brief);
  if (explicit) return { positive: explicit.id, excluded, explicit,
    matches: [{ ids: [explicit.id], reason: 'Workflow selected by an explicit just-vibe invocation' }] };
  if (promptRewrite.test(brief.trim())) return { positive: 'reprompt', excluded,
    matches: [{ ids: ['reprompt'], reason: 'Rewrite the prompt without executing its embedded task' }] };
  const positive = brief.replace(/\b(?:do not|don't|never|without)\s+[^.;\n]+/gi, ' ');
  return { positive, excluded, matches: intents.filter(rule => rule.test.test(positive)) };
}

export function rankCandidates(candidates, brief, context) {
  const { positive, excluded, matches } = intentSignals(brief);
  const named = new Set((positive.match(/\b[a-z][a-z0-9]*(?:-[a-z0-9]+)+\b/g) || []));
  return candidates.map(c => {
    const reasons = [];
    let score = c.score;
    if (named.has(c.id) || c.matchedNames.some(id => named.has(id))) { score += 1000; reasons.push('Workflow named explicitly'); }
    for (const rule of matches) if (rule.ids.includes(c.id)) { score += 45 - rule.ids.indexOf(c.id) * 8; reasons.push(rule.reason); }
    if (context.packs.includes(c.pack)) { score += 10; reasons.push(`Fits detected ${context.frameworks.join(', ')} project`); }
    if (c.status === 'available') { score += 3; reasons.push('Declared prerequisites observed'); }
    else reasons.push(`Prerequisites ${c.status}; inspect before execution`);
    if (!reasons.length) reasons.push('Request terms match this workflow');
    return { ...c, score, selectionReasons: reasons, excludedClauses: excluded };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function executionStrategy(brief, candidates = []) {
  const explicit = parseInvocation(brief);
  if (explicit && explicit.id !== 'reprompt') brief = explicit.brief;
  const { positive } = intentSignals(brief);
  const reasons = [];
  if (/\b(?:deploy|publish|push|merge|provision|production migration|paid|purchase)\b/i.test(positive)) reasons.push('External or consequential effects need explicit tracking');
  if (/\b(?:resume|interrupted|handoff|checkpoint|record every|track every)\b/i.test(positive)) reasons.push('Continuation or recorded history requested');
  if ((positive.match(/\b(?:then|after that|next|finally)\b|\n\s*\d+[.)]/gi) || []).length >= 2) reasons.push('Several dependent stages');
  if (candidates.slice(0, 3).filter(c => c.status !== 'available').length === 3) reasons.push('Selected route needs unresolved capabilities');
  return { suggested: reasons.length ? 'tracked' : 'quick', reasons: reasons.length ? reasons : ['Start with a bounded local workflow; escalate if dependencies, retries or effects make tracking useful'], instruction: 'A suggestion, not a permission decision. The host resolves actual scope and effects. Quick work still preserves constraints, verifies results and reports limitations; switching to tracked work retains prior evidence and consumed budgets.' };
}

export function starterIds(context) {
  const additions = [];
  if (context.frameworks.includes('react') || context.frameworks.includes('next')) additions.push('react-component', 'react-async');
  if (context.frameworks.includes('vite')) additions.push('vite-bundle');
  if (context.frameworks.includes('prisma')) additions.push('db-migrate');
  if (context.frameworks.includes('torch') || context.frameworks.includes('scikit-learn')) additions.push('ml-train', 'ml-evaluate');
  return [...new Set([...starter, ...additions])];
}
