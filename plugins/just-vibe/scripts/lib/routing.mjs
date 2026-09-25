import { inspectProject } from './project.mjs';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { readPreferences } from './continuity.mjs';
import { parseInvocation } from './invocation.mjs';
import { promptRewrite, ruleText, matchIntents } from './intents.mjs';

const starter = ['auto', 'fix', 'explain', 'reprompt', 'plan', 'review', 'test', 'teach', 'tools', 'profile', 'checkpoint', 'resume', 'help'];
const ML_PACKS = ['ml-data', 'ml-experiments', 'ml-evaluation', 'ml-deployment'];
// Detected stacks break ties toward matching packs. Vercel is detected from its own project files, not inferred from Next.js.
const stackPacks = { react: ['react', 'ui'], vite: ['vite'], next: ['react', 'ui'], vercel: ['vercel'], prisma: ['database'], torch: ML_PACKS, 'scikit-learn': ML_PACKS, django: ['backend'], fastapi: ['backend'], postgres: ['database'] };

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
  const vercel = project.manifests.some(path => /(?:^|\/)vercel\.json$/.test(path)) || existsSync(join(project.root, '.vercel', 'project.json'));
  const frameworks = Object.keys(stackPacks).filter(key => (key === 'vercel' ? vercel : dependencies.has(key) || (key === 'prisma' && dependencies.has('@prisma/client'))));
  let preferences = null, preferenceError = null;
  try { preferences = readPreferences(root)?.preferences || null; } catch (error) { preferenceError = error.message; }
  return { frameworks, packs: [...new Set(frameworks.flatMap(f => stackPacks[f]))], manifests: project.manifests, packages: project.packages.map(p => p.path), truncated: project.truncated,
    preferences, preferenceError, preferencePolicy: 'Saved context only. The host must resolve conflicts with the current request; a saved profile is not an active pin or permission.' };
}

// Negated clauses are excluded from ranking only; the full brief is always preserved.
// A clause ends at sentence punctuation, a comma or a pivot word, so "Don't deploy, just fix
// the login bug" keeps its task. A leading negation excludes its clause; "without" excludes the
// rest of an imperative clause ("fix it without new dependencies") but not a symptom
// ("the page reloads without saving"); "never" is a symptom unless it leads the clause.
const clauseBreak = /([.;!?\n]+|,\s*|\s+(?=(?:but|just|then|instead|only|so that)\b))/i;
const negationLead = /^(?:(?:and|but|also|just|then|please|so)\s+)*(?:do not|don't|dont|never|no|skip|avoid|not|without|nothing|instead of)\b/i;
const subjectLead = /^(?:the|a|an|this|that|these|those|it|its|my|our|their|his|her|your|when|if|why|how|what|which|where|who|i|we|you|they|he|she|there|some|every|each|all)\b/i;
export function splitNegations(brief) {
  const text = brief.replace(/[\u2018\u2019\u02bc]/g, "'");
  const kept = [], excluded = [];
  for (const part of text.split(clauseBreak)) {
    if (!part || clauseBreak.test(part) && !/[a-z0-9]/i.test(part)) { kept.push(part); continue; }
    const clause = part.trim();
    if (negationLead.test(clause)) { excluded.push(clause); kept.push(' '); continue; }
    const tail = !subjectLead.test(clause) && clause.match(/\s(?:without|instead of)\s.+$/i);
    if (tail) { excluded.push(tail[0].trim()); kept.push(part.replace(tail[0], ' ')); continue; }
    kept.push(part);
  }
  return { positive: kept.join(''), excluded };
}

// Lesson and explanation requests name workflows as their subject, not as a selection.
const lessonLead = /^(?:please\s+)?(?:teach(?:\s+me)?|explain|quiz(?:\s+me)?|test\s+me|help\s+me\s+understand|how\s+does|how\s+do|what\s+(?:is|does|are)|walk\s+me\s+through)\b/i;
export const isLesson = brief => lessonLead.test(brief.trim());

export function intentSignals(brief) {
  const explicit = parseInvocation(brief);
  const { positive, excluded } = splitNegations(brief);
  if (explicit) return { positive: explicit.id, excluded, explicit,
    matches: [{ ids: [explicit.id], reason: 'Workflow selected by an explicit just-vibe invocation' }] };
  if (promptRewrite.test(brief.trim())) return { positive: 'reprompt', excluded,
    matches: [{ ids: ['reprompt'], reason: 'Rewrite the prompt without executing its embedded task' }] };
  return { positive, excluded, matches: matchIntents(ruleText(positive)) };
}

const MODE_ORDER = { inspect: 0, plan: 1, apply: 2 };
export function rankCandidates(candidates, brief, context) {
  const { positive, excluded, matches } = intentSignals(brief);
  const actionRequested = matches.some(rule => rule.action || rule.damp);
  const named = isLesson(brief) ? new Set() : new Set((positive.match(/\b[a-z][a-z0-9]*(?:-[a-z0-9]+)+\b/g) || []));
  return candidates.map(c => {
    const reasons = [];
    let score = c.score;
    const lexical = c.score;
    if (named.has(c.id) || c.matchedNames.some(id => named.has(id))) { score += 1000; reasons.push('Workflow named explicitly'); }
    let ruled = false;
    for (const rule of matches) if (rule.ids.includes(c.id)) {
      // When the request names a kind of work, domain topic rules only break ties.
      const boost = actionRequested && !rule.action && !rule.damp ? Math.min(rule.boost ?? 45, 10) : rule.boost ?? 45;
      ruled = true; score += boost - rule.ids.indexOf(c.id) * 8; reasons.push(rule.reason);
    }
    // Project context breaks ties between workflows the request already supports; it is not evidence by itself.
    if (context.packs.includes(c.pack) && (ruled || lexical >= 4)) { score += 2; reasons.push(`Fits detected ${context.frameworks.join(', ')} project`); }
    // Availability is reported, not ranked: an honest capability declaration must not lose relevance.
    if (c.status !== 'available') reasons.push(`Prerequisites ${c.status}; inspect before execution`);
    if (!reasons.length) reasons.push('Request terms match this workflow');
    return { ...c, score: Math.round(score * 10) / 10, selectionReasons: reasons, excludedClauses: excluded };
  }).sort((a, b) => b.score - a.score || (MODE_ORDER[a.defaultMode] ?? 3) - (MODE_ORDER[b.defaultMode] ?? 3) || a.id.localeCompare(b.id));
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
